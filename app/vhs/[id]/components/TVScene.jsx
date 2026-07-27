"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  TV_OFF_IMAGE,
  TV_PLAYBACK_FRAME,
  STATIC_VIDEO_SRC,
  TV_SCREEN,
  PHOTO_FRAME_INNER,
  CROSSFADE_DURATION_MS,
  FILTER_OVERLAYS,
} from "./lib/constants";
import ReplayOverlay from "./ReplayOverlay";
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
  colorFilter,
  visible,
  frameImage: frameImageSrc,
  photoFrameImageSrc,
  onPhotoFrameClick,
  onTVClick,
  onAdvance,
  onRetreat,
  // The shared slideshow viewport (portal host) attaches here — see VHSExhibition.
  mediaMountRef,
  ended = false,
  onReplay,
}) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const [screenBounds, setScreenBounds] = useState(null);
  const [photoFrameBounds, setPhotoFrameBounds] = useState(null);
  const [frameNaturalSize, setFrameNaturalSize] = useState(null);
  const scrollThrottleRef = useRef(false);
  const touchStartRef = useRef(null);

  const overlayColor = FILTER_OVERLAYS[colorFilter];

  // Scroll/wheel handler on screen area
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (scrollThrottleRef.current) return;
      scrollThrottleRef.current = true;

      if (e.deltaY > 0) {
        onAdvance?.();
      } else if (e.deltaY < 0) {
        onRetreat?.();
      }

      setTimeout(() => {
        scrollThrottleRef.current = false;
      }, 300);
    },
    [onAdvance, onRetreat],
  );

  // Touch swipe handler
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartRef.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current;
      touchStartRef.current = null;

      if (Math.abs(deltaX) < 50) return;

      if (deltaX < 0) {
        onAdvance?.();
      } else {
        onRetreat?.();
      }
    },
    [onAdvance, onRetreat],
  );

  const recalculate = useCallback(() => {
    if (!containerRef.current || !frameNaturalSize) return;

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    const imgBounds = getContainedImageBounds(
      containerW,
      containerH,
      frameNaturalSize.w,
      frameNaturalSize.h,
    );

    setScreenBounds({
      left: imgBounds.x + imgBounds.width * TV_SCREEN.left,
      top: imgBounds.y + imgBounds.height * TV_SCREEN.top,
      width: imgBounds.width * TV_SCREEN.width,
      height: imgBounds.height * TV_SCREEN.height,
    });

    setPhotoFrameBounds({
      left: imgBounds.x + imgBounds.width * PHOTO_FRAME_INNER.left,
      top: imgBounds.y + imgBounds.height * PHOTO_FRAME_INNER.top,
      width: imgBounds.width * PHOTO_FRAME_INNER.width,
      height: imgBounds.height * PHOTO_FRAME_INNER.height,
    });
  }, [frameNaturalSize]);

  // Recalculate on resize
  useEffect(() => {
    if (!frameNaturalSize) return;
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [frameNaturalSize, recalculate]);

  const handleFrameLoad = useCallback((e) => {
    const img = e.target;
    setFrameNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const isOff = scene === "tvOff";
  const frameImage = isOff ? TV_OFF_IMAGE : frameImageSrc || TV_PLAYBACK_FRAME;
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
            <div ref={mediaMountRef} className="absolute inset-0" />
          )}
        </div>
      )}

      {/* Clickable TV screen area + scroll/swipe capture */}
      {screenBounds && scene === "playback" && (
        <div
          className="absolute"
          style={{
            left: screenBounds.left,
            top: screenBounds.top,
            width: screenBounds.width,
            height: screenBounds.height,
            borderRadius: TV_SCREEN.borderRadius,
            zIndex: 3,
            background: "transparent",
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {onTVClick && (
            <button
              onClick={onTVClick}
              className="h-full w-full cursor-pointer border-2 border-transparent p-0 transition-[border-color,box-shadow] duration-300 hover:border-[#c9a84c] hover:shadow-[0_0_12px_2px_rgba(201,168,76,0.5)]"
              style={{
                borderRadius: TV_SCREEN.borderRadius,
                background: "transparent",
              }}
              aria-label="TV 클로즈업"
            />
          )}
        </div>
      )}

      {/* 재생 종료(루프 off) 시 TV 화면에 다시 재생 버튼 — 클릭 캡처 레이어 위 */}
      {screenBounds && scene === "playback" && ended && (
        <ReplayOverlay
          bounds={screenBounds}
          onReplay={onReplay}
          borderRadius={TV_SCREEN.borderRadius}
        />
      )}

      {/* Photo inside the small frame (visible whenever the room image is shown) */}
      {photoFrameBounds && photoFrameImageSrc && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: photoFrameBounds.left,
            top: photoFrameBounds.top,
            width: photoFrameBounds.width,
            height: photoFrameBounds.height,
            zIndex: 1,
          }}
        >
          <img
            src={photoFrameImageSrc}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
          {/* Color filter overlay */}
          {overlayColor && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundColor: overlayColor,
                mixBlendMode: "color",
              }}
            />
          )}
        </div>
      )}

      {/* Clickable photo frame area */}
      {photoFrameBounds && onPhotoFrameClick && (
        <button
          onClick={onPhotoFrameClick}
          className="absolute cursor-pointer border-transparent p-0 transition-[border-color,box-shadow] duration-300 hover:border-[#c9a84c] hover:shadow-[0_0_12px_2px_rgba(201,168,76,0.5)]"
          style={{
            left: photoFrameBounds.left,
            top: photoFrameBounds.top,
            width: photoFrameBounds.width,
            height: photoFrameBounds.height,
            zIndex: 3,
            borderWidth: 2,
            borderStyle: "solid",
            background: "transparent",
          }}
          aria-label="액자 보기"
        />
      )}
    </div>
  );
}
