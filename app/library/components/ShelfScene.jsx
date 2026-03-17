"use client";

import * as THREE from "three";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Niche from "./Niche";
import Shelf from "./Shelf";
import AlbumCover from "./AlbumCover";
import { getMediaType } from "../utils/mediaType";
// import BlurLayer from "./BlurLayer";

// 레이아웃 상수
const SHELF_CONFIG = {
  width: 5, // 선반 너비
  depth: 0.4, // 선반 깊이
  thickness: 0.08, // 선반 두께
  spacing: 1.4, // 선반 간 수직 간격
  wallOffset: 0.02, // 벽과의 거리
};

const ALBUM_CONFIG = {
  size: 0.8, // 앨범 정사각형 크기 (N x N)
  thickness: 0.02, // 앨범 두께 (m - 얇은 판)
  gap: 0.15, // 앨범 간 간격
  tiltAngle: -0.15, // 벽에 기대는 각도 (라디안)
};

export default function ShelfScene({
  albums,
  selectedAlbum,
  isFlipped,
  onAlbumClick,
  onFlipAlbum,
  onCloseAlbum,
  onHoverLabelPos,
}) {
  const { camera, gl } = useThree();

  // 반응형 COLS
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const COLS = useMemo(() => {
    if (windowWidth >= 1280) return 5;
    if (windowWidth >= 1024) return 4;
    if (windowWidth >= 768) return 3;
    return 2;
  }, [windowWidth]);

  // ROWS는 앨범 수와 무관하게 고정 — 필터 변경 시 선반 레이아웃 유지
  const ROWS = 2;

  // 씬 y-offset: 헤더/필터 UI와 겹침 방지
  // ROWS=1: +0.2, ROWS=2: -0.2, ROWS=3: -0.6
  const sceneOffset = -0.2 - (ROWS - 2) * 0.4;

  // 장식용 최상단 선반 y (ROWS 연동)
  const DECORATIVE_SHELF_Y = SHELF_CONFIG.spacing * ROWS - 0.03;

  // 앨범 위치 계산
  const albumPositions = useMemo(() => {
    const positions = [];
    const totalWidth = COLS * ALBUM_CONFIG.size + (COLS - 1) * ALBUM_CONFIG.gap;
    const startX = -totalWidth / 2 + ALBUM_CONFIG.size / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        const x = startX + col * (ALBUM_CONFIG.size + ALBUM_CONFIG.gap);
        const y =
          SHELF_CONFIG.spacing * (ROWS - 1 - row) +
          SHELF_CONFIG.thickness / 2 +
          ALBUM_CONFIG.size / 2;
        const z = SHELF_CONFIG.depth / 2 - ALBUM_CONFIG.thickness;

        positions.push({
          index,
          position: [x, y, z],
          row,
          col,
        });
      }
    }
    return positions;
  }, [COLS, ROWS]);

  // 선반 위치 계산 (ROWS단)
  const shelfPositions = useMemo(() => {
    return Array.from({ length: ROWS }, (_, row) => ({
      y: SHELF_CONFIG.spacing * (ROWS - 1 - row) - 0.03,
      z: -SHELF_CONFIG.wallOffset,
    }));
  }, [ROWS]);

  // 호버된 앨범 인덱스
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 랜덤 재생 대상 인덱스 (hover/select 해제 시 갱신)
  const randomActiveIndexRef = useRef(null);

  useEffect(() => {
    const isInteracting = hoveredIndex !== null || selectedAlbum !== null;

    if (!isInteracting) {
      const mediaIndices = albumPositions
        .slice(0, albums.length)
        .filter(({ index }) => {
          const t = getMediaType(albums[index]?.frontImage);
          return t === "video" || t === "gif";
        })
        .map(({ index }) => index);

      if (mediaIndices.length > 0) {
        randomActiveIndexRef.current =
          mediaIndices[Math.floor(Math.random() * mediaIndices.length)];
      } else {
        randomActiveIndexRef.current = null;
      }
    }
  }, [hoveredIndex, selectedAlbum, albums, albumPositions]);

  // 앨범 top-left 모서리를 화면 좌표(px)로 투영
  const projectAlbumTopLeft = useCallback(
    (position) => {
      const vec = new THREE.Vector3(
        position[0] - ALBUM_CONFIG.size / 2,
        position[1] - ALBUM_CONFIG.size / 2 - 0.15,
        position[2],
      );
      vec.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((vec.x + 1) / 2) * rect.width + rect.left;
      const y = ((-vec.y + 1) / 2) * rect.height + rect.top;
      return { x, y };
    },
    [camera, gl],
  );

  // 선택된 앨범의 Three.js Group ref
  const selectedGroupRef = useRef(null);
  const handleGroupRef = useCallback((ref) => {
    selectedGroupRef.current = ref;
  }, []);

  const isInteracting = hoveredIndex !== null || selectedAlbum !== null;

  return (
    <group
      position={[0, sceneOffset, 0]}
      onPointerMissed={() => onCloseAlbum?.()}
    >
      {/* 아치형 틈새 구조 (뒷벽 대체) */}
      <Niche
        position={[0, 1.5, -SHELF_CONFIG.depth / 2 - SHELF_CONFIG.wallOffset]}
        rows={ROWS}
      />

      {/* 앨범 있는 선반들 */}
      {shelfPositions.map((pos, i) => (
        <Shelf
          key={`shelf-${i}`}
          position={[0, pos.y, pos.z]}
          width={SHELF_CONFIG.width}
          depth={SHELF_CONFIG.depth}
          thickness={SHELF_CONFIG.thickness}
          shelfOffset={SHELF_CONFIG.spacing}
        />
      ))}

      {/* 장식용 최상단 선반 (앨범 없음, 등간격) */}
      <Shelf
        position={[0, DECORATIVE_SHELF_Y, -SHELF_CONFIG.wallOffset]}
        width={SHELF_CONFIG.width}
        depth={SHELF_CONFIG.depth}
        thickness={SHELF_CONFIG.thickness}
      />

      {/* 배경 블러 레이어: 비활성화 */}
      {/* <BlurLayer
        isActive={!!selectedAlbum}
        blurStrength={3}
        hiddenDuringBlur={selectedGroupRef}
      /> */}

      {/* 앨범 커버들 (albums 개수만큼) */}
      {albumPositions
        .slice(0, albums.length)
        .map(({ index, position, row, col }) => {
          const album = albums[index] || {};
          const isSelectedAlbum = selectedAlbum?.index === index;

          // isPlayable 계산: 인터랙션 중이면 호버/선택 앨범만, 아니면 랜덤 하나
          const isPlayable = isInteracting
            ? index === hoveredIndex || isSelectedAlbum
            : index === randomActiveIndexRef.current;

          return (
            <AlbumCover
              key={`album-${index}`}
              index={index}
              position={position}
              size={ALBUM_CONFIG.size}
              thickness={ALBUM_CONFIG.thickness}
              tiltAngle={ALBUM_CONFIG.tiltAngle}
              frontImage={album.frontImage}
              backImage={album.backImage}
              edgeColor={album.edgeColor}
              isSelected={isSelectedAlbum}
              isFlipped={isSelectedAlbum && isFlipped}
              isPlayable={isPlayable}
              onClick={() => {
                if (isSelectedAlbum) {
                  onFlipAlbum?.();
                } else {
                  onAlbumClick?.(index, album);
                }
              }}
              onGroupRef={handleGroupRef}
              onHoverChange={(hovered) => {
                setHoveredIndex(hovered ? index : null);
                if (hovered) {
                  const screenPos = projectAlbumTopLeft(position);
                  onHoverLabelPos?.({ album, ...screenPos });
                } else {
                  onHoverLabelPos?.(null);
                }
              }}
            />
          );
        })}

      {/* 호버 툴팁은 page.js에서 DOM으로 렌더링 (onHoverLabelPos 콜백) */}
    </group>
  );
}
