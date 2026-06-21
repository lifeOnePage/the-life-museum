"use client";

import * as THREE from "three";
import { useMemo } from "react";

const CREAM = "#f5ede0";
const NICHE_BACK = "#543F45";

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

  // 밝은 벽면 미세 노이즈 텍스처
  const wallTexture = useMemo(() => {
    const SIZE = 128;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = NICHE_BACK;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 미세 노이즈
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
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
    // 그레인을 더 촘촘하게 타일링하여 질감이 덜 크게(미세하게) 보이도록 함
    texture.repeat.set(8, 8);
    return texture;
  }, []);

  return (
    <group position={position}>
      {/* 외부 배경 벽 — 어떤 스크롤/줌에서도 프러스텀을 항상 덮도록 크게 잡아
          뒤쪽 빈 영역이 노출되지 않게 한다. 측벽과 동일한 standardMaterial을 써서
          같은 앰버 조명을 받아 warm tone으로 블렌딩되도록 한다 (basic이면 조명을
          안 받아 상대적으로 회색으로 떠 보임). */}
      <mesh raycast={() => null} position={[0, 0, -1]}>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} metalness={0.0} />
      </mesh>

      {/* 크림색 내부 뒷판 */}
      <mesh raycast={() => null} position={[0, wallCenterY, 0.06]}>
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
