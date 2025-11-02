"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";

// ▶︎ 공통 상수 (요구한 사이즈 고정)
const RADIUS = 2.2;
const PLANE_W = 1.1;
const PLANE_H = 1.4;
const CAM_Y = 3;
const CAM_Z = 6;

/** 이미지 머티리얼: useLoader로 안정 로딩 */
function ImageMat({ url }) {
  // 마운트 로그
  // console.log("[ImageMat] mount", url);
  const tex = useLoader(THREE.TextureLoader, url);
  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    // 디버깅
    // console.log("[ImageMat] loaded:", url);
  }, [tex, url]);
  return (
    <meshBasicMaterial
      map={tex}
      toneMapped={false}
      transparent={true}
      opacity={1}
      side={THREE.DoubleSide}
    />
  );
}

/** 비디오 머티리얼: useVideoTexture 사용 */
function VideoMat({ url }) {
  // console.log("[VideoMat] mount", url);
  const vtex = useVideoTexture(url, {
    crossOrigin: "anonymous",
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    preload: "auto",
  });
  useEffect(() => {
    if (!vtex) return;
    vtex.colorSpace = THREE.SRGBColorSpace;
    vtex.needsUpdate = true;
    // console.log("[VideoMat] loaded:", url);
  }, [vtex, url]);
  return (
    <meshBasicMaterial
      map={vtex}
      toneMapped={false}
      transparent={true}
      opacity={1}
      side={THREE.DoubleSide}
    />
  );
}

/** 빈 슬롯(반투명 흰색) */
function EmptyMat({ opacity = 0.28 }) {
  return (
    <meshBasicMaterial
      color="white"
      transparent={true}
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

/** 개별 플레인: 위치/정면보정, 머티리얼은 kind에 따라 분기 */
function MediaPlane({ theta, ringAngleRef, slot }) {
  const meshRef = useRef();
  // console.log(slot);

  // 원형 배치 좌표 (반지름/크기 불변)
  const x = Math.cos(theta) * RADIUS;
  const z = Math.sin(theta) * RADIUS;

  // 그룹 회전을 정확히 상쇄해서 "사용자 정면"으로 보정
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y = -ringAngleRef.current;
  });

  const kind = slot?.type || "empty";
  const url = slot?.url || null;

  return (
    <mesh ref={meshRef} position={[x, 0, z]}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      {/* 종류별로 안전하게 훅 분리 */}
      {kind === "image" && url ? (
        <Suspense fallback={<EmptyMat opacity={0.18} />}>
          <ImageMat url={url} />
        </Suspense>
      ) : kind === "video" && url ? (
        <Suspense fallback={<EmptyMat opacity={0.18} />}>
          <VideoMat url={url} />
        </Suspense>
      ) : (
        <EmptyMat />
      )}
    </mesh>
  );
}

/** 링 전체 */
function RingInner({ slots, leftIndex, snapSpeed = 10, onLeftmostChange }) {
  const N = slots.length;
  const groupRef = useRef();
  const ringAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const step = useMemo(() => (Math.PI * 2) / N, [N]);

  // "가장 왼쪽"이 k번째 슬롯이 되도록 목표 각도 갱신
  useEffect(() => {
    const DIR = -1;           
    targetAngleRef.current = Math.PI - DIR * leftIndex * step;
  }, [leftIndex, step]);

  // 부드러운 스냅 회전 + 좌측 인덱스 계산 콜백
  useFrame((_, dt) => {
    const k = Math.max(1, snapSpeed);
    ringAngleRef.current +=
      (targetAngleRef.current - ringAngleRef.current) * Math.min(1, k * dt);
    if (groupRef.current) groupRef.current.rotation.y = ringAngleRef.current;

    if (onLeftmostChange) {
      const raw = (Math.PI - ringAngleRef.current) / step;
      const idx = ((Math.round(raw) % N) + N) % N;
      onLeftmostChange(idx);
    }
  });

  const baseAngles = useMemo(
    () => Array.from({ length: N }, (_, i) => i * step),
    [N, step],
  );

  return (
    <group ref={groupRef}>
      {baseAngles.map((theta, i) => (
        <MediaPlane
          key={i}
          theta={theta}
          ringAngleRef={ringAngleRef}
          slot={slots[i]}
        />
      ))}
    </group>
  );
}

export default function Ring({
  slots, // [{kind:'image'|'video'|'empty', url}, ...] (len >= 100)
  leftIndex, // 현재 "왼쪽" 인덱스
  onLeftmostChange, // 실시간 좌측 인덱스(스냅) 콜백
  snapSpeed = 10,
}) {
  useEffect(() => {
    const LM = THREE.DefaultLoadingManager;
    const _start = LM.onStart;
    const _load = LM.onLoad;
    const _err = LM.onError;

    LM.onStart = (url, itemsLoaded, itemsTotal) => {
      // console.log("[LM onStart]", { url, itemsLoaded, itemsTotal });
      _start?.(url, itemsLoaded, itemsTotal);
    };
    LM.onLoad = () => {
      // console.log("[LM onLoad] all done");
      _load?.();
    };
    LM.onError = (url) => {
      // console.error("[LM onError]", url);
      _err?.(url);
    };

    return () => {
      LM.onStart = _start;
      LM.onLoad = _load;
      LM.onError = _err;
    };
  }, []);
  return (
    <Canvas
      camera={{ position: [0, CAM_Y, CAM_Z], fov: 50 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.95} />
      <directionalLight position={[6, 10, 6]} intensity={0.7} />
      <Suspense fallback={null}>
        <RingInner
          slots={slots}
          leftIndex={leftIndex}
          onLeftmostChange={onLeftmostChange}
          snapSpeed={snapSpeed}
        />
      </Suspense>
    </Canvas>
  );
}
