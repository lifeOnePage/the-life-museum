"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import AlbumCover3D from "@/app/library/edit/[record_id]/components/AlbumCover3D";
import { UNIFIED_THEMES } from "@/app/library/edit/[record_id]/themeConfig";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import ListeningBooth from "./ListeningBooth";

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
    <group ref={groupRef} position={[0, -0.2, -0.1]}>
      <AlbumCover3D {...props} isSelected={false} isFlipped={false} />
    </group>
  );
}

function SpotLightWithTarget() {
  const spotRef = useRef();
  const targetRef = useRef();

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <>
      <spotLight
        ref={spotRef}
        position={[0, 1.0, 0.1]}
        color="#FFE4C4"
        intensity={3}
        angle={0.6}
        penumbra={0.5}
        castShadow
      />
      <object3D ref={targetRef} position={[0, -1.2, -0.1]} />
    </>
  );
}

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
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.elegant;

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

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div
        className="min-h-0 w-full flex-1 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragStartX.current = null;
        }}
      >
        <Canvas
          camera={{ position: [0, -0.1, 4.5], fov: 30 }}
          gl={{ antialias: true }}
          shadows
        >
          <color attach="background" args={["#0a0a0a"]} />

          {/* Lighting */}
          <SpotLightWithTarget />
          <ambientLight color="#ffffff" intensity={0.15} />
          <pointLight position={[0, 0.5, 0.6]} color="#FFF5E6" intensity={0.5} />

          {/* Niche */}
          <ListeningBooth />

          {/* Album */}
          <FlippableAlbum
            isFlipped={isFlipped}
            index={0}
            position={[0, 0, 0]}
            size={ALBUM_SIZE}
            thickness={ALBUM_THICKNESS}
            tiltAngle={0}
            frontImage={frontCover}
            backImage={backCoverDataUrl}
            edgeColor={theme.bg}
            onClick={() => setIsFlipped((f) => !f)}
          />
        </Canvas>
      </div>

      {/* Flip button */}
      <button
        onClick={() => setIsFlipped((f) => !f)}
        className="shrink-0 py-3 text-[11px] font-light tracking-[0.2em] text-white/40 transition-colors hover:text-white/70"
      >
        {isFlipped ? "앞면" : "뒷면"} 보기
      </button>
    </div>
  );
}
