// app/view/[identifier]/reels/components/LeftSprite.jsx
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useVideoTexture } from "@react-three/drei";

const CAM_Z = 18;
const MAX_W = 20;
const MAX_H = 11.25; // 16:9 박스

// ---- 새로 추가: 외부 URL을 동일출처 프록시로 바꿉니다.
function proxify(u) {
  // console.log(u);
  try {
    if (!u) return u;
    // 절대 URL 판별
    const abs = new URL(
      u,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    // 이미 동일 출처면 그대로
    if (typeof window !== "undefined" && abs.origin === window.location.origin)
      return u;
    // http/https만 프록시
    if (abs.protocol === "http:" || abs.protocol === "https:") {
      return `/api/proxy?url=${encodeURIComponent(abs.href)}`;
    }
    return u;
  } catch {
    return u;
  }
}

function fitSizeByAspect(aspect, maxW, maxH) {
  if (!Number.isFinite(aspect) || aspect <= 0) return { w: maxW, h: maxH };
  const wByH = maxH * aspect;
  if (wByH <= maxW) return { w: wByH, h: maxH }; // 높이에 맞춤
  const hByW = maxW / aspect;
  return { w: maxW, h: hByW }; // 너비에 맞춤
}

function EmptyMat({ opacity = 0.2 }) {
  return (
    <meshBasicMaterial
      color="white"
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

// --- 이미지 머티리얼 (URL 프록시 적용)
function ImageMat({ url, onAspect, materialRef }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const img = tex.image;
    const iw = img?.naturalWidth ?? img?.width ?? 0;
    const ih = img?.naturalHeight ?? img?.height ?? 0;
    if (iw > 0 && ih > 0) onAspect?.(iw / ih);
  }, [tex, onAspect]);

  return (
    <meshBasicMaterial
      ref={materialRef}
      map={tex}
      toneMapped={false}
      transparent
      opacity={0}
      side={THREE.DoubleSide}
    />
  );
}

// --- 비디오 머티리얼 (URL 프록시 적용 + Range 지원)
function VideoMat({ url, onAspect, materialRef }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const vtex = useVideoTexture(effUrl, {
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
    const vid = vtex.image;
    const iw = vid?.videoWidth ?? 0;
    const ih = vid?.videoHeight ?? 0;
    if (iw > 0 && ih > 0) onAspect?.(iw / ih);
  }, [vtex, onAspect]);

  return (
    <meshBasicMaterial
      ref={materialRef}
      map={vtex}
      toneMapped={false}
      transparent
      opacity={0}
      side={THREE.DoubleSide}
    />
  );
}

function PlaneContent({ kind, url, maxWUnits = MAX_W, maxHUnits = MAX_H }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const matRef = useRef();

  const scaleRef = useRef(0.92);
  const alphaRef = useRef(0.0);
  const slideRef = useRef(0.36);
  const aspectRef = useRef(16 / 9);
  const prevKeyRef = useRef("");

  useEffect(() => {
    const key = `${kind}|${url ?? "empty"}`;
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      scaleRef.current = 0.92;
      alphaRef.current = 0.0;
      slideRef.current = 0.36;
    }
  }, [kind, url]);

  const handleAspect = (a) => {
    if (Number.isFinite(a) && a > 0) aspectRef.current = a;
  };

  useFrame((_, dt) => {
    const k = Math.min(1, 8 * dt);
    scaleRef.current += (1.0 - scaleRef.current) * k;
    alphaRef.current += (1.0 - alphaRef.current) * k;
    slideRef.current += (0.0 - slideRef.current) * k;

    const size = fitSizeByAspect(aspectRef.current, maxWUnits, maxHUnits);
    if (meshRef.current) meshRef.current.scale.set(size.w, size.h, 1);
    if (groupRef.current) {
      groupRef.current.position.set(slideRef.current, 0, 0);
      groupRef.current.scale.setScalar(scaleRef.current);
    }
    if (matRef.current) matRef.current.opacity = alphaRef.current;
  });

  const isImg = kind === "image" && url;
  const isVid = kind === "video" && url;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1.5, 1.5]} />
        {isImg ? (
          <Suspense fallback={<EmptyMat />}>
            <ImageMat url={url} onAspect={handleAspect} materialRef={matRef} />
          </Suspense>
        ) : isVid ? (
          <Suspense fallback={<EmptyMat />}>
            <VideoMat url={url} onAspect={handleAspect} materialRef={matRef} />
          </Suspense>
        ) : (
          <EmptyMat />
        )}
      </mesh>
    </group>
  );
}

export default function LeftSprite({
  item,
  activeKey,
  lifestory = "",
  mainLabel = "",
  subLabel = "",
  caption = "",
}) {
  const canvasKey = useMemo(
    () => (item?.url || activeKey || "none") + "|" + (item?.caption || ""),
    [item, activeKey],
  );
  console.log(activeKey);
  const showCanvas = activeKey !== "lifestory";
  if (mainLabel === "Memory") {
    console.log("item: ", item);
    console.log("activeKey: ", activeKey);
    console.log("lifestory: ", lifestory);
    console.log("mainLabel: ", mainLabel);
    console.log("subLabel: ", subLabel);
    console.log("caption: ", caption);
  }
  return (
    <div className="mx-auto h-full w-full max-w-[680px]">
      <div className="h-[80%] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
        {showCanvas ? (
          <Canvas
            key={canvasKey}
            camera={{ position: [0, 0, CAM_Z], fov: 50 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.95} />
            <directionalLight position={[6, 10, 6]} intensity={0.7} />
            <PlaneContent kind={item?.kind} url={item?.url} />
          </Canvas>
        ) : (
          <div className="h-full w-full overflow-y-auto p-4">
            <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-white/90">
              {lifestory || "생애문이 없습니다."}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] font-semibold tracking-wide text-white/80">
            {mainLabel}
          </div>
          <div className="h-px flex-1 bg-white/10" />
          <div className="truncate text-[12px] text-white/70">{subLabel}</div>
        </div>
        {mainLabel === "People" ? (
          <div className="mt-2 text-[13px] leading-relaxed text-white/50">
            {item?._relMeta?.relation}
          </div>
        ) : mainLabel === "Memory" ? (
          <div className="mt-2 text-[13px] leading-relaxed text-white/85">
            {item?._memoryMeta?.description}
          </div>
        ) : null}
        {caption?.trim() ? (
          <div className="mt-2 text-[13px] leading-relaxed text-white/85">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}
