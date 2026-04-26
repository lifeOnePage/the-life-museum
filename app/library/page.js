"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import ShelfCanvas from "./components/ShelfCanvas";
import InfoBlock from "./components/InfoBlock";
import CreateAlbumModal from "./components/CreateAlbumModal";
import ShareModal from "./components/ShareModal";
import Header from "../components/Header";
import { Share2, Pencil, ArrowRight } from "lucide-react";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";
import { cachedAlbums, setCachedAlbums } from "./utils/albumListCache";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const THEME_BG_MAP = {
  kitsch: "/images/albumtheme/kitsch.png",
  illustration: "/images/albumtheme/illustration.png",
};

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function generateAlbumCovers(item) {
  const themeKey = item.theme || "minimalist";
  const bio = item.lifestory?.content || "";
  const timeline = (item.timeline?.events || []).map((e) => ({
    year: e.timestamp,
    event: e.title,
  }));

  const [frontCoverImg, themeBgImg, themeStickerImg] = await Promise.all([
    loadImage(item.coverImage?.url),
    loadImage(THEME_BG_MAP[themeKey] || null),
    themeKey === "kitsch"
      ? loadImage("/images/albumtheme/kitsch 2.png")
      : Promise.resolve(null),
  ]);

  const backImage = generateBackCoverDataUrl(
    themeKey,
    bio,
    timeline,
    frontCoverImg,
    item.title || "",
    item.subtitle || "",
    null,
    themeBgImg,
    themeStickerImg,
  );

  // Front cover with title overlay
  let frontImage = item.coverImage?.url ?? "#ffffff";
  if (item.coverTitleVisible && frontCoverImg) {
    const frontDataUrl = generateFrontCoverDataUrl(frontCoverImg, {
      title: item.title || "",
      subtitle: "",
      position: item.coverTitlePosition || "bottom-center",
      font: item.coverTitleFont || "Pretendard Variable",
      color: item.coverTitleColor || "#ffffff",
      stroke: item.coverTitleBgColor ?? false,
    });
    if (frontDataUrl) frontImage = frontDataUrl;
  }

  return { frontImage, backImage };
}

export default function MyShelfPage() {
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
      .then(async (json) => {
        if (json.ok && Array.isArray(json.data)) {
          // Set albums immediately (no backImage yet)
          const newAlbums = json.data.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            frontImage: item.coverImage?.url ?? "#ffffff",
            backImage: null,
            edgeColor: item.bgColor || "#ffffff",
            role: item.role || "owner",
            isPublic: item.isPublic ?? false,
          }));
          setCachedAlbums(newAlbums);
          setAlbums(newAlbums);

          // Generate themed covers async, then update
          const covers = await Promise.all(
            json.data.map(async (item) => ({
              id: item.id,
              ...(await generateAlbumCovers(item)),
            })),
          );
          setAlbums((prev) => {
            const updated = prev.map((album) => {
              const match = covers.find((c) => c.id === album.id);
              return match
                ? { ...album, frontImage: match.frontImage, backImage: match.backImage }
                : album;
            });
            setCachedAlbums(updated);
            return updated;
          });
        }
      })
      .catch((err) => console.error("Failed to fetch library:", err));
  }, [token]);

  // 앨범 클릭 핸들러 (3D에서 호출됨)
  const handleAlbumClick = useCallback((albumIndex, albumData) => {
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

        const { frontImage, backImage } = await generateAlbumCovers(d);

        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumData.id
              ? { ...a, frontImage, backImage, edgeColor: d.bgColor || "#ffffff" }
              : a,
          ),
        );
      })
      .catch((err) => console.error("Failed to fetch record detail:", err));
  }, []);

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
        backImage: null,
        edgeColor: null,
        role: newAlbum.role || "owner",
      },
    ]);
  }, []);

  // 필터 적용
  const filteredAlbums =
    filterType === "all" ? albums : albums.filter((a) => a.role === filterType);

  // Canvas에는 최대 15개만 전달 (3행×5열)
  const visibleAlbums = filteredAlbums.slice(0, 15);

  const selectedRole = selectedAlbum?.data?.role;

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#1a1510]"
      onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
    >
      {/* 커서팁: 선택된 앨범 호버 시 */}
      {hoverLabel && selectedAlbum && hoverLabel.album?.id === selectedAlbum?.data?.id && (
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
          <div className="pointer-events-auto absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap pb-6 sm:pb-8 md:pb-[10vh]">
            {selectedRole === "owner" && (
              <button
                onClick={() => {
                  if (selectedAlbum.data?.id) {
                    router.push(`library/edit/${selectedAlbum.data.id}`);
                  }
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/50 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                <Pencil size={14} />
                편집하기
              </button>
            )}
            <button
              onClick={() => {
                if (selectedAlbum.data?.id) {
                  router.push(`/walk/${selectedAlbum.data.id}`);
                }
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/50 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
            >
              <ArrowRight size={14} />
              보러가기
            </button>
            {selectedRole === "owner" && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex shrink-0 items-center justify-center rounded-full bg-black/50 p-2.5 text-white transition hover:bg-white hover:text-black"
                title="공유하기"
              >
                <Share2 size={16} />
              </button>
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
        />
      )}

      {/* 공유 모달 */}
      {showShareModal && selectedAlbum?.data?.id && (
        <ShareModal
          albumId={selectedAlbum.data.id}
          albumTitle={selectedAlbum.data.title || ""}
          initialIsPublic={selectedAlbum.data.isPublic ?? false}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
