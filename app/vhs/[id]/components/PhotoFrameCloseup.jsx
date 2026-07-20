"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { X, ImageIcon } from "lucide-react";
import { useChunkedGrid } from "@/app/lib/useChunkedGrid";
import {
  PHOTO_FRAME_CLOSEUP,
  PHOTO_FRAME_CLOSEUP_VIEWPORT,
  CROSSFADE_DURATION_MS,
  FILTER_OVERLAYS,
} from "./lib/constants";

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

export default function PhotoFrameCloseup({
  images,
  selectedIndex,
  onChangeIndex,
  onClose,
  visible,
  colorFilter = "none",
  // false = 공유 감상 모드: 액자 크게 보기는 가능하되 사진 바꾸기는 비활성화
  canChangePhoto = true,
}) {
  const overlayColor = FILTER_OVERLAYS[colorFilter];
  const containerRef = useRef(null);
  const [viewportBounds, setViewportBounds] = useState(null);
  const [frameNaturalSize, setFrameNaturalSize] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

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

    setViewportBounds({
      left: imgBounds.x + imgBounds.width * PHOTO_FRAME_CLOSEUP_VIEWPORT.left,
      top: imgBounds.y + imgBounds.height * PHOTO_FRAME_CLOSEUP_VIEWPORT.top,
      width: imgBounds.width * PHOTO_FRAME_CLOSEUP_VIEWPORT.width,
      height: imgBounds.height * PHOTO_FRAME_CLOSEUP_VIEWPORT.height,
    });
  }, [frameNaturalSize]);

  useEffect(() => {
    if (!frameNaturalSize) return;
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [frameNaturalSize, recalculate]);

  // Animate in
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFadeIn(true));
      });
    } else {
      setFadeIn(false);
      setShowPicker(false);
    }
  }, [visible]);

  const handleFrameLoad = useCallback((e) => {
    const img = e.target;
    setFrameNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const handlePickPhoto = useCallback(
    (index) => {
      onChangeIndex(index);
      setShowPicker(false);
    },
    [onChangeIndex],
  );

  // Keyboard: Escape closes picker first, then closes frame
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showPicker) {
          setShowPicker(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, showPicker, onClose]);

  // 썸네일 그리드 청크 마운트 — 수천 장 앨범에서 전량 마운트 방지
  const {
    visibleCount: gridCount,
    sentinelRef: gridSentinelRef,
    hasMore: gridHasMore,
  } = useChunkedGrid(images?.length ?? 0);

  if (!visible && !fadeIn) return null;

  const currentImage = images?.[selectedIndex];
  const imageSrc = currentImage?.original_url || currentImage?.thumbnail_url;

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
      {/* Closeup frame background */}
      <img
        src={PHOTO_FRAME_CLOSEUP}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 2 }}
        onLoad={handleFrameLoad}
        draggable={false}
      />

      {/* Photo inside frame */}
      {viewportBounds && imageSrc && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: viewportBounds.left,
            top: viewportBounds.top,
            width: viewportBounds.width,
            height: viewportBounds.height,
            borderRadius: PHOTO_FRAME_CLOSEUP_VIEWPORT.borderRadius,
            zIndex: 1,
          }}
        >
          <img
            src={imageSrc}
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

      {/* "사진 바꾸기" button inside the frame viewport, top-right */}
      {canChangePhoto && viewportBounds && images && images.length > 1 && (
        <button
          onClick={() => setShowPicker(true)}
          className="absolute flex items-center gap-1.5 rounded-md bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          style={{
            left: viewportBounds.left + viewportBounds.width - 100,
            top: viewportBounds.top + 8,
            zIndex: 5,
          }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          사진 바꾸기
        </button>
      )}

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

      {/* Thumbnail picker modal */}
      {canChangePhoto && showPicker && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 40 }}
          onClick={() => setShowPicker(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Modal */}
          <div
            className="relative max-h-[70vh] w-full max-w-xl overflow-hidden rounded-xl bg-neutral-900/95 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="text-sm font-medium text-white">사진 선택</span>
              <button
                onClick={() => setShowPicker(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail grid */}
            <div
              className="grid grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-4"
              style={{ maxHeight: "calc(70vh - 52px)" }}
            >
              {images.slice(0, gridCount).map((img, idx) => {
                const thumb = img.thumbnail_url || img.original_url;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={img.id ?? idx}
                    onClick={() => handlePickPhoto(idx)}
                    className={`group relative aspect-square overflow-hidden rounded-lg transition-all ${
                      isSelected
                        ? "ring-2 ring-[#c9a84c] ring-offset-2 ring-offset-neutral-900"
                        : "hover:ring-1 hover:ring-white/40"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      draggable={false}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#c9a84c]/20" />
                    )}
                  </button>
                );
              })}
              {gridHasMore && (
                <div ref={gridSentinelRef} className="col-span-full h-6" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
