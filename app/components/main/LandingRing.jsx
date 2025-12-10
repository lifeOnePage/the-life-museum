// app/components/main/LandingRing.jsx
"use client";

import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";

// 고정 파라미터
const RADIUS = 5;
const PLANE_W = 1.2;
const PLANE_H = 0.9;

// 유틸 함수
function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
}

function lerpExp(prev, next, rate) {
  return prev + (next - prev) * rate;
}

// 이미지 머티리얼
function ImageMat({ url }) {
  const tex = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
  }, [tex, url]);

  return (
    <meshBasicMaterial
      map={tex}
      color={0xffffff}
      toneMapped={false}
      transparent
      opacity={0.85}
      side={THREE.DoubleSide}
    />
  );
}

// 플레인 머티리얼 (반투명 흰색)
function PlainMat() {
  return (
    <meshBasicMaterial
      color={0xffffff}
      transparent
      opacity={0.15}
      side={THREE.DoubleSide}
    />
  );
}

// 단일 플레인
function RingPlane({ angle, url, usePlain }) {
  const meshRef = useRef();
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y = -angle;
    }
  }, [angle, x, z]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      {usePlain ? <PlainMat /> : url ? <ImageMat url={url} /> : <PlainMat />}
    </mesh>
  );
}

// 링 그룹
function RingGroup({ slots, rotationOffset, usePlain }) {
  const groupRef = useRef();
  const targetRotRef = useRef(rotationOffset);
  const currentRotRef = useRef(rotationOffset);

  useFrame(() => {
    if (!groupRef.current) return;

    const target = targetRotRef.current;
    const current = currentRotRef.current;
    const diff = wrapPi(target - current);
    const next = current + lerpExp(0, diff, 0.08);

    currentRotRef.current = next;
    groupRef.current.rotation.y = next;
  });

  useEffect(() => {
    targetRotRef.current = rotationOffset;
  }, [rotationOffset]);

  const planes = useMemo(() => {
    return slots.map((slot, i) => {
      const angle = (i / slots.length) * Math.PI * 2;
      return (
        <RingPlane
          key={i}
          angle={angle}
          url={usePlain ? null : slot.url}
          usePlain={usePlain}
        />
      );
    });
  }, [slots, usePlain]);

  return <group ref={groupRef}>{planes}</group>;
}

// 메인 씬
function Scene({ slots, rotationOffset, usePlain, cameraPos }) {
  return (
    <>
      <RingGroup slots={slots} rotationOffset={rotationOffset} usePlain={usePlain} />
      <ambientLight intensity={0.5} />
    </>
  );
}

// 메인 캔버스
export default function LandingRing({
  imageUrls = [],
  usePlain = false,
  rotationSpeed = 0.0005,
  cameraPosition = { x: -3, y: 3, z: 12 }
}) {
  const rotationRef = useRef(0);
  const [rotation, setRotation] = React.useState(0);

  // 100개 맞추기 (이미지 반복)
  const slots = useMemo(() => {
    if (imageUrls.length === 0) {
      return Array(100).fill({ url: null });
    }

    const result = [];
    for (let i = 0; i < 100; i++) {
      result.push({ url: imageUrls[i % imageUrls.length] });
    }
    return result;
  }, [imageUrls]);

  // 자동 회전
  useEffect(() => {
    const interval = setInterval(() => {
      rotationRef.current += rotationSpeed;
      setRotation(rotationRef.current);
    }, 16);
    return () => clearInterval(interval);
  }, [rotationSpeed]);

  return (
    <Canvas
      camera={{
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        fov: 45,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <Suspense fallback={null}>
        <Scene slots={slots} rotationOffset={rotation} usePlain={usePlain} cameraPos={cameraPosition} />
      </Suspense>
    </Canvas>
  );
}
