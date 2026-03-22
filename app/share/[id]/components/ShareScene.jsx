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

// ── VinylRecord ─────────────────────────────────────────────
function VinylRecord({ radius = 0.65, labelColor = "#E85D3A" }) {
  const texture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const cx = size / 2;
    const cy = size / 2;
    const discR = size / 2;

    // Black disc
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, Math.PI * 2);
    ctx.fill();

    // Concentric grooves
    for (let r = discR * 0.32; r < discR * 0.95; r += 2) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = r % 4 < 2 ? "rgba(40,40,40,0.6)" : "rgba(55,55,55,0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Diagonal sheen gradient
    const sheen = ctx.createLinearGradient(0, 0, size, size);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.45, "rgba(255,255,255,0.04)");
    sheen.addColorStop(0.55, "rgba(255,255,255,0.08)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, Math.PI * 2);
    ctx.fill();

    // Center label
    const labelR = discR * 0.3;
    const labelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, labelR);
    labelGrad.addColorStop(0, lightenColor(labelColor, 1.4));
    labelGrad.addColorStop(1, labelColor);
    ctx.fillStyle = labelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, labelR, 0, Math.PI * 2);
    ctx.fill();

    // Decorative ring on label
    ctx.beginPath();
    ctx.arc(cx, cy, labelR * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spindle hole
    ctx.beginPath();
    ctx.arc(cx, cy, labelR * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [labelColor]);

  return (
    <mesh position={[0.55, 0, -0.01]}>
      <circleGeometry args={[radius, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.2}
        metalness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function lightenColor(str, factor) {
  const c = hexToRgb(str);
  if (!c) return str;
  const r = Math.min(255, Math.round(c.r * factor));
  const g = Math.min(255, Math.round(c.g * factor));
  const b = Math.min(255, Math.round(c.b * factor));
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(str) {
  // Handle rgb(r,g,b) strings
  const rgbMatch = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }
  // Handle hex
  const hex = str.replace("#", "");
  if (hex.length !== 6) return null;
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

// ── FrameDisplay (shadow-box style) ────────────────────────
function FrameDisplay({
  width = 2.9,
  height = 1.7,
  borderSize = 0.045,
  children,
}) {
  const frameColor = "#a3845b";
  const matColor = "#fff8f0";

  return (
    <group>
      {/* Back mat */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color={matColor} roughness={0.9} />
      </mesh>

      {/* Top border */}
      <mesh position={[0, height / 2 - borderSize / 2, 0]}>
        <boxGeometry args={[width, borderSize, 0.06]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Bottom border */}
      <mesh position={[0, -height / 2 + borderSize / 2, 0]}>
        <boxGeometry args={[width, borderSize, 0.06]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Left border */}
      <mesh position={[-width / 2 + borderSize / 2, 0, 0]}>
        <boxGeometry args={[borderSize, height, 0.06]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Right border */}
      <mesh position={[width / 2 - borderSize / 2, 0, 0]}>
        <boxGeometry args={[borderSize, height, 0.06]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Content inside the frame */}
      {children}
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

// ── Shelf ───────────────────────────────────────────────────
function Shelf({ y = -1.1, width = 3.1 }) {
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
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontCoverImg, setFrontCoverImg] = useState(null);
  const [extractedColors, setExtractedColors] = useState(null);

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
    img.crossOrigin = "anonymous";
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

  const themeKey = selectedTheme || "elegant";

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(
      themeKey,
      bio || "",
      timeline || [],
      frontCoverImg,
      albumTitle || "",
      extractedColors,
    );
  }, [themeKey, bio, timeline, frontCoverImg, albumTitle, extractedColors]);

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

  const accentColor = extractedColors?.[2] || "#E85D3A";

  return (
    <div className="relative h-full w-full">
      {/* Flip button */}
      <button
        onClick={() => setIsFlipped((f) => !f)}
        className="absolute top-4 left-1/2 z-10 -translate-x-1/2 text-[11px] font-light tracking-[0.2em] text-white/40 transition-colors hover:text-white/70"
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
        <Canvas camera={{ position: [0, -0.15, 5.5], fov: 32 }} shadows>
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
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
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

          <FrameDisplay>
            <FlippableAlbum
              isFlipped={isFlipped}
              position={[-0.3, 0, 0.02]}
              size={ALBUM_SIZE}
              thickness={ALBUM_THICKNESS}
              frontImage={frontCover}
              backImage={backCoverDataUrl}
            />
            <VinylRecord radius={0.65} labelColor={accentColor} />
          </FrameDisplay>

          <Shelf y={-1.1} />

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
