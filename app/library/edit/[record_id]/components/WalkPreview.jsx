"use client";

import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import * as THREE from "three";
import Scene from "@/app/walk/[id]/components/scene/Scene";
import {
  SEED,
  CAMERA_SPEED,
  getTextureConfig,
} from "@/app/walk/[id]/components/lib/constants";
import {
  mulberry32,
  generatePlanes,
} from "@/app/walk/[id]/components/lib/planeGenerator";

// Same visual as the live /walk LoadingOverlay (displayScene.jsx)
function LoadingOverlay({ pct, title, fading }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-black transition-opacity duration-1000 ease-out ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex w-72 flex-col items-center gap-6">
        {title && (
          <div className="text-center text-lg font-light tracking-wide text-white/80">
            {title}
          </div>
        )}

        <div className="w-full">
          <div className="mb-2 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/70 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-center text-xs tracking-widest text-white/40">
            {pct}%
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Edit-mode preview for the "Time Travel" (walk / exhibit) exhibition type.
 *
 * Mirrors the live /walk experience: same corridor Scene, same loading overlay with
 * an eased progress bar, and full wheel/touch/keyboard interaction — but the input
 * listeners are scoped to the preview canvas (Scene interactive="scoped") so they
 * never hijack the editor page's scroll or text inputs.
 *
 * @param {{
 *   photoMedia: Array<{ type: string, original_url?: string, thumbnail_url?: string, id?: string }>,
 *   mediaLoading?: boolean,
 *   title?: string,
 * }} props
 */
export default function WalkPreview({ photoMedia, mediaLoading = false, title }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Loading overlay state — same staging as the live walk page:
  // media fetch → 0-60%, texture loading → 60-95%, autoplay fade → 100%
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayFading, setOverlayFading] = useState(false);
  const [animatedPct, setAnimatedPct] = useState(0);
  const targetPctRef = useRef(0);

  const mediaList = useMemo(
    () =>
      (photoMedia ?? []).filter(
        (m) => m.type === "image" || m.type === "video",
      ),
    [photoMedia],
  );

  const planes = useMemo(() => {
    if (mediaList.length === 0) return [];
    const rng = mulberry32(SEED);
    return generatePlanes(rng, mediaList);
  }, [mediaList]);

  const textureConfig = useMemo(() => getTextureConfig(), []);

  // Media fetch stage → 0-60%
  useEffect(() => {
    if (mediaLoading) {
      targetPctRef.current = Math.max(targetPctRef.current, 10);
    } else if (mediaList.length > 0) {
      targetPctRef.current = Math.max(targetPctRef.current, 60);
    }
  }, [mediaLoading, mediaList.length]);

  // Texture loading stage → 60-95%
  const handleLoadProgress = useCallback((loaded, total) => {
    if (total > 0) {
      const realPct = Math.min(100, Math.round((loaded / total) * 100));
      targetPctRef.current = Math.max(
        targetPctRef.current,
        60 + Math.round(realPct * 0.35),
      );
    }
  }, []);

  // Smooth easing toward target (same interval easing as the live walk page)
  useEffect(() => {
    if (!overlayVisible) return;
    const interval = setInterval(() => {
      setAnimatedPct((prev) => {
        const target = targetPctRef.current;
        if (prev >= target) return prev;
        const diff = target - prev;
        const step = Math.max(0.3, diff * 0.06);
        return Math.min(target, prev + step);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [overlayVisible]);

  // Textures ready (~80% loaded) → 100% + 1s fade-out, then start playing
  const handleAutoPlay = useCallback(() => {
    targetPctRef.current = 100;
    setOverlayFading(true);
    setTimeout(() => {
      setOverlayVisible(false);
      setIsPlaying(true);
    }, 1000);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);
  const noop = useCallback(() => {}, []);

  const displayPct = Math.round(animatedPct);

  return (
    <div className="relative h-full w-full bg-black">
      {mediaList.length > 0 && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 0], fov: 80, near: 0.1, far: 7200 }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.85,
          }}
          style={{ width: "100%", height: "100%", touchAction: "none" }}
        >
          <Suspense fallback={null}>
            <Scene
              planes={planes}
              mediaListLength={mediaList.length}
              isPlaying={isPlaying}
              cameraSpeed={CAMERA_SPEED}
              textureConfig={textureConfig}
              onAutoPlay={handleAutoPlay}
              onLoadProgress={handleLoadProgress}
              onTogglePlay={handleTogglePlay}
              onToggleFullscreen={noop}
              onVideoBgmControl={noop}
              videoPreviewEnabled={false}
              videoMaxDuration={0}
              interactive="scoped"
            />
          </Suspense>
        </Canvas>
      )}

      {/* Loading overlay — same as the live exhibition */}
      {overlayVisible &&
        (mediaLoading || mediaList.length > 0 ? (
          <LoadingOverlay
            pct={displayPct}
            title={title || "전시 준비 중"}
            fading={overlayFading}
          />
        ) : (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black px-6 text-center text-sm text-white/50">
            미리보기를 표시할 사진이 아직 없습니다.
          </div>
        ))}
    </div>
  );
}
