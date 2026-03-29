"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProxiedUrl } from "@/app/walk/[id]/components/lib/constants";
import { DEFAULT_THEME } from "@/app/library/edit/[record_id]/themeConfig";

const AlbumPreview3D = dynamic(
  () => import("@/app/library/edit/[record_id]/components/AlbumPreview3D"),
  { ssr: false },
);

const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app";

export default function SharePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bio, setBio] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [titleOverlayEnabled, setTitleOverlayEnabled] = useState(false);
  const [titlePosition, setTitlePosition] = useState("bottom-center");
  const [titleFont, setTitleFont] = useState("Pretendard Variable");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!id) return;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/api/v1/record/${id}`);

        if (!response.ok) {
          throw new Error(`앨범을 불러올 수 없습니다 (${response.status})`);
        }

        const result = await response.json();

        if (!result.ok || !result.data) {
          throw new Error("앨범 데이터가 없습니다");
        }

        const data = result.data;

        setFrontCover(data.coverImage?.url || null);
        setAlbumTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setBio(data.lifestory?.content || "");
        setSelectedTheme(data.theme || DEFAULT_THEME);
        setTitleOverlayEnabled(data.titleOverlayEnabled ?? false);
        setTitlePosition(data.titlePosition || "bottom-center");
        setTitleFont(data.titleFont || "Pretendard Variable");
        setTitleColor(data.titleColor || "#ffffff");

        if (data.timeline?.events) {
          setTimeline(
            data.timeline.events.map((e) => ({
              year: e.timestamp || "",
              event: `${e.title || ""}${e.description ? ` - ${e.description}` : ""}`,
            })),
          );
        }

        const imgs = (data.mediaList ?? []).filter((m) => m.type === "image");
        setImages(imgs);
      } catch (err) {
        console.error("Failed to fetch record:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setReady(true), 100);
      }
    }

    fetchRecord();
  }, [id]);

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
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Dark gradient overlays (vignette) */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" />

          <div
            className="absolute inset-0 flex items-center justify-center opacity-55"
            style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
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
                  className="absolute left-1/2 top-1/2"
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
                        className="w-full rounded-sm object-cover"
                        style={{ aspectRatio: "1" }}
                        loading="lazy"
                        draggable={false}
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
            ready
              ? "scale-100 opacity-100"
              : "scale-[0.95] opacity-0"
          }`}
        >
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
            hideControls
          />
        </div>

        {/* CTA Button */}
        <div
          className={`transition-all delay-500 duration-1000 ease-out ${
            ready
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <button
            onClick={() => router.push(`/walk/${id}`)}
            className="rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-light tracking-[0.15em] text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
          >
            갤러리 보러가기
          </button>
        </div>
      </div>
    </div>
  );
}
