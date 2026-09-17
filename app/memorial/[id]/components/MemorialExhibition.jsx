"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRecordData, invalidateRecord } from "@/app/lib/useRecordData";
import { getMediaType } from "@/app/library/utils/mediaType";
import { useBGM } from "@/app/vhs/[id]/components/lib/useBGM";
import IntroPoster from "./IntroPoster";
import BottomNavBar, { normalizeExternalUrl } from "./BottomNavBar";
import BgmToggle from "./BgmToggle";
import StoryTab from "./StoryTab";
import MemoryTab from "./MemoryTab";
import GuestbookTab from "./GuestbookTab";
import CustomLinkTab from "./CustomLinkTab";

export default function MemorialExhibition({ recordId, preview = false }) {
  const router = useRouter();
  const { data, loading, error, mediaLoading } = useRecordData(recordId);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // 편집 화면 iframe 임베드(preview) 모드 — 저장 전 편집 상태(제목·부제·
  // 포스터 설정·커버)를 부모 창의 postMessage로 받아 즉시 반영한다.
  // 저장 전 편집 상태(모토·포스터 설정·사용자 지정 탭 포함)를 즉시 반영하기 위한 경로.
  const [overrides, setOverrides] = useState(null);
  useEffect(() => {
    if (!preview) return;
    // 임베드 프레임 안에서 문서 스크롤바가 보이지 않게 고정
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "tlm-memorial-preview") {
        setOverrides(e.data.overrides || null);
      }
    };
    window.addEventListener("message", onMessage);
    // 마운트 완료를 알려 부모가 현재 편집 상태를 재전송하게 한다
    window.parent?.postMessage(
      { type: "tlm-memorial-preview-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);
  const ov = overrides || {};
  const posterStyle = ov.posterStyle ?? data?.memorialPosterStyle ?? "classic";
  const posterTone = ov.posterTone ?? data?.memorialPosterTone ?? "dark";
  const posterRatio = ov.aspectRatio ?? data?.memorialAspectRatio ?? "9:16";
  const guestbookEnabled =
    ov.guestbookEnabled ?? data?.guestbookEnabled ?? true;

  // 좌우명 — 인트로 포스터·스토리 탭에 표시 (편집 프리뷰 오버라이드 우선)
  const motto = ov.motto ?? data?.memorialMotto ?? "";

  // 사용자 지정 링크 탭 — 활성화 + URL(기존 externalLinkUrl)이 있을 때만.
  // 라벨은 customTabLabel → externalLinkTitle → "링크" 순으로 폴백.
  const customTab = useMemo(() => {
    const enabled = ov.customTabEnabled ?? data?.customTabEnabled;
    const rawUrl = ov.externalLinkUrl ?? data?.externalLinkUrl;
    if (!enabled || !rawUrl) return null;
    return {
      label:
        (ov.customTabLabel ?? data?.customTabLabel) ||
        (ov.externalLinkTitle ?? data?.externalLinkTitle) ||
        "링크",
      url: normalizeExternalUrl(rawUrl),
      mode: (ov.customTabMode ?? data?.customTabMode) || "newtab",
    };
  }, [
    data,
    ov.customTabEnabled,
    ov.externalLinkUrl,
    ov.customTabLabel,
    ov.externalLinkTitle,
    ov.customTabMode,
  ]);

  // 방명록이 꺼진 상태에서 방명록 탭에 남아있지 않도록 (프리뷰 실시간 토글 대응)
  useEffect(() => {
    if (!guestbookEnabled && activeTab === "guestbook") setActiveTab("home");
  }, [guestbookEnabled, activeTab]);

  // 링크 탭이 꺼지거나 새 창 모드로 바뀌면 임베드 탭에 남아있지 않도록
  useEffect(() => {
    if (activeTab === "custom" && (!customTab || customTab.mode !== "embed")) {
      setActiveTab("home");
    }
  }, [customTab, activeTab]);

  const bgmUrl = data?.bgmUrl || data?.bgm || null;
  const { isMuted, toggleMute, startBGM, setBgmPlaying, hasBgm, bgmStarted } =
    useBGM(bgmUrl);
  // 사용자가 재생/정지 버튼으로 고른 상태 (useBGM 은 isPlaying 을 ref 로만 갖고 있어 별도 보관)
  const [bgmPlaying, setBgmPlayingState] = useState(false);
  const isBgmPlaying = bgmStarted && bgmPlaying && !isMuted;

  // 재생/정지 토글 — 아직 시작 전이면 제스처 안에서 시작, 음소거면 해제, 그 외 pause/resume
  const handleBgmToggle = useCallback(() => {
    if (!bgmStarted) {
      startBGM();
      setBgmPlaying(true);
      setBgmPlayingState(true);
    } else if (isMuted) {
      toggleMute();
      setBgmPlaying(true);
      setBgmPlayingState(true);
    } else if (isBgmPlaying) {
      setBgmPlaying(false);
      setBgmPlayingState(false);
    } else {
      setBgmPlaying(true);
      setBgmPlayingState(true);
    }
  }, [bgmStarted, isMuted, isBgmPlaying, startBGM, setBgmPlaying, toggleMute]);

  // 생성/전환 직후 미디어 인제스트가 진행 중이면 "준비 중" 화면 + 폴링.
  // (빈 mediaList가 recordCache에 영구 캐시되는 것을 막기 위해 준비 완료 시
  //  캐시 무효화 후 전체 리로드)
  const isPreparing = data?.mediaStatus === "processing";
  useEffect(() => {
    if (!isPreparing) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${recordId}`,
        );
        const json = await res.json();
        if (json?.data?.mediaStatus === "ready") {
          clearInterval(timer);
          invalidateRecord(recordId);
          window.location.reload();
        }
      } catch {
        // 일시 오류 — 다음 폴링에서 재시도
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isPreparing, recordId]);

  // 배경/슬라이드쇼용 미디어 (image + video)
  const mediaList = useMemo(
    () =>
      (data?.mediaList ?? []).filter(
        (m) => m.type === "image" || m.type === "video",
      ),
    [data],
  );

  // 프로필 이미지 = 커버 이미지(이미지 타입일 때) 우선 — 편집 화면 포스터
  // 미리보기와 동기화. 커버가 없거나 영상이면 mediaList 첫 image로 폴백.
  const profileItem = useMemo(() => {
    const coverUrl = ov.coverImageUrl ?? data?.coverImage?.url;
    if (coverUrl && getMediaType(coverUrl) === "image") {
      return { type: "image", original_url: coverUrl, thumbnail_url: coverUrl };
    }
    return mediaList.find((m) => m.type === "image") || mediaList[0] || null;
  }, [data, mediaList, ov.coverImageUrl]);

  // 스토리 탭 사진 카드용 — 이미지 타입만
  const imageList = useMemo(
    () => mediaList.filter((m) => m.type === "image"),
    [mediaList],
  );

  const name = ov.title ?? data?.title ?? "";
  const years = ov.subtitle ?? data?.subtitle ?? "";
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

  // 자동재생 정책: 최초 사용자 제스처에서 BGM 시작 (편집 미리보기에선 미재생)
  useEffect(() => {
    if (!hasBgm || bgmStarted || preview) return;
    const start = () => {
      startBGM();
      setBgmPlaying(true);
      setBgmPlayingState(true);
    };
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, [hasBgm, bgmStarted, preview, startBGM, setBgmPlaying]);

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

  if (isPreparing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
        <div className="text-center">
          <p className="text-sm text-white/70">앨범을 준비하고 있어요</p>
          <p className="mt-1 text-xs text-white/40">
            사진을 안전하게 옮기는 중입니다 — 잠시만 기다려주세요
          </p>
        </div>
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
    // IntroPoster 루트가 <button> 이라 BGM 버튼을 안에 중첩할 수 없음 —
    // 형제 오버레이로 얹고 BgmToggle 이 클릭 전파를 막아 onEnter 가 같이 발동하지 않게 한다
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        <IntroPoster
          name={name}
          yearRange={posterYearRange}
          subtitle={years}
          motto={motto}
          profileItem={profileItem}
          style={posterStyle}
          tone={posterTone}
          aspectRatio={posterRatio}
          guestbookEnabled={guestbookEnabled}
          onEnter={() => {
            // 인트로 터치 → 바로 스토리 탭으로 (홈 포스터를 한 번 더 거치지 않음)
            setIntroDismissed(true);
            setActiveTab("story");
          }}
        />
        {hasBgm && !preview && (
          <BgmToggle
            isPlaying={isBgmPlaying}
            onToggle={handleBgmToggle}
            className="absolute top-5 right-5 z-30"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {activeTab === "home" && (
        <IntroPoster
          name={name}
          yearRange={posterYearRange}
          subtitle={years}
          motto={motto}
          profileItem={profileItem}
          style={posterStyle}
          tone={posterTone}
          aspectRatio={posterRatio}
          guestbookEnabled={guestbookEnabled}
          onEnter={() => setActiveTab("story")}
        />
      )}

      {activeTab === "story" && (
        <StoryTab
          name={name}
          yearRange={posterYearRange}
          subtitle={years}
          motto={motto}
          images={imageList}
          mediaList={mediaList}
          events={events}
          bio={memorialText}
        />
      )}

      {activeTab === "memory" && (
        <MemoryTab
          mediaList={mediaList}
          mediaLoading={mediaLoading}
          tone={posterTone}
        />
      )}
      {activeTab === "guestbook" && guestbookEnabled && (
        <GuestbookTab
          recordId={recordId}
          profileItem={profileItem}
          tone={posterTone}
        />
      )}

      {activeTab === "custom" && customTab && customTab.mode === "embed" && (
        <CustomLinkTab
          label={customTab.label}
          url={customTab.url}
          tone={posterTone}
        />
      )}

      <BottomNavBar
        activeTab={activeTab}
        onChange={setActiveTab}
        showGuestbook={guestbookEnabled}
        customTab={customTab}
      />

      {/* 컨트롤: 뒤로가기 / BGM 재생·정지 — 편집 미리보기에선 숨김 */}
      {!preview && (
        <button
          onClick={handleExit}
          className="absolute top-5 left-5 z-30 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft size={14} />
          나가기
        </button>
      )}
      {hasBgm && !preview && (
        <BgmToggle
          isPlaying={isBgmPlaying}
          onToggle={handleBgmToggle}
          className="absolute top-5 right-5 z-30"
        />
      )}
    </div>
  );
}
