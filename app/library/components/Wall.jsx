"use client";

import * as THREE from "three";
import { useMemo } from "react";

export default function Wall({ position = [0, 0, 0], size = [8, 4, 0.1] }) {
  // 벽 텍스처 (미세한 노이즈로 약간의 질감)
  const wallTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext("2d");

    // 기본 배경색
    ctx.fillStyle = "#efefef";
    ctx.fillRect(0, 0, 2000, 2000);

    // 미세한 노이즈 추가
    const imageData = ctx.getImageData(0, 0, 2000, 2000);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    return texture;
  }, []);

  return (
    <mesh position={position} receiveShadow raycast={() => null}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={wallTexture} roughness={2} metalness={0.05} />
    </mesh>
  );
}
