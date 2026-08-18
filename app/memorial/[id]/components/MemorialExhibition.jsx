"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useRecordData } from "@/app/lib/useRecordData";
import { useBGM } from "@/app/vhs/[id]/components/lib/useBGM";
import IntroPoster from "./IntroPoster";
import BottomNavBar from "./BottomNavBar";
import StoryTab from "./StoryTab";
import MemoryTab from "./MemoryTab";
import PlaceholderTab from "./PlaceholderTab";

export default function MemorialExhibition({ recordId }) {
  const router = useRouter();
  const { data, loading, error, mediaLoading } = useRecordData(recordId);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const bgmUrl = data?.bgmUrl || data?.bgm || null;
  const { isMuted, toggleMute, startBGM, setBgmPlaying, hasBgm, bgmStarted } =
    useBGM(bgmUrl);

  // 배경/슬라이드쇼용 미디어 (image + video)
  const mediaList = useMemo(
    () =>
      (data?.mediaList ?? []).filter(
        (m) => m.type === "image" || m.type === "video",
      ),
    [data],
  );

  // 프로필 이미지 = mediaList의 첫 번째 image 타입
  const profileItem = useMemo(
    () => mediaList.find((m) => m.type === "image") || mediaList[0] || null,
    [mediaList],
  );

  // 스토리 탭 사진 카드용 — 이미지 타입만
  const imageList = useMemo(
    () => mediaList.filter((m) => m.type === "image"),
    [mediaList],
  );

  const name = data?.title ?? "";
  const years = data?.subtitle ?? "";
  const memorialText = data?.lifestory?.content ?? "";
  const events = data?.timeline?.events ?? [];

  // 인트로 포스터용 "시작연도~끝연도" — 타임라인 이벤트의 최소/최대 연도에서 자동 계산
  const posterYearRange = useMemo(() => {
    const yearNums = events
      .map((ev) => {
        const m = String(ev.timestamp || "").match(/\d{4}/);
        return m ? parseInt(m[0], 10) : null;
      })
      .filter((n) => n != null);
    if (yearNums.length === 0) return "";
    const min = Math.min(...yearNums);
    const max = Math.max(...yearNums);
    return min === max ? `${min}` : `${min} ~ ${max}`;
  }, [events]);

  // 자동재생 정책: 최초 사용자 제스처에서 BGM 시작
  useEffect(() => {
    if (!hasBgm || bgmStarted) return;
    const start = () => {
      startBGM();
      setBgmPlaying(true);
    };
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, [hasBgm, bgmStarted, startBGM, setBgmPlaying]);

  const handleExit = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-sm text-white/50">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black">
        <div className="text-sm text-white/50">{error}</div>
        <button
          onClick={handleExit}
          className="rounded bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!introDismissed) {
    return (
      <IntroPoster
        name={name}
        yearRange={posterYearRange}
        subtitle={years}
        profileItem={profileItem}
        style={data?.memorialPosterStyle || "classic"}
        tone={data?.memorialPosterTone || "dark"}
        aspectRatio={data?.memorialAspectRatio || "9:16"}
        onEnter={() => setIntroDismissed(true)}
      />
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {activeTab === "home" && (
        <IntroPoster
          name={name}
          yearRange={posterYearRange}
          subtitle={years}
          profileItem={profileItem}
          style={data?.memorialPosterStyle || "classic"}
          tone={data?.memorialPosterTone || "dark"}
          aspectRatio={data?.memorialAspectRatio || "9:16"}
          onEnter={() => setActiveTab("story")}
        />
      )}

      {activeTab === "story" && (
        <StoryTab
          name={name}
          yearRange={posterYearRange}
          subtitle={years}
          images={imageList}
          events={events}
          bio={memorialText}
        />
      )}

      {activeTab === "memory" && (
        <MemoryTab
          mediaList={mediaList}
          mediaLoading={mediaLoading}
          tone={data?.memorialPosterTone || "dark"}
        />
      )}
      {activeTab === "guestbook" && <PlaceholderTab label="방명록" />}

      <BottomNavBar activeTab={activeTab} onChange={setActiveTab} />

      {/* 컨트롤: 뒤로가기 / 음소거 */}
      <button
        onClick={handleExit}
        className="absolute top-5 left-5 z-30 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white"
      >
        <ArrowLeft size={14} />
        나가기
      </button>
      {hasBgm && (
        <button
          onClick={toggleMute}
          className="absolute top-5 right-5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white"
          aria-label={isMuted ? "음소거 해제" : "음소거"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}
