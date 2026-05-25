"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecordData } from "@/app/lib/useRecordData";
import { useVHSScene } from "./lib/useVHSScene";
import { useMediaSlideshow } from "./lib/useMediaSlideshow";
import {
  DEFAULT_IMAGE_DURATION,
  DEFAULT_VIDEO_MODE,
  DEFAULT_FILTER,
  DEFAULT_TRANSITION,
  CONTROLS_IDLE_TIMEOUT_MS,
  INSERT_VIDEO_SRC,
  TV_OFF_IMAGE,
  TV_PLAYBACK_FRAME,
  STATIC_VIDEO_SRC,
} from "./lib/constants";
import VHSTapeIntro from "./VHSTapeIntro";
import TVInsertVideo from "./TVInsertVideo";
import TVScene from "./TVScene";
import VHSControls from "./VHSControls";

export default function VHSExhibition({ recordId, locale }) {
  const router = useRouter();
  const { data, loading, error, mediaLoading } = useRecordData(recordId);
  const { scene, startInsert, onInsertEnded } = useVHSScene();

  const [isPlaying, setIsPlaying] = useState(true);
  const [imageDuration, setImageDuration] = useState(DEFAULT_IMAGE_DURATION);
  const [videoMode, setVideoMode] = useState(DEFAULT_VIDEO_MODE);
  const [colorFilter, setColorFilter] = useState(DEFAULT_FILTER);
  const [transitionType, setTransitionType] = useState(DEFAULT_TRANSITION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const idleTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Filter media list for images and videos
  const mediaList = useMemo(
    () =>
      (data?.mediaList ?? []).filter(
        (m) => m.type === "image" || m.type === "video"
      ),
    [data]
  );

  const slideshow = useMediaSlideshow({
    mediaList,
    isPlaying,
    imageDuration,
    videoMode,
    active: scene === "playback",
  });

  // Preload assets on mount
  useEffect(() => {
    const preloadVideo = (src) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.src = src;
    };
    const preloadImage = (src) => {
      const img = new Image();
      img.src = src;
    };

    preloadVideo(INSERT_VIDEO_SRC);
    preloadVideo(STATIC_VIDEO_SRC);
    preloadImage(TV_OFF_IMAGE);
    preloadImage(TV_PLAYBACK_FRAME);
  }, []);

  // Preload upcoming slideshow media
  useEffect(() => {
    slideshow.preloadUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [slideshow.preloadUrls]);

  // Controls auto-hide
  const resetIdleTimer = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (scene !== "playback") return;

    const handleActivity = () => resetIdleTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    resetIdleTimer();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [scene, resetIdleTimer]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Handle play button on intro
  const handlePlay = useCallback(() => {
    startInsert();
  }, [startInsert]);

  // Handle exit
  const handleExit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    router.back();
  }, [router]);

  // Extract record info
  const title = data?.title ?? "";
  const lifestory = data?.lifestory?.content ?? "";

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-sm text-white/50">불러오는 중...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black">
        <div className="text-sm text-white/50">{error}</div>
        <button
          onClick={() => router.back()}
          className="rounded bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-black"
    >
      {/* Scene layers with crossfade */}
      {(scene === "intro" || scene === "insert") && (
        <VHSTapeIntro
          title={title}
          lifestory={lifestory}
          onPlay={handlePlay}
          visible={scene === "intro"}
        />
      )}

      {(scene === "insert" || scene === "tvOff") && (
        <TVInsertVideo
          onEnded={onInsertEnded}
          visible={scene === "insert"}
        />
      )}

      {(scene === "tvOff" || scene === "static" || scene === "playback") && (
        <TVScene
          scene={scene}
          currentItem={slideshow.currentItem}
          nextItem={slideshow.nextItem}
          currentIndex={slideshow.currentIndex}
          nextIndex={slideshow.nextIndex}
          transitioning={slideshow.transitioning}
          isPlaying={isPlaying}
          videoMode={videoMode}
          onVideoEnded={slideshow.advance}
          colorFilter={colorFilter}
          transitionType={transitionType}
          imageDuration={imageDuration}
          visible={scene !== "insert"}
        />
      )}

      {scene === "playback" && (
        <VHSControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          imageDuration={imageDuration}
          onImageDurationChange={setImageDuration}
          videoMode={videoMode}
          onVideoModeChange={setVideoMode}
          colorFilter={colorFilter}
          onColorFilterChange={setColorFilter}
          transitionType={transitionType}
          onTransitionTypeChange={setTransitionType}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onExit={handleExit}
          visible={showControls}
        />
      )}

      {/* Empty media state */}
      {scene === "playback" && mediaList.length === 0 && !mediaLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="text-sm text-white/50">
            표시할 미디어가 없습니다
          </div>
        </div>
      )}
    </div>
  );
}
