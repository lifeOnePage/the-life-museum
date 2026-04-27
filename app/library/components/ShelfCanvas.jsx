"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";

import ShelfScene from "./ShelfScene";
// import { OrbitControls, useHelper } from "@react-three/drei";

function FPSLimiter({ fps }) {
  const { invalidate } = useThree();

  useEffect(() => {
    let id;
    const interval = 1000 / fps;
    const loop = () => {
      invalidate();
      id = setTimeout(loop, interval);
    };
    loop();
    return () => clearTimeout(id);
  }, [fps, invalidate]);

  return null;
}

// Canvas 내부 서브컴포넌트: 드래그 yOffset을 카메라 Y에 부드럽게 반영
function CameraYController({ yOffsetRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const target = 1.5 + yOffsetRef.current;
    camera.position.y += (target - camera.position.y) * 0.12;
    camera.lookAt(0, camera.position.y, 0);
  });
  return null;
}

// Canvas 내부에서만 호출 가능한 훅(useHelper)을 사용하는 서브컴포넌트
// castShadow=true인 경우에만 고품질 shadowMap 설정 적용
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
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // 모바일 세로 드래그 스크롤
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    let rafId = null;
    const handler = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
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
    if (windowWidth >= 768) return 2;
    return Math.min(5, Math.max(2, Math.ceil(albums.length / COLS)));
  }, [windowWidth, albums.length, COLS]);

  // 드래그 상태 (ref — setState 없이 처리)
  const dragRef = useRef({ dragging: false, startY: 0, startOffset: 0 });
  const cameraYOffsetRef = useRef(0);

  const handlePointerDown = (e) => {
    dragRef.current = {
      dragging: true,
      startY: e.clientY,
      startOffset: cameraYOffsetRef.current,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientY - dragRef.current.startY;
    // delta > 0 (드래그 아래) → 카메라 위로 → 위쪽 앨범 노출 (자연스러운 스크롤)
    const newOffset = dragRef.current.startOffset + delta * 0.003;
    // ROWS=2 데스크탑도 ±0.7 허용, 더 많은 행일수록 범위 확장
    const scrollRange = (ROWS - 1) * 0.7;
    cameraYOffsetRef.current = Math.max(
      -scrollRange,
      Math.min(scrollRange, newOffset),
    );
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  // 마우스 휠 스크롤 — 드래그 방향과 동일 (위로 스크롤 → 카메라 아래, 아래로 스크롤 → 카메라 위)
  const handleWheel = (e) => {
    const scrollRange = (ROWS - 1) * 0.7;
    const newOffset = cameraYOffsetRef.current + e.deltaY * 0.001;
    cameraYOffsetRef.current = Math.max(
      -scrollRange,
      Math.min(scrollRange, newOffset),
    );
  };

  // 카메라 제어 메서드를 부모에 노출
  useEffect(() => {
    if (cameraControlRef) {
      cameraControlRef.current = {
        reset: () => {
          if (controlsRef.current) {
            controlsRef.current.reset();
          }
        },
        zoomIn: () => {
          if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, 1);
            controlsRef.current.update();
          }
        },
        zoomOut: () => {
          if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, -1);
            controlsRef.current.update();
          }
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
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
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
        onCreated={({ camera }) => {
          cameraRef.current = camera;
          // 하이앵글: 선반 중심을 내려다봄
          camera.lookAt(0, 1.5, 0);
        }}
        frameloop="demand"
      >
        <FPSLimiter fps={30} />
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
          />
        </Suspense>

        {/* 모바일 세로 드래그 스크롤: 카메라 Y 오프셋 부드럽게 반영 */}
        <CameraYController yOffsetRef={cameraYOffsetRef} />

        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}
