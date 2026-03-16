"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ZoomIn, ZoomOut } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";
import { UNIFIED_THEMES } from "../themeConfig";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";

const ALBUM_CONFIG = {
  size: 1.8,
  thickness: 0.03,
  tiltAngle: 0,
};

const ZOOM_MIN = 5;
const ZOOM_MAX = 7;
const ZOOM_STEP = 0.25;
const ZOOM_DEFAULT = 6;

function CameraZoom({ zoom }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    // Ensure the album (width 1.8) fits horizontally with margin
    const fovRad = (30 * Math.PI) / 180;
    const minZ = (ALBUM_CONFIG.size * 1.15) / (2 * Math.tan(fovRad / 2) * aspect);
    camera.position.z = Math.max(zoom, minZ);
    camera.updateProjectionMatrix();
  }, [zoom, camera, size]);

  return null;
}

export default function AlbumPreview3D({
  frontCover,
  bio,
  timeline,
  selectedTheme,
  albumTitle,
  flipped,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [frontCoverImg, setFrontCoverImg] = useState(null);
  const [extractedColors, setExtractedColors] = useState(null);

  // Load front cover as HTMLImageElement for canvas drawing
  // Video URLs (mp4/webm/mov) cannot be drawn to canvas synchronously — skip loading
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

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) {
      setIsFlipped((f) => !f);
    }
    dragStartX.current = null;
  };

  const themeKey = selectedTheme || "elegant";
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.elegant;

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(
      themeKey,
      bio || "",
      timeline || [],
      frontCoverImg,
      albumTitle || "",
      extractedColors,
    );
  }, [themeKey, bio, timeline, frontCoverImg, albumTitle, extractedColors]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex shrink-0 items-center gap-3 py-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX))}
          disabled={zoom >= ZOOM_MAX}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsFlipped((f) => !f)}
          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          {isFlipped ? "앞면" : "뒷면"} 보기
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN))}
          disabled={zoom <= ZOOM_MIN}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <div className="relative min-h-0 w-full flex-1">
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragStartX.current = null;
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 6], fov: 30 }}
            gl={{ antialias: true }}
            resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 4]} intensity={0.8} />
            <directionalLight position={[-2, 1, 2]} intensity={3} />
            <CameraZoom zoom={zoom} />
            <AlbumCover3D
              index={0}
              position={[0, 0, 0]}
              size={ALBUM_CONFIG.size}
              thickness={ALBUM_CONFIG.thickness}
              tiltAngle={ALBUM_CONFIG.tiltAngle}
              frontImage={frontCover}
              backImage={backCoverDataUrl}
              edgeColor={theme.bg}
              isSelected={true}
              isFlipped={isFlipped}
              onClick={() => setIsFlipped((f) => !f)}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
