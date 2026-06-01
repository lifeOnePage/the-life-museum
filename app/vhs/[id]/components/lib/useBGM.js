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
  const [isMuted, setIsMuted] = useState(false);
  const [bgmStarted, setBgmStarted] = useState(false);
  const isDuckedRef = useRef(false);
  const isPlayingRef = useRef(true);

  // Initialize audio element
  useEffect(() => {
    if (!bgmUrl) return;
    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [bgmUrl]);

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

  // Start BGM playback (call on user interaction to satisfy autoplay policy)
  const startBGM = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || bgmStarted) return;

    audio.volume = 0;
    audio.play().catch(() => {
      // Autoplay blocked — mute and retry
      audio.muted = true;
      setIsMuted(true);
      audio.play().catch(() => {});
    });
    setBgmStarted(true);

    // Fade in
    fadeTo(DEFAULT_VOLUME);
  }, [bgmStarted, fadeTo]);

  // Duck (fade out) — call when a video starts playing
  const duck = useCallback(() => {
    isDuckedRef.current = true;
    fadeTo(0);
  }, [fadeTo]);

  // Unduck (fade in) — call when a video stops/ends
  const unduck = useCallback(() => {
    isDuckedRef.current = false;
    const audio = audioRef.current;
    if (!audio || !bgmStarted) return;
    if (audio.muted || !isPlayingRef.current) return;
    fadeTo(DEFAULT_VOLUME);
  }, [fadeTo, bgmStarted]);

  // Pause/resume BGM with the global play state
  const setBgmPlaying = useCallback(
    (playing) => {
      isPlayingRef.current = playing;
      const audio = audioRef.current;
      if (!audio || !bgmStarted) return;

      if (playing) {
        audio.play().catch(() => {});
        if (!isDuckedRef.current && !audio.muted) {
          fadeTo(DEFAULT_VOLUME);
        }
      } else {
        fadeTo(0, 400);
        setTimeout(() => {
          if (!isPlayingRef.current && audioRef.current) {
            audioRef.current.pause();
          }
        }, 450);
      }
    },
    [bgmStarted, fadeTo]
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (!audio) return next;

      audio.muted = next;
      if (!next && bgmStarted && isPlayingRef.current && !isDuckedRef.current) {
        fadeTo(DEFAULT_VOLUME);
      }
      return next;
    });
  }, [bgmStarted, fadeTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFade();
    };
  }, [clearFade]);

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
