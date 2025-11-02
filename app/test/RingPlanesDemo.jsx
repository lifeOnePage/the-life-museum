// app/test/RingPlanesDemo.jsx
"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** [-π, π]로 감기 */
function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
}

/** 스무딩 유틸(부드럽게 수렴) */
function lerpExp(prev, next, rate) {
  return prev + (next - prev) * rate;
}

/**
 * Scene
 * - 그룹 회전/이동 없이 각 슬롯의 월드 좌표를 직접 계산
 * - "왼쪽 고정(π)" 기준으로 가장 가까운 슬롯(또는 근처 슬롯들)을 팝아웃
 * - popMode: "single" | "band"
 *   - single: 무조건 하나만 팝아웃
 *   - band  : 왼쪽 주변으로 원하는 폭(popSpanSlots, 슬롯 단위)만큼 팝아웃
 */
function Scene({
  N = 100,
  radius = 2.2,
  planeW = 1.1,
  planeH = 1.4,
  leftIndex = 0,     // "왼쪽 위치"에 오도록 만들 슬롯 인덱스
  snapSpeed = 12,    // leftIndex 스냅 수렴 속도
  bulge = 0.6,      // 튀어나올 양 (반지름 가산)
  popMode = "single",// "single" | "band"
  popSpanSlots = 1.2,// band 모드에서 왼쪽 주변으로 몇 슬롯 폭까지 살릴지(절반폭)
  centerX = 0, centerY = 0, centerZ = 0,
}) {
  const planeRefs = useRef([]);
  const weightsRef = useRef(new Array(N).fill(0));
  const step = useMemo(() => (Math.PI * 2) / N, [N]);

  // "왼쪽 고정식": targetAngle = π - leftIndex * step
  const targetAngle = useRef(Math.PI - leftIndex * step);
  const ringAngle = useRef(targetAngle.current);

  const baseAngles = useMemo(
    () => Array.from({ length: N }, (_, i) => i * step),
    [N, step]
  );

  if (planeRefs.current.length !== N) {
    planeRefs.current = Array(N).fill(null);
  }

  useFrame((_, dt) => {
    // 목표각 업데이트 + 부드러운 수렴
    targetAngle.current = Math.PI - leftIndex * step;
    ringAngle.current = lerpExp(
      ringAngle.current,
      targetAngle.current,
      Math.min(1, Math.max(1, snapSpeed) * dt)
    );

    // 각 슬롯의 "왼쪽 라인(π)"으로부터의 각도 거리 → 슬롯 거리로 변환
    let bestIdx = 0;
    let bestD = Infinity;
    const dSlotsArr = new Array(N);

    for (let i = 0; i < N; i++) {
      const worldAngle = baseAngles[i] + ringAngle.current;
      const dAngle = Math.abs(wrapPi(worldAngle - Math.PI)); // [0, π]
      const dSlots = dAngle / step; // "몇 슬롯 떨어져 있나"
      dSlotsArr[i] = dSlots;
      if (dSlots < bestD) {
        bestD = dSlots;
        bestIdx = i;
      }
    }

    // 타깃 weight 계산
    const targetW = new Array(N).fill(0);
    if (popMode === "single") {
      // 하나만 1, 나머지 0
      targetW[bestIdx] = 1;
    } else {
      // band: 왼쪽 주변으로 popSpanSlots(절반폭)까지 삼각커브로 분포
      const half = Math.max(0.0001, popSpanSlots);
      for (let i = 0; i < N; i++) {
        const dS = dSlotsArr[i];
        if (dS <= half) {
          const t = 1 - dS / half;      // [0..1]
          targetW[i] = t * t;           // 부드러운 정점(제곱으로 더 날카롭게)
        } else {
          targetW[i] = 0;
        }
      }
    }

    // 부드럽게 weight 수렴
    const wSpeed = 14;
    for (let i = 0; i < N; i++) {
      const prev = weightsRef.current[i] ?? 0;
      const next = targetW[i];
      weightsRef.current[i] = lerpExp(prev, next, Math.min(1, wSpeed * dt));
    }

    // 각 메쉬 월드 배치(그룹은 회전/이동 X)
    for (let i = 0; i < N; i++) {
      const a = baseAngles[i] + ringAngle.current;
      const w = weightsRef.current[i] ?? 0;
      const r = radius + bulge * w;

      const x = centerX + Math.cos(a) * r;
      const y = centerY;
      const z = centerZ + Math.sin(a) * r;

      const m = planeRefs.current[i];
      if (!m) continue;
      m.position.set(x, y, z);
      m.rotation.set(0, 0, 0); // 항상 화면 정면
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 6]} intensity={0.6} />
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {baseAngles.map((_, i) => (
          <mesh key={i} ref={(el) => (planeRefs.current[i] = el)}>
            <planeGeometry args={[planeW, planeH]} />
            <meshBasicMaterial color={"#ffffff"} transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function RingPlanesDemo() {
  const [leftIndex, setLeftIndex] = useState(0);
  const N = 100;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#111", overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }} gl={{ antialias: true }}>
        <Scene
          N={N}
          radius={2.2}
          planeW={1.1}
          planeH={1.4}
          leftIndex={leftIndex}
          snapSpeed={12}
          bulge={0.6}
          // === 여기로 팝아웃 개수 제어 ===
          popMode="single"      // "single"이면 항상 1개만 튀어나옴
          // popMode="band"
          // popSpanSlots={0.6}  // band 모드일 때 왼쪽 주변 절반폭(슬롯 단위). 키우면 여러 개가 함께 팝아웃
          centerX={0}
          centerY={0}
          centerZ={0}
        />
      </Canvas>

      {/* 하단 컨트롤 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ color: "#fff", fontSize: 12 }}>leftmost</span>
        <input
          type="range"
          min={0}
          max={N - 1}
          step={1}
          value={leftIndex}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setLeftIndex(Number.isFinite(v) ? v : 0);
          }}
          style={{ flex: 1 }}
        />
        <span style={{ color: "#fff", fontSize: 12 }}>{leftIndex}</span>
      </div>
    </div>
  );
}
