"use client";

import { use, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProxiedUrl } from "@/app/walk/[id]/components/lib/constants";
import { DEFAULT_THEME } from "@/app/library/edit/[record_id]/themeConfig";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useRecordData } from "@/app/lib/useRecordData";

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
      <path d="M14 6a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-3" />
      <path d="M3 5h2.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-2.5" />
      <path d="M17 7v4a2 2 0 1 0 4 0v-4a2 2 0 1 0 -4 0" />
      <path d="M3 16c0 1.657 4.03 3 9 3s9 -1.343 9 -3" />
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
  const [ready, setReady] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const autoRotatingRef = useRef(false);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);
  const ROTATE_SPEED = 0.08; // 1바퀴(0→1)에 약 12.5초

  const stopAutoRotate = useCallback(() => {
    autoRotatingRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setIsAutoRotating(false);
  }, []);

  const startAutoRotate = useCallback(() => {
    autoRotatingRef.current = true;
    lastTimeRef.current = null;
    setIsAutoRotating(true);

    function loop(timestamp) {
      if (!autoRotatingRef.current) return;
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      setFlipProgress((prev) => prev + ROTATE_SPEED * dt);

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // value: 0 = 앞면, 0.5 = 뒷면 (한 사이클 내 상대 위치)
  const snapTo = useCallback((value, currentProgress) => {
    stopAutoRotate();
    setFlipProgress((prev) => {
      const base = Math.floor(prev);
      const frac = prev - base;
      // 현재 위치에서 가장 가까운 목표 절대값 계산
      const candidates = [base + value, base + value + 1, base + value - 1];
      return candidates.reduce((a, b) => Math.abs(a - prev) < Math.abs(b - prev) ? a : b);
    });
  }, [stopAutoRotate]);

  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // 페이지 진입 후 자동 회전 시작
  useEffect(() => {
    if (ready) {
      startAutoRotate();
      return () => stopAutoRotate();
    }
  }, [ready]);

  const frontCover = recordData?.coverImage?.url || null;
  const albumTitle = recordData?.title || "";
  const subtitle = recordData?.subtitle || "";
  const bio = recordData?.lifestory?.content || "";
  const selectedTheme = recordData?.theme || DEFAULT_THEME;
  const titleOverlayEnabled = recordData?.coverTitleVisible ?? false;
  const titlePosition = recordData?.coverTitlePosition || "bottom-center";
  const titleFont = recordData?.coverTitleFont || "Pretendard Variable";
  const titleColor = recordData?.coverTitleColor || "#ffffff";
  const rawStroke = recordData?.coverTitleStroke;
  const titleStroke = rawStroke === true ? "black" : (rawStroke === false || !rawStroke) ? "none" : rawStroke;

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

  // Build cylindrical column strips
  const GRID_COLS = 14;
  const ARC_SPREAD = 180;
  const RADIUS = 600;
  const ROWS_PER_COL = 8;
  const angleStep = ARC_SPREAD / (GRID_COLS - 1);
  // Width so adjacent columns tile seamlessly on the cylinder
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
  }, [images]);

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background: Concave cylindrical photo grid */}
      {images.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Dark gradient overlays (vignette) */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" />

          <div
            className="absolute inset-0 flex items-center justify-center opacity-35"
            style={{ perspective: "clamp(600px, 60vw, 1200px)", perspectiveOrigin: "50% 50%" }}
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
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${angle}deg) translateZ(-${RADIUS}px) translateX(-50%) translateY(-50%)`,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    {colImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-full rounded-sm object-cover opacity-0 transition-opacity duration-[1200ms] ease-out"
                        style={{ aspectRatio: "1" }}
                        draggable={false}
                        onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
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
          className={`h-[50vh] w-[80vw] max-w-[400px] transition-all delay-200 duration-1000 ease-out ${
            ready ? "scale-100 opacity-100" : "scale-[0.95] opacity-0"
          }`}
        >
          <AlbumPreview3D
            frontCover={frontCover}
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
            rotationY={flipProgress * 2 * Math.PI}
            hideControls
            onExpand={() => { const f = flipProgress % 1; stopAutoRotate(); snapTo(f < 0.25 || f > 0.75 ? 0 : 0.5); setIsExpanded(true); }}
          />
        </div>

        {/* Flip Slider + CTA */}
        <div
          className={`flex flex-col items-center gap-4 transition-all delay-500 duration-1000 ease-out ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Front / Auto / Back toggle + Expand */}
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
            <button
              onClick={() => snapTo(0)}
              className={`rounded-full px-4 py-1.5 text-[11px] tracking-wider transition-all duration-300 ${
                !isAutoRotating && (flipProgress % 1 < 0.15 || flipProgress % 1 > 0.85)
                  ? "bg-white/20 text-white"
                  : "text-white/35 hover:text-white/70"
              }`}
            >
              앞
            </button>
            <button
              onClick={() => isAutoRotating ? stopAutoRotate() : startAutoRotate()}
              className={`rounded-full px-3 py-1.5 transition-all duration-300 ${
                isAutoRotating
                  ? "bg-white/20 text-white"
                  : "text-white/35 hover:text-white/70"
              }`}
            >
              <Icon360 className="h-4 w-4" />
            </button>
            <button
              onClick={() => snapTo(0.5)}
              className={`rounded-full px-4 py-1.5 text-[11px] tracking-wider transition-all duration-300 ${
                !isAutoRotating && flipProgress % 1 > 0.35 && flipProgress % 1 < 0.65
                  ? "bg-white/20 text-white"
                  : "text-white/35 hover:text-white/70"
              }`}
            >
              뒤
            </button>
          </div>
          <button
            onClick={() => { const f = flipProgress % 1; stopAutoRotate(); snapTo(f < 0.25 || f > 0.75 ? 0 : 0.5); setIsExpanded(true); }}
            className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/35 backdrop-blur-sm transition-all duration-300 hover:text-white/70"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          </div>
          <button
            onClick={() => router.push(`/walk/${id}`)}
            className="rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-light tracking-[0.15em] text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
          >
            갤러리 보러가기
          </button>
        </div>
      </div>

      {/* Expanded Album Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
          <div className="h-[85vh] w-[90vw] max-w-[900px]">
            <AlbumPreview3D
              frontCover={frontCover}
              bio={bio}
              timeline={timeline}
              selectedTheme={selectedTheme}
              albumTitle={albumTitle}
              titleOverlayEnabled={titleOverlayEnabled}
              titlePosition={titlePosition}
              titleFont={titleFont}
              titleColor={titleColor}
              rotationY={(flipProgress % 1) * 2 * Math.PI}
              hideControls
              expanded
              onExpand={() => setIsExpanded(false)}
            />
          </div>
          <div className="mt-0 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
                <button
                  onClick={() => snapTo(0)}
                  className={`rounded-full px-4 py-1.5 text-[11px] tracking-wider transition-all duration-300 ${
                    flipProgress % 1 < 0.15 || flipProgress % 1 > 0.85
                      ? "bg-white/20 text-white"
                      : "text-white/35 hover:text-white/70"
                  }`}
                >
                  앞
                </button>
                <button
                  onClick={() => snapTo(0.5)}
                  className={`rounded-full px-4 py-1.5 text-[11px] tracking-wider transition-all duration-300 ${
                    flipProgress % 1 > 0.35 && flipProgress % 1 < 0.65
                      ? "bg-white/20 text-white"
                      : "text-white/35 hover:text-white/70"
                  }`}
                >
                  뒤
                </button>
              </div>
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
    </div>
  );
}
