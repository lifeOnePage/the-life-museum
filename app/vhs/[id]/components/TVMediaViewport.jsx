"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import {
  CROSSFADE_DURATION_MS,
  TV_SCREEN,
  FILTER_OVERLAYS,
  STATIC_VIDEO_SRC,
} from "./lib/constants";

function generateKenBurnsParams() {
  const startScale = 1.05 + Math.random() * 0.2;
  const endScale = 1.05 + Math.random() * 0.2;
  // Keep translate small enough to avoid exposing edges
  const maxOff = (s) => (s - 1) * 40;
  const startX = (Math.random() - 0.5) * maxOff(startScale);
  const startY = (Math.random() - 0.5) * maxOff(startScale);
  const endX = (Math.random() - 0.5) * maxOff(endScale);
  const endY = (Math.random() - 0.5) * maxOff(endScale);
  return {
    start: `scale(${startScale.toFixed(3)}) translate(${startX.toFixed(2)}%, ${startY.toFixed(2)}%)`,
    end: `scale(${endScale.toFixed(3)}) translate(${endX.toFixed(2)}%, ${endY.toFixed(2)}%)`,
  };
}

/**
 * Wraps children with an animated scale+translate for the Ken Burns effect.
 * Animation starts on mount and runs for the given duration.
 * Because we use React keys based on slideshow index, this component
 * stays mounted as an item transitions from back buffer to front buffer,
 * so the animation continues uninterrupted.
 */
function KenBurnsWrapper({ duration, children }) {
  const [style, setStyle] = useState({
    transform: "scale(1)",
    transition: "none",
  });
  const rafRef = useRef(null);

  useEffect(() => {
    const params = generateKenBurnsParams();

    // 1. Jump to start (no transition)
    setStyle({ transform: params.start, transition: "none" });

    // 2. After paint, animate to end
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setStyle({
          transform: params.end,
          transition: `transform ${duration}s linear`,
        });
      });
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Only run on mount — animation persists across buffer swap thanks to React key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0" style={style}>
      {children}
    </div>
  );
}

function MediaItem({ item, isPlaying, onVideoEnded, isFront, onVideoPlaying }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item || item.type !== "video") return;

    if (isPlaying && isFront) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, item, isFront]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && item?.type === "video") {
      video.currentTime = 0;
    }
  }, [item?.original_url]);

  if (!item) return null;

  const mediaSrc = item.original_url || item.thumbnail_url;

  if (item.type === "image") {
    return (
      <img
        src={mediaSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    );
  }

  if (item.type === "video") {
    return (
      <video
        ref={videoRef}
        src={mediaSrc}
        // muted
        playsInline
        preload="auto"
        onEnded={isFront ? onVideoEnded : undefined}
        onPlaying={isFront ? onVideoPlaying : undefined}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return null;
}

export default function TVMediaViewport({
  currentItem,
  nextItem,
  currentIndex,
  nextIndex,
  transitioning,
  isPlaying,
  onVideoEnded,
  colorFilter = "none",
  transitionType = "fade",
  imageDuration = 5,
}) {
  const overlayColor = FILTER_OVERLAYS[colorFilter];
  const useKenBurns = transitionType === "kenburns";

  // While the front video is buffering (advancing to a new video item), show the
  // VHS static loop instead of a black gap. Cleared by the video's 'playing' event.
  const [frontVideoReady, setFrontVideoReady] = useState(false);
  useEffect(() => {
    setFrontVideoReady(false);
  }, [currentIndex, currentItem?.original_url]);
  const showLoadingStatic =
    currentItem?.type === "video" && !frontVideoReady;

  // Build layers keyed by slideshow index.
  // When nextIndex becomes currentIndex on the next render,
  // React preserves the DOM element (same key) so animations continue.
  const layers = useMemo(() => {
    const result = [];

    // Current item layer
    if (currentItem != null && currentIndex != null) {
      result.push({
        key: currentIndex,
        item: currentItem,
        isCurrent: true,
      });
    }

    // Next item layer (mounted before transition starts for fade-in)
    if (nextItem != null && nextIndex != null) {
      result.push({
        key: nextIndex,
        item: nextItem,
        isCurrent: false,
      });
    }

    return result;
  }, [currentItem, nextItem, currentIndex, nextIndex]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ borderRadius: TV_SCREEN.borderRadius }}
    >
      {layers.map((layer) => {
        const isFront = layer.isCurrent;
        // During transition: current fades out (opacity 0), next fades in (opacity 1)
        // Not transitioning: current is fully visible (opacity 1)
        const opacity = transitioning ? (isFront ? 0 : 1) : isFront ? 1 : 0;

        const media = (
          <MediaItem
            item={layer.item}
            isPlaying={isPlaying}
            onVideoEnded={isFront ? onVideoEnded : undefined}
            isFront={isFront}
            onVideoPlaying={
              isFront ? () => setFrontVideoReady(true) : undefined
            }
          />
        );

        return (
          <div
            key={layer.key}
            className="absolute inset-0"
            style={{
              opacity,
              transition: transitioning
                ? `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`
                : "none",
              zIndex: isFront ? 1 : 2,
            }}
          >
            {useKenBurns && layer.item?.type === "image" ? (
              <KenBurnsWrapper duration={imageDuration}>
                {media}
              </KenBurnsWrapper>
            ) : (
              media
            )}
          </div>
        );
      })}

      {/* VHS static while the front video buffers (no black gap / no thumbnail) */}
      {showLoadingStatic && (
        <video
          src={STATIC_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 5 }}
        />
      )}

      {/* Color filter overlay */}
      {overlayColor && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            mixBlendMode: "color",
            zIndex: 10,
          }}
        />
      )}

    </div>
  );
}
