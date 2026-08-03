"use client";

import { use, useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import ShelfCanvas from "./components/ShelfCanvas";
import InfoBlock from "./components/InfoBlock";
import CreateAlbumModal from "./components/CreateAlbumModal";
import ShareModal from "./components/ShareModal";
import UnlockTrialModal from "./components/UnlockTrialModal";
import Header from "../components/Header";
import { Share2, Pencil, ArrowRight, Lock, Sparkles } from "lucide-react";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";
import { getProxiedUrl } from "@/app/lib/proxy";
import {
  cachedAlbums,
  setCachedAlbums,
  coverCache,
  getOptimisticCover,
  clearOptimisticCover,
} from "./utils/albumListCache";
import { authedFetch } from "@/app/utils/authedFetch";
import { hapticTap } from "@/app/utils/haptics";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const THEME_BG_MAP = {
  kitsch: "/images/albumtheme/kitsch.png",
  illustration: "/images/albumtheme/illustration.png",
  travel: "/images/albumtheme/travel/travel1_back.svg",
};

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const isBlobOrData = src.startsWith("blob:") || src.startsWith("data:");
    const img = new Image();
    if (!isBlobOrData) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (!isBlobOrData) {
        const proxy = new Image();
        proxy.crossOrigin = "anonymous";
        proxy.onload = () => resolve(proxy);
        proxy.onerror = () => resolve(null);
        // 직접 로드가 실패한 폴백 — R2 URL이라도 프록시로 강제 재시도
        proxy.src = getProxiedUrl(src, { force: true });
      } else {
        resolve(null);
      }
    };
    img.src = src;
  });
}

// 합성 커버에 영향을 주는 필드들의 서명 — 같으면 coverCache의 합성본을 재사용
function coverSignature(item) {
  return JSON.stringify([
    item.coverImage?.url ?? null,
    item.backCoverImageUrl ?? null,
    item.theme ?? null,
    item.title ?? "",
    item.subtitle ?? "",
    item.lifestory?.content ?? "",
    item.timeline?.events ?? null,
    item.coverTitleVisible ?? false,
    item.coverTitlePosition ?? null,
    item.coverTitleFont ?? null,
    item.coverTitleColor ?? null,
    item.coverTitleBgColor ?? null,
    // 사용자 배치 스티커 — 변경 시 뒷면 재합성
    item.stickers ?? null,
  ]);
}

