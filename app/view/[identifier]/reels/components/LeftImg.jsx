"use client";

import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";

/**
 * LeftImg
 * - props:
 *    kind: "image" | "video" | "empty"
 *    url:  string | null
 *
 * - 왼쪽 슬롯이 바뀔 때마다 이미지/비디오가 살짝 오른쪽에서 미끄러져 들어오며
 *   약간의 스케일/투명도 이징이 들어간다.
 * - 이미지/비디오 비율을 읽어서 plane 크기를 자동 조정한다.
 * - ring을 가리지 않도록 높이 상한(maxHUnits)으로 제한한다.
 */

function ImageMat({ url }) {
  // crossOrigin 허용
  const tex = useLoader(THREE.TextureLoader, url, (loader) => {
    loader.setCrossOrigin("anonymous");
  });
  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
  }, [tex]);
  return <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={1} />;
}

function VideoMat({ url }) {
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
  }, [vtex]);
  return <meshBasicMaterial map={vtex} toneMapped={false} transparent opacity={1} />;
}

function EmptyMat() {
  return <meshBasicMaterial color="#ffffff" transparent opacity={0.24} />;
}

function fitSizeByAspect(aspect, maxW, maxH) {
  // aspect = w / h
  if (!Number.isFinite(aspect) || aspect <= 0) return { w: maxW * 0.9, h: maxH * 0.9 };
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { w, h };
}

function PlaneContent({ kind, url, maxWUnits = 9.0, maxHUnits = 3.6 }) {
  const meshRef = useRef();
  const scaleRef = useRef(0.9);
  const alphaRef = useRef(0.0);
  const slideRef = useRef(0.4); // +x에서 0으로 슬라이드 인
  const prevKeyRef = useRef("");

  // 리소스 로드(비율 추출)
  const isImg = kind === "image" && url;
  const isVid = kind === "video" && url;

  const tex = useMemo(() => ({ current: null }), []);
  let aspect = 16 / 9;

  if (isImg) {
    const t = useLoader(THREE.TextureLoader, url, (loader) => {
      loader.setCrossOrigin("anonymous");
    });
    tex.current = t;
    const iw = t?.image?.naturalWidth ?? t?.image?.width ?? 0;
    const ih = t?.image?.naturalHeight ?? t?.image?.height ?? 0;
    if (iw > 0 && ih > 0) aspect = iw / ih;
  } else if (isVid) {
    // useVideoTexture는 훅이라 여기서 못씀 → 아래 머티리얼에서 처리
    // 비율은 대략적으로 16:9로 두고, 실제 비율은 크게 어긋나지 않도록 상한으로 보정
    aspect = 16 / 9;
  }

  const size = fitSizeByAspect(aspect, maxWUnits, maxHUnits);

  // url이 바뀔 때마다 애니메이션 리셋
  useEffect(() => {
    const key = `${kind}|${url ?? "empty"}`;
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      scaleRef.current = 0.92;
      alphaRef.current = 0.0;
      slideRef.current = 0.36;
    }
  }, [kind, url]);

  useFrame((_, dt) => {
    // 부드러운 이징
    const k = Math.min(1, 8 * dt);
    scaleRef.current += (1.0 - scaleRef.current) * k;
    alphaRef.current += (1.0 - alphaRef.current) * k;
    slideRef.current += (0.0 - slideRef.current) * k;

    if (meshRef.current) {
      meshRef.current.position.set(slideRef.current, 0, 0);
      meshRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[size.w, size.h]} />
      {isImg ? (
        <meshBasicMaterial map={tex.current} toneMapped={false} transparent opacity={alphaRef.current} />
      ) : isVid ? (
        <Suspense fallback={<EmptyMat />}>
          <VideoMat url={url} />
        </Suspense>
      ) : (
        <EmptyMat />
      )}
    </mesh>
  );
}

export default function LeftImg({
  kind = "empty",
  url = null,
  // 레이아웃: 부모에서 크기/위치는 CSS로 제어
  camZ = 3,
}) {
  return (
    <Canvas
      // pointer-events 막아서 아래 UI 조작 불가 문제 방지
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, camZ], fov: 50 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 6]} intensity={0.6} />
      <Suspense fallback={null}>
        <PlaneContent kind={kind} url={url} />
      </Suspense>
    </Canvas>
  );
}
