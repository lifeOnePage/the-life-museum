"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AlbumCover3D from "@/app/library/edit/[record_id]/components/AlbumCover3D";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const ALBUM_SIZE = 1.4;
const ALBUM_THICKNESS = 0.02;

// ── FlippableAlbum ──────────────────────────────────────────
function FlippableAlbum({ isFlipped, ...props }) {
  const groupRef = useRef();
  const targetRotY = useRef(0);

  useEffect(() => {
    targetRotY.current = isFlipped ? Math.PI : 0;
  }, [isFlipped]);

  useFrame((_, delta) => {
    const factor = 1 - Math.pow(0.001, delta);
    groupRef.current.rotation.y +=
      (targetRotY.current - groupRef.current.rotation.y) * factor;
  });

  return (
    <group ref={groupRef}>
      <AlbumCover3D {...props} isSelected={false} isFlipped={false} />
    </group>
  );
}

// ── Wall ────────────────────────────────────────────────────
function Wall() {
  const wallTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#c8c4bc";
    ctx.fillRect(0, 0, size, size);

    // Subtle noise
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 6;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, -0.15]}>
      <planeGeometry args={[20, 15]} />
      <meshStandardMaterial map={wallTexture} roughness={0.95} />
    </mesh>
  );
}

// ── Potted Flower ───────────────────────────────────────────
function PottedPlant({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.2, 16]} />
        <meshStandardMaterial color="#c4956a" roughness={0.85} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.13, 0.12, 0.03, 16]} />
        <meshStandardMaterial color="#b88860" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.2, 0.05]}>
        <circleGeometry args={[0.11, 16]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* Main stem */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#5a7a4a" roughness={0.8} />
      </mesh>
      {/* Leaves on stem */}
      <Leaf position={[0.04, 0.32, 0.01]} rotation={[0.2, 0, 0.6]} />
      <Leaf position={[-0.04, 0.42, -0.01]} rotation={[-0.1, Math.PI, -0.5]} />
      {/* Flower */}
      {/* <Flower position={[0, 0.62, 0]} /> */}
    </group>
  );
}

function Flower({ position }) {
  const petalColor = "#e8a0b4";
  const centerColor = "#f5d76e";
  const petalCount = 6;

  return (
    <group position={position}>
      {/* Petals arranged in circle */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i / petalCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.04, Math.sin(angle) * 0.04, 0]}
            rotation={[0, 0, angle]}
          >
            <sphereGeometry args={[0.04, 12, 8]} />
            <meshStandardMaterial color={petalColor} roughness={0.6} />
          </mesh>
        );
      })}
      {/* Center */}
      <mesh>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={centerColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Leaf({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.1, 0.05]} />
      <meshStandardMaterial
        color="#6b9b4f"
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Shelf ───────────────────────────────────────────────────
function Shelf({ y = -2.1, width = 3.0 }) {
  const shelfColor = "#96784a";
  const bracketColor = "#7a6340";

  return (
    <group position={[0, y, 0]}>
      {/* Shelf plank */}
      <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.04, 0.25]} />
        <meshStandardMaterial
          color={shelfColor}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Left bracket */}
      <mesh position={[-width / 2 + 0.2, -0.08, 0.02]}>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={bracketColor} roughness={0.6} />
      </mesh>

      {/* Right bracket */}
      <mesh position={[width / 2 - 0.2, -0.08, 0.02]}>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={bracketColor} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── Main ShareScene ─────────────────────────────────────────
