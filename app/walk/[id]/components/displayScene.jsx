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
}) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
      <Tooltip label="나가기">
        <button
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-white/20" />

      <Tooltip label={isPlaying ? "일시정지" : "재생"}>
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

      <Tooltip label="재생 속도">
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
          <Tooltip label={isMuted ? "음악 켜기" : "음악 끄기"}>
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

      <Tooltip label={isFullscreen ? "전체화면 해제" : "전체화면"}>
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

export default function DisplayScene({ recordId }) {
  const router = useRouter();
  const { data: recordData, loading, error } = useRecordData(recordId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(CAMERA_SPEED);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bgmRef = useRef(null);
  const textureConfig = useMemo(() => getTextureConfig(), []);

  const [showControls, setShowControls] = useState(true);
  const idleTimerRef = useRef(null);

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

  const mediaList = useMemo(
    () => (recordData?.mediaList ?? []).filter((m) => m.type === "image"),
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

  const handleAutoPlay = useCallback(() => {
    setIsPlaying(true);
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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">Loading...</div>
          <div className="text-sm text-gray-400">
            Fetching media from server
          </div>
        </div>
      </div>
    );
  }

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

  // if (recordData?.isPublic === false) {
  //   return (
  //     <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
  //       <p className="text-2xl">🔒</p>
  //       <p className="text-sm font-light tracking-wide text-white/60">
  //         비공개 앨범입니다
  //       </p>
  //       <p className="text-xs tracking-wider text-white/30">
  //         앨범 소유자만 열람할 수 있어요
  //       </p>
  //     </div>
  //   );
  // }

  if (mediaList.length === 0) {
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
      <div
        className={`transition-opacity duration-500 ${!isFullscreen || showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
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
        />
      </div>

      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 300],
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
            isPlaying={isPlaying}
            cameraSpeed={cameraSpeed}
            textureConfig={textureConfig}
            onAutoPlay={handleAutoPlay}
            onTogglePlay={handleTogglePlay}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
