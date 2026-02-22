"use client";

import * as THREE from "three";
import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import Wall from "./Wall";
import Shelf from "./Shelf";
import AlbumCover from "./AlbumCover";
import BlurLayer from "./BlurLayer";

// 레이아웃 상수
const SHELF_CONFIG = {
  width: 5, // 선반 너비
  depth: 0.4, // 선반 깊이
  thickness: 0.08, // 선반 두께
  spacing: 1.2, // 선반 간 수직 간격
  wallOffset: 0.02, // 벽과의 거리
};

const ALBUM_CONFIG = {
  size: 0.8, // 앨범 정사각형 크기 (N x N)
  thickness: 0.02, // 앨범 두께 (m - 얇은 판)
  gap: 0.15, // 앨범 간 간격
  tiltAngle: -0.15, // 벽에 기대는 각도 (라디안)
};

const ROWS = 2; // 2행
const COLS = 5; // 5열

export default function ShelfScene({
  albums,
  selectedAlbum,
  isFlipped,
  onAlbumClick,
  onFlipAlbum,
  onCloseAlbum,
}) {
  // 앨범 위치 계산
  const albumPositions = useMemo(() => {
    const positions = [];
    const totalWidth = COLS * ALBUM_CONFIG.size + (COLS - 1) * ALBUM_CONFIG.gap;
    const startX = -totalWidth / 2 + ALBUM_CONFIG.size / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        const x = startX + col * (ALBUM_CONFIG.size + ALBUM_CONFIG.gap);
        // 각 선반 위에 앨범 배치 (선반 두께 + 앨범 바닥)
        const y =
          SHELF_CONFIG.spacing * (ROWS - 1 - row) +
          SHELF_CONFIG.thickness / 2 +
          ALBUM_CONFIG.size / 2;
        // 벽 앞쪽에 배치 (벽에 기대어 있음)
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
  }, []);

  // 선반 위치 계산 (2단)
  const shelfPositions = useMemo(() => {
    return Array.from({ length: ROWS }, (_, row) => ({
      y: SHELF_CONFIG.spacing * (ROWS - 1 - row) - 0.03,
      z: -SHELF_CONFIG.wallOffset,
    }));
  }, []);

  // 호버된 앨범 인덱스
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <group onPointerMissed={() => onCloseAlbum?.()}>
      {/* 바닥 */}
      {/* <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#efefef" roughness={0.8} />
      </mesh> */}

      {/* 뒷벽 */}
      <Wall
        position={[0, 1.5, -SHELF_CONFIG.depth / 2 - SHELF_CONFIG.wallOffset]}
        size={[100, 100, 0.1]}
      />

      {/* 선반들 (2단) */}
      {shelfPositions.map((pos, i) => (
        <Shelf
          key={`shelf-${i}`}
          position={[0, pos.y, pos.z]}
          width={SHELF_CONFIG.width}
          depth={SHELF_CONFIG.depth}
          thickness={SHELF_CONFIG.thickness}
        />
      ))}

      {/* 배경 블러 레이어: 앨범 선택 시 선반/다른 앨범을 흐리게 */}
      <BlurLayer isActive={!!selectedAlbum} blurStrength={3} />

      {/* 앨범 커버들 (albums 개수만큼) */}
      {albumPositions
        .slice(0, albums.length)
        .map(({ index, position, row, col }) => {
          const album = albums[index] || {};
          const isSelectedAlbum = selectedAlbum?.index === index;

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
              onClick={() => {
                if (isSelectedAlbum) {
                  onFlipAlbum?.();
                } else {
                  onAlbumClick?.(index, album);
                }
              }}
              onHoverChange={(hovered) => {
                setHoveredIndex(hovered ? index : null);
              }}
            />
          );
        })}

      {/* 호버 툴팁 (포커싱 없을 때만) */}
      {!selectedAlbum &&
        hoveredIndex != null &&
        albumPositions[hoveredIndex] && (
          <Html
            position={[
              albumPositions[hoveredIndex].position[0] - ALBUM_CONFIG.size / 2,
              albumPositions[hoveredIndex].position[1] +
                ALBUM_CONFIG.size / 2 +
                0.08,
              albumPositions[hoveredIndex].position[2] + 0.5,
            ]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                opacity: 1,
                transition: "opacity 0.2s ease",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                {albums[hoveredIndex]?.title}
              </span>
              {albums[hoveredIndex]?.subtitle && (
                <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {albums[hoveredIndex].subtitle}
                </span>
              )}
            </div>
          </Html>
        )}
    </group>
  );
}
