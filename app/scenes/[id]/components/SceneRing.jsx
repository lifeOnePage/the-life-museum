// app/scenes/[id]/components/SceneRing.jsx
"use client";

import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useVideoTexture, Line } from "@react-three/drei";

// ▶︎ 고정 파라미터
const RADIUS = 4;
const PLANE_W = 1.2;
const PLANE_H = 0.8;
const CAM_Y = 8;
const CAM_Z = 10;

// 프록시 함수
function proxify(u) {
  try {
    if (!u) return u;
    const abs = new URL(u, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (typeof window !== "undefined" && abs.origin === window.location.origin) return u;
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
function ImageMat({ url, isSelected }) {
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

  // Grayscale effect: reduce opacity and apply gray tint for non-selected
  const opacity = isSelected ? 0.9 : 0.3;
  const color = isSelected ? 0xffffff : 0x888888;

  return (
    <meshBasicMaterial
      map={tex}
      color={color}
      toneMapped={false}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

function VideoMat({ url, isSelected }) {
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
    vtex.needsUpdate = true;
  }, [vtex, url]);

  // Grayscale effect: reduce opacity and apply gray tint for non-selected
  const opacity = isSelected ? 0.5 : 0.3;
  const color = isSelected ? 0xffffff : 0x888888;

  return (
    <meshBasicMaterial
      map={vtex}
      color={color}
      toneMapped={false}
      transparent
      opacity={opacity}
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

// ===== Leftmost Sprite =====
function LeftmostSprite({ slot, spritePosition }) {
  const spriteRef = useRef();
  const kind = slot?.kind ?? slot?.type ?? "empty";
  const url = slot?.url ?? null;

  // 스프라이트 최대 크기 제한
  const MAX_WIDTH = 3;
  const MAX_HEIGHT = 4.0;

  // 항상 카메라를 향하도록 (billboard)
  useFrame(({ camera }) => {
    if (spriteRef.current) {
      spriteRef.current.lookAt(camera.position);
    }
  });

  if (!url || kind === "empty") return null;

  return (
    <sprite ref={spriteRef} position={spritePosition} scale={[MAX_WIDTH, MAX_HEIGHT, 1]}>
      {kind === "image" ? (
        <Suspense fallback={<spriteMaterial transparent opacity={0.3} />}>
          <SpriteImageMat url={url} />
        </Suspense>
      ) : kind === "video" ? (
        <Suspense fallback={<spriteMaterial transparent opacity={0.3} />}>
          <SpriteVideoMat url={url} />
        </Suspense>
      ) : (
        <spriteMaterial transparent opacity={0.3} />
      )}
    </sprite>
  );
}

// ===== Sprite용 텍스처 머티리얼 =====
function SpriteImageMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

  useEffect(() => {
    if (!tex || !tex.image) return;

    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;

    // Cover 효과: 스프라이트 비율에 맞춰 이미지 crop
    const MAX_WIDTH = 3;
    const MAX_HEIGHT = 4.0;
    const spriteAspect = MAX_WIDTH / MAX_HEIGHT; // 1.25
    const imageAspect = tex.image.width / tex.image.height;

    if (imageAspect > spriteAspect) {
      // 이미지가 더 넓음 - 가로를 crop
      const scale = spriteAspect / imageAspect;
      tex.repeat.set(scale, 1);
      tex.offset.set((1 - scale) / 2, 0);
    } else {
      // 이미지가 더 높음 - 세로를 crop
      const scale = imageAspect / spriteAspect;
      tex.repeat.set(1, scale);
      tex.offset.set(0, (1 - scale) / 2);
    }

    tex.needsUpdate = true;
  }, [tex, url]);

  return <spriteMaterial map={tex} transparent opacity={0.95} />;
}

function SpriteVideoMat({ url }) {
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
    if (!vtex || !vtex.image) return;

    vtex.colorSpace = THREE.SRGBColorSpace;

    // Cover 효과: 스프라이트 비율에 맞춰 비디오 crop
    const MAX_WIDTH = 3;
    const MAX_HEIGHT = 4.0;
    const spriteAspect = MAX_WIDTH / MAX_HEIGHT; // 1.25
    const videoAspect = vtex.image.videoWidth / vtex.image.videoHeight;

    if (videoAspect > spriteAspect) {
      // 비디오가 더 넓음 - 가로를 crop
      const scale = spriteAspect / videoAspect;
      vtex.repeat.set(scale, 1);
      vtex.offset.set((1 - scale) / 2, 0);
    } else {
      // 비디오가 더 높음 - 세로를 crop
      const scale = videoAspect / spriteAspect;
      vtex.repeat.set(1, scale);
      vtex.offset.set(0, (1 - scale) / 2);
    }

    vtex.needsUpdate = true;
  }, [vtex, url]);

  return <spriteMaterial map={vtex} transparent opacity={0.95} />;
}

// ===== 투영선 =====
function ProjectionLines({ planePosition, planeRotation, spritePosition }) {
  // 플레인의 상단 좌우 꼭짓점 계산
  const planeCorners = useMemo(() => {
    if (!planePosition || !planeRotation) return null;

    const planeMatrix = new THREE.Matrix4();
    planeMatrix.makeRotationFromEuler(new THREE.Euler(planeRotation[0], planeRotation[1], planeRotation[2]));
    planeMatrix.setPosition(planePosition[0], planePosition[1], planePosition[2]);

    // 플레인의 로컬 좌표계에서 상단 좌우 꼭짓점
    const topLeft = new THREE.Vector3(-PLANE_W / 2, PLANE_H / 2, 0);
    const topRight = new THREE.Vector3(PLANE_W / 2, PLANE_H / 2, 0);

    // 월드 좌표로 변환
    topLeft.applyMatrix4(planeMatrix);
    topRight.applyMatrix4(planeMatrix);

    return { topLeft, topRight };
  }, [planePosition, planeRotation]);

  // 스프라이트의 하단 좌우 꼭짓점 계산
  const spriteCorners = useMemo(() => {
    if (!spritePosition) return null;

    const MAX_WIDTH = 3;
    const MAX_HEIGHT = 4.0;

    // 스프라이트는 항상 카메라를 향하므로 x축으로만 오프셋
    const bottomLeft = new THREE.Vector3(
      spritePosition[0] - MAX_WIDTH / 2-0.4,
      spritePosition[1] - MAX_HEIGHT / 2,
      spritePosition[2]
    );
    const bottomRight = new THREE.Vector3(
      spritePosition[0] + MAX_WIDTH / 2-0.2,
      spritePosition[1] - MAX_HEIGHT / 2,
      spritePosition[2]
    );

    return { bottomLeft, bottomRight };
  }, [spritePosition]);

  if (!planeCorners || !spriteCorners) return null;

  return (
    <>
      <Line
        points={[planeCorners.topLeft, spriteCorners.bottomLeft]}
        color="white"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
      <Line
        points={[planeCorners.topRight, spriteCorners.bottomRight]}
        color="white"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
    </>
  );
}

// ===== 개별 플레인 =====
const MediaPlane = React.forwardRef(function MediaPlane({ slot, isSelected }, ref) {
  const kind = slot?.kind ?? slot?.type ?? "empty";
  const url = slot?.url ?? null;

  return (
    <mesh ref={ref}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      {kind === "image" && url ? (
        <Suspense fallback={<EmptyMat opacity={0.18} />}>
          <ImageMat url={url} isSelected={isSelected} />
        </Suspense>
      ) : kind === "video" && url ? (
        <Suspense fallback={<EmptyMat opacity={0.18} />}>
          <VideoMat url={url} isSelected={isSelected} />
        </Suspense>
      ) : (
        <EmptyMat />
      )}
    </mesh>
  );
});

// ===== 링 내부 =====
function RingInner({
  slots,
  leftIndex,
  onLeftmostChange,
  snapSpeed = 1,
  popMode = "single",
  popSpanSlots = 1.2,
  bulge = 10,
}) {
  const N = Math.max(1, slots.length);
  const step = useMemo(() => (Math.PI * 2) / N, [N]);

  const targetAngle = useRef(Math.PI);
  const ringAngle = useRef(targetAngle.current);

  const planeRefs = useRef(new Array(N).fill(null));
  if (planeRefs.current.length !== N) planeRefs.current = Array(N).fill(null);
  const weightsRef = useRef(new Array(N).fill(0));
  if (weightsRef.current.length !== N) weightsRef.current = Array(N).fill(0);

  // 선택된 아이템 추적
  const selectedItemIdRef = useRef(null);
  const baseAnglesRef = useRef(Array.from({ length: N }, (_, i) => i * step));
  if (baseAnglesRef.current.length !== N) baseAnglesRef.current = Array.from({ length: N }, (_, i) => i * step);

  const lastNotifiedIdx = useRef(-1);

  // Leftmost 플레인 위치/회전 추적
  const [leftmostPlaneInfo, setLeftmostPlaneInfo] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  });
  useFrame((_, dt) => {
    // 1. 선택된 아이템의 itemId를 leftIndex로부터 가져옴
    const selectedItemId = slots[leftIndex]?.itemId;
    selectedItemIdRef.current = selectedItemId;

    // 2. 비균등 간격으로 baseAngles 재계산
    const selectedCount = slots.filter(s => s?.itemId === selectedItemId).length;
    const otherCount = N - selectedCount;

    // 선택된 아이템의 각 이미지에 할당할 각도 (기본 + 200% 가중치)
    const selectedStepMultiplier = 4.0;  // 3배 간격으로 증가
    const selectedStep = step * selectedStepMultiplier;
    const selectedTotalAngle = selectedCount * selectedStep;

    // 나머지 이미지들에 할당할 총 각도 (360도 - 선택된 아이템 총 각도)
    const remainingAngle = Math.PI * 2 - selectedTotalAngle;
    const otherStep = otherCount > 0 ? remainingAngle / otherCount : step;

    // 각 슬롯의 각도를 새로 계산
    let angle = 0;
    const newBaseAngles = [];
    for (let i = 0; i < N; i++) {
      newBaseAngles[i] = angle;
      const itemId = slots[i]?.itemId;
      if (itemId === selectedItemId) {
        angle += selectedStep;
      } else {
        angle += otherStep;
      }
    }
    baseAnglesRef.current = newBaseAngles;

    // 3. leftIndex에 해당하는 슬롯이 Math.PI에 오도록 목표 각도 계산
    const targetSlotAngle = newBaseAngles[leftIndex] || 0;
    targetAngle.current = Math.PI - targetSlotAngle;

    // 4. 최단 경로로 회전
    const diff = wrapPi(targetAngle.current - ringAngle.current);
    ringAngle.current += diff * Math.min(1, Math.max(1, snapSpeed) * dt);

    // 5. bestIdx 계산 (현재 leftmost 슬롯)
    let bestIdx = 0;
    let bestD = Infinity;
    const dSlotsArr = new Array(N);
    for (let i = 0; i < N; i++) {
      const worldAngle = newBaseAngles[i] + ringAngle.current;
      const dAngle = Math.abs(wrapPi(worldAngle - Math.PI));
      const dSlots = dAngle / step;
      dSlotsArr[i] = dSlots;
      if (dSlots < bestD) {
        bestD = dSlots;
        bestIdx = i;
      }
    }

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

    const wSpeed = 14;
    for (let i = 0; i < N; i++) {
      const prev = weightsRef.current[i] ?? 0;
      const next = targetW[i];
      weightsRef.current[i] = lerpExp(prev, next, Math.min(1, wSpeed * dt));
    }

    for (let i = 0; i < N; i++) {
      const a = newBaseAngles[i] + ringAngle.current;
      const w = weightsRef.current[i] ?? 0;
      const r = RADIUS + bulge * w;

      const x = Math.cos(a) * r;
      const y = 0;
      const z = Math.sin(a) * r;

      const m = planeRefs.current[i];
      if (!m) continue;
      m.position.set(x, y, z);
      m.rotation.set(-0.6, 0, 0);
    }

    // 좌측 인덱스 스냅 콜백(회전이 거의 완료되었을 때만)
    if (onLeftmostChange) {
      const angleDiff = Math.abs(wrapPi(targetAngle.current - ringAngle.current));

      // 타겟 인덱스에 거의 도달했을 때만 알림 (각도 차이가 step의 10% 이하)
      if (angleDiff < step * 0.1 && bestIdx === leftIndex && bestIdx !== lastNotifiedIdx.current) {
        lastNotifiedIdx.current = bestIdx;
        onLeftmostChange(bestIdx);
      }
    }

    // Leftmost 플레인 위치 업데이트 (매 프레임)
    const leftPlane = planeRefs.current[leftIndex];
    if (leftPlane) {
      setLeftmostPlaneInfo({
        position: [leftPlane.position.x, leftPlane.position.y, leftPlane.position.z],
        rotation: [leftPlane.rotation.x, leftPlane.rotation.y, leftPlane.rotation.z],
      });
    }
  });

  // leftIndex에 해당하는 아이템의 itemId 계산
  const selectedItemId = slots[leftIndex]?.itemId;

  // Sprite 위치 계산
  const spritePosition = useMemo(() => {
    if (!leftmostPlaneInfo.position) return [0, 4, 0];
    return [
      leftmostPlaneInfo.position[0],
      leftmostPlaneInfo.position[1] +4,
      leftmostPlaneInfo.position[2],
    ];
  }, [leftmostPlaneInfo.position]);

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {slots.map((slot, i) => {
        const isSelected = slot?.itemId === selectedItemId;
        return (
          <MediaPlane
            key={i}
            ref={(el) => (planeRefs.current[i] = el)}
            slot={slot}
            isSelected={isSelected}
          />
        );
      })}

      {/* Leftmost Sprite */}
      <LeftmostSprite
        slot={slots[leftIndex]}
        spritePosition={spritePosition}
      />

      {/* Projection Lines */}
      <ProjectionLines
        planePosition={leftmostPlaneInfo.position}
        planeRotation={leftmostPlaneInfo.rotation}
        spritePosition={spritePosition}
      />
    </group>
  );
}

export default function SceneRing({
  slots,
  leftIndex = 0,
  onLeftmostChange,
  snapSpeed = 4,
  popMode = "single",
  popSpanSlots = 1.2,
  bulge = 10.0,
}) {
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
