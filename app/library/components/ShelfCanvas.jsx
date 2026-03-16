"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  N8AO,
} from "@react-three/postprocessing";
import ShelfScene from "./ShelfScene";
import { OrbitControls, useHelper } from "@react-three/drei";

const CREAM = "#f5ede0";
const DARK_WALL = "#1a1510";
// Canvas 내부에서만 호출 가능한 훅(useHelper)을 사용하는 서브컴포넌트
// castShadow=true인 경우에만 고품질 shadowMap 설정 적용
function DirLightWithHelper({
  position,
  intensity,
  color,
  helperSize = 0,
  castShadow = false,
  blurSamples = 25,
}) {
  const lightRef = useRef();
  // useHelper(lightRef, THREE.DirectionalLightHelper, helperSize);
  return (
    <directionalLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      color={color}
      castShadow={castShadow}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={5}
      shadow-camera-bottom={-4}
      shadow-bias={0}
      shadow-blurSamples={blurSamples}
    />
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
        toneMappingExposure: 0.75,
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
    >
      {/* 라이팅 설정 */}
      <ambientLight intensity={2} color="#957A57" />
      {/* 방향광 (shadow 없음 — N8AO가 contact shadow 처리) */}
      <DirLightWithHelper
        position={[0, 0.1, 0.2]}
        intensity={0.4}
        color="#D8BB95"
        helperSize={0}
      />
      <DirLightWithHelper
        position={[0, 2.4, 0.5]}
        intensity={1}
        color="#D8BB95"
        helperSize={0}
      />

      <DirLightWithHelper
        position={[0.05, 0, -0.09]}
        intensity={1.5}
        color={CREAM}
        helperSize={0}
      />
      <DirLightWithHelper
        position={[-0.05, 0, -0.09]}
        intensity={1.5}
        color={CREAM}
        helperSize={0}
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
        />
      </Suspense>

      {/* Post-processing: N8AO + Bloom + Vignette */}
      <EffectComposer>
        <N8AO
          aoRadius={1}
          intensity={3}
          aoSamples={10}
          denoiseSamples={10}
          denoiseRadius={20}
          color="#34221D"
        />
        <Bloom
          intensity={2}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.1}
          radius={0.85}
        />
        {/* <Vignette offset={0.1} darkness={0.1} eskil={false} /> */}
      </EffectComposer>
      {/* <OrbitControls /> */}
    </Canvas>
  );
}
