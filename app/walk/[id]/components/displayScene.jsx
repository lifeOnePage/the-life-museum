"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import * as THREE from "three";
import { X, Maximize2, Minimize2, Gauge } from "lucide-react";
import Scene from "./scene/Scene";
import { SEED, CAMERA_SPEED, getTextureConfig } from "./lib/constants";
import { mulberry32, generatePlanes } from "./lib/planeGenerator";
import { useRecordData } from "@/app/lib/useRecordData";

const T = {
  ko: {
    exit: "나가기",
    pause: "일시정지",
    play: "재생",
    speed: "재생 속도",
    musicOn: "음악 켜기",
    musicOff: "음악 끄기",
    fullscreenOff: "전체화면 해제",
    fullscreen: "전체화면",
    preparing: "전시 준비 중",
  },
  en: {
    exit: "Exit",
    pause: "Pause",
    play: "Play",
    speed: "Playback Speed",
    musicOn: "Unmute",
    musicOff: "Mute",
    fullscreenOff: "Exit Fullscreen",
    fullscreen: "Fullscreen",
    preparing: "Preparing exhibition",
  },
};

function Tooltip({ label, children }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

// Loading overlay with progress bar and fade-out support
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

// Playback Controls UI
function PlaybackControls({
  isPlaying,
  onTogglePlay,
  cameraSpeed,
  onCameraSpeedChange,
  onExit,
  isMuted,
  onToggleMute,
  hasBgm,
  isFullscreen,
  onToggleFullscreen,
  t,
}) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
      <Tooltip label={t.exit}>
        <button
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-white/20" />

      <Tooltip label={isPlaying ? t.pause : t.play}>
        <button
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </Tooltip>

      <Tooltip label={t.speed}>
        <Gauge className="mr-1.5 h-6 w-6 shrink-0 text-white/70" />
        <input
          type="range"
          min={5}
          max={240}
          value={cameraSpeed}
          onChange={(e) => onCameraSpeedChange(Number(e.target.value))}
          className="w-24 accent-white"
        />
      </Tooltip>

      {hasBgm && (
        <>
          <div className="h-6 w-px bg-white/20" />
          <Tooltip label={isMuted ? t.musicOn : t.musicOff}>
            <button
              onClick={onToggleMute}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
          </Tooltip>
        </>
      )}

      <div className="h-6 w-px bg-white/20" />

      <Tooltip label={isFullscreen ? t.fullscreenOff : t.fullscreen}>
        <button
          onClick={onToggleFullscreen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-white" />
          ) : (
            <Maximize2 className="h-5 w-5 text-white" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}

export default function DisplayScene({ recordId, locale }) {
  const t = T[locale] || T.ko;
  const router = useRouter();

  const [scrapingProgress, setScrapingProgress] = useState(null);

  const handleMediaProgress = useCallback((event) => {
    setScrapingProgress(event);
  }, []);

  const { data: recordData, loading, error, mediaLoading } = useRecordData(recordId, {
    onMediaProgress: handleMediaProgress,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(CAMERA_SPEED);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bgmRef = useRef(null);
  const bgmMutedByVideoRef = useRef(false);
  const textureConfig = useMemo(() => getTextureConfig(), []);

  const [sceneReady, setSceneReady] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [showControls, setShowControls] = useState(true);
  const idleTimerRef = useRef(null);

  // Smooth progress animation state
  const [animatedPct, setAnimatedPct] = useState(0);
  const targetPctRef = useRef(0);

  const bgmUrl = recordData?.bgmUrl || null;

  // BGM 없으면 기본 음소거
  useEffect(() => {
    if (!loading && !bgmUrl) {
      setIsMuted(true);
    }
  }, [loading, bgmUrl]);

  // BGM 초기화
  useEffect(() => {
    if (!bgmUrl) return;
    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0.4;
    bgmRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [bgmUrl]);

  // isPlaying 변화에 따라 BGM 재생/정지
  useEffect(() => {
    if (!bgmRef.current) return;
    if (isPlaying) {
      bgmRef.current.play().catch(() => {
        // autoplay 정책 등으로 재생 실패 시 음소거 상태로 폴백
        bgmRef.current.muted = true;
        setIsMuted(true);
      });
    } else {
      bgmRef.current.pause();
    }
  }, [isPlaying]);

  // isMuted 변화에 따라 음소거 처리 (iOS는 volume read-only라 muted 속성 사용)
  useEffect(() => {
    if (!bgmRef.current) return;
    bgmRef.current.muted = isMuted;
  }, [isMuted]);

  // 비디오 재생 시 BGM 뮤트/복원 콜백
  const handleVideoBgmControl = useCallback(
    (videoIsPlaying) => {
      if (!bgmRef.current) return;
      if (videoIsPlaying) {
        bgmMutedByVideoRef.current = true;
        bgmRef.current.volume = 0;
      } else {
        bgmMutedByVideoRef.current = false;
        bgmRef.current.volume = isMuted ? 0 : 0.4;
      }
    },
    [isMuted],
  );

  const mediaList = useMemo(
    () =>
      (recordData?.mediaList ?? []).filter(
        (m) => m.type === "image" || m.type === "video",
      ),
    [recordData],
  );

  const planes = useMemo(() => {
    if (mediaList.length === 0) return [];
    const rng = mulberry32(SEED);
    return generatePlanes(rng, mediaList);
  }, [mediaList]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleLoadProgress = useCallback((loaded, total) => {
    setLoadProgress({ loaded, total });
  }, []);

  const handleAutoPlay = useCallback(() => {
    // Scene textures are ready — start overlay fade-out, then begin playback
    setSceneReady(true);
    targetPctRef.current = 100;
    setAnimatedPct(100);
    setOverlayFading(true);
    // Wait for overlay fade-out (1s CSS transition) before starting playback
    setTimeout(() => {
      setOverlayVisible(false);
      setIsPlaying(true);
    }, 1000);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync isFullscreen state with browser fullscreen changes (e.g. ESC key)
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // UI auto-hide: show on interaction, hide after 3s idle
  useEffect(() => {
    const handleInteraction = () => {
      setShowControls(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    handleInteraction();

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Compute target progress from SSE events + texture loading (real values only)
  useEffect(() => {
    if (scrapingProgress) {
      const { phase, sourceIndex, totalSources } = scrapingProgress;
      if (phase === 'started') {
        // Stream connected — small initial progress
        targetPctRef.current = Math.max(targetPctRef.current, 3);
      } else if (phase === 'scraping') {
        // Source scraping started — map to proportional range within 3-90%
        const base = 3 + Math.round((sourceIndex / totalSources) * 87);
        targetPctRef.current = Math.max(targetPctRef.current, base);
      } else if (phase === 'source_done' || phase === 'source_error') {
        targetPctRef.current = 3 + Math.round(((sourceIndex + 1) / totalSources) * 87);
      } else if (phase === 'optimizing') {
        targetPctRef.current = 90;
      }
    }
  }, [scrapingProgress]);

  useEffect(() => {
    if (loadProgress.total > 0) {
      const realPct = Math.min(100, Math.round((loadProgress.loaded / loadProgress.total) * 100));
      targetPctRef.current = 90 + Math.round(realPct * 0.1);
    }
  }, [loadProgress]);

  // Smooth easing toward target (no prediction/creep — only animates toward real milestones)
  useEffect(() => {
    if (sceneReady) return;

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
  }, [sceneReady]);

  const displayPct = Math.round(animatedPct);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl text-red-500">Error</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!loading && !mediaLoading && mediaList.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">No Media Found</div>
          <div className="text-sm text-gray-400">
            The album appears to be empty
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay — fades out when scene is ready, removed after transition */}
      {overlayVisible && (
        <LoadingOverlay
          pct={displayPct}
          title={recordData?.title || t.preparing}
          fading={overlayFading}
        />
      )}

      <div
        className={`transition-opacity duration-500 ${!isFullscreen || showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {!overlayVisible && (
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            cameraSpeed={cameraSpeed}
            onCameraSpeedChange={setCameraSpeed}
            onExit={() => router.back()}
            hasBgm={!!bgmUrl}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((m) => !m)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            t={t}
          />
        )}
      </div>

      {!loading && mediaList.length > 0 && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{
            position: [0, 0, 0],
            fov: 80,
            near: 0.1,
            far: 7200,
          }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.85,
          }}
          style={{ width: "100%", height: "100%" }}
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
              onToggleFullscreen={handleToggleFullscreen}
              onVideoBgmControl={handleVideoBgmControl}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
