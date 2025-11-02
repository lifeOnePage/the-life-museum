// app/view/[identifier]/reels/components/ImageRing3D.jsx
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture, useTexture } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";

// ---- Canvas 바깥에서는 일반 React 훅만 사용 (필요시)
export default function ImageRing3D(props) {
  const { camY = 7.5, camZ = 18 } = props;

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, camY, camZ], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 10, 6]} intensity={0.7} />
        {/* ✅ 모든 R3F/Drei 훅은 이 내부 컴포넌트에서만 사용 */}
        <RingScene {...props} />
      </Canvas>
    </div>
  );
}

// ---- 여기부터는 반드시 Canvas 내부에서만 렌더됨
function RingScene({
  radius = 6, // 기존 값 유지
  planeW = 2.2, // 기존 값 유지
  planeH = 2.8, // 기존 값 유지
  shiftRight = true, // 모바일에서 오른쪽으로 반쯤 잘리게
  items = [], // { url, kind: 'image'|'video'|'empty' } 등
  rotTarget = 0, // 외부에서 제어하는 목표 인덱스(스냅)
  onLeftmost, // 왼쪽 슬롯 URL 보고용 콜백 (LeftSprite 갱신)
}) {
  const groupRef = useRef();
  const [rotIndex, setRotIndex] = useState(0);

  // 부드러운 스냅(3D는 연속 회전, HUD는 스냅)
  useFrame((_, dt) => {
    const k = 8; // 빠르게 수렴
    const next = rotIndex + (rotTarget - rotIndex) * Math.min(1, k * dt);
    if (Math.abs(next - rotIndex) > 1e-4) setRotIndex(next);
  });

  // 회전 → 각도로 변환
  const nSlots = items.length || 100;
  const step = (Math.PI * 2) / nSlots;
  const baseAngle = useMemo(
    () => -Math.PI / 2,
    [
      /* 고정: 왼쪽이 index 0이 되도록 */
    ],
  );

  // rotIndex가 바뀔 때 왼쪽 슬롯 계산 & 보고
  useEffect(() => {
    const idx = ((Math.round(rotIndex) % nSlots) + nSlots) % nSlots;
    const leftIdx = idx; // 왼쪽 슬롯이 곧 rotIndex 정수부
    const leftItem = items[leftIdx];
    if (onLeftmost)
      onLeftmost(leftItem?.url ?? null, leftItem ?? null, leftIdx);
  }, [rotIndex, nSlots, items, onLeftmost]);

  // 그룹 위치: 모바일에서 오른쪽으로 절반쯤 잘리게 이동
  const offsetX = shiftRight ? radius * 0.75 : 0;

  return (
    <group ref={groupRef} position={[offsetX, 0, 0]}>
      {/* 링 전체 회전: rotIndex에 따라 연속 회전 */}
      <group rotation={[0, baseAngle + rotIndex * step, 0]}>
        {items.map((it, i) => {
          // i번째 슬롯의 각도(왼쪽이 index 0)
          const ang = i * step;
          // 원형 배치 좌표
          const x = Math.cos(ang) * radius;
          const z = Math.sin(ang) * radius;

          // 정면(=화면)으로 보이게 Y회전: 슬롯 각도 보정
          // 그룹 회전을 포함해 항상 '화면'을 향하도록 -ang 로 보정
          const rotationY = -ang;

          return (
            <Thumb
              key={i}
              position={[x, 0, z]}
              rotation={[0, rotationY, 0]}
              url={it?.url || null}
              kind={it?.kind || "empty"} // 'image'|'video'|'empty'
              width={planeW}
              height={planeH}
              dimType={it?.dimType || (it?.kind === "empty" ? "empty" : "on")}
              // 가장 왼쪽 슬롯을 약간 튀어나오게 하고 싶다면
              inflateLeft={
                i === Math.round(((rotIndex % nSlots) + nSlots) % nSlots)
              }
              radius={radius}
            />
          );
        })}
      </group>
    </group>
  );
}

function Thumb({
  position,
  rotation,
  url,
  kind,
  width,
  height,
  dimType,
  inflateLeft,
  radius,
}) {
  const meshRef = useRef();

  // 왼쪽 슬롯을 살짝 튀어나오게 (radius + delta)
  const finalPos = useMemo(() => {
    if (!inflateLeft) return position;
    // position은 [x,0,z], 원점 기준 반경을 약간 늘려준다
    const [x, y, z] = position;
    const r = Math.hypot(x, z) || radius;
    const scale = (r + 0.2) / r; // 0.2만큼 바깥으로
    return [x * scale, y, z * scale];
  }, [position, inflateLeft, radius]);

  // 머티리얼 분기
  if (!url || kind === "empty") {
    return (
      <mesh ref={meshRef} position={finalPos} rotation={rotation}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.25}
          toneMapped={false}
        />
      </mesh>
    );
  }

  if (kind === "video") {
    const tex = useVideoTexture(url, {
      crossOrigin: "anonymous",
      muted: true,
      start: true,
      loop: true,
      // playsInline: true 는 내부에서 처리됨
    });
    useEffect(() => {
      if (!tex) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    }, [tex]);

    return (
      <mesh ref={meshRef} position={finalPos} rotation={rotation}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={tex}
          transparent
          opacity={dimType === "off" ? 0.5 : 1}
          toneMapped={false}
        />
      </mesh>
    );
  }

  // kind === 'image'
  const tex = useTexture(url);
  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }, [tex]);

  return (
    <mesh ref={meshRef} position={finalPos} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={dimType === "off" ? 0.5 : 1}
        toneMapped={false}
      />
    </mesh>
  );
}
