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

// Canvas 내부 서브컴포넌트: 카메라 Y + Z를 부드럽게 반영
function CameraController({ yOffsetRef, zRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const targetY = 1.5 + yOffsetRef.current;
    const targetZ = zRef.current;
    const dy = targetY - camera.position.y;
    const dz = targetZ - camera.position.z;
    if (Math.abs(dy) > 0.0001 || Math.abs(dz) > 0.0001) {
      camera.position.y += dy * 0.12;
      camera.position.z += dz * 0.1;
      camera.lookAt(0, camera.position.y, 0);
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

  // Camera refs
  const cameraYOffsetRef = useRef(0);
  const cameraZRef = useRef(3.8);
  const scrollRangeRef = useRef((ROWS - 1) * 0.7);

  // scrollRange 갱신
  useEffect(() => {
    scrollRangeRef.current = (ROWS - 1) * 0.7;
  }, [ROWS]);

  // 제스처 훅 (touch + wheel은 내부 addEventListener, pointer만 반환)
  const { onPointerDown, onPointerMove, onPointerUp, isScrollingRef } = useShelfGestures({
      wrapperRef,
      scrollRangeRef,
      cameraYOffsetRef,
      cameraZRef,
      selectedAlbum,
    });

  // 카메라 제어 메서드를 부모에 노출
  useEffect(() => {
    if (cameraControlRef) {
      cameraControlRef.current = {
        reset: () => {
          cameraYOffsetRef.current = 0;
          cameraZRef.current = 3.8;
        },
        zoomIn: () => {
          cameraZRef.current = Math.max(2.5, cameraZRef.current - 0.5);
        },
        zoomOut: () => {
          cameraZRef.current = Math.min(5.5, cameraZRef.current + 0.5);
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
        onCreated={({ camera }) => {
          cameraRef.current = camera;
          camera.lookAt(0, 1.5, 0);
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
            isScrollingRef={isScrollingRef}
          />
        </Suspense>

        <CameraController yOffsetRef={cameraYOffsetRef} zRef={cameraZRef} />
      </Canvas>
    </div>
  );
}
