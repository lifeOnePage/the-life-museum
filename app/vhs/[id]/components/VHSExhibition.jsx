"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
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
  PHOTO_FRAME_CLOSEUP,
  STATIC_VIDEO_SRC,
  TV_CLOSEUP_IMAGE,
} from "./lib/constants";
import { useBGM } from "./lib/useBGM";
import VHSTapeIntro from "./VHSTapeIntro";
import TVInsertVideo from "./TVInsertVideo";
import TVScene from "./TVScene";
import TVMediaViewport from "./TVMediaViewport";
import VHSControls from "./VHSControls";
import PhotoFrameCloseup from "./PhotoFrameCloseup";
import TVCloseup from "./TVCloseup";

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

  // 공유 감상 모드(share 링크 → /vhs/{id}?share=1): 소유자용 기능 비활성화.
  // useSearchParams 대신 window 접근(useEffect)으로 static export 빌드 제약 회피.
  const [isShareView, setIsShareView] = useState(false);
  useEffect(() => {
    setIsShareView(
      new URLSearchParams(window.location.search).has("share"),
    );
  }, []);

  // BGM with fade in/out
  const bgmUrl = data?.bgmUrl || data?.bgm || null;
  const {
    isMuted: bgmMuted,
    toggleMute: bgmToggleMute,
    startBGM,
    duck: bgmDuck,
    unduck: bgmUnduck,
    setBgmPlaying,
    hasBgm,
  } = useBGM(bgmUrl);

  // Load saved VHS settings from record data
  useEffect(() => {
    if (!data) return;
    if (data.vhsFilter) setColorFilter(data.vhsFilter);
    if (data.vhsTransition) setTransitionType(data.vhsTransition);
    // 저장된 재생 설정: 사진 표시 시간(초), 영상 재생 방식(0=전체, N=짧게 N초)
    if (data.vhsImageDuration != null) setImageDuration(data.vhsImageDuration);
    if (data.vhsVideoMode != null) setVideoMode(data.vhsVideoMode);
    // 편집 페이지 저장 시 vhsPhotoFrameIndex가 항상 기록되므로(기본 0) null 체크만으로는
    // "사용자가 고른 것"을 구분할 수 없다. 0은 기본값으로 보고 뒷면 커버 기본을 적용하고,
    // 0보다 큰 값만 명시적 선택으로 취급한다.
    if (data.vhsPhotoFrameIndex != null) {
      setPhotoFrameIndex(data.vhsPhotoFrameIndex);
      setPhotoFrameExplicit(data.vhsPhotoFrameIndex > 0);
    }
  }, [data]);

  // Photo frame closeup state
  const [photoFrameOpen, setPhotoFrameOpen] = useState(false);
  const [photoFrameIndex, setPhotoFrameIndex] = useState(0);
  // Whether the user has explicitly chosen a frame photo. Until then, the frame
  // defaults to the album's back cover (fallback: front cover).
  const [photoFrameExplicit, setPhotoFrameExplicit] = useState(false);

  // TV closeup state
  const [tvCloseupOpen, setTvCloseupOpen] = useState(false);

  // ── Single shared media viewport ─────────────────────────────────────────
  // The slideshow is rendered ONCE into a stable detached host <div> (via portal),
  // and that host is physically moved (appendChild) between the main TV screen and
  // the closeup screen. Moving a DOM node does not reset <video> playback, so
  // clicking the TV feels like the same screen simply enlarges — no re-buffering,
  // no gap, no restart.
  const [mediaHost] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.inset = "0";
    return el;
  });
  const [tvMountEl, setTvMountEl] = useState(null);
  const [closeupMountEl, setCloseupMountEl] = useState(null);

  useEffect(() => {
    if (!mediaHost) return;
    const target = tvCloseupOpen && closeupMountEl ? closeupMountEl : tvMountEl;
    if (target && mediaHost.parentElement !== target) {
      target.appendChild(mediaHost);
    }
  }, [mediaHost, tvCloseupOpen, tvMountEl, closeupMountEl]);

  const idleTimerRef = useRef(null);
  const containerRef = useRef(null);

  // The Google Photos share page lists the album cover as its header image, so the
  // backend's first scraped item is always the cover. The backend marks it with
  // is_cover (og:image base match) — exclude it so playback starts from the first
  // real album photo. (URL matching is impossible client-side: coverImage.url is an
  // R2 re-upload while media URLs are googleusercontent.)
  const mediaList = useMemo(
    () =>
      (data?.mediaList ?? []).filter(
        (m) => (m.type === "image" || m.type === "video") && !m.is_cover,
      ),
    [data],
  );

  // Filter images only (for photo frame, excluding the cover)
  const imageList = useMemo(
    () =>
      (data?.mediaList ?? []).filter(
        (m) => m.type === "image" && !m.is_cover,
      ),
    [data],
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
    preloadImage(PHOTO_FRAME_CLOSEUP);
    preloadImage(TV_CLOSEUP_IMAGE);
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

  // Spacebar play/pause toggle
  useEffect(() => {
    if (scene !== "playback") return;

    const handleKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene]);

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

  // Handle play button on intro — also starts BGM (satisfies autoplay policy via user gesture)
  const handlePlay = useCallback(() => {
    startBGM();
    startInsert();
  }, [startInsert, startBGM]);

  // Sync BGM with global isPlaying state
  useEffect(() => {
    setBgmPlaying(isPlaying);
  }, [isPlaying, setBgmPlaying]);

  // Duck BGM during insert video scene
  useEffect(() => {
    if (scene === "insert") {
      bgmDuck();
    } else if (scene === "tvOff" || scene === "static") {
      bgmUnduck();
    }
  }, [scene, bgmDuck, bgmUnduck]);

  // Duck/unduck BGM based on current slideshow media type
  const prevItemTypeRef = useRef(null);
  useEffect(() => {
    if (scene !== "playback") return;

    const currentType = slideshow.currentItem?.type;
    const prevType = prevItemTypeRef.current;

    if (currentType === "video" && prevType !== "video") {
      bgmDuck();
    } else if (currentType !== "video" && prevType === "video") {
      bgmUnduck();
    }

    prevItemTypeRef.current = currentType;
  }, [scene, slideshow.currentItem?.type, bgmDuck, bgmUnduck]);

  // Handle exit
  const handleExit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    router.back();
  }, [router]);

  // 인트로 나가기 — 로그인 유저는 라이브러리로, 아니면 랜딩으로
  const { token } = useAuth();
  const handleIntroExit = useCallback(() => {
    router.push(token ? "/library" : "/");
  }, [router, token]);

  // Photo frame handlers
  const handlePhotoFrameClick = useCallback(() => {
    if (imageList.length === 0) return;
    setPhotoFrameOpen(true);
    setIsPlaying(false);
  }, [imageList]);

  const handlePhotoFrameClose = useCallback(() => {
    setPhotoFrameOpen(false);
    setIsPlaying(true);
  }, []);

  const handlePhotoFrameIndexChange = useCallback((i) => {
    setPhotoFrameIndex(i);
    setPhotoFrameExplicit(true);
  }, []);

  // Resolve the photo-frame image: an explicit user choice wins; otherwise default
  // to the album back cover, falling back to the front cover, then the first image.
  const photoFrameSrc = useMemo(() => {
    if (photoFrameExplicit && imageList[photoFrameIndex]) {
      return (
        imageList[photoFrameIndex]?.original_url ||
        imageList[photoFrameIndex]?.thumbnail_url
      );
    }
    return (
      data?.backCoverImageUrl ||
      data?.coverImage?.url ||
      imageList[0]?.original_url ||
      imageList[0]?.thumbnail_url ||
      undefined
    );
  }, [photoFrameExplicit, photoFrameIndex, imageList, data]);

  // TV closeup handlers
  const handleTVClick = useCallback(() => {
    setTvCloseupOpen(true);
  }, []);

  const handleTVCloseupClose = useCallback(() => {
    setTvCloseupOpen(false);
  }, []);

  // ─── Insert video delayed fade-in (fade through black) ───
  const [insertReady, setInsertReady] = useState(false);
  useEffect(() => {
    if (scene === "insert") {
      // Delay insert video appearance so intro fades to black first
      const timer = setTimeout(() => setInsertReady(true), 400);
      return () => clearTimeout(timer);
    } else {
      setInsertReady(false);
    }
  }, [scene]);

  // Extract record info
  console.log("data", data);
  const subTitle = data?.subtitle ?? "";
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
    <>
      <style>{`@keyframes vhsFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        ref={containerRef}
        className="relative h-screen w-screen overflow-hidden bg-black"
        style={{ animation: "vhsFadeIn 1400ms ease-in both" }}
      >
      {/* Scene layers with crossfade */}
      {(scene === "intro" || scene === "insert") && (
        <VHSTapeIntro
          subTitle={subTitle}
          title={title}
          lifestory={lifestory}
          onPlay={handlePlay}
          onExit={handleIntroExit}
          visible={scene === "intro"}
        />
      )}

      {(scene === "insert" || scene === "tvOff") && (
        <TVInsertVideo
          onEnded={onInsertEnded}
          visible={scene === "insert" && insertReady}
        />
      )}

      {(scene === "tvOff" || scene === "static" || scene === "playback") && (
        <TVScene
          scene={scene}
          colorFilter={colorFilter}
          visible={scene !== "insert"}
          frameImage={TV_PLAYBACK_FRAME}
          photoFrameImageSrc={photoFrameSrc}
          onPhotoFrameClick={
            imageList.length > 0 ? handlePhotoFrameClick : undefined
          }
          onTVClick={handleTVClick}
          onAdvance={slideshow.advance}
          onRetreat={slideshow.retreat}
          mediaMountRef={setTvMountEl}
        />
      )}

      {/* Shared slideshow viewport — rendered once, physically moved between the
          main TV screen and the closeup screen (video never remounts) */}
      {mediaHost &&
        scene === "playback" &&
        createPortal(
          <TVMediaViewport
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
          />,
          mediaHost,
        )}

      {/* Photo frame closeup overlay */}
      {scene === "playback" && (
        <PhotoFrameCloseup
          images={imageList}
          selectedIndex={photoFrameIndex}
          onChangeIndex={handlePhotoFrameIndexChange}
          onClose={handlePhotoFrameClose}
          visible={photoFrameOpen}
          colorFilter={colorFilter}
          canChangePhoto={!isShareView}
        />
      )}

      {/* TV closeup overlay */}
      {scene === "playback" && (
        <TVCloseup
          visible={tvCloseupOpen}
          onClose={handleTVCloseupClose}
          onAdvance={slideshow.advance}
          onRetreat={slideshow.retreat}
          mediaMountRef={setCloseupMountEl}
        />
      )}

      {scene === "playback" && !photoFrameOpen && !tvCloseupOpen && (
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
          isMuted={bgmMuted}
          onToggleMute={bgmToggleMute}
          hasBgm={hasBgm}
        />
      )}

      {/* Empty media state */}
      {scene === "playback" && mediaList.length === 0 && !mediaLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="text-sm text-white/50">표시할 미디어가 없습니다</div>
        </div>
      )}
    </div>
    </>
  );
}
