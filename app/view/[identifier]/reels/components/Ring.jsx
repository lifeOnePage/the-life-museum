// app/view/[identifier]/reels/components/Ring.jsx
"use client";

import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";

// ▶︎ 고정 파라미터(요구사항 유지)
const RADIUS = 2.4;
const PLANE_W = 1.3;
const PLANE_H = 1.2;
const CAM_Y = 1.8;
const CAM_Z = 8;

// Ring.jsx 상단 어딘가(컴포넌트 바깥)
function proxify(u) {
  try {
    if (!u) return u;
    const abs = new URL(u, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (typeof window !== "undefined" && abs.origin === window.location.origin) return u; // 동일 출처면 그대로
    if (abs.protocol === "http:" || abs.protocol === "https:") {
      return `/api/proxy?url=${encodeURIComponent(abs.href)}`;
    }
    return u;
  } catch {
    return u;
  }
}


// ===== 유틸 =====
function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
}
function lerpExp(prev, next, rate) {
  return prev + (next - prev) * rate;
}

// ===== 머티리얼들 =====
function ImageMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);     
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");                  
  });
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
      toneMapped={false}
      transparent
      opacity={0.5}
      side={THREE.DoubleSide}
    />
  );
}

function VideoMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);      // ✅ 추가
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
    vtex.needsUpdate = true;
  }, [vtex, url]);
  return (
    <meshBasicMaterial
      map={vtex}
      toneMapped={false}
      transparent
      opacity={0.5}
      side={THREE.DoubleSide}
    />
  );
}

