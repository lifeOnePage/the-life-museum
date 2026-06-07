import { useState, useCallback, useRef, useEffect } from "react";
import { CROSSFADE_DURATION_MS } from "./constants";

/**
 * Slideshow state & timer hook for VHS playback.
 *
 * @param {{ mediaList, isPlaying, imageDuration, videoMode, active }} opts
 *   - mediaList: array of { type, src, ... }
 *   - isPlaying: boolean
 *   - imageDuration: seconds per image
 *   - videoMode: 0 = full playback, N = clip to N seconds
 *   - active: only run when scene === "playback"
 */
export function useMediaSlideshow({
  mediaList,
  isPlaying,
  imageDuration,
  videoMode,
  active,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const count = mediaList.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const rafRef = useRef(null);

  const advance = useCallback(() => {
    if (count <= 1) return;
    if (transitioning || nextIndex !== null) return;

    const next = (currentIndex + 1) % count;
    // Phase 1: mount the next layer at opacity 0
    setNextIndex(next);

    // Phase 2: after paint, start the crossfade transition (0 → 1)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setTransitioning(true);

        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          setCurrentIndex(next);
          setNextIndex(null);
          setTransitioning(false);
        }, CROSSFADE_DURATION_MS);
      });
    });
  }, [count, currentIndex, transitioning, nextIndex, clearTransitionTimer]);

  const retreat = useCallback(() => {
    if (count <= 1) return;
    if (transitioning || nextIndex !== null) return;

    const prev = (currentIndex - 1 + count) % count;
    setNextIndex(prev);

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setTransitioning(true);

        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          setCurrentIndex(prev);
          setNextIndex(null);
          setTransitioning(false);
        }, CROSSFADE_DURATION_MS);
      });
    });
  }, [count, currentIndex, transitioning, nextIndex, clearTransitionTimer]);

  // Auto-advance timer for images and short video mode
  useEffect(() => {
    if (!active || !isPlaying || count === 0 || transitioning || nextIndex !== null) return;

    const item = mediaList[currentIndex];
    if (!item) return;

    let duration = null;

    if (item.type === "image") {
      duration = imageDuration * 1000;
    } else if (item.type === "video" && videoMode > 0) {
      duration = videoMode * 1000;
    }
    // video with videoMode === 0 (full playback): no timer, advance on onEnded

    if (duration !== null) {
      clearTimer();
      timerRef.current = setTimeout(advance, duration);
    }

    return clearTimer;
  }, [
    active,
    isPlaying,
    currentIndex,
    nextIndex,
    transitioning,
    count,
    mediaList,
    imageDuration,
    videoMode,
    advance,
    clearTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      clearTransitionTimer();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clearTimer, clearTransitionTimer]);

  // Reset index when mediaList changes
  useEffect(() => {
    setCurrentIndex(0);
    setNextIndex(null);
    setTransitioning(false);
  }, [mediaList]);

  const currentItem = count > 0 ? mediaList[currentIndex] : null;
  const nextItem = nextIndex !== null ? mediaList[nextIndex] : null;

  // Preload next few items
  const preloadUrls = [];
  if (count > 1) {
    for (let i = 1; i <= Math.min(2, count - 1); i++) {
      const idx = (currentIndex + i) % count;
      const m = mediaList[idx];
      if (m?.type === "image") preloadUrls.push(m.original_url || m.thumbnail_url);
    }
  }

  return {
    currentIndex,
    nextIndex,
    transitioning,
    currentItem,
    nextItem,
    advance,
    retreat,
    preloadUrls,
  };
}
