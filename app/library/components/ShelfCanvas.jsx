"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";

import ShelfScene from "./ShelfScene";
import useShelfGestures from "../hooks/useShelfGestures";

// Keeps the demand-mode render loop alive by requesting the next frame
// from within useFrame (single RAF chain, no separate loop).
function RenderLoop() {
  const { invalidate } = useThree();
  useFrame(() => {
    invalidate();
  });
  return null;
}

// Canvas 내부 서브컴포넌트: 카메라 X + Y + Z를 부드럽게 반영
function CameraController({ xOffsetRef, yOffsetRef, zRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const targetX = xOffsetRef.current;
    const targetY = 1.5 + yOffsetRef.current;
    const targetZ = zRef.current;
    const dx = targetX - camera.position.x;
    const dy = targetY - camera.position.y;
    const dz = targetZ - camera.position.z;
    if (
      Math.abs(dx) > 0.0001 ||
      Math.abs(dy) > 0.0001 ||
      Math.abs(dz) > 0.0001
    ) {
      camera.position.x += dx * 0.12;
      camera.position.y += dy * 0.12;
      camera.position.z += dz * 0.1;
      camera.lookAt(camera.position.x, camera.position.y, 0);
    }
  });
  return null;
}

function DirLightWithHelper({ position, intensity, color }) {
  return (
    <directionalLight position={position} intensity={intensity} color={color} />
  );
}

