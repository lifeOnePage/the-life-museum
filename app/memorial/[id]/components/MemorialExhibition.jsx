"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useRecordData } from "@/app/lib/useRecordData";
import { useBGM } from "@/app/vhs/[id]/components/lib/useBGM";
import BackgroundMediaFlow from "./BackgroundMediaFlow";
import Gravestone from "./Gravestone";
import TimelineColumns from "./TimelineColumns";

export default function MemorialExhibition({ recordId }) {
  const router = useRouter();
  const { data, loading, error, mediaLoading } = useRecordData(recordId);

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

  const name = data?.title ?? "";
  const years = data?.subtitle ?? "";
  const memorialText = data?.lifestory?.content ?? "";
  const events = data?.timeline?.events ?? [];

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 배경: 좌→우로 흐르는 미디어 */}
      <BackgroundMediaFlow mediaList={mediaList} />

      {/* 하단 좌/우 타임라인 */}
      <TimelineColumns events={events} />

      {/* 중앙 gravestone — 전체 높이가 아니라 하단에 붙는 밴드 */}
      <div className="absolute bottom-[3vh] left-1/2 top-[11vh] z-10 w-[min(500px,38vw)] -translate-x-1/2">
        <Gravestone
          name={name}
          years={years}
          memorialText={memorialText}
          profileItem={profileItem}
          mediaList={mediaList}
        />
      </div>

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

      {/* 빈 미디어 상태 */}
      {!mediaLoading && mediaList.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-sm text-white/40">표시할 미디어가 없습니다</div>
        </div>
      )}
    </div>
  );
}
