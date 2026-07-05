"use client";

import { use, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProxiedUrl } from "@/app/walk/[id]/components/lib/constants";
import { DEFAULT_THEME } from "@/app/library/edit/[record_id]/themeConfig";
import { X, Info, ExternalLink } from "lucide-react";
import { useRecordData } from "@/app/lib/useRecordData";
import { useAuth } from "@/app/contexts/AuthContext";
import SmartAppBanner from "@/app/components/SmartAppBanner";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import scrollMouse from "@/public/lottie/scroll-mouse.json";

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

// import AlbumPreview3D from "@/app/library/edit/[record_id]/components/AlbumPreview3D";

const AlbumPreview3D = dynamic(
  () => import("@/app/library/edit/[record_id]/components/AlbumPreview3D"),
  { ssr: false },
);

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

const T = {
  ko: {
    linkError: "링크가 올바른지 확인해 주세요",
    privateAlbum: "비공개 앨범입니다",
    privateDesc: "앨범 소유자만 열람할 수 있어요",
    gallery: "보러가기",
    externalLink: "외부 링크",
    info: "앨범정보",
    flip: "돌려보기",
    signupPrompt: "나만의 앨범을 만들고 싶으신가요?",
    signupCta: "회원가입하고 편집하기",
  },
  en: {
    linkError: "Please check if the link is correct",
    privateAlbum: "This album is private",
    privateDesc: "Only the album owner can view it",
    gallery: "View",
    externalLink: "External Link",
    info: "Info",
    flip: "Flip",
    signupPrompt: "Want to create your own album?",
    signupCta: "Sign up and start editing",
  },
};

