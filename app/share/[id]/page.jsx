"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DEFAULT_THEME } from "@/app/library/edit/[record_id]/themeConfig";

const AlbumPreview3D = dynamic(
  () => import("@/app/library/edit/[record_id]/components/AlbumPreview3D"),
  { ssr: false },
);

export default function SharePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const [frontCover, setFrontCover] = useState(null);
  const [bio, setBio] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [albumTitle, setAlbumTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    if (!id) return;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/record/${id}`);

        if (!response.ok) {
          throw new Error(`앨범을 불러올 수 없습니다 (${response.status})`);
        }

        const result = await response.json();

        if (!result.ok || !result.data) {
          throw new Error("앨범 데이터가 없습니다");
        }

        const data = result.data;

        setFrontCover(data.coverImage?.url || null);
        setBio(data.lifestory?.content || "");
        setAlbumTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setSelectedTheme(data.theme || DEFAULT_THEME);

        if (data.timeline?.events) {
          setTimeline(
            data.timeline.events.map((e) => ({
              year: e.timestamp || "",
              event: e.title || "",
            })),
          );
        }
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
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-black">
      {/* Header */}
      <div
        className={`relative z-10 shrink-0 px-6 pt-10 pb-2 text-center transition-all duration-1000 ease-out ${
          ready ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        {albumTitle && (
          <h1 className="text-lg font-light tracking-[0.2em] text-white/85">
            {albumTitle}
          </h1>
        )}
        {subtitle && (
          <p className="mt-2 text-[11px] font-light tracking-[0.25em] text-white/35">
            {subtitle}
          </p>
        )}
      </div>

      {/* 3D Album */}
      <div
        className={`relative z-10 min-h-0 flex-1 transition-all delay-200 duration-1000 ease-out ${
          ready ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
        }`}
      >
        <AlbumPreview3D
          frontCover={frontCover}
          bio={bio}
          timeline={timeline}
          selectedTheme={selectedTheme}
          albumTitle={albumTitle}
        />
      </div>

      {/* Bottom CTA */}
      <div
        className={`relative z-10 shrink-0 pt-2 pb-10 text-center transition-all delay-500 duration-1000 ease-out ${
          ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <button
          onClick={() => router.push(`/walk/${id}`)}
          className="group inline-flex items-center gap-3 px-1 py-2 transition-all duration-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-white/50 transition-all duration-300 group-hover:text-white/80"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08l3.158-2.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-[13px] font-light tracking-[0.15em] text-white/50 transition-colors duration-300 group-hover:text-white/80">
            갤러리 보러가기
          </span>
        </button>
      </div>
    </div>
  );
}
