"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import ShelfCanvas from "./components/ShelfCanvas";
import InfoBlock from "./components/InfoBlock";
import CreateAlbumModal from "./components/CreateAlbumModal";
import Header from "../components/Header";
import generateBackCoverDataUrl from "./utils/generateBackCover";
import { cachedAlbums, setCachedAlbums } from "./utils/albumListCache";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

export default function MyShelfPage() {
  const { token } = useAuth();
  const router = useRouter();

  // API에서 받아온 전체 앨범 목록 (재방문 시 캐시에서 즉시 복원)
  const [albums, setAlbums] = useState(() => cachedAlbums);

  // 선택된 앨범 상태 (DOM과 3D 캔버스 간 상호작용)
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // 앨범 플립 상태 (뒷면 표시 여부)
  const [isFlipped, setIsFlipped] = useState(false);

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 필터 상태: 'all' | 'owner' | 'shared'
  const [filterType, setFilterType] = useState("all");

  // 카메라 제어를 위한 ref
  const cameraControlRef = useRef(null);

  // 호버 라벨 상태 (앨범 top-left 화면 좌표 + 앨범 데이터)
  const [hoverLabel, setHoverLabel] = useState(null);

  // API fetch
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/library`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          const newAlbums = json.data.map((item) => {
              const bio = item.lifestory?.content || "";
              const timeline = (item.timeline?.events || []).map((e) => ({
                year: e.timestamp,
                event: e.title,
              }));
              const bgColor = item.bgColor || "#ffffff";
              const textColor = item.color || "#1c1917";
              const keyColor = item.keyColor || "#d97706";

              const backImage = generateBackCoverDataUrl(
                bio,
                timeline,
                bgColor,
                textColor,
                keyColor,
              );

              return {
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                frontImage: item.coverImage?.url ?? "#ffffff",
                backImage,
                edgeColor: bgColor,
                role: item.role || "owner",
              };
            });
          setCachedAlbums(newAlbums);
          setAlbums(newAlbums);
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

    // record detail fetch → back cover 생성
    fetch(`${BASE_URL}/record/${albumData.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok || !json.data) return;
        const d = json.data;

        const bio = d.lifestory?.content || "";
        const timeline = (d.timeline?.events || []).map((e) => ({
          year: e.timestamp,
          event: e.title,
        }));
        const bgColor = d.bgColor || "#ffffff";
        const textColor = d.color || "#1c1917";
        const keyColor = d.keyColor || "#d97706";

        const backCoverUrl = generateBackCoverDataUrl(
          bio,
          timeline,
          bgColor,
          textColor,
          keyColor,
        );

        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumData.id
              ? { ...a, backImage: backCoverUrl, edgeColor: bgColor }
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
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1510]">
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
      {hoverLabel && !selectedAlbum && (
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
      )}

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
        {selectedAlbum && (
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
        )}

        {/* 선택된 앨범: 아래에 버튼 (role에 따라 분기) */}
        {selectedAlbum && (
          <div className="pointer-events-auto absolute bottom-[15vh] left-1/2 flex -translate-x-1/2 translate-y-full gap-3">
            {selectedRole === "owner" && (
              <button
                onClick={() => {
                  if (selectedAlbum.data?.id) {
                    router.push(`library/edit/${selectedAlbum.data.id}`);
                  }
                }}
                className="rounded-full bg-black/50 px-6 py-2 font-medium text-white transition hover:bg-white hover:text-black"
              >
                편집하기
              </button>
            )}
            <button
              onClick={() => {
                if (selectedAlbum.data?.id) {
                  router.push(`/walk/${selectedAlbum.data.id}`);
                }
              }}
              className="rounded-full bg-black/50 px-6 py-2 font-medium text-white transition hover:bg-white hover:text-black"
            >
              보러가기
            </button>
          </div>
        )}
      </div>

      {/* 앨범 생성 모달 */}
      {showCreateModal && (
        <CreateAlbumModal
          baseUrl={BASE_URL}
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleAlbumCreated}
        />
      )}
    </div>
  );
}