export default function ShareScene({
  frontCover,
  bio,
  timeline,
  selectedTheme,
  albumTitle,
  albumSubTitle,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontCoverImg, setFrontCoverImg] = useState(null);
  const [extractedColors, setExtractedColors] = useState(null);
  const [themeBgImg, setThemeBgImg] = useState(null);
  const [themeStickerImg, setThemeStickerImg] = useState(null);

  // Load theme background image and sticker
  useEffect(() => {
    const key = selectedTheme || "minimalist";
    const bgMap = {
      kitsch: "/images/albumtheme/kitsch.png",
      illustration: "/images/albumtheme/illustration.png",
      travel: "/images/albumtheme/travel/travel1_back.svg",
    };
    const bgSrc = bgMap[key];
    if (!bgSrc) {
      setThemeBgImg(null);
      setThemeStickerImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setThemeBgImg(img);
    img.onerror = () => setThemeBgImg(null);
    img.src = bgSrc;

    if (key === "kitsch") {
      const sticker = new Image();
      sticker.onload = () => setThemeStickerImg(sticker);
      sticker.onerror = () => setThemeStickerImg(null);
      sticker.src = "/images/albumtheme/kitsch 2.png";
    } else {
      setThemeStickerImg(null);
    }
  }, [selectedTheme]);

  // Load front cover as HTMLImageElement for canvas drawing
  useEffect(() => {
    if (!frontCover || typeof document === "undefined") {
      setFrontCoverImg(null);
      setExtractedColors(null);
      return;
    }

    const lower = frontCover.toLowerCase().split("?")[0];
    const isVideo =
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov");
    if (isVideo) {
      setFrontCoverImg(null);
      return;
    }

    const img = new Image();
    if (!frontCover.startsWith("blob:") && !frontCover.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => setFrontCoverImg(img);
    img.onerror = () => setFrontCoverImg(null);
    img.src = frontCover;
  }, [frontCover]);

  // Extract dominant colors from front cover
  useEffect(() => {
    if (!frontCoverImg) {
      setExtractedColors(null);
      return;
    }
    extractColors(frontCoverImg, { pixels: 10000, distance: 0.2 })
      .then((colors) => {
        const main = colors.sort((a, b) => b.area - a.area)[0];
        if (!main) return;
        const { red, green, blue } = main;
        const variants = [0.4, 0.7, 1.0].map((factor) => {
          const r = Math.min(255, Math.round(red * factor));
          const g = Math.min(255, Math.round(green * factor));
          const b = Math.min(255, Math.round(blue * factor));
          return `rgb(${r}, ${g}, ${b})`;
        });
        setExtractedColors(variants);
      })
      .catch(() => setExtractedColors(null));
  }, [frontCoverImg]);

  const themeKey = selectedTheme || "minimalist";

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(
      themeKey,
      bio || "",
      timeline || [],
      frontCoverImg,
      albumTitle || "",
      albumSubTitle || "",
      extractedColors,
      themeBgImg,
      themeStickerImg,
    );
  }, [
    themeKey,
    bio,
    timeline,
    frontCoverImg,
    albumTitle,
    albumSubTitle,
    extractedColors,
    themeBgImg,
    themeStickerImg,
  ]);

  // Drag-to-flip
  const dragStartX = useRef(null);

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) {
      setIsFlipped((f) => !f);
    }
    dragStartX.current = null;
  };

  return (
    <div className="relative h-full w-full">
      {/* Flip button */}
      <button
        onClick={() => setIsFlipped((f) => !f)}
        className="absolute top-4 left-1/2 z-10 -translate-x-1/2 text-[11px] font-light tracking-[0.2em] text-black/40 transition-colors hover:text-black/70"
      >
        {isFlipped ? "앞면" : "뒷면"} 보기
      </button>
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragStartX.current = null;
        }}
      >
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
          camera={{ position: [0, -0.15, 5.5], fov: 32 }}
          shadows
        >
          <color attach="background" args={["#0a0a0a"]} />

          {/* Museum lighting */}
          <ambientLight intensity={0.15} />
          <spotLight
            position={[0, 3.5, 2]}
            target-position={[0, 0, 0]}
            color="#FFE0B2"
            intensity={80}
            angle={0.45}
            penumbra={0.6}
            decay={2}
            distance={12}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight
            position={[0, 2.5, 1.5]}
            color="#FFD59E"
            intensity={3}
            distance={8}
            decay={2}
          />
          <directionalLight position={[2, 2, 3]} intensity={0.3} />

          <Wall />

          {/* Album leaning on shelf — tilted back ~12° */}
          {/* <group position={[-0.4, -0.14, 0]} rotation={[-0.21, 0, 0]}>
            <FlippableAlbum
              isFlipped={isFlipped}
              size={ALBUM_SIZE}
              thickness={ALBUM_THICKNESS}
              frontImage={frontCover}
              backImage={backCoverDataUrl}
            />
          </group> */}

          {/* <PottedPlant position={[0.75, -0.85, 0.1]} /> */}

          {/* <Shelf y={-0.85} /> */}

          <EffectComposer>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
