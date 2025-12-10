// app/components/main/LPDisc.jsx
"use client";

import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

// LP판 디스크
function Disc({ radius, rotationSpeed }) {
  const discRef = useRef();
  const innerDiscRef = useRef();

  useFrame(() => {
    if (discRef.current) {
      discRef.current.rotation.z += rotationSpeed;
    }
    if (innerDiscRef.current) {
      innerDiscRef.current.rotation.z += rotationSpeed * 0.95;
    }
  });

  // 그라데이션 텍스처 생성
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // 방사형 그라데이션
    const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(0.5, "#0a0a0a");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 음반 홈 텍스처 (질감)
  const grooveTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 512);

    // 동심원 그루브 효과
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let i = 50; i < 256; i += 3) {
      ctx.beginPath();
      ctx.arc(256, 256, i, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <group>
      {/* 외부 디스크 */}
      <mesh ref={discRef} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial
          map={gradientTexture}
          roughness={0.3}
          metalness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 내부 음반 홈 */}
      <mesh ref={innerDiscRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[radius * 0.95, 64]} />
        <meshStandardMaterial
          map={grooveTexture}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 중앙 레이블 영역 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[radius * 0.25, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.5}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// 방사형 텍스트
function RadialText({ text, radius, segments, fontSize, rotationSpeed }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += rotationSpeed;
    }
  });

  const chars = text.split("");
  const angleStep = (Math.PI * 2) / segments;

  return (
    <group ref={groupRef} position={[0, 0.03, 0]}>
      {chars.map((char, i) => {
        const angle = (i / chars.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Text
            key={i}
            position={[x, 0, z]}
            rotation={[Math.PI / 2, 0, -angle + Math.PI / 2]}
            fontSize={fontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Pretendard-Bold.woff"
          >
            {char}
          </Text>
        );
      })}
    </group>
  );
}

// 메인 씬
function Scene({ radius, text, textRadius, fontSize, rotationSpeed }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        castShadow
      />

      <Disc radius={radius} rotationSpeed={rotationSpeed} />

      {text && (
        <RadialText
          text={text}
          radius={textRadius}
          segments={text.length}
          fontSize={fontSize}
          rotationSpeed={rotationSpeed * 0.8}
        />
      )}
    </>
  );
}

// 메인 캔버스
export default function LPDisc({
  radius = 6,
  text = "THE LIFE MUSEUM • ARCHIVE YOUR STORY • PRESERVE YOUR MEMORIES • ",
  textRadius = 5,
  fontSize = 0.4,
  rotationSpeed = 0.002,
  cameraPosition = { x: 5, y: 8, z: 12 }
}) {
  return (
    <Canvas
      camera={{
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        fov: 45,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <Scene
        radius={radius}
        text={text}
        textRadius={textRadius}
        fontSize={fontSize}
        rotationSpeed={rotationSpeed}
      />
    </Canvas>
  );
}