async function generateAlbumCovers(item, locale) {
  const themeKey = item.theme || "minimalist";
  const bio = item.lifestory?.content || "";
  const timeline = (item.timeline?.events || []).map((e) => ({
    year: e.timestamp,
    event: e.title,
  }));
  const frontFrameMap = {
    memorial_light: "/stickers/memorial/image 406.svg",
    memorial_dark: "/stickers/memorial/image 406.svg",
    travel: "/images/albumtheme/travel/travel1_front.svg",
    couple_1: "/images/albumtheme/couple/couple-1.svg",
    couple_2: "/images/albumtheme/couple/couple-2.svg",
  };

  // 사용자 배치 스티커 — 고유 src만 로드해 {src: img} 맵 구성 (실패한 이미지는 제외)
  // side 없는 기존 데이터는 뒷면으로 취급(하위 호환, AlbumPreview2D.jsx와 동일 규칙)
  const stickers = Array.isArray(item.stickers) ? item.stickers : [];
  const frontStickers = stickers.filter((s) => s.side === "front");
  const backStickers = stickers.filter((s) => s.side !== "front");
  const uniqueStickerSrcs = [
    ...new Set(stickers.map((s) => s?.src).filter(Boolean)),
  ];

  // flowerImg(main: memorial 앞면 장식)와 stickerImages(feat-scene: 사용자 뒷면
  // 스티커)는 용도가 달라 둘 다 유지 — Promise.all 순서와 구조분해 순서 일치 필수
  const [
    frontCoverImg,
    backCoverImg,
    themeBgImg,
    themeStickerImg,
    flowerImg,
    stickerImages,
  ] =
    await Promise.all([
      loadImage(item.coverImage?.url),
      // 뒷면 사진을 아직 저장 안 한 옛 앨범은 편집/공유 페이지와 동일하게
      // 앞면 커버로 대체 표시한다 (영상 커버는 대체 불가라 그대로 null).
      loadImage(item.backCoverImageUrl || item.coverImage?.url || null),
      loadImage(THEME_BG_MAP[themeKey] || null),
      themeKey === "kitsch"
        ? loadImage("/images/albumtheme/kitsch 2.png")
        : Promise.resolve(null),
      loadImage(frontFrameMap[themeKey] || null),
      Promise.all(
        uniqueStickerSrcs.map(async (src) => [src, await loadImage(src)]),
      ).then((pairs) =>
        Object.fromEntries(pairs.filter(([, img]) => img)),
      ),
    ]);

  const backImage = generateBackCoverDataUrl(
    themeKey,
    bio,
    timeline,
    backCoverImg,
    item.title || "",
    item.subtitle || "",
    null,
    themeBgImg,
    themeStickerImg,
    backStickers,
    stickerImages,
  );

  // Front cover composite — 오버레이 OFF여도 합성본(정사각 크롭)을 사용한다.
  // raw URL을 쓰면 (a) 편집 프리뷰·낙관 캐시(합성본)와 모습이 달라 저장 후
  // 복귀 시 원본이 노출된 것처럼 보이고, (b) 정사각 면에 원본이 늘어나 왜곡된다.
  // (영상 커버는 frontCoverImg가 null이라 raw URL 유지 → 비디오 텍스처 경로)
  let frontImage = item.coverImage?.url ?? "#ffffff";
  if (frontCoverImg) {
    let stroke = item.coverTitleBgColor ?? false;
    let strokeOpacity = 100;
    if (stroke && typeof stroke === "string" && stroke.startsWith("#") && stroke.length === 9) {
      strokeOpacity = Math.round((parseInt(stroke.slice(7, 9), 16) / 255) * 100);
      stroke = stroke.slice(0, 7);
    }
    const frontDataUrl = generateFrontCoverDataUrl(frontCoverImg, {
      title: item.coverTitleVisible ? item.title || "" : "",
      subtitle: "",
      position: item.coverTitlePosition || "bottom-center",
      font: item.coverTitleFont || "Pretendard Variable",
      color: item.coverTitleColor || "#ffffff",
      stroke,
      strokeOpacity,
      themeKey,
      albumTitle: item.title || "",
      flowerImg,
      locale,
      stickers: frontStickers,
      stickerImages,
    });
    if (frontDataUrl) frontImage = frontDataUrl;
  }

  return { frontImage, backImage };
}

const T = {
  ko: {
    edit: "편집하기",
    view: "보러가기",
    share: "공유하기",
    unlock: "잠금 해제",
    buyCredits: "앨범 구매하기",
  },
  en: {
    edit: "Edit",
    view: "View",
    share: "Share",
    unlock: "Unlock",
    buyCredits: "Buy Albums",
  },
};

