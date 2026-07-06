"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";
import { UNIFIED_THEMES } from "../themeConfig";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";
import { loadCachedImage } from "@/app/lib/loadCachedImage";

function Icon360({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 15.328c2.414 -.718 4 -1.94 4 -3.328c0 -2.21 -4.03 -4 -9 -4s-9 1.79 -9 4s4.03 4 9 4" />
      <path d="M9 13l3 3l-3 3" />
    </svg>
  );
}

const ALBUM_CONFIG = {
  size: 1.8,
  thickness: 0.03,
  tiltAngle: 0,
};

// 이미지 로드 캐시 — 공유 유틸 사용. 앞표지 하나 바꿀 때마다 뒷면 커버(R2:
// 프록시 재시도)와 테마 이미지가 매번 재다운로드되어 Promise.all 배리어 전체가
// 수 초 걸리던 문제를 없앤다. 캐시되면 이후 선택은 "새 앞면 이미지 1장"만 기다린다.
const loadImg = loadCachedImage;

const ZOOM_STEP = 0.25;

function getZoomConfig() {
  if (typeof window === "undefined") return { min: 5, max: 7, default: 6 };
  const isMobile = window.innerWidth < 1024;
  return isMobile
    ? { min: 4, max: 6, default: 7.5 }
    : { min: 3.5, max: 7, default: 6 };
}

