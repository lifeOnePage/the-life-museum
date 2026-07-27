"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  TV_CLOSEUP_IMAGE,
  TV_CLOSEUP_SCREEN,
  TV_KNOB_UPPER,
  TV_KNOB_LOWER,
  CROSSFADE_DURATION_MS,
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

/**
 * Circular knob button overlay for TV navigation.
 */
function KnobButton({ bounds, onClick, label }) {
  if (!bounds) return null;

  return (
    <button
      onClick={onClick}
      className="absolute cursor-pointer rounded-full border-2 border-transparent transition-[border-color,box-shadow] duration-300 hover:border-[#c9a84c] hover:shadow-[0_0_12px_2px_rgba(201,168,76,0.5)]"
      style={{
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        zIndex: 5,
        background: "transparent",
      }}
      aria-label={label}
    />
  );
}

export default function TVCloseup({
  visible,
  onClose,
  onAdvance,
  onRetreat,
  // The shared slideshow viewport (portal host) attaches here — see VHSExhibition.
  // Reusing the same DOM node keeps the video playing seamlessly across the zoom.
  mediaMountRef,
  ended = false,
  onReplay,
}) {
  const containerRef = useRef(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [frameNaturalSize, setFrameNaturalSize] = useState(null);
  const [screenBounds, setScreenBounds] = useState(null);
  const [knobUpperBounds, setKnobUpperBounds] = useState(null);
  const [knobLowerBounds, setKnobLowerBounds] = useState(null);
  const scrollThrottleRef = useRef(false);

  // Recalculate bounds — defined inside useEffect so it always reads
  // the latest module-level constants (no stale closure from useCallback).
  useEffect(() => {
    if (!containerRef.current || !frameNaturalSize) return;

    function recalculate() {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      const imgBounds = getContainedImageBounds(
        containerW,
        containerH,
        frameNaturalSize.w,
        frameNaturalSize.h,
      );

      setScreenBounds({
        left: imgBounds.x + imgBounds.width * TV_CLOSEUP_SCREEN.left,
        top: imgBounds.y + imgBounds.height * TV_CLOSEUP_SCREEN.top,
        width: imgBounds.width * TV_CLOSEUP_SCREEN.width,
        height: imgBounds.height * TV_CLOSEUP_SCREEN.height,
      });

      const upperKnobSize = imgBounds.width * TV_KNOB_UPPER.radius * 2;
      setKnobUpperBounds({
        left:
          imgBounds.x +
          imgBounds.width * TV_KNOB_UPPER.centerX -
          upperKnobSize / 2,
        top:
          imgBounds.y +
          imgBounds.height * TV_KNOB_UPPER.centerY -
          upperKnobSize / 2,
        width: upperKnobSize,
        height: upperKnobSize,
      });

      const lowerKnobSize = imgBounds.width * TV_KNOB_LOWER.radius * 2;
      setKnobLowerBounds({
        left:
          imgBounds.x +
          imgBounds.width * TV_KNOB_LOWER.centerX -
          lowerKnobSize / 2,
        top:
          imgBounds.y +
          imgBounds.height * TV_KNOB_LOWER.centerY -
          lowerKnobSize / 2,
        width: lowerKnobSize,
        height: lowerKnobSize,
      });
    }

    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }); // no deps — runs every render so constant changes take effect immediately

  // Fade in animation
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFadeIn(true));
      });
    } else {
      setFadeIn(false);
    }
  }, [visible]);

  // Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  // Scroll/wheel handler on screen area
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (scrollThrottleRef.current) return;
      scrollThrottleRef.current = true;

      if (e.deltaY > 0) {
        onAdvance();
      } else if (e.deltaY < 0) {
        onRetreat();
      }

      setTimeout(() => {
        scrollThrottleRef.current = false;
      }, 300);
    },
    [onAdvance, onRetreat],
  );

  // Touch swipe handler
  const touchStartRef = useRef(null);

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
        // Left swipe -> advance
        onAdvance();
      } else {
        // Right swipe -> retreat
        onRetreat();
      }
    },
    [onAdvance, onRetreat],
  );

  const handleFrameLoad = useCallback((e) => {
    const img = e.target;
    setFrameNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  // The closeup frame PNG is preloaded on mount, so it is usually already cached
  // when this overlay opens. Cached images don't reliably fire onLoad, which would
  // leave screenBounds null and the media viewport unmounted (black gap). Reading
  // the dimensions from the element the moment it attaches closes that window.
  const handleFrameRef = useCallback((img) => {
    if (img && img.complete && img.naturalWidth) {
      setFrameNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  if (!visible && !fadeIn) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-black"
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
        zIndex: 30,
        pointerEvents: fadeIn ? "auto" : "none",
      }}
    >
      {/* Media viewport behind TV frame (visible through transparent screen) */}
      {screenBounds && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: screenBounds.left,
            top: screenBounds.top,
            width: screenBounds.width,
            height: screenBounds.height,
            borderRadius: TV_CLOSEUP_SCREEN.borderRadius,
            zIndex: 1,
          }}
        >
          <div ref={mediaMountRef} className="absolute inset-0" />
        </div>
      )}

      {/* TV closeup frame PNG (transparent screen area) */}
      <img
        ref={handleFrameRef}
        src={TV_CLOSEUP_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 2 }}
        onLoad={handleFrameLoad}
        draggable={false}
      />

      {/* Scroll/swipe capture layer over screen area */}
      {screenBounds && (
        <div
          className="absolute"
          style={{
            left: screenBounds.left,
            top: screenBounds.top,
            width: screenBounds.width,
            height: screenBounds.height,
            zIndex: 3,
            background: "transparent",
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* 재생 종료(루프 off) 시 다시 재생 버튼 — 클릭 캡처 레이어 위 */}
      {screenBounds && ended && (
        <ReplayOverlay
          bounds={screenBounds}
          onReplay={onReplay}
          borderRadius={TV_CLOSEUP_SCREEN.borderRadius}
        />
      )}

      {/* Knob buttons */}
      <KnobButton
        bounds={knobUpperBounds}
        onClick={onAdvance}
        label="다음 미디어"
      />
      <KnobButton
        bounds={knobLowerBounds}
        onClick={onRetreat}
        label="이전 미디어"
      />

      {/* Close button — 모바일 노치/상태바를 피하도록 safe-area 상단 여백 적용 */}
      <button
        onClick={onClose}
        className="absolute right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        style={{
          zIndex: 10,
          top: "max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))",
        }}
        aria-label="닫기"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
