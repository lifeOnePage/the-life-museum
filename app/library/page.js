"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import ShelfCanvas from "./components/ShelfCanvas";
import InfoBlock from "./components/InfoBlock";
import CreateAlbumModal from "./components/CreateAlbumModal";
import Header from "../components/Header";
import generateBackCoverDataUrl from "./utils/generateBackCover";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

export default function MyShelfPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // API에서 받아온 전체 앨범 목록
  const [albums, setAlbums] = useState([]);

  // 선택된 앨범 상태 (DOM과 3D 캔버스 간 상호작용)
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // 앨범 플립 상태 (뒷면 표시 여부)
  const [isFlipped, setIsFlipped] = useState(false);

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 카메라 제어를 위한 ref
  const cameraControlRef = useRef(null);

  // API fetch
  useEffect(() => {
    fetch(`${BASE_URL}/library`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setAlbums(
            json.data.map((item) => {
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
                frontImage: item.coverImage?.url ?? null,
                backImage,
                edgeColor: bgColor,
              };
            }),
          );
        }
      })
      .catch((err) => console.error("Failed to fetch library:", err));
  }, []);

  // 앨범 클릭 핸들러 (3D에서 호출됨)
  const handleAlbumClick = useCallback(
    (albumIndex, albumData) => {
      setSelectedAlbum({ index: albumIndex, data: albumData });
      setIsFlipped(false);

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
            prev.map((a, i) =>
              a.id === albumData.id
                ? { ...a, backImage: backCoverUrl, edgeColor: bgColor }
                : a,
            ),
          );
        })
        .catch((err) => console.error("Failed to fetch record detail:", err));
    },
    [],
  );

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

  // 앨범 생성 완료 핸들러
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
      },
    ]);
  }, []);

  // Canvas에는 최대 10개만 전달
  const visibleAlbums = albums.slice(0, 10);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* 3D 캔버스 */}
      <ShelfCanvas
        albums={visibleAlbums}
        selectedAlbum={selectedAlbum}
        isFlipped={isFlipped}
        onAlbumClick={handleAlbumClick}
        onFlipAlbum={handleFlipAlbum}
        onCloseAlbum={handleCloseAlbum}
        cameraControlRef={cameraControlRef}
      />

      {/* DOM 오버레이 UI */}
      <div className="pointer-events-none absolute inset-0">
        <InfoBlock
          user={user}
          onClickCreate={() => setShowCreateModal(true)}
          onCloseAlbum={selectedAlbum ? handleCloseAlbum : undefined}
        />
        {/* 상단 헤더 */}
        <div className="pointer-events-auto absolute top-0 right-0 left-0 flex items-center justify-between p-4">
          {/* 좌상단: 앨범 선택 시 X 버튼, 아니면 타이틀 */}
          {/* {selectedAlbum ? (
            <button
              onClick={handleCloseAlbum}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-black backdrop-blur-sm transition hover:bg-white/20"
              title="Close album"
            >
              ✕
            </button>
          ) : (
            <h1 className="text-xl font-bold text-black"></h1>
          )} */}

          {/* 우상단: 카메라 컨트롤 (앨범 미선택 시에만 표시) */}
          {/* {!selectedAlbum && (
            <div className="flex gap-2">
              <button
                onClick={handleZoomIn}
                className="rounded-lg bg-white/10 px-3 py-2 text-black backdrop-blur-sm transition hover:bg-white/20"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="rounded-lg bg-white/10 px-3 py-2 text-black backdrop-blur-sm transition hover:bg-white/20"
              >
                −
              </button>
              <button
                onClick={handleResetCamera}
                className="rounded-lg bg-white/10 px-3 py-2 text-black backdrop-blur-sm transition hover:bg-white/20"
              >
                Reset
              </button>
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

        {/* 선택된 앨범: 아래에 버튼 나란히 */}
        {selectedAlbum && (
          <div className="pointer-events-auto absolute bottom-[15vh] left-1/2 flex -translate-x-1/2 translate-y-full gap-3">
            <button
              onClick={() => {
                if (selectedAlbum.data?.id) {
                  router.push(`library/edit/${selectedAlbum.data.id}`);
                }
              }}
              className="rounded-full bg-black/50 px-6 py-2 font-medium text-white transition hover:bg-white"
            >
              편집하기
            </button>
            <button
              onClick={() => {
                if (selectedAlbum.data?.id) {
                  router.push(`/walk/${selectedAlbum.data.id}`);
                }
              }}
              className="rounded-full bg-black/50 px-6 py-2 font-medium text-white transition hover:bg-white"
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