function CameraZoom({ zoom, panOffset }) {
  const { camera } = useThree();

  // Z는 즉시 적용
  useEffect(() => {
    camera.position.z = zoom;
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  // X/Y는 매 프레임 lerp → 손 떼면 중심으로 부드럽게 복귀
  useFrame(() => {
    const tx = panOffset?.x ?? 0;
    const ty = panOffset?.y ?? 0;
    camera.position.x += (tx - camera.position.x) * 0.1;
    camera.position.y += (ty - camera.position.y) * 0.1;
  });

  return null;
}

export default function AlbumPreview3D({
  frontCover,
  backCoverOverride,
  backCoverImageUrl,
  bio,
  timeline,
  selectedTheme,
  albumTitle,
  albumSubTitle,
  titleOverlayEnabled,
  titlePosition,
  titleFont,
  titleColor,
  titleStroke,
  titleStrokeOpacity,
  flipped,
  rotationY,
  externalZoom,
  cameraOffset,
  hideControls,
  cursorTipIcon,
  onExpand,
  onFlipChange,
  expanded,
  // 최신 합성 커버(dataURL)를 부모로 전달 — 편집 페이지가 저장 시
  // 라이브러리 캐시에 심어 복귀 즉시 최종 모습이 보이게 하는 용도
  onCoversComposited,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const toggleFlip = () => {
    setIsFlipped((f) => {
      const next = !f;
      onFlipChange?.(next);
      return next;
    });
  };
  const [zoomCfg, setZoomCfg] = useState(getZoomConfig);
  const [zoom, setZoom] = useState(() => getZoomConfig().default);
  const [frontCoverImg, setFrontCoverImg] = useState(null);
  const [backCoverImg, setBackCoverImg] = useState(null);
  const [extractedColors, setExtractedColors] = useState(null);
  const [themeBgImg, setThemeBgImg] = useState(null);
  const [themeStickerImg, setThemeStickerImg] = useState(null);

  // Update zoom config on resize (mobile <-> desktop)
  useEffect(() => {
    const onResize = () => {
      const next = getZoomConfig();
      setZoomCfg((prev) => {
        if (prev.min === next.min && prev.max === next.max) return prev;
        setZoom(next.default);
        return next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Load all images in parallel + extract colors — single effect to avoid
  // multiple sequential state updates that each trigger an expensive canvas recompute.
  useEffect(() => {
    if (typeof document === "undefined") return;
    let cancelled = false;

    async function loadAll() {
      const key = selectedTheme || "minimalist";
      const bgMap = {
        kitsch: "/images/albumtheme/kitsch.png",
        illustration: "/images/albumtheme/illustration.png",
      };
      const backSrc =
        backCoverImageUrl && backCoverImageUrl !== frontCover
          ? backCoverImageUrl
          : null;

      const [frontImg, backImg, bgImg, stickerImg] = await Promise.all([
        loadImg(frontCover),
        loadImg(backSrc),
        loadImg(bgMap[key] || null, false),
        key === "kitsch"
          ? loadImg("/images/albumtheme/kitsch 2.png", false)
          : Promise.resolve(null),
      ]);

      if (cancelled) return;

      let colors = null;
      if (frontImg) {
        try {
          const extracted = await extractColors(frontImg, {
            pixels: 10000,
            distance: 0.2,
          });
          const main = extracted.sort((a, b) => b.area - a.area)[0];
          if (main) {
            const { red, green, blue } = main;
            colors = [0.4, 0.7, 1.0].map((factor) => {
              const r = Math.min(255, Math.round(red * factor));
              const g = Math.min(255, Math.round(green * factor));
              const b = Math.min(255, Math.round(blue * factor));
              return `rgb(${r}, ${g}, ${b})`;
            });
          }
        } catch {}
      }

      if (cancelled) return;

      // All state updates batched into one render (React 18)
      setFrontCoverImg(frontImg);
      setBackCoverImg(backImg);
      setThemeBgImg(bgImg);
      setThemeStickerImg(stickerImg);
      setExtractedColors(colors);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [frontCover, backCoverImageUrl, selectedTheme]);

  // Sync with external flipped prop (tab switch)
  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped);
    }
  }, [flipped]);
  const dragStartX = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursorTip, setShowCursorTip] = useState(false);

  // ── 드래그 패닝 (share 페이지와 동일: 놓으면 중심 복귀) ──
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const lastPanPosRef = useRef(null);
  const mouseDragRef = useRef(null);

  // 데스크탑 마우스 드래그 패닝
  useEffect(() => {
    const MAX_PAN = 0.8;
    const onMouseMove = (e) => {
      if (!mouseDragRef.current) return;
      const dx = e.clientX - mouseDragRef.current.x;
      const dy = e.clientY - mouseDragRef.current.y;
      const currentZoom =
        typeof externalZoom === "number" ? externalZoom : wheelZoomRef.current;
      const s = currentZoom * 0.0005;
      const newX = Math.max(
        -MAX_PAN,
        Math.min(MAX_PAN, panOffsetRef.current.x - dx * s),
      );
      const newY = Math.max(
        -MAX_PAN,
        Math.min(MAX_PAN, panOffsetRef.current.y + dy * s),
      );
      panOffsetRef.current = { x: newX, y: newY };
      setPanOffset({ x: newX, y: newY });
      mouseDragRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      if (!mouseDragRef.current) return;
      mouseDragRef.current = null;
      panOffsetRef.current = { x: 0, y: 0 };
      setPanOffset({ x: 0, y: 0 });
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [externalZoom]);

  // 모바일 1손가락 패닝
  const handlePanTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      lastPanPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handlePanTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 1 && lastPanPosRef.current) {
        const dx = e.touches[0].clientX - lastPanPosRef.current.x;
        const dy = e.touches[0].clientY - lastPanPosRef.current.y;
        const currentZoom =
          typeof externalZoom === "number"
            ? externalZoom
            : wheelZoomRef.current;
        const sensitivity = currentZoom * 0.0005;
        const MAX_PAN = 0.8;
        const newX = Math.max(
          -MAX_PAN,
          Math.min(MAX_PAN, panOffsetRef.current.x - dx * sensitivity),
        );
        const newY = Math.max(
          -MAX_PAN,
          Math.min(MAX_PAN, panOffsetRef.current.y + dy * sensitivity),
        );
        panOffsetRef.current = { x: newX, y: newY };
        setPanOffset({ x: newX, y: newY });
        lastPanPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [externalZoom],
  );

  const handlePanTouchEnd = useCallback(() => {
    lastPanPosRef.current = null;
    panOffsetRef.current = { x: 0, y: 0 };
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // 마우스 휠 줌 + 터치 핀치 줌 (externalZoom이 없을 때만)
  const canvasContainerRef = useRef(null);
  const wheelZoomRef = useRef(zoom);
  const pinchStartDist = useRef(null);
  const pinchStartZoom = useRef(null);
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el || typeof externalZoom === "number") return;
    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cfg = getZoomConfig();
      const next = Math.max(
        cfg.min,
        Math.min(cfg.max, wheelZoomRef.current + e.deltaY * 0.008),
      );
      wheelZoomRef.current = next;
      setZoom(next);
    };
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist.current = Math.hypot(dx, dy);
        pinchStartZoom.current = wheelZoomRef.current;
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = pinchStartDist.current / dist;
        const cfg = getZoomConfig();
        const next = Math.max(
          cfg.min,
          Math.min(cfg.max, pinchStartZoom.current * scale),
        );
        wheelZoomRef.current = next;
        setZoom(next);
      }
    };
    const onTouchEnd = () => {
      pinchStartDist.current = null;
      pinchStartZoom.current = null;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [externalZoom]);

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) {
      toggleFlip();
    }
    dragStartX.current = null;
  };

  const themeKey = selectedTheme || "minimalist";
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.minimalist;

  // Debounced front cover canvas: run async after render, 200ms debounce
  // prevents blocking the main thread on every prop change
  const [frontCoverDataUrl, setFrontCoverDataUrl] = useState(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!frontCoverImg && !(titleOverlayEnabled && albumTitle)) {
      setFrontCoverDataUrl(null);
      return;
    }
    const t = setTimeout(() => {
      setFrontCoverDataUrl(
        generateFrontCoverDataUrl(frontCoverImg, {
          title: titleOverlayEnabled ? albumTitle || "" : "",
          subtitle: "",
          position: titlePosition || "bottom-center",
          font: titleFont || "Pretendard Variable",
          color: titleColor || "#000000",
          stroke: titleStroke ?? false,
          strokeOpacity: titleStrokeOpacity ?? 100,
        }),
      );
    }, 200);
    return () => clearTimeout(t);
  }, [
    frontCoverImg,
    albumTitle,
    titleOverlayEnabled,
    titlePosition,
    titleFont,
    titleColor,
    titleStroke,
    titleStrokeOpacity,
  ]);

  // Debounced back cover canvas: coalesces rapid sequential updates (image loads,
  // bio typing, theme changes) into a single 200ms-delayed canvas computation
  const [backCoverDataUrl, setBackCoverDataUrl] = useState(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const imgForBack = backCoverImg || frontCoverImg;
    const t = setTimeout(() => {
      setBackCoverDataUrl(
        generateBackCoverDataUrl(
          themeKey,
          bio || "",
          timeline || [],
          imgForBack,
          albumTitle || "",
          albumSubTitle || "",
          extractedColors,
          themeBgImg,
          themeStickerImg,
        ),
      );
    }, 200);
    return () => clearTimeout(t);
  }, [
    themeKey,
    bio,
    timeline,
    backCoverImg,
    frontCoverImg,
    albumTitle,
    albumSubTitle,
    extractedColors,
    themeBgImg,
    themeStickerImg,
  ]);

  // 합성 커버가 갱신될 때마다 부모에 최신본 전달 (라이브러리 캐시 낙관 갱신용)
  useEffect(() => {
    onCoversComposited?.({
      frontImage: frontCoverDataUrl || frontCover || null,
      backImage: backCoverDataUrl || null,
    });
  }, [frontCoverDataUrl, backCoverDataUrl, frontCover, onCoversComposited]);

  return (
    <div className="relative h-full w-full">
      {!hideControls && (
        <div className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
          <button
            onClick={() => setZoom((z) => Math.min(z + ZOOM_STEP, zoomCfg.max))}
            disabled={zoom >= zoomCfg.max}
            className="rounded-md p-1 text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7] disabled:opacity-30"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - ZOOM_STEP, zoomCfg.min))}
            disabled={zoom <= zoomCfg.min}
            className="rounded-md p-1 text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7] disabled:opacity-30"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFlip}
            className="rounded-md p-1 text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7]"
          >
            <Icon360 className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="absolute inset-0">
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            handlePointerDown(e);
            if (e.pointerType === "mouse") {
              mouseDragRef.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onPointerUp={handlePointerUp}
          onPointerMove={(e) => {
            if (hideControls) {
              const rect = e.currentTarget.getBoundingClientRect();
              setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          }}
          onPointerLeave={() => {
            dragStartX.current = null;
            setShowCursorTip(false);
          }}
          onTouchStart={handlePanTouchStart}
          onTouchMove={handlePanTouchMove}
          onTouchEnd={(e) => {
            handlePanTouchEnd();
          }}
        >
          {/* Cursor-following hint */}
          {hideControls && showCursorTip && (
            <div
              className="pointer-events-none absolute z-10 rounded-full bg-white/15 p-2 backdrop-blur-sm"
              style={{ left: cursorPos.x + 14, top: cursorPos.y - 10 }}
            >
              {cursorTipIcon ??
                (expanded ? (
                  <Minimize2 className="h-4 w-4 text-white/70" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-white/70" />
                ))}
            </div>
          )}
          <Canvas
            camera={{ position: [0, 0, 10], fov: 30 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.85,
            }}
            resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 4]} intensity={0.8} />
            <directionalLight position={[-2, 1, 2]} intensity={3} />
            <CameraZoom
              zoom={typeof externalZoom === "number" ? externalZoom : zoom}
              panOffset={{
                x: (cameraOffset?.x ?? 0) + panOffset.x,
                y: (cameraOffset?.y ?? 0) + panOffset.y,
              }}
            />
            <AlbumCover3D
              index={0}
              position={[0, 0, 0]}
              size={ALBUM_CONFIG.size}
              thickness={ALBUM_CONFIG.thickness}
              tiltAngle={ALBUM_CONFIG.tiltAngle}
              frontImage={frontCoverDataUrl || frontCover}
              backImage={backCoverOverride || backCoverDataUrl}
              edgeColor={theme.bg}
              isSelected={true}
              isFlipped={isFlipped}
              rotationY={rotationY}
              onClick={hideControls && onExpand ? onExpand : toggleFlip}
              onHoverChange={hideControls ? setShowCursorTip : undefined}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
