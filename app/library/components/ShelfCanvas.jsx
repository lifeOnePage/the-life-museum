"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useImperativeHandle, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import ShelfScene from "./ShelfScene";

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
    <Canvas
      shadows
      camera={{
        position: [0, 1.4, 4.2],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
      onCreated={({ camera }) => {
        cameraRef.current = camera;
        // 카메라 방향벡터를 (0,0,-1)로 고정 — 정면을 바라봄
        camera.lookAt(0, 1.5, -100);
      }}
    >
      {/* 라이팅 설정 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[0, 1, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.005}
      />
      <pointLight position={[-3, 3, 2]} intensity={1.5} />
      <pointLight position={[3, 2, -2]} intensity={1.3} color="#ffeedd" />

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
        />
      </Suspense>

      {/* 카메라 컨트롤 */}
      {/* <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0.5, 0]}
      /> */}
    </Canvas>
  );
}
