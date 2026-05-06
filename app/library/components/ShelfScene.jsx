"use client";

import * as THREE from "three";
import { useMemo, useRef, useCallback, useEffect, useState } from "react";
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
  spacing: 1.2, // 선반 간 수직 간격
  wallOffset: 0.02, // 벽과의 거리
};

const ALBUM_CONFIG = {
  size: 0.8, // 앨범 정사각형 크기 (데스크탑 기본)
  thickness: 0.02, // 앨범 두께 (m - 얇은 판)
  gap: 0.15, // 앨범 간 간격 (데스크탑 기본)
  tiltAngle: -0.15, // 벽에 기대는 각도 (라디안)
};

// 호버 시 앨범이 올라가는 양 (AlbumCover.jsx의 targetY + 0.35 와 일치해야 함)
const HOVER_LIFT = 0.35;

// 선반 하단 스팟라이트 — 따뜻한 앰버 톤으로 선반 너비만큼 조사
function ShelfSpotlight({ y, z, shelfWidth, spacing }) {
  const lightRef = useRef();
  const targetRef = useRef();

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  // 선반 너비를 커버하는 조사각 (반각)
  const angle = useMemo(
    () => Math.atan2(shelfWidth / 2, spacing),
    [shelfWidth, spacing],
  );

  return (
    <>
      <object3D ref={targetRef} position={[0, y - spacing, z]} />
      <spotLight
        ref={lightRef}
        position={[0, y, z]}
        angle={Math.PI / 2}
        penumbra={0}
        intensity={10}
        color="#E8913A"
        distance={spacing * 4}
        decay={2}
      />
    </>
  );
}

export default function ShelfScene({
  albums,
  selectedAlbum,
  isFlipped,
  onAlbumClick,
  onFlipAlbum,
  onCloseAlbum,
  onHoverLabelPos,
  windowWidth = 1280,
  isScrollingRef,
}) {
  const { camera, gl } = useThree();

  const COLS = useMemo(() => {
    if (windowWidth >= 1280) return 5;
    if (windowWidth >= 1024) return 4;
    if (windowWidth >= 768) return 3;
    return 2;
  }, [windowWidth]);

  // 모바일 반응형 앨범 크기/간격 (portrait에서 클리핑 방지)
  const albumSize = useMemo(
    () => (windowWidth < 768 ? 0.65 : ALBUM_CONFIG.size),
    [windowWidth],
  );
  const albumGap = useMemo(
    () => (windowWidth < 768 ? 0.08 : ALBUM_CONFIG.gap),
    [windowWidth],
  );

  // ROWS: 데스크탑은 2 고정, 모바일은 앨범 수에 따라 동적 확장 (최대 5)
  const ROWS = useMemo(() => {
    return Math.min(5, Math.max(2, Math.ceil(albums.length / COLS)));
  }, [windowWidth, albums.length, COLS]);

  // 씬 y-offset: 헤더/필터 UI와 겹침 방지
  // ROWS=1: +0.2, ROWS=2: -0.2, ROWS=3: -0.6
  const sceneOffset = -0.2 - (ROWS - 2) * 0.4;

  // 장식용 최상단 선반 y (ROWS 연동)
  const DECORATIVE_SHELF_Y = SHELF_CONFIG.spacing * ROWS - 0.03;

  // 앨범 위치 계산
  const albumPositions = useMemo(() => {
    const positions = [];
    const totalWidth = COLS * albumSize + (COLS - 1) * albumGap;
    const startX = -totalWidth / 2 + albumSize / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        const x = startX + col * (albumSize + albumGap);
        const y =
          SHELF_CONFIG.spacing * (ROWS - 1 - row) +
          SHELF_CONFIG.thickness / 2 +
          albumSize / 2;
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
  }, [COLS, ROWS, albumSize, albumGap]);

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

  // 호버된 앨범의 하단 중앙을 화면 좌표(px)로 투영
  // 라벨은 이 점 기준으로 translateX(-50%) 하면 앨범 바로 아래 중앙에 정렬됨
  const projVec = useMemo(() => new THREE.Vector3(), []);
  const projectAlbumBottomCenter = useCallback(
    (position) => {
      projVec.set(
        position[0], // 앨범 수평 중앙
        position[1] + sceneOffset + HOVER_LIFT - albumSize / 2 - 0.05, // 로컬→월드 변환: sceneOffset 포함
        position[2],
      );
      projVec.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((projVec.x + 1) / 2) * rect.width + rect.left;
      const y = ((-projVec.y + 1) / 2) * rect.height + rect.top;
      return { x, y };
    },
    [camera, gl, albumSize, sceneOffset, projVec],
  );

  // Stable callback refs — hold latest values without causing re-renders
  const latestRef = useRef({ albums, albumPositions, selectedAlbum, projectAlbumBottomCenter, onHoverLabelPos, onAlbumClick, onFlipAlbum });
  latestRef.current = { albums, albumPositions, selectedAlbum, projectAlbumBottomCenter, onHoverLabelPos, onAlbumClick, onFlipAlbum };

  // Stable onHoverChange: accepts (index, hovered) from AlbumCover
  const handleHoverChange = useCallback((index, hovered) => {
    const { albums: a, albumPositions: ap, projectAlbumBottomCenter: proj, onHoverLabelPos: onPos } = latestRef.current;
    setHoveredIndex(hovered ? index : null);
    if (hovered) {
      const pos = ap[index]?.position;
      if (pos) {
        const screenPos = proj(pos);
        onPos?.({ album: a[index], ...screenPos });
      }
    } else {
      onPos?.(null);
    }
  }, []);

  // Stable onClick: accepts (index) from AlbumCover
  const handleAlbumClick = useCallback((index) => {
    const { albums: a, selectedAlbum: sel, onAlbumClick: onClk, onFlipAlbum: onFlp } = latestRef.current;
    if (sel?.index === index) {
      onFlp?.();
    } else {
      onClk?.(index, a[index] || {});
    }
  }, []);

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

      {/* 선반 하단 스팟라이트 (선반 수에 따라 동적 배치) */}
      {shelfPositions.map((pos, i) => (
        <ShelfSpotlight
          key={`spotlight-${i}`}
          y={pos.y}
          z={pos.z + SHELF_CONFIG.depth * 0.5}
          shelfWidth={SHELF_CONFIG.width}
          spacing={SHELF_CONFIG.spacing}
        />
      ))}
      <ShelfSpotlight
        y={DECORATIVE_SHELF_Y}
        z={-SHELF_CONFIG.wallOffset + SHELF_CONFIG.depth * 0.5}
        shelfWidth={SHELF_CONFIG.width}
        spacing={SHELF_CONFIG.spacing}
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
        .map(({ index, position }) => {
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
              size={albumSize}
              thickness={ALBUM_CONFIG.thickness}
              tiltAngle={ALBUM_CONFIG.tiltAngle}
              frontImage={album.frontImage}
              backImage={album.backImage}
              edgeColor={album.edgeColor}
              isSelected={isSelectedAlbum}
              isFlipped={isSelectedAlbum && isFlipped}
              isPlayable={isPlayable}
              sceneOffset={sceneOffset}
              onClick={handleAlbumClick}
              isScrollingRef={isScrollingRef}
              onGroupRef={handleGroupRef}
              onHoverChange={handleHoverChange}
            />
          );
        })}

      {/* 호버 툴팁은 page.js에서 DOM으로 렌더링 (onHoverLabelPos 콜백) */}
    </group>
  );
}