function EmptyMat({ opacity = 0.08 }) {
  return (
    <meshBasicMaterial
      color="white"
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

// ===== 개별 플레인(텍스처 + 지오메트리) =====
const MediaPlane = React.forwardRef(function MediaPlane({ slot }, ref) {
  const kind = slot?.kind ?? slot?.type ?? "empty";
  const url = slot?.url ?? null;

  return (
    <mesh ref={ref}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
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
});

// ===== 링 내부 (그룹은 회전시키지 않고, 각 슬롯을 직접 배치) =====
function RingInner({
  slots,
  leftIndex,
  onLeftmostChange,
  snapSpeed = 12,

  // 팝아웃 컨트롤(튜닝 가능)
  popMode = "single",     // "single" | "band"
  popSpanSlots = 1.2,     // band 모드에서 왼쪽 주변 절반폭(슬롯 단위)
  bulge = 0.28,           // 튀어나오는 양 (반지름 가산)
}) {
  const N = Math.max(1, slots.length);
  const step = useMemo(() => (Math.PI * 2) / N, [N]);
  const baseAngles = useMemo(
    () => Array.from({ length: N }, (_, i) => i * step),
    [N, step]
  );

  // 회전(인덱스→각도) 상태
  const targetAngle = useRef(Math.PI - leftIndex * step);
  const ringAngle = useRef(targetAngle.current);

  // 메쉬/웨이트 관리
  const planeRefs = useRef(new Array(N).fill(null));
  if (planeRefs.current.length !== N) planeRefs.current = Array(N).fill(null);
  const weightsRef = useRef(new Array(N).fill(0));
  if (weightsRef.current.length !== N) weightsRef.current = Array(N).fill(0);

  // 프레임 루프: 회전 수렴 + 왼쪽 라인 기준 팝아웃 가중치 + 배치
  const lastNotifiedIdx = useRef(-1);
  useFrame((_, dt) => {
    // 목표각 업데이트 및 수렴
    targetAngle.current = Math.PI - leftIndex * step;
    ringAngle.current = lerpExp(
      ringAngle.current,
      targetAngle.current,
      Math.min(1, Math.max(1, snapSpeed) * dt)
    );

    // 각 슬롯의 왼쪽기준 거리 & 최좌측 후보 탐색
    let bestIdx = 0;
    let bestD = Infinity;
    const dSlotsArr = new Array(N);
    for (let i = 0; i < N; i++) {
      const worldAngle = baseAngles[i] + ringAngle.current;
      const dAngle = Math.abs(wrapPi(worldAngle - Math.PI)); // [0..π]
      const dSlots = dAngle / step; // 슬롯 단위
      dSlotsArr[i] = dSlots;
      if (dSlots < bestD) {
        bestD = dSlots;
        bestIdx = i;
      }
    }

    // 팝아웃 목표 웨이트
    const targetW = new Array(N).fill(0);
    if (popMode === "single") {
      targetW[bestIdx] = 1;
    } else {
      const half = Math.max(0.0001, popSpanSlots);
      for (let i = 0; i < N; i++) {
        const dS = dSlotsArr[i];
        if (dS <= half) {
          const t = 1 - dS / half;
          targetW[i] = t * t;
        }
      }
    }

    // 웨이트 수렴
    const wSpeed = 14;
    for (let i = 0; i < N; i++) {
      const prev = weightsRef.current[i] ?? 0;
      const next = targetW[i];
      weightsRef.current[i] = lerpExp(prev, next, Math.min(1, wSpeed * dt));
    }

    // 실제 배치 (그룹 고정, 각 슬롯 직접 위치/회전 세팅)
    for (let i = 0; i < N; i++) {
      const a = baseAngles[i] + ringAngle.current;
      const w = weightsRef.current[i] ?? 0;
      const r = RADIUS + bulge * w;

      const x = Math.cos(a) * r;
      const y = 0;
      const z = Math.sin(a) * r;

      const m = planeRefs.current[i];
      if (!m) continue;
      m.position.set(x, y, z);
      m.rotation.set(0, 0, 0); // 항상 화면 정면
    }

    // 좌측 인덱스 스냅 콜백(변했을 때만)
    if (onLeftmostChange) {
      const raw = (Math.PI - ringAngle.current) / step;
      const idx = ((Math.round(raw) % N) + N) % N;
      if (idx !== lastNotifiedIdx.current) {
        lastNotifiedIdx.current = idx;
        onLeftmostChange(idx);
      }
    }
  });

  return (
    <group /* 그룹은 이동/회전 고정 */ position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {slots.map((slot, i) => (
        <MediaPlane
          key={i}
          ref={(el) => (planeRefs.current[i] = el)}
          slot={slot}
        />
      ))}
    </group>
  );
}

export default function Ring({
  slots,                 // [{kind:'image'|'video'|'empty', url}, ...] (len>=100 보장 권장)
  leftIndex,             // 현재 "왼쪽" 인덱스
  onLeftmostChange,      // 스냅 좌측 인덱스 콜백
  snapSpeed = 12,

  // 팝아웃 제어(원하는 느낌으로 조절 가능)
  popMode = "single",    // "single" | "band"
  popSpanSlots = 1.2,    // band 모드에서 왼쪽 주변 절반폭(슬롯 단위)
  bulge = 1.0,          // 튀어나올 양
}) {
  // 로더 디버깅 훅(선택)
  useEffect(() => {
    const LM = THREE.DefaultLoadingManager;
    const _start = LM.onStart;
    const _load = LM.onLoad;
    const _err = LM.onError;
    LM.onStart = (url, itemsLoaded, itemsTotal) => {
      _start?.(url, itemsLoaded, itemsTotal);
    };
    LM.onLoad = () => {
      _load?.();
    };
    LM.onError = (url) => {
      _err?.(url);
    };
    return () => {
      LM.onStart = _start;
      LM.onLoad = _load;
      LM.onError = _err;
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, CAM_Y, CAM_Z], fov: 50 }} gl={{ antialias: true }}>
      <ambientLight intensity={0.95} />
      <directionalLight position={[6, 10, 6]} intensity={0.7} />
      <Suspense fallback={null}>
        <RingInner
          slots={slots}
          leftIndex={leftIndex}
          onLeftmostChange={onLeftmostChange}
          snapSpeed={snapSpeed}
          popMode={popMode}
          popSpanSlots={popSpanSlots}
          bulge={bulge}
        />
      </Suspense>
    </Canvas>
  );
}
