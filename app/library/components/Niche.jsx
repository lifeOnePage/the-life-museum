"use client";

import * as THREE from "three";
import { useMemo } from "react";

const CREAM = "#ffffff";
const DARK_WALL = "#644F48";

export default function Niche({ position = [0, 0, 0], rows = 2 }) {
  const nicheWidth = 5; // 내부 너비 (선반 5 + 여백)
  const wallThickness = 10; // 측벽 두께
  // 이 컴포넌트는 position=[0, 1.5, ...] 에 배치됨
  const bottomY = -2.0; // world y=-0.5 → local y=-2.0
  // rows에 따라 상단 높이 동적 계산: rows=1: 0.6, rows=2: 2.0, rows=3: 3.4
  const straightTopY = rows * 1.4 - 0.8;
  const wallHeight = straightTopY - bottomY;
  const wallCenterY = (bottomY + straightTopY) / 2;
  const nicheDepth = 0.6; // 틈새 깊이

  // 어두운 외벽 노이즈 텍스처
  const wallTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = DARK_WALL;
    ctx.fillRect(0, 0, 512, 512);

    // 미세 노이즈
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  return (
    <group position={position}>
      {/* 외부 배경 벽 */}
      <mesh raycast={() => null} position={[0, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color={CREAM} />
      </mesh>

      {/* 크림색 내부 뒷판 */}
      <mesh
        raycast={() => null}
        position={[0, wallCenterY, 0.06]}
      >
        <planeGeometry args={[nicheWidth, wallHeight + 0.6]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.75}
          metalness={0.0}
        />
      </mesh>

      {/* 좌측 벽 */}
      <mesh
        raycast={() => null}
        position={[
          -(nicheWidth / 2 + wallThickness / 2),
          wallCenterY,
          nicheDepth / 2,
        ]}
      >
        <boxGeometry args={[wallThickness, wallHeight + 0.6, nicheDepth]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} metalness={0.0} />
      </mesh>

      {/* 우측 벽 */}
      <mesh
        raycast={() => null}
        position={[
          nicheWidth / 2 + wallThickness / 2,
          wallCenterY,
          nicheDepth / 2,
        ]}
      >
        <boxGeometry args={[wallThickness, wallHeight + 0.6, nicheDepth]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} metalness={0.0} />
      </mesh>

      <mesh
        raycast={() => null}
        position={[0, wallCenterY - wallHeight, nicheDepth / 2]}
      >
        <boxGeometry args={[wallThickness, wallHeight + 0.6, nicheDepth]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} metalness={0.0} />
      </mesh>

      {/* 아치 상단 — 반원 (TorusGeometry, arc=π) */}
      {/* <mesh
        raycast={() => null}
        position={[0, straightTopY, nicheDepth / 2]}
      >
        <torusGeometry args={[archRadius, archTubeRadius, 8, 32, Math.PI]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} metalness={0.0} />
      </mesh> */}
    </group>
  );
}
