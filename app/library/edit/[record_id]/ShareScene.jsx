"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import AlbumCover3D from "@/app/library/edit/[record_id]/components/AlbumCover3D";
import { UNIFIED_THEMES } from "@/app/library/edit/[record_id]/themeConfig";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

const ALBUM_SIZE = 1.8;
const ALBUM_THICKNESS = 0.03;

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
    <group ref={groupRef} position={[0, 0.15, -0.1]}>
      <AlbumCover3D {...props} isSelected={false} isFlipped={false} />
    </group>
  );
}

import * as THREE from "three";

function AlbumGlow({ color }) {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      10,
      size / 2,
      size / 2,
      size / 2,
    );

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, [color]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 1]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial
        map={texture}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

import { MeshReflectorMaterial } from "@react-three/drei";

function ReflectiveFloor() {
  const matRef = useRef();

  // Generate a procedural water normal map
  const normalMap = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx =
          Math.sin(x * 0.15) * Math.cos(y * 0.1) * 0.5 +
          Math.sin(x * 0.05 + y * 0.08) * 0.3;
        const ny =
          Math.cos(x * 0.1) * Math.sin(y * 0.15) * 0.5 +
          Math.cos(x * 0.08 + y * 0.05) * 0.3;
        data[i] = ((nx * 0.1 + 0.5) * 255) | 0;
        data[i + 1] = ((ny * 0.5 + 0.5) * 255) | 0;
        data[i + 2] = 200;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  // Animate normal map offset for ripple effect
  useFrame((_, delta) => {
    if (normalMap) {
      normalMap.offset.x += delta * 0.02;
      normalMap.offset.y += delta * 0.015;
    }
  });

  return (
    // <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 1.8]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
      {/* <planeGeometry args={[5, 5]} /> */}
      <planeGeometry args={[8, 8]} />

      <MeshReflectorMaterial
        ref={matRef}
        resolution={1024}
        mirror={1}
        mixBlur={3}
        mixStrength={2}
        blur={[400, 100]}
        color="#333"
        // color="90d5ff"
        metalness={0.6}
        roughness={0.2}
        // normalMap={normalMap}
        // normalScale={[0.3, 0.3]}
      />
    </mesh>
  );
}

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

  const themeKey = selectedTheme || "minimalist";
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.minimalist;

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
  }, [themeKey, bio, timeline, frontCoverImg, albumTitle, albumSubTitle, extractedColors, themeBgImg, themeStickerImg]);

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
      {/* Flip button — absolute top center */}
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
        <Canvas camera={{ position: [0, -0.1, 5.5], fov: 30 }} shadows>
          <color attach="background" args={["#050505"]} />

          <ambientLight intensity={0.2} />

          <directionalLight position={[0, 3, 4]} intensity={1.5} />

          <pointLight
            position={[0, 0.5, 1]}
            intensity={2}
            color={extractedColors?.[2] || "#ff0000"}
          />

          <FlippableAlbum
            isFlipped={isFlipped}
            size={ALBUM_SIZE}
            thickness={ALBUM_THICKNESS}
            frontImage={frontCover}
            backImage={backCoverDataUrl}
          />

          <AlbumGlow color={extractedColors?.[2] || "#ff0000"} />

          <ReflectiveFloor />

          <EffectComposer>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
