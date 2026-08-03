"use client";

import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import * as THREE from "three";
import { X, Maximize2, Minimize2, Gauge, Video } from "lucide-react";
import { SlLogout } from "react-icons/sl";
import Scene from "./scene/Scene";
import { SEED, CAMERA_SPEED, getTextureConfig } from "./lib/constants";
import { mulberry32, generatePlanes } from "./lib/planeGenerator";
import { useRecordData } from "@/app/lib/useRecordData";
import { isNativeApp } from "@/app/utils/platform";

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
    videoOptions: "비디오 옵션",
    videoPreview: "비디오 조금씩만 보기",
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
    videoOptions: "Video Options",
    videoPreview: "Short video preview",
  },
};

const VIDEO_DURATION_OPTIONS = [
  { label: "10초", value: 10 },
  { label: "30초", value: 30 },
  { label: "1분", value: 60 },
  { label: "3분", value: 180 },
  { label: "10분", value: 600 },
  { label: "30분", value: 1800 },
];

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
  videoPreviewEnabled,
  onToggleVideoPreview,
  videoMaxDuration,
  onVideoMaxDurationChange,
  isApp,
  t,
}) {
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const videoOptionsRef = useRef(null);

  useEffect(() => {
    if (!showVideoOptions) return;
    const handleClickOutside = (e) => {
      if (
        videoOptionsRef.current &&
        !videoOptionsRef.current.contains(e.target)
      ) {
        setShowVideoOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVideoOptions]);
  return (
    <div className="absolute top-[max(env(safe-area-inset-top),0.75rem)] left-1/2 z-10 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
      <Tooltip label={t.exit}>
        <button
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          {/* <X className="h-4 w-4 text-white" /> */}
          <SlLogout className="h-4 w-4 text-white" />
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

      <div ref={videoOptionsRef} className="relative">
        <Tooltip label={t.videoOptions}>
          <button
            onClick={() => setShowVideoOptions((v) => !v)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              videoPreviewEnabled
                ? "bg-white/40 hover:bg-white/50"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            <Video className="h-5 w-5 text-white" />
          </button>
        </Tooltip>
        {showVideoOptions && (
          <div className="absolute top-full left-1/2 mt-2 min-w-[200px] -translate-x-1/2 rounded-lg bg-black/80 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs whitespace-nowrap text-white/80">
                {t.videoPreview}
              </span>
              <button
                role="switch"
                aria-checked={videoPreviewEnabled}
                onClick={onToggleVideoPreview}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                  videoPreviewEnabled ? "bg-white/50" : "bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none mt-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    videoPreviewEnabled
                      ? "ml-0.5 translate-x-4"
                      : "ml-0.5 translate-x-0"
                  }`}
                />
              </button>
            </div>
            {videoPreviewEnabled && (
              <select
                value={videoMaxDuration}
                onChange={(e) =>
                  onVideoMaxDurationChange(Number(e.target.value))
                }
                className="w-full cursor-pointer rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                {VIDEO_DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

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

      {/* 앱(WebView)에서는 항상 전체화면이므로 전체화면 버튼 숨김 */}
      {!isApp && (
        <>
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
        </>
      )}
    </div>
  );
}

// ── 성능 계측 프로브 (URL에 ?debug 추가 시 활성) ──────────────────────────────
// Canvas 내부에서 프레임 시간·드로우콜·GPU 리소스 수를 0.5s 창으로 집계해
// 오버레이로 전달한다. 실기기(모바일)에서 병목을 실측하기 위한 도구.
function PerfProbe({ enabled, onSample }) {
  const accRef = useRef({ frames: 0, time: 0, maxDt: 0 });
  useFrame(({ gl }, delta) => {
    if (!enabled) return;
    const a = accRef.current;
    a.frames += 1;
    a.time += delta;
    if (delta > a.maxDt) a.maxDt = delta;
    if (a.time >= 0.5) {
      onSample({
        fps: Math.round(a.frames / a.time),
        avgMs: ((a.time / a.frames) * 1000).toFixed(1),
        maxMs: (a.maxDt * 1000).toFixed(0),
        calls: gl.info.render.calls,
        tris: gl.info.render.triangles,
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
      });
      accRef.current = { frames: 0, time: 0, maxDt: 0 };
    }
  });
  return null;
}

function PerfOverlay({ data }) {
  if (!data) return null;
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-50 rounded bg-black/70 p-2 font-mono text-[10px] leading-tight text-green-400">
      <div>FPS {data.fps} | frame {data.avgMs}ms (max {data.maxMs}ms)</div>
      <div>calls {data.calls} | tris {(data.tris / 1000).toFixed(0)}k</div>
      <div>tex {data.textures} | geom {data.geometries} | dpr {typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : "?"}</div>
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

  const {
    data: recordData,
    loading,
    error,
    mediaLoading,
  } = useRecordData(recordId, {
    onMediaProgress: handleMediaProgress,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(CAMERA_SPEED);
  // 모바일 기본 카메라 속도 하향(getTextureConfig.defaultCameraSpeed) — SSR 초기값과의
  // 하이드레이션 불일치를 피하려고 마운트 후 1회 보정(재생 시작 전이라 체감 점프 없음).
  useEffect(() => {
    const d = getTextureConfig().defaultCameraSpeed;
    if (d && d !== CAMERA_SPEED) setCameraSpeed(d);
  }, []);

  // 성능 오버레이 — URL에 ?debug가 있으면 활성(실기기 병목 실측용)
  const [perfEnabled, setPerfEnabled] = useState(false);
  const [perfData, setPerfData] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("debug")) {
      setPerfEnabled(true);
    }
  }, []);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoPreviewEnabled, setVideoPreviewEnabled] = useState(false);
  const [videoMaxDuration, setVideoMaxDuration] = useState(30);

  // 편집 페이지에서 저장한 재생 설정을 초기값으로 적용
  // (감상 중 컨트롤로 바꾸는 것은 세션 한정 — 저장되지 않음)
  useEffect(() => {
    if (!recordData) return;
    if (recordData.walkCameraSpeed != null)
      setCameraSpeed(recordData.walkCameraSpeed);
    if (recordData.walkVideoPreview != null)
      setVideoPreviewEnabled(recordData.walkVideoPreview);
    if (recordData.walkVideoMaxDuration != null)
      setVideoMaxDuration(recordData.walkVideoMaxDuration);
  }, [recordData]);
  const bgmRef = useRef(null);
  const bgmMutedByVideoRef = useRef(false);
  const textureConfig = useMemo(() => getTextureConfig(), []);

  const [sceneReady, setSceneReady] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [showControls, setShowControls] = useState(true);
  const idleTimerRef = useRef(null);

  // 앱(Capacitor WebView) 여부 — 클라이언트에서만 판정(SSR 불일치 방지)
  const [isApp, setIsApp] = useState(false);
  useEffect(() => {
    setIsApp(isNativeApp());
  }, []);

  // 앱/감상 화면에서 페이지 스크롤·오버스크롤을 잠가 항상 꽉 찬 전체화면 유지
  // (위로 드래그 시 하단 여백이 생기는 문제 방지)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      overflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
      position: body.style.position,
      width: body.style.width,
      height: body.style.height,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.overflow;
      body.style.overscrollBehavior = prev.overscroll;
      body.style.position = prev.position;
      body.style.width = prev.width;
      body.style.height = prev.height;
    };
  }, []);

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
    return generatePlanes(rng, mediaList, textureConfig.planePoolSize);
  }, [mediaList, textureConfig.planePoolSize]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleLoadProgress = useCallback((loaded, total) => {
    setLoadProgress({ loaded, total });
  }, []);

  const handleAutoPlay = useCallback(() => {
    // Scene textures are ready — set target to 100 and let the easing interval
    // animate smoothly toward it instead of jumping instantly
    targetPctRef.current = 100;
    setOverlayFading(true);
    setTimeout(() => {
      setSceneReady(true);
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

  // UI auto-hide (YouTube식): 탭하면 컨트롤 표시 후 3초 뒤 자동 숨김.
  // 앞뒤 이동용 "드래그"는 컨트롤을 띄우지 않도록 탭과 구분한다.
  useEffect(() => {
    const TAP_MOVE_THRESHOLD = 10; // px — 이 이상 움직이면 드래그로 간주
    const IDLE_MS = 3000;

    const showAndResetIdle = () => {
      setShowControls(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setShowControls(false), IDLE_MS);
    };

    // ── 터치: 탭만 컨트롤 표시, 드래그는 제외 ──
    let touchStart = null;
    const onTouchStart = (e) => {
      const tch = e.touches[0];
      touchStart = tch
        ? { x: tch.clientX, y: tch.clientY, moved: e.touches.length > 1 }
        : null;
    };
    const onTouchMove = (e) => {
      if (!touchStart) return;
      const tch = e.touches[0];
      if (!tch) return;
      if (
        Math.hypot(tch.clientX - touchStart.x, tch.clientY - touchStart.y) >
        TAP_MOVE_THRESHOLD
      ) {
        touchStart.moved = true; // 드래그로 확정 → 컨트롤 표시 안 함
      }
    };
    const onTouchEnd = () => {
      if (touchStart && !touchStart.moved) showAndResetIdle(); // 탭
      touchStart = null;
    };

    // ── 데스크톱: 마우스 이동 시 표시 ──
    const onMouseMove = () => showAndResetIdle();

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("mousemove", onMouseMove);
    showAndResetIdle(); // 진입 시 잠깐 표시

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousemove", onMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Compute target progress from SSE events + texture loading (real values only)
  // Ranges: 0-60% scraping, 60-95% texture loading, 95-100% autoplay fade
  useEffect(() => {
    if (scrapingProgress) {
      const { phase, sourceIndex, totalSources } = scrapingProgress;
      const SCRAPE_RANGE = 60; // 0-60%

      if (phase === "started") {
        targetPctRef.current = Math.max(targetPctRef.current, 1);
      } else if (phase === "scraping") {
        const base = Math.round((sourceIndex / totalSources) * SCRAPE_RANGE);
        targetPctRef.current = Math.max(targetPctRef.current, base);
      } else if (phase === "scraping_detail") {
        // Sub-step progress within a single source
        const sourceRange = SCRAPE_RANGE / totalSources;
        const sourceStart = sourceIndex * sourceRange;
        const { step, current, total } = scrapingProgress;

        // Map each step to a fraction within the source range
        const SUB_STEPS = {
          fetching_page: 0.1,
          urls_found: 0.15,
          building_list: 0.95,
          page_loading: 0.15,
          waiting_for_content: 0.25,
          collecting_media: 0.85,
        };

        let subPct;
        if (step === "probing_media" && total > 0) {
          subPct = 0.15 + (current / total) * 0.75;
        } else if (step === "scrolling" && total > 0) {
          subPct = 0.25 + (current / total) * 0.5;
        } else {
          subPct = SUB_STEPS[step] ?? 0;
        }

        const overallPct = sourceStart + subPct * sourceRange;
        targetPctRef.current = Math.max(
          targetPctRef.current,
          Math.round(overallPct),
        );
      } else if (phase === "source_done" || phase === "source_error") {
        const pct = Math.round(
          ((sourceIndex + 1) / totalSources) * SCRAPE_RANGE,
        );
        targetPctRef.current = Math.max(targetPctRef.current, pct);
      } else if (phase === "optimizing") {
        targetPctRef.current = Math.max(targetPctRef.current, SCRAPE_RANGE);
      }
    }
  }, [scrapingProgress]);

  useEffect(() => {
    if (loadProgress.total > 0) {
      const realPct = Math.min(
        100,
        Math.round((loadProgress.loaded / loadProgress.total) * 100),
      );
      // Map texture loading to 60-95% range
      targetPctRef.current = Math.max(
        targetPctRef.current,
        60 + Math.round(realPct * 0.35),
      );
    }
  }, [loadProgress]);

  // Smooth easing toward target (no prediction/creep — only animates toward real milestones)
  // Keeps running even after sceneReady so animatedPct reaches 100% smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPct((prev) => {
        const target = targetPctRef.current;
        if (prev >= target) return prev;
        const diff = target - prev;
        const step = Math.max(0.3, diff * 0.06);
        const next = Math.min(target, prev + step);
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

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
    <div
      className="relative h-full w-full"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Loading overlay — fades out when scene is ready, removed after transition */}
      {overlayVisible && (
        <LoadingOverlay
          pct={displayPct}
          title={recordData?.title || t.preparing}
          fading={overlayFading}
        />
      )}

      {perfEnabled && <PerfOverlay data={perfData} />}

      <div
        className={`transition-opacity duration-500 ${!(isApp || isFullscreen) || showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
            videoPreviewEnabled={videoPreviewEnabled}
            onToggleVideoPreview={() => setVideoPreviewEnabled((v) => !v)}
            videoMaxDuration={videoMaxDuration}
            onVideoMaxDurationChange={setVideoMaxDuration}
            isApp={isApp}
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
          style={{ width: "100%", height: "100%", touchAction: "none" }}
        >
          <Suspense fallback={null}>
            <Scene
              planes={planes}
              mediaList={mediaList}
              mediaListLength={mediaList.length}
              isPlaying={isPlaying}
              cameraSpeed={cameraSpeed}
              textureConfig={textureConfig}
              onAutoPlay={handleAutoPlay}
              onLoadProgress={handleLoadProgress}
              onTogglePlay={handleTogglePlay}
              onToggleFullscreen={handleToggleFullscreen}
              onVideoBgmControl={handleVideoBgmControl}
              videoPreviewEnabled={videoPreviewEnabled}
              videoMaxDuration={videoMaxDuration}
            />
            <PerfProbe enabled={perfEnabled} onSample={setPerfData} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
