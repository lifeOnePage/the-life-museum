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

// 감상 화면(displayScene)과 동일한 짧게 보기 시간 옵션
const VIDEO_DURATION_OPTIONS = [
  { label: "10초", value: 10 },
  { label: "30초", value: 30 },
  { label: "1분", value: 60 },
  { label: "3분", value: 180 },
  { label: "10분", value: 600 },
  { label: "30분", value: 1800 },
];

/**
 * Edit-mode preview for the "Time Travel" (walk / exhibit) exhibition type.
 *
 * Mirrors the live /walk experience: same corridor Scene, same loading overlay with
 * an eased progress bar, and full wheel/touch/keyboard interaction — but the input
 * listeners are scoped to the preview canvas (Scene interactive="scoped") so they
 * never hijack the editor page's scroll or text inputs.
 *
 * 재생 설정(카메라 속도, 비디오 짧게 보기)은 부모(편집 페이지)의 상태와 연결되어
 * 저장 시 record에 함께 기록된다.
 *
 * @param {{
 *   photoMedia: Array<{ type: string, original_url?: string, thumbnail_url?: string, id?: string }>,
 *   mediaLoading?: boolean,
 *   title?: string,
 *   cameraSpeed?: number,
 *   onCameraSpeedChange?: (v: number) => void,
 *   videoPreviewEnabled?: boolean,
 *   onVideoPreviewChange?: (v: boolean) => void,
 *   videoMaxDuration?: number,
 *   onVideoMaxDurationChange?: (v: number) => void,
 * }} props
 */
export default function WalkPreview({
  photoMedia,
  mediaLoading = false,
  title,
  cameraSpeed = CAMERA_SPEED,
  onCameraSpeedChange,
  videoPreviewEnabled = false,
  onVideoPreviewChange,
  videoMaxDuration = 30,
  onVideoMaxDurationChange,
}) {
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
              cameraSpeed={cameraSpeed}
              textureConfig={textureConfig}
              onAutoPlay={handleAutoPlay}
              onLoadProgress={handleLoadProgress}
              onTogglePlay={handleTogglePlay}
              onToggleFullscreen={noop}
              onVideoBgmControl={noop}
              videoPreviewEnabled={videoPreviewEnabled}
              videoMaxDuration={videoPreviewEnabled ? videoMaxDuration : 0}
              interactive="scoped"
            />
          </Suspense>
        </Canvas>
      )}

      {/* 재생 설정 컨트롤 바 — VHSPreview와 동일한 톤 (record에 저장됨) */}
      {!overlayVisible && (
        <div className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/60">속도</span>
            <input
              type="range"
              min={5}
              max={240}
              value={cameraSpeed}
              onChange={(e) => onCameraSpeedChange?.(Number(e.target.value))}
              className="w-20 accent-white"
            />
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/60">영상 짧게</span>
            <button
              role="switch"
              aria-checked={videoPreviewEnabled}
              onClick={() => onVideoPreviewChange?.(!videoPreviewEnabled)}
              className={`relative h-4 w-7 rounded-full transition-colors ${
                videoPreviewEnabled ? "bg-white/50" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
                  videoPreviewEnabled ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </button>
            {videoPreviewEnabled && (
              <select
                value={videoMaxDuration}
                onChange={(e) =>
                  onVideoMaxDurationChange?.(Number(e.target.value))
                }
                className="cursor-pointer rounded bg-white/10 px-1.5 py-1 text-[10px] text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                {VIDEO_DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
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
