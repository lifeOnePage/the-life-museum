"use client";

import * as THREE from "three";
import { useMemo } from "react";

const SHELF_COLOR = "#f5ede0";

// 그라데이션 그림자 텍스처 생성 (위→아래 방향, 위가 어두움)
function createGradientShadowTexture(opacity = 0.18) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
  gradient.addColorStop(0.4, `rgba(0,0,0,${opacity * 0.3})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function Shelf({
  position = [0, 0, 0],
  width = 5,
  depth = 0.4,
  thickness = 0.08,
  shelfOffset = 1,
}) {
  // 그라데이션 그림자 텍스처 (선반 아래 벽면에 드리우는 그림자)
  const underShelfShadowTex = useMemo(
    () => createGradientShadowTexture(0.2),
    [],
  );

  // 선반 위 뒷벽 접합부 그라데이션 (수평 방향)
  const backContactShadowTex = useMemo(
    () => createGradientShadowTexture(0.12),
    [],
  );

  const SHADOW_DROP_HEIGHT = 0.5; // 선반 아래로 드리우는 그림자 높이

  return (
    <group position={position}>
      {/* 선반 상판 */}
      <mesh raycast={() => null} position={[0, thickness / 2, depth / 2]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial
          color={SHELF_COLOR}
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>

      {/* 선반 아래 벽면 드롭 섀도 (그라데이션 — 레퍼런스 핵심 요소) */}
      {/* <mesh raycast={() => null} position={[0, -SHADOW_DROP_HEIGHT / 2, 0.03]}>
        <planeGeometry args={[width, SHADOW_DROP_HEIGHT]} />
        <meshBasicMaterial
          map={underShelfShadowTex}
          transparent
          depthWrite={false}
        />
      </mesh> */}

      {/* 선반 위 뒷벽 접합부 그림자 (수평 그라데이션) */}
      {/* <mesh
        raycast={() => null}
        position={[0, thickness + 0.001, -0.01]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, 0.18]} />
        <meshBasicMaterial
          map={backContactShadowTex}
          transparent
          depthWrite={false}
        />
      </mesh> */}

      {/* 선반 앞면 립 하단 미세 그림자 (앞 엣지 강조) */}
      {/* <mesh raycast={() => null} position={[0, -0.01, depth + 0.001]}>
        <planeGeometry args={[width, 0.06]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh> */}

      {/* LED 스트립 (앰버 글로우) */}
      {/* <mesh raycast={() => null} position={[0, shelfOffset - thickness, 0.04]}>
        <boxGeometry args={[width - 0.1, 0.05, 0.025]} />
        <meshStandardMaterial
          emissive="#ffaa40"
          emissiveIntensity={2}
          color="#ffaa40"
          roughness={0.1}
        />
      </mesh> */}
    </group>
  );
}
