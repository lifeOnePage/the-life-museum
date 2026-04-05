"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Text } from "@react-three/drei";

const LandingTypography = dynamic(() => import("./LandingTypography"), {
  ssr: false,
});

const RING_COUNT = 80;
const RING_RADIUS = 200;
const RING_SPEED = 0.003;
const ENTRANCE_OFFSET = 80;
const STAGGER = 0.02;
const DURATION = 2;

const RADIAL_ARC_DEG = 60; // 방사 텍스트가 차지할 호의 각도
const RADIAL_ARC_RAD = (Math.PI / 180) * RADIAL_ARC_DEG;

const COLORS = {
  background: "#151515",
  object: "rgba(10, 10, 10, 1)",
  light: "#fff",
};

function getDummyImageUrls() {
  const imageNames = [
    "_ (1).jpeg",
    "_ (2).jpeg",
    "_ (3).jpeg",
    "_ (4).jpeg",
    "_ (5).jpeg",
    "_ (6).jpeg",
    "_ (7).jpeg",
    "_ (8).jpeg",
    "_ (9).jpeg",
    "_ (10).jpeg",
    "_ (12).jpeg",
    "_ (13).jpeg",
    "_ (14).jpeg",
    "_ (15).jpeg",
    "_ (16).jpeg",
    "_ (17).jpeg",
    "_ (18).jpeg",
    "_ (19).jpeg",
    "_ (20).jpeg",
    "_ (21).jpeg",
    "_ (22).jpeg",
    "_ (23).jpeg",
    "_ (24).jpeg",
    "_ (25).jpeg",
    "_ (26).jpeg",
    "_ (27).jpeg",
    "_ (28).jpeg",
    "_ (29).jpeg",
    "_ (30).jpeg",
    "_ (31).jpeg",
    "_ (32).jpeg",
    "_ (33).jpeg",
    "_ (34).jpeg",
    "_ (35).jpeg",
    "_ (36).jpeg",
    "_ (37).jpeg",
    "_ (38).jpeg",
    "_ (39).jpeg",
    "_ (40).jpeg",
    "_ (42).jpeg",
  ];
  return imageNames.map((name) => `/images/dummy/${encodeURIComponent(name)}`);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function RingPlane({ outDir, quat, delay, currentRadiusRef, imageUrl }) {
  const meshRef = useRef();
  const matRef = useRef(null);
  const startedAt = useRef(null);
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(imageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setTexture(tex);
      });
    }
  }, [imageUrl]);

  useFrame((state) => {
    if (!startedAt.current) startedAt.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - startedAt.current;

    const p = THREE.MathUtils.clamp((elapsed - delay) / DURATION, 0, 1);
    const e = easeOutCubic(p);

    const r = currentRadiusRef.current + ENTRANCE_OFFSET * (1 - e);

    if (meshRef.current) {
      meshRef.current.position.copy(outDir).multiplyScalar(r);
      meshRef.current.quaternion.copy(quat);
    }

    const targetOpacity = 0.65 * e;
    if (matRef.current) {
      matRef.current.opacity = targetOpacity;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[100, 70, 128, 128]} />
      {texture ? (
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          side={THREE.DoubleSide}
          opacity={0.1}
          toneMapped={false}
        />
      ) : (
        <meshStandardMaterial
          ref={matRef}
          color={COLORS.object}
          transparent
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}

function ImageRing() {
  const group = useRef();
  const speed = useRef(0);
  const tiltGroup = useRef();
  const currentRadius = useRef(RING_RADIUS);

  const imageUrls = useMemo(() => getDummyImageUrls(), []);

  const planes = useMemo(() => {
    const arr = [];
    const mid = (RING_COUNT - 1) / 2;
    for (let j = 0; j < RING_COUNT; j++) {
      const angle = (Math.PI * 2 * j) / RING_COUNT;

      const outDir = new THREE.Vector3(
        0,
        Math.cos(angle),
        Math.sin(angle),
      ).normalize();

      const inDir = outDir.clone().multiplyScalar(-1);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        inDir,
      );

      const order = Math.abs(j - mid);
      const delay = order * STAGGER;

      const imageUrl = imageUrls[j % imageUrls.length];

      arr.push({ j, outDir, quat, delay, imageUrl });
    }
    return arr;
  }, [imageUrls]);

  useFrame(() => {
    const targetSpeed = RING_SPEED;
    speed.current = THREE.MathUtils.lerp(speed.current, targetSpeed, 0.03);
    if (group.current) group.current.rotation.x += speed.current;

    const targetRadius = RING_RADIUS;
    currentRadius.current = THREE.MathUtils.lerp(
      currentRadius.current,
      targetRadius,
      0.05,
    );

    if (tiltGroup.current) {
      tiltGroup.current.rotation.x = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.x,
        -0.1,
        0.05,
      );
      tiltGroup.current.rotation.y = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.y,
        -0.2,
        0.05,
      );
    }
  });

  return (
    <group ref={tiltGroup}>
      <group ref={group}>
        {planes.map(({ j, outDir, quat, delay, imageUrl }) => (
          <RingPlane
            key={j}
            outDir={outDir}
            quat={quat}
            delay={delay}
            currentRadiusRef={currentRadius}
            imageUrl={imageUrl}
          />
        ))}
      </group>
    </group>
  );
}

