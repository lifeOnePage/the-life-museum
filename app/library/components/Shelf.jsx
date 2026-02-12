"use client";

import * as THREE from "three";
import { useMemo } from "react";

export default function Shelf({
  position = [0, 0, 0],
  width = 5,
  depth = 0.4,
  thickness = 0.08,
}) {
  // 나무 질감 텍스처
  const woodTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // 나무 기본색
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, "#ffffff");
    // gradient.addColorStop(0.3, "#efefef");
    // gradient.addColorStop(0.6, "#ffffff");
    gradient.addColorStop(1, "#efefef");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 128);

    // 나무결 라인
    ctx.strokeStyle = "#efefef";
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 128;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 20) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 4);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    return texture;
  }, []);

  return (
    <group position={position}>
      {/* 선반 상판 */}
      <mesh castShadow receiveShadow raycast={() => null} position={[0, thickness / 2, depth / 2]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 선반 앞면 립 (앨범이 떨어지지 않도록) */}
      <mesh
        castShadow
        receiveShadow
        raycast={() => null}
        position={[0, thickness / 2 + 0.02, depth - 0.015]}
      >
        <boxGeometry args={[width, 0.04, 0.03]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
