import { useRef, useCallback, useEffect, useState } from "react";

const FADE_DURATION_MS = 800;
const FADE_INTERVAL_MS = 20;
const DEFAULT_VOLUME = 0.4;

/**
 * BGM playback hook with smooth fade in/out.
 *
 * Provides duck/unduck for fading out when videos play and fading back in when they stop.
 * Call startBGM() on a user gesture (e.g. play button click) to satisfy autoplay policy.
 *
 * @param {string|null} bgmUrl - URL of the background music
 */
export function useBGM(bgmUrl) {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmStarted, setBgmStarted] = useState(false);
  const isDuckedRef = useRef(false);
  const isPlayingRef = useRef(true);
  // iOS Safari/WKWebView ignores HTMLMediaElement.volume (always reads 1),
  // so volume fades are silent no-ops there — duck/unduck must pause/resume instead.
  const canControlVolumeRef = useRef(true);

  // Initialize audio element
  useEffect(() => {
    if (!bgmUrl) return;
    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    // iOS ignores HTMLMediaElement volume *audibly*, but modern WebKit still
    // reads back the value you set — write-and-read-back detection false-positives.
    // Detect the platform instead (iPadOS reports as MacIntel + multi-touch).
    const isIOS =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    canControlVolumeRef.current = !isIOS && audio.volume === 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [bgmUrl]);

  // Cancel a pause scheduled by duck()/setBgmPlaying(false)
  const clearPendingPause = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // Clear any running fade interval
  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  // Smoothly transition volume from current to target
  const fadeTo = useCallback(
    (target, duration = FADE_DURATION_MS) => {
      const audio = audioRef.current;
      if (!audio) return;

      clearFade();

      const startVolume = audio.volume;
      const diff = target - startVolume;

      if (Math.abs(diff) < 0.01) {
        audio.volume = Math.max(0, Math.min(1, target));
        return;
      }

      const steps = Math.ceil(duration / FADE_INTERVAL_MS);
      let step = 0;

      fadeRef.current = setInterval(() => {
        step++;
        const progress = step / steps;
        // Ease-out curve for smoother perception
        const eased = 1 - Math.pow(1 - progress, 2);
        audio.volume = Math.max(0, Math.min(1, startVolume + diff * eased));

        if (step >= steps) {
          audio.volume = Math.max(0, Math.min(1, target));
          clearFade();
        }
      }, FADE_INTERVAL_MS);
    },
    [clearFade]
  );

  // Start BGM playback (call on user interaction to satisfy autoplay policy).
  // With { ducked: true } the element is only unlocked — play() then pause()
  // synchronously inside the gesture — and stays silent until unduck().
  // Use this when a video with its own audio follows immediately (VHS insert
  // scene): no platform emits audible BGM, even where volume control is ignored.
  const startBGM = useCallback(
    ({ ducked = false } = {}) => {
      const audio = audioRef.current;
      if (!audio || bgmStarted) return;
      setBgmStarted(true);

      audio.volume = 0;

      if (ducked) {
        isDuckedRef.current = true;
        audio.play().catch(() => {});
        audio.pause();
        return;
      }

      audio.play().catch((err) => {
        // AbortError: pause() landed while play() was pending (e.g. duck on iOS) — not a block
        if (err?.name !== "NotAllowedError") return;
        // Autoplay blocked — mute and retry
        audio.muted = true;
        setIsMuted(true);
        if (!isDuckedRef.current) audio.play().catch(() => {});
      });

      // Fade in
      fadeTo(DEFAULT_VOLUME);
    },
    [bgmStarted, fadeTo]
  );

  // Duck — call when a video with audio starts playing.
  // Fade out then pause; without volume control (iOS) pause immediately,
  // otherwise the OS lets the video's audio forcibly interrupt the BGM element.
  const duck = useCallback(() => {
    isDuckedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    clearPendingPause();

    if (!canControlVolumeRef.current) {
      clearFade();
      audio.pause();
      return;
    }

    fadeTo(0);
    pauseTimerRef.current = setTimeout(() => {
      pauseTimerRef.current = null;
      if (isDuckedRef.current && audioRef.current) {
        audioRef.current.pause();
      }
    }, FADE_DURATION_MS + 50);
  }, [fadeTo, clearFade, clearPendingPause]);

  // Unduck — call when a video stops/ends. Resumes playback (the element may be
  // paused by duck() or by the OS when another media element took over the audio).
  const unduck = useCallback(() => {
    isDuckedRef.current = false;
    const audio = audioRef.current;
    if (!audio || !bgmStarted) return;
    clearPendingPause();
    if (!isPlayingRef.current) return;
    if (audio.paused) audio.play().catch(() => {});
    if (audio.muted) return;
    fadeTo(DEFAULT_VOLUME);
  }, [fadeTo, bgmStarted, clearPendingPause]);

  // Pause/resume BGM with the global play state
  const setBgmPlaying = useCallback(
    (playing) => {
      isPlayingRef.current = playing;
      const audio = audioRef.current;
      if (!audio || !bgmStarted) return;

      if (playing) {
        // While ducked, stay paused — unduck() resumes when the video ends
        if (isDuckedRef.current) return;
        clearPendingPause();
        audio.play().catch(() => {});
        if (!audio.muted) {
          fadeTo(DEFAULT_VOLUME);
        }
      } else {
        clearPendingPause();
        if (!canControlVolumeRef.current) {
          audio.pause();
          return;
        }
        fadeTo(0, 400);
        pauseTimerRef.current = setTimeout(() => {
          pauseTimerRef.current = null;
          if (!isPlayingRef.current && audioRef.current) {
            audioRef.current.pause();
          }
        }, 450);
      }
    },
    [bgmStarted, fadeTo, clearPendingPause]
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (!audio) return next;

      audio.muted = next;
      if (!next && bgmStarted && isPlayingRef.current && !isDuckedRef.current) {
        if (audio.paused) audio.play().catch(() => {});
        fadeTo(DEFAULT_VOLUME);
      }
      return next;
    });
  }, [bgmStarted, fadeTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFade();
      clearPendingPause();
    };
  }, [clearFade, clearPendingPause]);

  return {
    isMuted,
    toggleMute,
    startBGM,
    duck,
    unduck,
    setBgmPlaying,
    hasBgm: !!bgmUrl,
    bgmStarted,
  };
}
