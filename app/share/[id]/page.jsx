"use client";

import { use, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProxiedUrl } from "@/app/walk/[id]/components/lib/constants";
import { DEFAULT_THEME } from "@/app/library/edit/[record_id]/themeConfig";
import { X, Maximize2, Minimize2, Info } from "lucide-react";
import { useRecordData } from "@/app/lib/useRecordData";
import { useAuth } from "@/app/contexts/AuthContext";

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

export default function SharePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: recordData, loading, error } = useRecordData(id);
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const albumRef = useRef(null);
  const expandedAlbumRef = useRef(null);
  const idleRafRef = useRef(null);
  // Library와 동일: 전체 윈도우 기준 정규화, 0.5rad max, 0.08 smoothing
  const targetTiltRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });

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
      const transform = `perspective(1000px) rotateX(${cur.x}deg) rotateY(${cur.y}deg)`;
      if (albumRef.current) albumRef.current.style.transform = transform;
      if (expandedAlbumRef.current) expandedAlbumRef.current.style.transform = transform;
      idleRafRef.current = requestAnimationFrame(loop);
    }
    idleRafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    };
  }, []);

  // 마우스/터치: 전체 윈도우 기준 정규화 (library와 동일)
  useEffect(() => {
    const MAX_DEG = 28.6; // 0.5 rad
    const onMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetTiltRef.current = { x: -y * MAX_DEG, y: x * MAX_DEG };
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      const x = (t.clientX / window.innerWidth) * 2 - 1;
      const y = (t.clientY / window.innerHeight) * 2 - 1;
      targetTiltRef.current = { x: -y * MAX_DEG, y: x * MAX_DEG };
    };
    const onTouchEnd = () => {
      targetTiltRef.current = { x: 0, y: 0 };
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
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
  const externalLinkUrl = recordData?.externalLinkUrl || "";
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
  const RADIUS = 700;

  const { GRID_COLS, ARC_SPREAD, ROWS_PER_COL } = useMemo(() => {
    if (typeof window === "undefined")
      return { GRID_COLS: 16, ARC_SPREAD: 200, ROWS_PER_COL: 8 };
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // 모바일: 컬럼/행 수를 줄여 GPU 부하 최소화 (9 × 5 = 45개 이미지)
      return { GRID_COLS: 9, ARC_SPREAD: 200, ROWS_PER_COL: 5 };
    }
    const aspect = window.innerWidth / window.innerHeight;
    const spread = Math.min(Math.round(aspect * 130), 280);
    const cols = Math.max(14, Math.round(spread / 12));
    return { GRID_COLS: cols, ARC_SPREAD: spread, ROWS_PER_COL: 8 };
  }, []);

  const angleStep = ARC_SPREAD / (GRID_COLS - 1);
  const cellWidth = Math.ceil(
    2 * RADIUS * Math.tan(((angleStep / 2) * Math.PI) / 180),
  );

  const gridColumns = useMemo(() => {
    if (images.length === 0) return [];
    const urls = images.map((img) =>
      getProxiedUrl(img.original_url || img.thumbnail_url),
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
        <p className="text-xs tracking-wider text-white/30">
          링크가 올바른지 확인해 주세요
        </p>
      </div>
    );
  }

  // Private album
  if (recordData?.isPublic === false) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-2xl">🔒</p>
        <p className="text-sm font-light tracking-wide text-white/60">
          비공개 앨범입니다
        </p>
        <p className="text-xs tracking-wider text-white/30">
          앨범 소유자만 열람할 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-screen overflow-hidden bg-black" style={{ height: "100dvh" }}>
      {/* Background: Concave cylindrical photo grid */}
      {images.length > 0 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Dark gradient overlays (vignette) */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" />

          <div
            className="absolute inset-0 flex items-center justify-center opacity-35"
            style={{
              perspective: "clamp(600px, 60vw, 1200px)",
              perspectiveOrigin: "50% 50%",
            }}
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
                    // preserve-3d는 자식 이미지들이 3D 변환 없으므로 제거 — GPU 합성 부하 대폭 감소
                    transform: `rotateY(${angle}deg) translateZ(-${RADIUS}px) translateX(-50%) translateY(-50%)`,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    {colImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        loading="lazy"
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

      {/* Center Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* Title / Subtitle */}
        <div
          className={`text-center transition-all duration-1000 ease-out ${
            ready ? "opacity-100" : "translate-y-2 opacity-0"
          }`}
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
        </div>

        {/* 3D Album Preview */}
        <div
          className={`w-[80vw] max-w-[400px] transition-all delay-200 duration-1000 ease-out lg:max-w-[520px] xl:max-w-[640px] ${
            ready ? "scale-100 opacity-100" : "scale-[0.95] opacity-0"
          }`}
          style={{ height: "45dvh", visibility: isExpanded ? "hidden" : "visible" }}
        >
          {!isExpanded && (
            <div ref={albumRef} className="h-full w-full" style={{ touchAction: "pinch-zoom" }}>
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
                cursorTipIcon={<Icon360 className="h-4 w-4 text-white/70" />}
                onExpand={handleAlbumClick}
              />
            </div>
          )}
        </div>

        {/* Flip Slider + CTA */}
        <div
          className={`flex flex-col items-center gap-4 transition-all delay-500 duration-1000 ease-out ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={handleAlbumClick}
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
            >
              <Icon360 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => router.push(`/walk/${id}`)}
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-light tracking-[0.15em] text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              갤러리 보러가기
            </button>
            {externalLinkUrl && (
              <a
                href={externalLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-light tracking-[0.15em] text-white/40 underline underline-offset-4 transition-colors hover:text-white/70"
              >
                {externalLinkTitle || "외부 링크"}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Album Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex flex-col items-center justify-center bg-black/95"
          style={{ height: "100dvh" }}
        >
          <div className="w-[90vw] max-w-[900px]" style={{ height: "70dvh" }}>
            <div ref={expandedAlbumRef} className="h-full w-full" style={{ touchAction: "pinch-zoom" }}>
              <AlbumPreview3D
                frontCover={frontCover}
                backCoverImageUrl={backCoverImage}
                bio={bio}
                timeline={timeline}
                selectedTheme={selectedTheme}
                albumTitle={albumTitle}
                titleOverlayEnabled={titleOverlayEnabled}
                titlePosition={titlePosition}
                titleFont={titleFont}
                titleColor={titleColor}
                titleStroke={titleStroke}
                rotationY={(flipProgress % 1) * 2 * Math.PI}
                hideControls
                expanded
                cursorTipIcon={<Icon360 className="h-4 w-4 text-white/70" />}
                onExpand={handleAlbumClick}
              />
            </div>
          </div>
          <div
            className="mt-0 flex flex-col items-center gap-3"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInfoOpen(true)}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                onClick={handleAlbumClick}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
              >
                <Icon360 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                router.push(`/walk/${id}`);
              }}
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-light tracking-[0.15em] text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              갤러리 보러가기
            </button>
          </div>
        </div>
      )}

      {/* Info Popup */}
      {isInfoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={() => setIsInfoOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-t-3xl border border-white/20 bg-[#181818] shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="max-h-[70dvh] overflow-y-auto px-6 pb-6 pt-4">
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
                      <div key={i} className="flex gap-4">
                        <span className="w-12 shrink-0 text-[15px] font-medium text-white/40">
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
                    나만의 앨범을 만들고 싶으신가요?
                  </p>
                  <button
                    onClick={() => { setIsInfoOpen(false); router.push("/login"); }}
                    className="text-[15px] font-medium tracking-wide text-white/70 underline underline-offset-4 transition-colors hover:text-white"
                  >
                    회원가입하고 편집하기
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsInfoOpen(false)}
              className="absolute top-4 right-4 text-white/25 transition-colors hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