export default function SharePage({ params }) {
  const { id, locale } = use(params);
  const t = T[locale] || T.ko;
  const router = useRouter();

  // 배경 포토 그리드는 이미지만 쓰므로 영상 제외로 요청 (프로빙/트랜스코딩 스킵 → 빠른 로딩)
  const { data: recordData, loading, error, mediaLoading } = useRecordData(id, {
    imagesOnly: true,
  });
  const { token } = useAuth();
  const isLoggedIn = !!token;
  const [ready, setReady] = useState(false);

  // 모바일 브라우저 크롬(주소창/탭바)으로 인한 body 스크롤 및 pull-to-refresh 방지
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    html.style.overscrollBehavior = "none";
    return () => {
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, []);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoFontScale, setInfoFontScale] = useState(1);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  useEffect(() => {
    if (!isInfoOpen) setInfoFontScale(1);
  }, [isInfoOpen]);
  const albumRef = useRef(null);
  const infoModalRef = useRef(null);

  // 모달 열릴 때 핀치줌 완전 차단 (touchstart + touchmove 모두)
  useEffect(() => {
    if (!isInfoOpen) return;
    const el = infoModalRef.current;
    if (!el) return;
    const block = (e) => {
      if (e.touches.length >= 2) e.preventDefault();
    };
    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("touchmove", block);
    };
  }, [isInfoOpen]);
  const idleRafRef = useRef(null);
  // Library와 동일: 전체 윈도우 기준 정규화, 0.5rad max, 0.08 smoothing
  const targetTiltRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });

  // 핀치줌 + 패닝 — 브라우저 확대 대신 Three.js 카메라 이동
  const [externalZoom, setExternalZoom] = useState(9.5);
  const pinchZoomRef = useRef(9.5);
  const lastPinchDistRef = useRef(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const lastPanPosRef = useRef(null);
  const mouseDragRef = useRef(null); // 데스크탑 마우스 드래그 패닝
  const [showDesktopHint, setShowDesktopHint] = useState(true);

  // rAF lerp loop — library AlbumCover.jsx의 smoothing 방식과 동일
  useEffect(() => {
    const SMOOTH = 0.08;
    let running = true;
    function loop() {
      if (!running) return;
      const cur = currentTiltRef.current;
      const tgt = targetTiltRef.current;
      cur.x += (tgt.x - cur.x) * SMOOTH;
      cur.y += (tgt.y - cur.y) * SMOOTH;
      // 풀스크린 캔버스에 맞게 perspective를 뷰포트 크기에 비례하여 키워 왜곡 방지
      const p = Math.max(window.innerWidth, window.innerHeight) * 2;
      const transform = `perspective(${p}px) rotateX(${cur.x}deg) rotateY(${cur.y}deg)`;
      if (albumRef.current) albumRef.current.style.transform = transform;
      idleRafRef.current = requestAnimationFrame(loop);
    }
    idleRafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    };
  }, []);

  // 브라우저 핀치줌 전체 차단
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length >= 2) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, []);

  // 마우스/터치: 전체 윈도우 기준 정규화 (library와 동일)
  useEffect(() => {
    // 데스크탑은 풀스크린 캔버스 전체가 기울어지므로 각도를 줄여 과도한 왜곡 방지
    const isMobile = window.innerWidth < 1024;
    const MAX_DEG = isMobile ? 28.6 : 10;
    const onMouseMove = (e) => {
      // 드래그 중에는 틸트 건너뜀
      if (e.buttons !== 0) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetTiltRef.current = { x: -y * MAX_DEG, y: x * MAX_DEG };
    };
    const onMouseLeave = () => {
      targetTiltRef.current = { x: 0, y: 0 };
    };
    const onTouchMove = (e) => {
      if (e.touches.length >= 2) return;
      const t = e.touches[0];
      const x = (t.clientX / window.innerWidth) * 2 - 1;
      const y = (t.clientY / window.innerHeight) * 2 - 1;
      targetTiltRef.current = { x: -y * MAX_DEG, y: x * MAX_DEG };
    };
    const onTouchEnd = () => {
      targetTiltRef.current = { x: 0, y: 0 };
    };
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // 데스크탑: 마우스 휠 줌 — window에 붙여야 Three.js Canvas 이벤트 삼킴 방지
  const isInfoOpenRef = useRef(false);
  useEffect(() => {
    isInfoOpenRef.current = isInfoOpen;
  }, [isInfoOpen]);

  useEffect(() => {
    const onWheel = (e) => {
      if (isInfoOpenRef.current) return; // info 팝업 열려 있으면 스크롤 허용
      e.preventDefault();
      const next = Math.max(
        4.5,
        Math.min(10, pinchZoomRef.current + e.deltaY * 0.008),
      );
      pinchZoomRef.current = next;
      setExternalZoom(next);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // 데스크탑: 마우스 드래그 패닝
  useEffect(() => {
    const MAX_PAN = 0.8;
    const onMouseMove = (e) => {
      if (!mouseDragRef.current) return;
      const dx = e.clientX - mouseDragRef.current.x;
      const dy = e.clientY - mouseDragRef.current.y;
      const s = pinchZoomRef.current * 0.0005;
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
  }, []);

  // 데스크탑 힌트 — 첫 진입 시 4초간 표시
  useEffect(() => {
    const t = setTimeout(() => setShowDesktopHint(false), 30000);
    return () => clearTimeout(t);
  }, []);

  // 핀치줌 + 1손가락 패닝 핸들러
  const handlePinchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      lastPanPosRef.current = null;
    } else if (e.touches.length === 1) {
      lastPanPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handlePinchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      // 핀치줌
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = lastPinchDistRef.current - dist;
      const next = Math.max(
        4.5,
        Math.min(10, pinchZoomRef.current + delta * 0.03),
      );
      pinchZoomRef.current = next;
      setExternalZoom(next);
      lastPinchDistRef.current = dist;
      lastPanPosRef.current = null;
    } else if (e.touches.length === 1 && lastPanPosRef.current !== null) {
      // 1손가락 패닝
      const dx = e.touches[0].clientX - lastPanPosRef.current.x;
      const dy = e.touches[0].clientY - lastPanPosRef.current.y;
      const sensitivity = pinchZoomRef.current * 0.0005;
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
  }, []);

  const handlePinchEnd = useCallback(() => {
    lastPinchDistRef.current = null;
    lastPanPosRef.current = null;
    // 손 떼면 pan 중심으로 복귀 (CameraZoom lerp가 부드럽게 처리)
    panOffsetRef.current = { x: 0, y: 0 };
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleAlbumClick = useCallback(() => {
    setFlipProgress((prev) => {
      const base = Math.floor(prev);
      const frac = prev - base;
      const isOnFront = frac < 0.25 || frac > 0.75;
      return isOnFront ? base + 0.5 : base + 1;
    });
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  const frontCover = recordData?.coverImage?.url || null;
  const backCoverImage = recordData?.backCoverImageUrl || frontCover;
  const albumTitle = recordData?.title || "";
  const subtitle = recordData?.subtitle || "";
  const externalLinkTitle = recordData?.externalLinkTitle || "";
  const rawExternalLinkUrl = recordData?.externalLinkUrl || "";
  // 프로토콜(http/https)이 없으면 상대경로로 처리돼 에러 → https:// 보정
  const externalLinkUrl = rawExternalLinkUrl
    ? /^https?:\/\//i.test(rawExternalLinkUrl)
      ? rawExternalLinkUrl
      : `https://${rawExternalLinkUrl}`
    : "";
  const bio = recordData?.lifestory?.content || "";
  const selectedTheme = recordData?.theme || DEFAULT_THEME;
  const titleOverlayEnabled = recordData?.coverTitleVisible ?? false;
  const titlePosition = recordData?.coverTitlePosition || "bottom-center";
  const titleFont = recordData?.coverTitleFont || "Pretendard Variable";
  const titleColor = recordData?.coverTitleColor || "#000000";
  const titleStroke = recordData?.coverTitleBgColor ?? false;

  const timeline = useMemo(() => {
    if (!recordData?.timeline?.events) return [];
    return recordData.timeline.events.map((e) => ({
      year: e.timestamp || "",
      event: `${e.title || ""}${e.description ? ` - ${e.description}` : ""}`,
    }));
  }, [recordData]);

  const images = useMemo(
    () => (recordData?.mediaList ?? []).filter((m) => m.type === "image"),
    [recordData],
  );

  // Build cylindrical column strips — viewport-responsive
  const { GRID_COLS, ARC_SPREAD, ROWS_PER_COL, PERSPECTIVE, RADIUS } =
    useMemo(() => {
      if (typeof window === "undefined")
        return {
          GRID_COLS: 16,
          ARC_SPREAD: 200,
          ROWS_PER_COL: 8,
          PERSPECTIVE: "1400px",
          RADIUS: 700,
        };
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return {
          GRID_COLS: 8,
          ARC_SPREAD: 140,
          ROWS_PER_COL: 5,
          PERSPECTIVE: "1400px",
          RADIUS: 700,
        };
      }
      // 데스크탑: 뷰포트 크기에 맞게 반지름·원근 스케일
      const vmax = Math.max(window.innerWidth, window.innerHeight);
      const radius = Math.round(vmax * 0.48);
      const aspect = window.innerWidth / window.innerHeight;
      const spread = Math.min(Math.round(aspect * 150), 360);
      const cols = Math.max(16, Math.round(spread / 10));
      const rows = window.innerHeight > 1200 ? 10 : 8;
      const perspective = `${Math.round(radius * 1.5)}px`;
      return {
        GRID_COLS: cols,
        ARC_SPREAD: spread,
        ROWS_PER_COL: rows,
        PERSPECTIVE: perspective,
        RADIUS: radius,
      };
    }, []);

  const angleStep = ARC_SPREAD / (GRID_COLS - 1);
  const cellWidth = Math.ceil(
    2 * RADIUS * Math.tan(((angleStep / 2) * Math.PI) / 180) * 1.06,
  );

  const gridColumns = useMemo(() => {
    if (images.length === 0) return [];
    // 배경 그리드는 400px 썸네일로 충분 — 원본(2000px)은 무거워 느리고 빈칸 유발
    const urls = images.map((img) =>
      getProxiedUrl(img.thumbnail_url || img.original_url),
    );
    return Array.from({ length: GRID_COLS }, (_, colIdx) => {
      const colImages = [];
      for (let r = 0; r < ROWS_PER_COL; r++) {
        colImages.push(urls[(colIdx * ROWS_PER_COL + r) % urls.length]);
      }
      const angle = (colIdx / (GRID_COLS - 1) - 0.5) * ARC_SPREAD;
      return { colIdx, angle, images: colImages };
    });
  }, [images, GRID_COLS, ARC_SPREAD, ROWS_PER_COL]);

  // Loading
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="h-5 w-5 animate-spin rounded-full border border-white/10 border-t-white/60" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-sm font-light tracking-wide text-white/60">
          {error}
        </p>
        <p className="text-xs tracking-wider text-white/30">{t.linkError}</p>
      </div>
    );
  }

  // Private album
  if (recordData?.isPublic === false) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-2xl">🔒</p>
        <p className="text-sm font-light tracking-wide text-white/60">
          {t.privateAlbum}
        </p>
        <p className="text-xs tracking-wider text-white/30">{t.privateDesc}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen overflow-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      <SmartAppBanner locale={locale} />
      {/* Background: Concave cylindrical photo grid */}
      {images.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-35"
            style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 35%" }}
          >
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateX(8deg)",
                width: "100vw",
                height: "100vh",
              }}
            >
              {gridColumns.map(({ colIdx, angle, images: colImages }) => (
                <div
                  key={colIdx}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: cellWidth,
                    backfaceVisibility: "hidden",
                    transform: `rotateY(${angle}deg) translateZ(-${RADIUS}px) translateX(-50%) translateY(-50%)`,
                  }}
                >
                  <div className="flex flex-col gap-0">
                    {colImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        decoding="async"
                        className="w-full rounded-sm object-cover opacity-0 transition-opacity duration-[1200ms] ease-out"
                        style={{ aspectRatio: "1" }}
                        draggable={false}
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 전체화면 3D 캔버스 */}
      <div
        ref={albumRef}
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ touchAction: "none" }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          mouseDragRef.current = { x: e.clientX, y: e.clientY };
        }}
        onTouchStart={handlePinchStart}
        onTouchMove={handlePinchMove}
        onTouchEnd={handlePinchEnd}
      >
        <AlbumPreview3D
          frontCover={frontCover}
          backCoverImageUrl={backCoverImage}
          bio={bio}
          timeline={timeline}
          selectedTheme={selectedTheme}
          albumTitle={albumTitle}
          albumSubTitle={subtitle}
          titleOverlayEnabled={titleOverlayEnabled}
          titlePosition={titlePosition}
          titleFont={titleFont}
          titleColor={titleColor}
          titleStroke={titleStroke}
          rotationY={(flipProgress % 1) * 2 * Math.PI}
          hideControls
          externalZoom={externalZoom}
          cameraOffset={panOffset}
          cursorTipIcon={<Icon360 className="h-4 w-4 text-white/70" />}
          onExpand={handleAlbumClick}
        />
      </div>

      {/* 타이틀 오버레이 — 상단 */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 pt-[max(env(safe-area-inset-top),2.5rem)] text-center transition-all duration-1000 ease-out ${
          ready ? "opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)",
        }}
      >
        {albumTitle && (
          <h1 className="text-lg font-medium tracking-[0.2em] text-white sm:text-xl">
            {albumTitle}
          </h1>
        )}
        {subtitle && (
          <p className="mt-2 text-xs font-light tracking-[0.25em] text-white/50 sm:text-sm">
            {subtitle}
          </p>
        )}

        {/* 앨범정보 · 뒤집기 · 링크 — 제목 아래 */}
        <div
          className={`pointer-events-auto mt-5 flex items-start justify-center gap-4 transition-all delay-300 duration-1000 ease-out ${
            ready ? "opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <button
            onClick={() => setIsInfoOpen(true)}
            className="group flex w-16 flex-col items-center gap-1.5 text-white/50 transition-colors duration-300 hover:text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/5 backdrop-blur-sm transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/10">
              <Info className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-light tracking-[0.12em]">
              {t.info}
            </span>
          </button>
          <button
            onClick={handleAlbumClick}
            className="group flex w-16 flex-col items-center gap-1.5 text-white/50 transition-colors duration-300 hover:text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/5 backdrop-blur-sm transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/10">
              <Icon360 className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-light tracking-[0.12em]">
              {t.flip}
            </span>
          </button>
          {externalLinkUrl && (
            <a
              href={externalLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-16 flex-col items-center gap-1.5 text-white/50 transition-colors duration-300 hover:text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/5 backdrop-blur-sm transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/10">
                <ExternalLink className="h-4 w-4" />
              </span>
              <span className="max-w-full truncate text-[10px] font-light tracking-[0.12em]">
                {externalLinkTitle || t.externalLink}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* 데스크탑 마우스 휠 힌트 — 앨범 오른쪽 중앙 */}
      <div
        className={`pointer-events-none absolute top-1/2 right-[17%] z-[1000] hidden -translate-y-[50%] flex-col transition-opacity duration-1000 md:flex ${
          showDesktopHint ? "opacity-100" : "opacity-0"
        }`}
      >
        <Lottie
          animationData={scrollMouse}
          loop
          autoplay
          style={{ width: 200, height: 200 }}
        />
        <span className="text-white-100 flex w-full translate-x-2 justify-center rounded-md text-[14px] whitespace-nowrap">
          Scroll to Zoom
        </span>
      </div>

      {/* 보러가기 — 하단 */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-[max(env(safe-area-inset-bottom),10px)] transition-all delay-300 duration-1000 ease-out ${
          ready ? "-translate-y-20 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={() => {
            // ?share=1: 공유 감상 모드 — 소유자용 기능(액자 사진 바꾸기 등) 비활성화
            const route = recordData?.exhibitionType === "memorial_tape"
              ? `/vhs/${id}?share=1`
              : `/walk/${id}`;
            router.push(route);
          }}
          aria-label={t.gallery}
          className="group cursor-pointer transition-transform duration-150 ease-out active:scale-95"
        >
          {/* 재생 버튼 — 테두리 선형 그라데이션 (색/방향은 아래 stop에서 수정) */}
          <svg
            viewBox="0 0 318 135"
            className="h-12 w-auto"
            fill="none"
            aria-hidden="true"
          >
            {/* 호버 시 안쪽 채움 (페이드인) — 흰/회색 심플 */}
            <rect
              x="2.5"
              y="2.5"
              width="313"
              height="130"
              rx="44"
              fill="rgba(255,255,255,0.15)"
              className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            />
            <rect
              x="2.5"
              y="2.5"
              width="313"
              height="130"
              rx="44"
              stroke="url(#playBtnBorder)"
              strokeWidth="6"
            />
            <path
              d="M178 64.0359C180.667 65.5755 180.667 69.4245 178 70.9641L153.25 85.2535C150.583 86.7931 147.25 84.8686 147.25 81.7894L147.25 53.2106C147.25 50.1314 150.583 48.2069 153.25 49.7465L178 64.0359Z"
              fill="#8D804B"
              fillOpacity="0.85"
            />
            <defs>
              <linearGradient
                id="playBtnBorder"
                x1="92.5"
                y1="0"
                x2="220.5"
                y2="145.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#513262" />
                <stop offset="0.235577" stopColor="#883654" />
                <stop offset="0.557692" stopColor="#8D804B" />
                <stop offset="0.769231" stopColor="#476224" />
                <stop offset="1" stopColor="#244050" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>

      {/* Info Popup */}
      {isInfoOpen && (
        <div
          ref={infoModalRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsInfoOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div
            className="relative z-10 mx-6 w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-[#181818] shadow-2xl md:mx-0 md:max-w-lg"
            onClick={(e) => e.stopPropagation()}
            style={!isMobile ? { zoom: infoFontScale } : {}}
          >
            {/* 데스크탑: maxHeight를 zoom 역수로 보정해 화면 높이 초과 방지 */}
            {/* 모바일: 고정 max-h, 내부 콘텐츠만 zoom */}
            <div
              className="overflow-y-auto px-6 pt-10 pb-6"
              style={
                !isMobile
                  ? {
                      maxHeight: `${Math.floor((window.innerHeight * 0.9) / infoFontScale)}px`,
                    }
                  : { maxHeight: "70dvh" }
              }
            >
              {/* 모바일 전용 콘텐츠 scale 래퍼 (Safari zoom 호환) */}
              <div
                style={
                  isMobile
                    ? {
                        transform: `scale(${infoFontScale})`,
                        transformOrigin: "top left",
                        width: `${100 / infoFontScale}%`,
                      }
                    : {}
                }
              >
                {/* Title */}
                {albumTitle && (
                  <div className="mb-5">
                    <p className="mb-2 text-[10px] tracking-[0.25em] text-white/30 uppercase">
                      Title
                    </p>
                    <p className="text-2xl leading-tight font-light tracking-wide text-white">
                      {albumTitle}
                    </p>
                    {subtitle && (
                      <p className="mt-2 text-[15px] leading-snug tracking-wide text-white/50">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Timeline */}
                {timeline.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-3 border-t border-white/10" />
                    <p className="mb-3 text-[10px] tracking-[0.25em] text-white/30 uppercase">
                      Timeline
                    </p>
                    <div className="space-y-2">
                      {timeline.map((t, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
                        >
                          <span className="shrink-0 text-[13px] font-medium text-white/40 sm:w-40 sm:text-[15px]">
                            {t.year}
                          </span>
                          <span className="text-[15px] leading-snug text-white/70">
                            {t.event}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Story */}
                {bio && (
                  <div>
                    <div className="mb-3 border-t border-white/10" />
                    <p className="mb-3 text-[10px] tracking-[0.25em] text-white/30 uppercase">
                      Story
                    </p>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-white/70">
                      {bio}
                    </p>
                  </div>
                )}

                {/* 비로그인 회원가입 유도 */}
                {!isLoggedIn && (
                  <div className="mt-5 border-t border-white/10 pt-5 text-center">
                    <p className="mb-3 text-[14px] text-white/40">
                      {t.signupPrompt}
                    </p>
                    <button
                      onClick={() => {
                        setIsInfoOpen(false);
                        router.push("/login");
                      }}
                      className="text-[15px] font-medium tracking-wide text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                    >
                      {t.signupCta}
                    </button>
                  </div>
                )}
              </div>
              {/* /모바일 zoom 래퍼 */}
            </div>
            {/* scroll container */}

            {/* 상단 버튼 바 */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <button
                onClick={() =>
                  setInfoFontScale((s) => Math.max(0.7, +(s - 0.1).toFixed(1)))
                }
                className="flex h-6 w-6 items-center justify-center rounded text-[13px] font-light text-white/30 transition-colors hover:text-white/70"
              >
                A-
              </button>
              <button
                onClick={() =>
                  setInfoFontScale((s) => Math.min(1.7, +(s + 0.1).toFixed(1)))
                }
                className="flex h-6 w-6 items-center justify-center rounded text-[15px] font-light text-white/30 transition-colors hover:text-white/70"
              >
                A+
              </button>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="ml-1 text-white/25 transition-colors hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
