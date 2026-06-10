"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";

/**
 * Lightweight VHS exhibition preview for the edit page.
 * Shows TV playback with album media, filter, transition, and photo frame interaction.
 */

// TV screen viewport (% of tv-room-desktop.png)
const TV_SCREEN = {
  left: 0.3,
  top: 0.18,
  width: 0.35,
  height: 0.46,
  borderRadius: "2.5%",
};

// Photo frame inner area (% of tv-room-desktop.png)
const PHOTO_FRAME_INNER = {
  left: 0.783,
  top: 0.54,
  width: 0.11,
  height: 0.12,
};

const TV_PLAYBACK_FRAME = "/vhs/tv-room-desktop.png";
const CROSSFADE_DURATION_MS = 600;

const FILTER_OVERLAYS = {
  none: null,
  sepia: "rgba(140, 66, 20, 0.6)",
};

// Control bar options (matching VHSControls)
const IMAGE_DURATION_OPTIONS = [
  { label: "1초", value: 1 },
  { label: "3초", value: 3 },
  { label: "5초", value: 5 },
  { label: "10초", value: 10 },
];

const VIDEO_MODE_OPTIONS = [
  { label: "전체 재생", value: 0 },
  { label: "짧게 3초", value: 3 },
  { label: "짧게 5초", value: 5 },
  { label: "짧게 10초", value: 10 },
];

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

// Ken Burns: randomized scale+translate animation
function generateKenBurnsParams() {
  const startScale = 1.05 + Math.random() * 0.15;
  const endScale = 1.05 + Math.random() * 0.15;
  const maxOff = (s) => (s - 1) * 35;
  const startX = (Math.random() - 0.5) * maxOff(startScale);
  const startY = (Math.random() - 0.5) * maxOff(startScale);
  const endX = (Math.random() - 0.5) * maxOff(endScale);
  const endY = (Math.random() - 0.5) * maxOff(endScale);
  return {
    start: `scale(${startScale.toFixed(3)}) translate(${startX.toFixed(2)}%, ${startY.toFixed(2)}%)`,
    end: `scale(${endScale.toFixed(3)}) translate(${endX.toFixed(2)}%, ${endY.toFixed(2)}%)`,
  };
}

function KenBurnsWrapper({ duration, children }) {
  const [style, setStyle] = useState({
    transform: "scale(1)",
    transition: "none",
  });
  const rafRef = useRef(null);

  useEffect(() => {
    const params = generateKenBurnsParams();
    setStyle({ transform: params.start, transition: "none" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0" style={style}>
      {children}
    </div>
  );
}

function MediaItem({ item, videoMode, onVideoEnded, isFront }) {
  const videoRef = useRef(null);
  const videoTimerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item || item.type !== "video") return;

    if (isFront) {
      video.currentTime = 0;
      video.play().catch(() => {});

      // If videoMode > 0, auto-advance after that many seconds
      if (videoMode > 0) {
        videoTimerRef.current = setTimeout(() => {
          onVideoEnded?.();
        }, videoMode * 1000);
      }
    } else {
      video.pause();
    }

    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }
    };
  }, [item, isFront, videoMode, onVideoEnded]);

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
        muted
        playsInline
        preload="auto"
        loop={false}
        onEnded={isFront && videoMode === 0 ? onVideoEnded : undefined}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return null;
}