export default function ShelfCanvas({
  albums,
  selectedAlbum,
  isFlipped,
  onAlbumClick,
  onFlipAlbum,
  onCloseAlbum,
  cameraControlRef,
  onHoverLabelPos,
}) {
  const cameraRef = useRef(null);
  const wrapperRef = useRef(null);

  // 뷰포트 크기 추적 (가로 + 세로)
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [windowHeight, setWindowHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  useEffect(() => {
    let rafId = null;
    const handler = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
        rafId = null;
      });
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // COLS/ROWS: 스크롤 범위 계산용 (ShelfScene과 동일 로직)
  const COLS = useMemo(() => {
    if (windowWidth >= 1280) return 5;
    if (windowWidth >= 1024) return 4;
    if (windowWidth >= 768) return 3;
    return 2;
  }, [windowWidth]);

  const ROWS = useMemo(() => {
    return Math.max(2, Math.ceil(albums.length / COLS));
  }, [albums.length, COLS]);

  // baseZ: 뷰포트 종횡비에 따라 카메라 Z를 자동 조정하여 앨범이 잘리지 않게 함
  const FOV_RAD = (52 * Math.PI) / 180;
  const TAN_HALF_FOV = Math.tan(FOV_RAD / 2);

  const baseZ = useMemo(() => {
    const aspect = windowWidth / windowHeight;
    const albumSize = windowWidth < 768 ? 0.65 : 0.8;
    const albumGap = windowWidth < 768 ? 0.08 : 0.15;
    const totalWidth = COLS * albumSize + (COLS - 1) * albumGap;
    const margin = 0.5;
    const requiredHalfWidth = totalWidth / 2 + margin;
    const requiredZ = requiredHalfWidth / (aspect * TAN_HALF_FOV);
    return Math.max(3.8, Math.min(requiredZ, 6.5));
  }, [windowWidth, windowHeight, COLS]);

  const baseZRef = useRef(baseZ);

  // ─── 세로 스크롤 한계 (비대칭) ───
  // 카메라가 위로 너무 올라가면 뒷벽(brown 패널) 위쪽 크림색 여백이 프러스텀에
  // 노출된다. 벽 상/하단 모서리를 프러스텀 상/하단이 넘지 않도록 오프셋 범위를
  // 기하학적으로 계산한다. (ShelfScene/Niche의 좌표 규칙과 일치시켜야 함)
  const scrollBounds = useMemo(() => {
    const HALF_FOV_TAN = Math.tan(((52 / 2) * Math.PI) / 180); // 세로 FOV 52°
    const H = baseZ * HALF_FOV_TAN; // z=0 평면에서 보이는 화면 절반 높이
    const sceneOffset = -0.2 - (ROWS - 2) * 0.4; // ShelfScene과 동일
    const nicheOriginY = sceneOffset + 1.5; // Niche가 group(sceneOffset) 안 [0,1.5]에 배치
    const straightTopY = ROWS * 1.4 - 0.8; // Niche.jsx와 동일
    const brownTopWorld = nicheOriginY + straightTopY + 0.3; // 뒷벽 상단 모서리
    const brownBottomWorld = nicheOriginY - 2.0 - 0.3; // 뒷벽 하단 모서리
    const MARGIN = 0.05; // 모서리에 딱 붙지 않도록 약간의 안쪽 여유
    let max = brownTopWorld - H - 3 - MARGIN; // 카메라 기준 y=1.5
    let min = brownBottomWorld + H - 1.5 + MARGIN;
    if (max < min) {
      // 프러스텀이 벽보다 크면 스크롤 없이 벽 중앙에 고정
      const center = (brownTopWorld + brownBottomWorld) / 2 - 1.5;
      max = center;
      min = center;
    }
    return { min, max };
  }, [ROWS, baseZ]);

  // Camera refs — 세로 오프셋은 최상단(scrollBounds.max)에서 시작해
  // 행이 많아도 첫 화면에 최신 앨범(맨 윗줄)이 보이게 한다
  const cameraXOffsetRef = useRef(0);
  const cameraYOffsetRef = useRef(scrollBounds.max);
  const cameraZRef = useRef(baseZ);
  const scrollMinRef = useRef(scrollBounds.min);
  const scrollMaxRef = useRef(scrollBounds.max);

  // baseZ 변경 시 카메라 Z를 동기화
  useEffect(() => {
    baseZRef.current = baseZ;
    cameraZRef.current = baseZ;
  }, [baseZ]);

  // 스크롤 한계 갱신 — 행 수가 바뀌면(로드/필터) 최상단으로 스냅해 최신
  // 앨범이 먼저 보이게 하고, 그 외(리사이즈 등)에는 현재 오프셋만 재클램프
  const prevRowsRef = useRef(ROWS);
  useEffect(() => {
    scrollMinRef.current = scrollBounds.min;
    scrollMaxRef.current = scrollBounds.max;
    if (prevRowsRef.current !== ROWS) {
      prevRowsRef.current = ROWS;
      cameraYOffsetRef.current = scrollBounds.max;
    } else {
      cameraYOffsetRef.current = Math.max(
        scrollBounds.min,
        Math.min(scrollBounds.max, cameraYOffsetRef.current),
      );
    }
  }, [scrollBounds, ROWS]);

  // 제스처 훅 (touch + wheel은 내부 addEventListener, pointer만 반환)
  const { onPointerDown, onPointerMove, onPointerUp, isScrollingRef } =
    useShelfGestures({
      wrapperRef,
      scrollMinRef,
      scrollMaxRef,
      cameraYOffsetRef,
      cameraXOffsetRef,
      cameraZRef,
      baseZRef,
      selectedAlbum,
    });

  // 앨범 선택 해제 시 X 패닝 리셋
  useEffect(() => {
    if (selectedAlbum === null) {
      cameraXOffsetRef.current = 0;
    }
  }, [selectedAlbum]);

  // 카메라 제어 메서드를 부모에 노출
  useEffect(() => {
    if (cameraControlRef) {
      cameraControlRef.current = {
        reset: () => {
          cameraXOffsetRef.current = 0;
          cameraYOffsetRef.current = Math.max(
            scrollMinRef.current,
            Math.min(scrollMaxRef.current, 0),
          );
          cameraZRef.current = baseZRef.current;
        },
        zoomIn: () => {
          cameraZRef.current = Math.max(
            baseZRef.current - 0.6,
            cameraZRef.current - 0.5,
          );
        },
        zoomOut: () => {
          cameraZRef.current = Math.min(
            baseZRef.current + 0.6,
            cameraZRef.current + 0.5,
          );
        },
      };
    }
  }, [cameraControlRef]);

  // ESC 키로 앨범 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedAlbum) {
        onCloseAlbum?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAlbum, onCloseAlbum]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        shadows={false}
        camera={{
          position: [0, 1.5, 3.8],
          fov: 52,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        onCreated={({ camera, gl }) => {
          cameraRef.current = camera;
          camera.lookAt(0, 1.5, 0);
          // 스크롤/줌 시 니체 배경을 벗어난 빈 영역이 회색으로 보이는 것을 방지.
          // 페이지 배경(#1a1510)과 동일하게 클리어색을 지정하여 이음매를 없앤다.
          gl.setClearColor("#1a1510", 1);
        }}
        frameloop="demand"
      >
        <RenderLoop />
        {/* 라이팅: 따뜻한 앰버/골드 무드 */}
        <ambientLight intensity={2} color="#957A57" />
        <DirLightWithHelper
          position={[0, 0.1, 0.2]}
          intensity={2}
          color="#D8BB95"
        />
        <DirLightWithHelper
          position={[0, 2.4, 0.2]}
          intensity={2}
          color="#D8BB95"
        />
        <DirLightWithHelper
          position={[0.05, 0, 0.09]}
          intensity={0.8}
          color="#CB9B65"
        />
        <DirLightWithHelper
          position={[-0.05, 0, 0.09]}
          intensity={0.8}
          color="#CB9B65"
        />

        {/* 메인 씬 */}
        <Suspense fallback={null}>
          <ShelfScene
            albums={albums}
            selectedAlbum={selectedAlbum}
            isFlipped={isFlipped}
            onAlbumClick={onAlbumClick}
            onFlipAlbum={onFlipAlbum}
            onCloseAlbum={onCloseAlbum}
            onHoverLabelPos={onHoverLabelPos}
            windowWidth={windowWidth}
            baseZ={baseZ}
            isScrollingRef={isScrollingRef}
          />
        </Suspense>

        <CameraController
          xOffsetRef={cameraXOffsetRef}
          yOffsetRef={cameraYOffsetRef}
          zRef={cameraZRef}
        />
      </Canvas>
    </div>
  );
}
