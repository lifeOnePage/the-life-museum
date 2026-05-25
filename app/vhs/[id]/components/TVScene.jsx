"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  TV_OFF_IMAGE,
  TV_PLAYBACK_FRAME,
  STATIC_VIDEO_SRC,
  TV_SCREEN,
  CROSSFADE_DURATION_MS,
} from "./lib/constants";
import TVMediaViewport from "./TVMediaViewport";

/**
 * Given container dimensions and image natural dimensions,
 * compute the actual rendered rect when using object-fit: contain.
 */
function getContainedImageBounds(containerW, containerH, imgNatW, imgNatH) {
  const imgAspect = imgNatW / imgNatH;
  const containerAspect = containerW / containerH;
  if (containerAspect > imgAspect) {
    const w = containerH * imgAspect;
    return { x: (containerW - w) / 2, y: 0, width: w, height: containerH };
  } else {
    const h = containerW / imgAspect;
    return { x: 0, y: (containerH - h) / 2, width: containerW, height: h };
  }
}

export default function TVScene({
  scene,
  currentItem,
  nextItem,
  currentIndex,
  nextIndex,
  transitioning,
  isPlaying,
  videoMode,
  onVideoEnded,
  colorFilter,
  transitionType,
  imageDuration,
  visible,
}) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const [screenBounds, setScreenBounds] = useState(null);
  const [frameNaturalSize, setFrameNaturalSize] = useState(null);

  const recalculate = useCallback(() => {
    if (!containerRef.current || !frameNaturalSize) return;

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    const imgBounds = getContainedImageBounds(
      containerW,
      containerH,
      frameNaturalSize.w,
      frameNaturalSize.h
    );

    setScreenBounds({
      left: imgBounds.x + imgBounds.width * TV_SCREEN.left,
      top: imgBounds.y + imgBounds.height * TV_SCREEN.top,
      width: imgBounds.width * TV_SCREEN.width,
      height: imgBounds.height * TV_SCREEN.height,
    });
  }, [frameNaturalSize]);

  // Recalculate on resize
  useEffect(() => {
    if (!frameNaturalSize) return;
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [frameNaturalSize, recalculate]);

  const handleFrameLoad = useCallback(
    (e) => {
      const img = e.target;
      setFrameNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    },
    []
  );

  const isOff = scene === "tvOff";
  const frameImage = isOff ? TV_OFF_IMAGE : TV_PLAYBACK_FRAME;
  const showContent = scene === "static" || scene === "playback";

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* TV frame image */}
      <img
        ref={frameRef}
        src={frameImage}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 2 }}
        onLoad={handleFrameLoad}
        draggable={false}
      />

      {/* Content area inside TV screen */}
      {showContent && screenBounds && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: screenBounds.left,
            top: screenBounds.top,
            width: screenBounds.width,
            height: screenBounds.height,
            borderRadius: TV_SCREEN.borderRadius,
            zIndex: 1,
          }}
        >
          {scene === "static" && (
            <video
              src={STATIC_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          )}

          {scene === "playback" && (
            <TVMediaViewport
              currentItem={currentItem}
              nextItem={nextItem}
              currentIndex={currentIndex}
              nextIndex={nextIndex}
              transitioning={transitioning}
              isPlaying={isPlaying}
              videoMode={videoMode}
              onVideoEnded={onVideoEnded}
              colorFilter={colorFilter}
              transitionType={transitionType}
              imageDuration={imageDuration}
            />
          )}
        </div>
      )}
    </div>
  );
}