export default function VHSPreview({
  photoMedia,
  colorFilter = "none",
  transitionType = "fade",
  photoFrameIndex = 0,
  onPhotoFrameIndexChange,
  imageDuration = 5,
  onImageDurationChange,
  videoMode = 0,
  onVideoModeChange,
}) {
  const containerRef = useRef(null);
  const [screenBounds, setScreenBounds] = useState(null);
  const [photoFrameBounds, setPhotoFrameBounds] = useState(null);
  const [frameNaturalSize, setFrameNaturalSize] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const overlayColor = FILTER_OVERLAYS[colorFilter];
  const useKenBurns = transitionType === "kenburns";

  const mediaList = useMemo(
    () => (photoMedia ?? []).filter((m) => m.type === "image" || m.type === "video"),
    [photoMedia]
  );

  const imageList = useMemo(
    () => (photoMedia ?? []).filter((m) => m.type === "image"),
    [photoMedia]
  );

  const count = mediaList.length;

  // Calculate screen and photo frame bounds based on frame image dimensions
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

    setPhotoFrameBounds({
      left: imgBounds.x + imgBounds.width * PHOTO_FRAME_INNER.left,
      top: imgBounds.y + imgBounds.height * PHOTO_FRAME_INNER.top,
      width: imgBounds.width * PHOTO_FRAME_INNER.width,
      height: imgBounds.height * PHOTO_FRAME_INNER.height,
    });
  }, [frameNaturalSize]);

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

  // Auto-advance slideshow
  const advance = useCallback(() => {
    if (count <= 1 || transitioning || nextIndex !== null) return;

    const next = (currentIndex + 1) % count;
    setNextIndex(next);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(true);
        transitionTimerRef.current = setTimeout(() => {
          setCurrentIndex(next);
          setNextIndex(null);
          setTransitioning(false);
        }, CROSSFADE_DURATION_MS);
      });
    });
  }, [count, currentIndex, transitioning, nextIndex]);

  useEffect(() => {
    if (count === 0 || transitioning || nextIndex !== null) return;

    const item = mediaList[currentIndex];
    if (!item) return;

    if (item.type === "image") {
      timerRef.current = setTimeout(advance, imageDuration * 1000);
    }
    // For videos: advance is triggered by onVideoEnded callback

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, count, mediaList, transitioning, nextIndex, advance, imageDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Reset index if media list changes
  useEffect(() => {
    setCurrentIndex(0);
    setNextIndex(null);
    setTransitioning(false);
  }, [mediaList]);

  const currentItem = count > 0 ? mediaList[currentIndex] : null;
  const nextItem = nextIndex !== null ? mediaList[nextIndex] : null;

  // Build keyed layers for crossfade (prevents flickering)
  const layers = useMemo(() => {
    const result = [];
    if (currentItem != null) {
      result.push({ key: currentIndex, item: currentItem, isCurrent: true });
    }
    if (nextItem != null) {
      result.push({ key: nextIndex, item: nextItem, isCurrent: false });
    }
    return result;
  }, [currentItem, nextItem, currentIndex, nextIndex]);

  // Photo frame image
  const photoFrameImage = imageList[photoFrameIndex];
  const photoFrameSrc = photoFrameImage?.original_url || photoFrameImage?.thumbnail_url;

  const handlePickPhoto = useCallback(
    (index) => {
      onPhotoFrameIndexChange?.(index);
      setShowPicker(false);
    },
    [onPhotoFrameIndexChange]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      {/* TV frame image */}
      <img
        src={TV_PLAYBACK_FRAME}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 2 }}
        onLoad={handleFrameLoad}
        draggable={false}
      />

      {/* Content inside TV screen */}
      {screenBounds && (
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
          {count === 0 ? (
            <div className="flex h-full w-full items-center justify-center bg-neutral-900">
              <span className="text-xs text-white/40">미디어 없음</span>
            </div>
          ) : (
            <>
              {/* Keyed layers for flicker-free crossfade */}
              {layers.map((layer) => {
                const isFront = layer.isCurrent;
                const opacity = transitioning ? (isFront ? 0 : 1) : isFront ? 1 : 0;

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
                    {useKenBurns && layer.item.type === "image" ? (
                      <KenBurnsWrapper duration={imageDuration}>
                        <MediaItem
                          item={layer.item}
                          videoMode={videoMode}
                          onVideoEnded={advance}
                          isFront={isFront}
                        />
                      </KenBurnsWrapper>
                    ) : (
                      <MediaItem
                        item={layer.item}
                        videoMode={videoMode}
                        onVideoEnded={advance}
                        isFront={isFront}
                      />
                    )}
                  </div>
                );
              })}

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
            </>
          )}
        </div>
      )}

      {/* Photo frame in the room */}
      {photoFrameBounds && photoFrameSrc && (
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
            src={photoFrameSrc}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
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

      {/* Clickable photo frame — opens picker */}
      {photoFrameBounds && imageList.length > 0 && (
        <button
          onClick={() => setShowPicker(true)}
          className="absolute cursor-pointer border-2 border-transparent p-0 transition-[border-color,box-shadow] duration-300 hover:border-[#c9a84c] hover:shadow-[0_0_12px_2px_rgba(201,168,76,0.5)]"
          style={{
            left: photoFrameBounds.left,
            top: photoFrameBounds.top,
            width: photoFrameBounds.width,
            height: photoFrameBounds.height,
            zIndex: 3,
            background: "transparent",
          }}
          aria-label="액자 사진 변경"
          title="클릭하여 사진 변경"
        />
      )}

      {/* Control bar — top of preview */}
      <div
        className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-white/60">사진</span>
          <select
            value={imageDuration}
            onChange={(e) => onImageDurationChange?.(Number(e.target.value))}
            className="cursor-pointer rounded bg-white/10 px-1.5 py-1 text-[10px] text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            {IMAGE_DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-white/60">영상</span>
          <select
            value={videoMode}
            onChange={(e) => onVideoModeChange?.(Number(e.target.value))}
            className="cursor-pointer rounded bg-white/10 px-1.5 py-1 text-[10px] text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            {VIDEO_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo picker modal */}
      {showPicker && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 40 }}
          onClick={() => setShowPicker(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative max-h-[70%] w-[85%] max-w-md overflow-hidden rounded-xl bg-neutral-900/95 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <span className="text-xs font-medium text-white">액자 사진 선택</span>
              <button
                onClick={() => setShowPicker(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Thumbnail grid */}
            <div
              className="grid grid-cols-3 gap-1.5 overflow-y-auto p-3"
              style={{ maxHeight: "calc(70vh - 44px)" }}
            >
              {imageList.map((img, idx) => {
                const thumb = img.thumbnail_url || img.original_url;
                const isSelected = idx === photoFrameIndex;
                return (
                  <button
                    key={img.id ?? idx}
                    onClick={() => handlePickPhoto(idx)}
                    className={`group relative aspect-square overflow-hidden rounded-lg transition-all ${
                      isSelected
                        ? "ring-2 ring-[#c9a84c] ring-offset-1 ring-offset-neutral-900"
                        : "hover:ring-1 hover:ring-white/40"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      draggable={false}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#c9a84c]/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
