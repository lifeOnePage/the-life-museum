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

/** 부드러운 계단 */
function smoothstep(e0, e1, x) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * 핵심 아이디어
 * - "왼쪽" 기준선(화면 기준)은 world-angle = π 로 고정.
 * - 그룹은 회전/이동하지 않음(좌우 흔들림 원천 차단).
 * - 각 플레인의 월드 좌표를 θ + ringAngle 로 직접 계산해 배치.
 * - 튀어나옴은 world-angle 이 π 에 얼마나 가까운지로 weight 을 계산해 반지름만 가산.
 * - 모든 플레인은 항상 화면 정면을 바라보도록 rotation.y = 0 유지.
 */
function Scene({
  N = 100,
  radius = 2.2,
  planeW = 1.1,
  planeH = 1.4,
  snapSpeed = 12,  // leftIndex 스냅 수렴 속도
  bulge = 0.28,    // 튀어나올 양 (반지름 가산)
  leftIndex = 0,   // "왼쪽 자리에 오게 만들" 인덱스
  centerX = 0,     // 링 센터의 x 위치(모바일에서 우측 반쯤 자르려면 양수로)
  centerY = 0,     // 필요하면 높이 오프셋
  centerZ = 0,     // 필요하면 깊이 오프셋
}) {
  const planeRefs = useRef([]);
  const step = useMemo(() => (Math.PI * 2) / N, [N]);

  // "왼쪽 고정식": targetAngle = π - leftIndex * step
  const targetAngle = useRef(Math.PI - leftIndex * step);
  const ringAngle = useRef(targetAngle.current);

  // 각 슬롯의 '튀어나옴' 가중치(부드럽게)
  const weightsRef = useRef(new Array(N).fill(0));

  // 슬롯의 기본 각
  const baseAngles = useMemo(
    () => Array.from({ length: N }, (_, i) => i * step),
    [N, step]
  );

  if (planeRefs.current.length !== N) {
    planeRefs.current = Array(N).fill(null);
  }

  useFrame((_, dt) => {
    // 최신 targetAngle 반영
    targetAngle.current = Math.PI - leftIndex * step;

    // 부드럽게 수렴
    const k = Math.max(1, snapSpeed);
    ringAngle.current += (targetAngle.current - ringAngle.current) * Math.min(1, k * dt);

    // world-angle 기준으로 왼쪽(π)에 가까울수록 weight↑
    const sigma = step * 0.70; // 가우시안 폭
    const wSpeed = 14;         // weight 반응 속도

    baseAngles.forEach((theta, i) => {
      const worldAngle = theta + ringAngle.current;          // 각 슬롯의 "현재" 월드 각
      const d = Math.abs(wrapPi(worldAngle - Math.PI));      // 왼쪽 라인(π)과의 거리
      const near = 1 - smoothstep(step * 0.8, step * 1.5, d);
      const gauss = Math.exp(-(d * d) / (2 * sigma * sigma));
      const raw = Math.max(near, gauss); // 한 칸 폭에 가까울수록 크게
      const prev = weightsRef.current[i] ?? 0;
      weightsRef.current[i] = prev + (raw - prev) * Math.min(1, wSpeed * dt);
    });

    // 그룹은 회전/이동 X → 각 메쉬의 월드 좌표를 "직접" 계산
    baseAngles.forEach((theta, i) => {
      const w = weightsRef.current[i] ?? 0;
      const r = radius + bulge * w; // 왼쪽 라인 근처만 반지름 가산
      const a = theta + ringAngle.current;

      const x = centerX + Math.cos(a) * r;
      const y = centerY;
      const z = centerZ + Math.sin(a) * r;

      const m = planeRefs.current[i];
      if (!m) return;

      m.position.set(x, y, z);
      // 항상 화면 정면(기본 plane은 +Z를 바라봄, 카메라는 +Z에서 원점 바라보므로 OK)
      m.rotation.set(0, 0, 0);
    });
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 6]} intensity={0.6} />

      {/* 그룹(컨테이너)은 고정, 모든 배치는 메쉬에서 직접 */}
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {baseAngles.map((_, i) => (
          <mesh key={i} ref={(el) => (planeRefs.current[i] = el)}>
            <planeGeometry args={[planeW, planeH]} />
            {/* 데모: 전부 흰색 반투명 */}
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
          snapSpeed={12}
          bulge={0.28}
          leftIndex={leftIndex}
          centerX={0}   // 모바일에서 링을 화면 오른쪽으로 밀고 싶으면 양수로 조절
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