/**
 * 방사 텍스트:
 * - 레코드판과 같은 평면(XZ)에 놓임 (group rotation으로 90도 회전)
 * - 60도 호 안에만 n등분하여 배치
 * - 각 텍스트는 레코드판 엣지에서 시작 (anchorX="left", radius = discRadius * 1.02)
 * - 텍스트는 레코드판 중심에서 바깥으로 방사형으로 뻗어나가는 방향으로 정렬
 */
function RadialTextRing({ discRadius }) {
  const texts = [
    "THE LIFE MUSEUM",
    "ARCHIVE YOUR STORY",
    "PRESERVE YOUR MEMORIES",
    "CHRONICLE YOUR JOURNEY",
    "CAPTURE EVERY MOMENT",
    "YOUR LEGACY LIVES ON",
    "MEMORIES NEVER FADE",
    "TIMELESS MOMENTS",
  ];

  if (!discRadius) return null;

  // 레코드판 엣지 바로 밖에서 시작하도록 약간 여유
  const innerRadius = discRadius * 1.02;
  // 폰트 크기: 레코드판 크기에 비례하게 크게
  const fontSize = discRadius * 0.08;

  const count = texts.length;
  const startAngle = -RADIAL_ARC_RAD / 2;
  const endAngle = RADIAL_ARC_RAD / 2;

  return (
    // Text 기본 평면(XY)을 XZ 평면으로 회전시켜 레코드판과 같은 평면에 두기
    <group rotation={[Math.PI / 2, 0, 0]}>
      {texts.map((text, index) => {
        const t = count === 1 ? 0.5 : index / (count - 1); // 0~1 사이 등분
        const angle = THREE.MathUtils.lerp(startAngle, endAngle, t);

        // 레코드판 중심에서 엣지까지의 반지름 방향으로 위치
        const x = Math.cos(angle) * innerRadius;
        const y = Math.sin(angle) * innerRadius; // group 회전 전 기준 (XY)

        // Text는 로컬 +X 방향으로 문자열이 뻗어나가므로,
        // rotation.z = angle, anchorX="left"로 두면
        // 중심에서 엣지 지점에서 바깥 방향으로 텍스트가 뻗어나가는 방사형이 됨
        return (
          <Text
            key={index}
            position={[x, y, 0]}
            rotation={[0, 0, angle]}
            fontSize={fontSize}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
          >
            {text}
          </Text>
        );
      })}
    </group>
  );
}

/**
 * 레코드판 + 방사 텍스트를 하나의 시스템으로 합친 컴포넌트
 * - 레코드판 모델 중심을 원점으로 정렬
 * - 바운딩 박스로 레코드판 반지름 계산 → 텍스트 시작 위치를 엣지에 맞춤
 * - 레코드판 평면(XZ)의 법선축(Y축)을 기준으로 회전(spinRef.rotation.y)
 * - 위치/기울기/스케일 애니메이션은 outerRef가 담당 (이전 LPDisc 느낌 유지)
 */
