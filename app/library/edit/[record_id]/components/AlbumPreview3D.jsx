"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";
import { UNIFIED_THEMES } from "../themeConfig";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";

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

const ZOOM_STEP = 0.25;

function getZoomConfig() {
  if (typeof window === "undefined") return { min: 5, max: 7, default: 6 };
  const isMobile = window.innerWidth < 1024;
  return isMobile
    ? { min: 4, max: 6, default: 7.5 }
    : { min: 5, max: 7, default: 6 };
}

function CameraZoom({ zoom }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!size.width || !size.height) return;
    const aspect = size.width / size.height;
    // Ensure the album (width 1.8) fits horizontally with margin
    const fovRad = (30 * Math.PI) / 180;
    const minZ =
      (ALBUM_CONFIG.size * 1.4) / (2 * Math.tan(fovRad / 2) * aspect);
    camera.position.z = Math.max(zoom, minZ);
    camera.updateProjectionMatrix();
  }, [zoom, camera, size]);

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
  hideControls,
  cursorTipIcon,
  onExpand,
  onFlipChange,
  expanded,
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

  // Load front cover as HTMLImageElement (for color extraction only)
  useEffect(() => {
    if (!frontCover || typeof document === "undefined") {
      setFrontCoverImg(null);
      setExtractedColors(null);
      return;
    }
    const lower = frontCover.toLowerCase().split("?")[0];
    const isVideo =
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov");
    if (isVideo) {
      setFrontCoverImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFrontCoverImg(img);
    img.onerror = () => setFrontCoverImg(null);
    img.src = frontCover;
  }, [frontCover]);

  // Load backCoverImageUrl as HTMLImageElement (for back cover rendering)
  // Falls back to frontCoverImg when not provided or same URL
  useEffect(() => {
    if (
      !backCoverImageUrl ||
      backCoverImageUrl === frontCover ||
      typeof document === "undefined"
    ) {
      setBackCoverImg(null); // will use frontCoverImg as fallback in useMemo
      return;
    }
    const lower = backCoverImageUrl.toLowerCase().split("?")[0];
    const isVideo =
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov");
    if (isVideo) {
      setBackCoverImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBackCoverImg(img);
    img.onerror = () => setBackCoverImg(null);
    img.src = backCoverImageUrl;
  }, [backCoverImageUrl, frontCover]);

  // Extract dominant colors from front cover
  useEffect(() => {
    if (!frontCoverImg) {
      setExtractedColors(null);
      return;
    }
    extractColors(frontCoverImg, { pixels: 10000, distance: 0.2 })
      .then((colors) => {
        const main = colors.sort((a, b) => b.area - a.area)[0];
        if (!main) return;
        // Generate 3 brightness variants: dark, mid, light
        const { red, green, blue } = main;
        const variants = [0.4, 0.7, 1.0].map((factor) => {
          const r = Math.min(255, Math.round(red * factor));
          const g = Math.min(255, Math.round(green * factor));
          const b = Math.min(255, Math.round(blue * factor));
          return `rgb(${r}, ${g}, ${b})`;
        });
        setExtractedColors(variants);
      })
      .catch(() => setExtractedColors(null));
  }, [frontCoverImg]);

  // Sync with external flipped prop (tab switch)
  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped);
    }
  }, [flipped]);
  const dragStartX = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursorTip, setShowCursorTip] = useState(false);

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

  // Load theme background image and sticker when themeKey changes
  useEffect(() => {
    const key = selectedTheme || "minimalist";
    const bgMap = {
      kitsch: "/images/albumtheme/kitsch.png",
      illustration: "/images/albumtheme/illustration.png",
    };
    const bgSrc = bgMap[key];
    if (!bgSrc) {
      setThemeBgImg(null);
      setThemeStickerImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setThemeBgImg(img);
    img.onerror = () => setThemeBgImg(null);
    img.src = bgSrc;

    // Load sticker overlay for kitsch theme
    if (key === "kitsch") {
      const sticker = new Image();
      sticker.onload = () => setThemeStickerImg(sticker);
      sticker.onerror = () => setThemeStickerImg(null);
      sticker.src = "/images/albumtheme/kitsch 2.png";
    } else {
      setThemeStickerImg(null);
    }
  }, [selectedTheme]);

  const themeKey = selectedTheme || "minimalist";
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.minimalist;

  const frontCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    // Skip if no image and no title to overlay
    if (!frontCoverImg && !(titleOverlayEnabled && albumTitle)) return null;
    return generateFrontCoverDataUrl(frontCoverImg, {
      title: titleOverlayEnabled ? albumTitle || "" : "",
      subtitle: "",
      position: titlePosition || "bottom-center",
      font: titleFont || "Pretendard Variable",
      color: titleColor || "#000000",
      stroke: titleStroke ?? false,
      strokeOpacity: titleStrokeOpacity ?? 100,
    });
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

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    // backCoverImg이 없으면 frontCoverImg로 폴백 (기본값 = 앞면)
    const imgForBack = backCoverImg || frontCoverImg;
    return generateBackCoverDataUrl(
      themeKey,
      bio || "",
      timeline || [],
      imgForBack,
      albumTitle || "",
      albumSubTitle || "",
      extractedColors,
      themeBgImg,
      themeStickerImg,
    );
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

  return (
    <div className="flex h-full w-full flex-col items-center">
      {!hideControls && (
        <div className="flex shrink-0 items-center gap-3 py-2">
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
      <div className="relative min-h-0 w-full flex-1">
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={(e) => {
            if (hideControls) {
              const rect = e.currentTarget.getBoundingClientRect();
              setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
              setShowCursorTip(true);
            }
          }}
          onPointerEnter={() => hideControls && setShowCursorTip(true)}
          onPointerLeave={() => {
            dragStartX.current = null;
            setShowCursorTip(false);
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
            gl={{ antialias: true }}
            resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 4]} intensity={0.8} />
            <directionalLight position={[-2, 1, 2]} intensity={3} />
            <CameraZoom
              zoom={typeof externalZoom === "number" ? externalZoom : zoom}
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
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