export default function MyShelfPage({ params }) {
  const { locale } = use(params);
  const t = T[locale] || T.ko;
  const { token, loading } = useAuth();
  const router = useRouter();

  // API에서 받아온 전체 앨범 목록 (재방문 시 캐시에서 즉시 복원)
  const [albums, setAlbums] = useState(() => cachedAlbums);

  // 선택된 앨범 상태 (DOM과 3D 캔버스 간 상호작용)
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // 앨범 플립 상태 (뒷면 표시 여부)
  const [isFlipped, setIsFlipped] = useState(false);

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // 필터 상태: 'all' | 'owner' | 'shared'
  const [filterType, setFilterType] = useState("all");

  // 카메라 제어를 위한 ref
  const cameraControlRef = useRef(null);

  // 호버 라벨 상태 (앨범 top-left 화면 좌표 + 앨범 데이터)
  const [hoverLabel, setHoverLabel] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // 비로그인 → 로그인 페이지로
  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  // API fetch
  useEffect(() => {
    if (!token) return;
    authedFetch(`${BASE_URL}/library`)
      .then((res) => res.json())
      .then((json) => {
        if (!(json.ok && Array.isArray(json.data))) return;

        // 1) 최신 메타데이터 즉시 반영. 커버 관련 필드가 안 바뀐 앨범은
        //    coverCache의 합성본을 그대로 사용 → 재합성/플래시 없이 즉시 표시.
        const prevAlbums = cachedAlbums;
        const newAlbums = json.data.map((item) => {
          const sig = coverSignature(item);
          // optimistic: 편집 페이지가 저장 시 심어둔 합성본(메모리 + sessionStorage,
          // 리로드 생존) — 즉시 표시하되 아래 2)에서 서버 기준 재합성으로 확정.
          const cached = coverCache.get(item.id) ?? getOptimisticCover(item.id);
          const hit = cached && (cached.sig === sig || cached.optimistic);
          // 마지막 안전망: 캐시가 전부 비어도(리로드 등) 직전 화면이 합성본
          // (data:/blob:)을 보여주고 있었다면 raw 대신 그것을 유지 — 어떤 경우에도
          // 세션 중간에 원본(raw)이 화면에 노출되지 않게 한다.
          const prev = prevAlbums.find((a) => a.id === item.id);
          const prevComposite =
            typeof prev?.frontImage === "string" &&
            (prev.frontImage.startsWith("data:") ||
              prev.frontImage.startsWith("blob:"))
              ? prev.frontImage
              : null;
          if (!hit) {
            // eslint-disable-next-line no-console
            console.debug(
              "[cover-sync] map miss:",
              item.id.slice(0, 8),
              { hasEntry: !!cached, prevComposite: !!prevComposite },
            );
          }
          return {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            frontImage: hit
              ? cached.frontImage
              : (prevComposite ?? item.coverImage?.url ?? "#ffffff"),
            // 원본 R2 URL (카톡 공유용) — frontImage는 캐시된 합성본(data:/blob:)일
            // 수 있어 공유에 못 쓰므로 별도로 보관한다.
            coverUrl: item.coverImage?.url ?? null,
            backImage: hit ? cached.backImage : (prev?.backImage ?? null),
            edgeColor: item.bgColor || "#ffffff",
            role: item.role || "owner",
            isPublic: item.isPublic ?? false,
            exhibitionType: item.exhibitionType ?? "walk",
            isTrial: item.isTrial ?? false,
            isExpired: item.isExpired ?? false,
            trialExpiresAt: item.trialExpiresAt ?? null,
          };
        });
        setCachedAlbums(newAlbums);
        setAlbums(newAlbums);

        // 2) 변경(또는 미합성) 앨범만 재합성 — 전체 완료를 기다리지 않고
        //    각 앨범이 끝나는 즉시 개별 반영 (편집한 앨범 하나면 그것만 빠르게).
        json.data.forEach((item) => {
          const sig = coverSignature(item);
          const cached = coverCache.get(item.id);
          if (cached && cached.sig === sig) return;
          generateAlbumCovers(item, locale)
            .then(({ frontImage, backImage }) => {
              coverCache.set(item.id, { sig, frontImage, backImage });
              clearOptimisticCover(item.id);
              // eslint-disable-next-line no-console
              console.debug("[cover-sync] regen done:", item.id.slice(0, 8));
              setAlbums((prev) => {
                const updated = prev.map((a) =>
                  a.id === item.id ? { ...a, frontImage, backImage } : a,
                );
                setCachedAlbums(updated);
                return updated;
              });
            })
            .catch(() => {});
        });
      })
      .catch((err) => console.error("Failed to fetch library:", err));
  }, [token, locale]);

  // 앨범 클릭 핸들러 (3D에서 호출됨)
  const handleAlbumClick = useCallback((albumIndex, albumData) => {
    hapticTap();
    setSelectedAlbum({ index: albumIndex, data: albumData });
    setIsFlipped(false);
    setHoverLabel(null);

    // 이미 detail이 로드된 경우 skip
    if (albumData?.backImage && albumData?.edgeColor) return;
    if (!albumData?.id) return;

    // record detail fetch → themed back cover 생성
    authedFetch(`${BASE_URL}/record/${albumData.id}`)
      .then((res) => res.json())
      .then(async (json) => {
        if (!json.ok || !json.data) return;
        const d = json.data;

        const { frontImage, backImage } = await generateAlbumCovers(d, locale);
        coverCache.set(albumData.id, {
          sig: coverSignature(d),
          frontImage,
          backImage,
        });

        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumData.id
              ? {
                  ...a,
                  frontImage,
                  backImage,
                  edgeColor: d.bgColor || "#ffffff",
                }
              : a,
          ),
        );
      })
      .catch((err) => console.error("Failed to fetch record detail:", err));
  }, [locale]);

  // 앨범 플립 핸들러 (선택된 앨범 클릭 시)
  const handleFlipAlbum = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // 앨범 닫기 (DOM X 버튼에서 호출)
  const handleCloseAlbum = useCallback(() => {
    setSelectedAlbum(null);
    setIsFlipped(false);
  }, []);

  // 카메라 리셋 (DOM 버튼에서 호출)
  const handleResetCamera = useCallback(() => {
    cameraControlRef.current?.reset();
  }, []);

  // 카메라 줌 (DOM 버튼에서 호출)
  const handleZoomIn = useCallback(() => {
    cameraControlRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraControlRef.current?.zoomOut();
  }, []);

  // 앨범 생성/공유 완료 핸들러
  const handleAlbumCreated = useCallback((newAlbum) => {
    if (!newAlbum) return;
    setAlbums((prev) => [
      ...prev,
      {
        id: newAlbum.id,
        title: newAlbum.title,
        subtitle: newAlbum.subtitle,
        frontImage: newAlbum.coverImage?.url ?? null,
        coverUrl: newAlbum.coverImage?.url ?? null,
        backImage: null,
        edgeColor: null,
        exhibitionType: newAlbum.exhibitionType ?? "walk",
        role: newAlbum.role || "owner",
        isPublic: newAlbum.isPublic ?? false,
        isTrial: newAlbum.isTrial ?? false,
        isExpired: newAlbum.isExpired ?? false,
        trialExpiresAt: newAlbum.trialExpiresAt ?? null,
      },
    ]);
  }, []);

  // 체험 앨범 잠금 해제 완료 — 해당 앨범의 체험 상태 해제
  const handleUnlocked = useCallback(() => {
    const id = selectedAlbum?.data?.id;
    if (!id) return;
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isTrial: false, isExpired: false, trialExpiresAt: null } : a,
      ),
    );
    setSelectedAlbum((prev) =>
      prev && prev.data?.id === id
        ? { ...prev, data: { ...prev.data, isTrial: false, isExpired: false } }
        : prev,
    );
  }, [selectedAlbum?.data?.id]);

  // 공유 모달에서 공개/비공개 전환 시 로컬 상태 반영 (재오픈 시 최신값 유지)
  const handlePublicChange = useCallback(
    (isPublic) => {
      const id = selectedAlbum?.data?.id;
      if (!id) return;
      setAlbums((prev) => {
        const updated = prev.map((a) =>
          a.id === id ? { ...a, isPublic } : a,
        );
        setCachedAlbums(updated); // 캐시도 동기화 (재마운트 시 stale 방지)
        return updated;
      });
      setSelectedAlbum((prev) =>
        prev && prev.data?.id === id
          ? { ...prev, data: { ...prev.data, isPublic } }
          : prev,
      );
    },
    [selectedAlbum?.data?.id],
  );

  // 필터 적용
  const filteredAlbums =
    filterType === "all" ? albums : albums.filter((a) => a.role === filterType);

  // Canvas에는 최대 15개만 전달 (3행×5열)
  const visibleAlbums = filteredAlbums.slice(0, 15);

  const selectedRole = selectedAlbum?.data?.role;
  const selData = selectedAlbum?.data;
  // 체험 앨범: 30일 경과 → 만료(잠금), 30일 이내 → 활성 체험(구매 유도)
  const selExpiredTrial = !!(selData?.isTrial && selData?.isExpired);
  const selActiveTrial = !!(selData?.isTrial && !selData?.isExpired);
  // 진열대 전체에 체험(미만료) 앨범이 하나라도 있으면 구매 유도 노출
  const hasActiveTrial = albums.some((a) => a.isTrial && !a.isExpired);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#1a1510]"
      onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
    >
      {/* 커서팁: 선택된 앨범 호버 시 */}
      {hoverLabel &&
        selectedAlbum &&
        hoverLabel.album?.id === selectedAlbum?.data?.id && (
          <div
            className="pointer-events-none fixed z-50"
            style={{ left: cursorPos.x + 14, top: cursorPos.y - 10 }}
          >
            <div className="rounded-full bg-white/15 p-2 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-white/70"
              >
                <path d="M17 15.328c2.414 -.718 4 -1.94 4 -3.328c0 -2.21 -4.03 -4 -9 -4s-9 1.79 -9 4s4.03 4 9 4" />
                <path d="M9 13l3 3l-3 3" />
              </svg>
            </div>
          </div>
        )}

      {/* 3D 캔버스 */}
      <ShelfCanvas
        albums={visibleAlbums}
        selectedAlbum={selectedAlbum}
        isFlipped={isFlipped}
        onAlbumClick={handleAlbumClick}
        onFlipAlbum={handleFlipAlbum}
        onCloseAlbum={handleCloseAlbum}
        cameraControlRef={cameraControlRef}
        onHoverLabelPos={setHoverLabel}
      />

      {/* 호버 라벨: 앨범 하단 중앙 화면 좌표 기준, 중앙 정렬 + 페이드인 */}
      {/* {hoverLabel && !selectedAlbum && (
        <div
          key={hoverLabel.album.id}
          style={{
            position: "fixed",
            left: hoverLabel.x,
            top: hoverLabel.y,
            pointerEvents: "none",
            textAlign: "center",
            animation: "albumLabelIn 0.18s ease-out forwards",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "clamp(11px, 1.2vw, 14px)",
              fontWeight: 600,
              color: "#e8d5b7",
              letterSpacing: "0.02em",
              lineHeight: 1.4,
            }}
          >
            {hoverLabel.album.title}
          </span>
          {hoverLabel.album.subtitle && (
            <span
              style={{
                display: "block",
                fontSize: "clamp(10px, 1vw, 12px)",
                color: "#9b8b7a",
                marginTop: 2,
                letterSpacing: "0.01em",
              }}
            >
              {hoverLabel.album.subtitle}
            </span>
          )}
        </div>
      )} */}

      {/* DOM 오버레이 UI */}
      <div className="pointer-events-none absolute inset-0">
        <InfoBlock
          onClickCreate={() => setShowCreateModal(true)}
          onCloseAlbum={selectedAlbum ? handleCloseAlbum : undefined}
          filterType={filterType}
          setFilterType={setFilterType}
          locale={locale}
        />
        {/* 상단 헤더 */}
        <div className="pointer-events-none absolute top-0 right-0 left-0 flex items-center justify-between p-4">
          {/* 우상단: 카메라 컨트롤 (앨범 미선택 시에만 표시) */}
          {/* {!selectedAlbum && (
            <div className="flex gap-2">
              <button onClick={handleZoomIn}>+</button>
              <button onClick={handleZoomOut}>−</button>
              <button onClick={handleResetCamera}>Reset</button>
            </div>
          )} */}
        </div>

        {/* 선택된 앨범: 왼쪽에 제목/설명 */}
        {/* {selectedAlbum && (
          <div className="pointer-events-auto absolute top-1/2 left-[calc(max(30vw,100px))] max-w-56 -translate-x-full -translate-y-1/2 rounded-xl p-4">
            <h2 className="mb-1 text-lg font-semibold text-black">
              {selectedAlbum.data?.title || `Album ${selectedAlbum.index + 1}`}
            </h2>
            {selectedAlbum.data?.subtitle && (
              <p className="text-sm text-black/70">
                {selectedAlbum.data.subtitle}
              </p>
            )}
          </div>
        )} */}

        {/* 선택된 앨범: 아래에 버튼 (role에 따라 분기) */}
        {selectedAlbum && (
          <div
            className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap will-change-transform"
            style={{ top: "calc(50% + min(32.5vw, 32.5vh) + 40px)" }}
          >
            {selExpiredTrial ? (
              // 30일 경과한 무료 체험 앨범 → 열지 않고 결제(잠금 해제) 유도
              <button
                onClick={() => setShowUnlockModal(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#c4b49a] px-5 py-2 text-sm font-semibold text-[#1a1510] transition-colors duration-150 hover:bg-[#e8d5b7]"
              >
                <Lock size={14} />
                {t.unlock}
              </button>
            ) : (
              <>
                {selectedRole === "owner" && (
                  <button
                    onClick={() => {
                      if (selectedAlbum.data?.id) {
                        router.push(`library/edit/${selectedAlbum.data.id}`);
                      }
                    }}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-800/80 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white hover:text-neutral-800"
                  >
                    <Pencil size={14} />
                    {t.edit}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (selectedAlbum.data?.id) {
                      const id = selectedAlbum.data.id;
                      const type = selectedAlbum.data.exhibitionType;
                      const route =
                        type === "memorial"
                          ? `/memorial/${id}`
                          : type === "memorial_tape"
                            ? `/vhs/${id}`
                            : `/walk/${id}`;
                      router.push(route);
                    }
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-800/80 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white hover:text-neutral-800"
                >
                  <ArrowRight size={14} />
                  {t.view}
                </button>
                {selectedRole === "owner" && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex shrink-0 items-center justify-center rounded-full bg-neutral-800/80 p-2.5 text-white transition-colors duration-150 hover:bg-white hover:text-neutral-800"
                    title={t.share}
                  >
                    <Share2 size={16} />
                  </button>
                )}
                {selActiveTrial && (
                  // 체험 기간(30일 이내) → 진열대에서 결제 유도
                  <button
                    onClick={() => setShowUnlockModal(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#c4b49a] px-5 py-2 text-sm font-semibold text-[#1a1510] transition-colors duration-150 hover:bg-[#e8d5b7]"
                  >
                    <Sparkles size={14} />
                    {t.buyCredits}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 앨범 생성 모달 */}
      {showCreateModal && (
        <CreateAlbumModal
          baseUrl={BASE_URL}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleAlbumCreated}
          locale={locale}
        />
      )}

      {/* 진열대 결제 유도 (체험 앨범 보유 + 미선택 시) */}
      {hasActiveTrial && !selectedAlbum && (
        <button
          onClick={() => router.push(`/${locale}/account/purchase`)}
          className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#c4b49a] px-6 py-2.5 text-sm font-semibold text-[#1a1510] shadow-lg transition-colors duration-150 hover:bg-[#e8d5b7]"
        >
          <Sparkles size={15} />
          {t.buyCredits}
        </button>
      )}

      {/* 공유 모달 */}
      {showShareModal && selectedAlbum?.data?.id && (
        <ShareModal
          albumId={selectedAlbum.data.id}
          albumTitle={selectedAlbum.data.title || ""}
          subtitle={selectedAlbum.data.subtitle || ""}
          coverImageUrl={selectedAlbum.data.coverUrl || ""}
          initialIsPublic={selectedAlbum.data.isPublic ?? false}
          isTrial={selectedAlbum.data.isTrial ?? false}
          isExpired={selectedAlbum.data.isExpired ?? false}
          onPublicChange={handlePublicChange}
          onClose={() => setShowShareModal(false)}
          locale={locale}
        />
      )}

      {/* 체험 앨범 잠금 해제 모달 */}
      {showUnlockModal && selectedAlbum?.data?.id && (
        <UnlockTrialModal
          albumId={selectedAlbum.data.id}
          albumTitle={selectedAlbum.data.title || ""}
          expired={selExpiredTrial}
          onUnlocked={handleUnlocked}
          onClose={() => setShowUnlockModal(false)}
          locale={locale}
        />
      )}
    </div>
  );
}