function DiscSystem() {
  const outerRef = useRef(null); // 위치/스케일
  const tiltRef = useRef(null); // 디스크 기울기(시점용)
  const spinRef = useRef(null); // 실제 회전축
  const startedAt = useRef(null);
  const [model, setModel] = useState(null);
  const [discRadius, setDiscRadius] = useState(null);

  useEffect(() => {
    const loader = new OBJLoader();
    loader.load(
      "/model/Vinyl_disc.obj",
      (obj) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: "#555",
              roughness: 0.4,
              metalness: 0.8,
              side: THREE.DoubleSide,
            });
          }
        });

        // 중심 정렬
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        obj.position.sub(center);

        obj.rotation.z = Math.PI / 2;

        // 반지름 계산
        const size = new THREE.Vector3();
        box.getSize(size);
        const radius = Math.max(size.x, size.z) / 2;
        setDiscRadius(radius);

        setModel(obj);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      },
    );
  }, []);

  useFrame((state) => {
    if (!outerRef.current || !spinRef.current || !tiltRef.current) return;
    if (!startedAt.current) startedAt.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - startedAt.current;

    const p = THREE.MathUtils.clamp(elapsed / DURATION, 0, 1);
    const e = easeOutCubic(p);

    // 1) 등장 애니메이션: 위치 + 스케일만 outerRef에 적용
    const targetX = 200;
    const targetY = 0;
    const targetZ = 0;
    outerRef.current.position.x = THREE.MathUtils.lerp(400, targetX, e);
    outerRef.current.position.y = THREE.MathUtils.lerp(100, targetY, e);
    outerRef.current.position.z = THREE.MathUtils.lerp(200, targetZ, e);

    const targetScale = 80;
    const currentScale = THREE.MathUtils.lerp(0, targetScale, e);
    outerRef.current.scale.set(currentScale, currentScale, currentScale);

    // 🎯 2) 디스크 기본 기울기: tiltRef에만 적용 (카메라에 잘 보이도록)
    const baseRotX = Math.PI / 4; // 45도 정도 위에서 내려다보는 느낌
    const baseRotY = -Math.PI / 6; // 약간 왼쪽으로 틀기

    const wobbleX = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    const wobbleY = Math.cos(state.clock.elapsedTime * 0.2) * 0.06;

    // 등장 시에는 0 -> base로 lerp
    tiltRef.current.rotation.x = THREE.MathUtils.lerp(0, baseRotX + wobbleX, e);
    tiltRef.current.rotation.y = THREE.MathUtils.lerp(0, baseRotY + wobbleY, e);

    // 🌀 3) 실제 스핀: spinRef의 로컬 Y축 = 디스크 평면에 수직
    spinRef.current.rotation.y += 0.02; // 속도는 취향에 맞게 조절
  });

  if (!model) return null;

  return (
    <group ref={outerRef}>
      <group ref={tiltRef}>
        <group ref={spinRef}>
          {/* 레코드판 모델 (중심이 원점, z축 90도 회전 적용됨) */}
          <primitive object={model} />
          {/* 레코드판 엣지에서 시작하는 방사 텍스트 (이미 평면 일치 상태) */}
          <RadialTextRing discRadius={discRadius} />
        </group>
      </group>
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight
        color={COLORS.light}
        intensity={3}
        position={[-3, 5, 3]}
      />
      <pointLight position={[200, 50, 50]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-100, 50, 50]} intensity={0.8} color="#fff" />
      <spotLight
        position={[250, 50, 50]}
        angle={0.6}
        penumbra={10}
        intensity={2.0}
        castShadow={false}
      />
      <ImageRing />
      <DiscSystem />
    </>
  );
}

export default function Landing() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: COLORS.background,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      >
        <Canvas
          dpr={[1, 2]}
          style={{ width: "100%", height: "100%" }}
          camera={{
            position: [-300, -180, 400],
            rotation: [0.5, -0.79, 0.37],
            fov: 50,
          }}
        >
          <fog attach="fog" args={["#151515", 400, 850]} />
          <SceneContent />
        </Canvas>
      </motion.div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <LandingTypography />
      </div>
    </div>
  );
}
