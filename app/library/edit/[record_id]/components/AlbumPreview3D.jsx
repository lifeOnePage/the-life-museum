"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ZoomIn, ZoomOut } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";
import generateBackCoverDataUrl from "../../../utils/generateBackCover";

const ALBUM_CONFIG = {
  size: 1.8,
  thickness: 0.03,
  tiltAngle: 0,
};

const ZOOM_MIN = 4;
const ZOOM_MAX = 8;
const ZOOM_STEP = 0.5;
const ZOOM_DEFAULT = 6;

function CameraZoom({ zoom }) {
  const { camera } = useThree();
  const targetZ = useRef(zoom);
  targetZ.current = zoom;

  useEffect(() => {
    camera.position.z = zoom;
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  return null;
}

export default function AlbumPreview3D({ frontCover, bio, timeline, textColor, bgColor, keyColor }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
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

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(bio || "", timeline || [], bgColor || "#ffffff", textColor, keyColor);
  }, [bio, timeline, bgColor, textColor, keyColor]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex shrink-0 items-center gap-3 py-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX))}
          disabled={zoom >= ZOOM_MAX}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsFlipped((f) => !f)}
          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          {isFlipped ? "앞면" : "뒷면"} 보기
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN))}
          disabled={zoom <= ZOOM_MIN}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <div
        className="min-h-0 w-full flex-1 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { dragStartX.current = null; }}
      >
        <Canvas
          camera={{ position: [0, 1.6, 6], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={0.8} />
          <directionalLight position={[-2, 1, 2]} intensity={3} />
          <CameraZoom zoom={zoom} />
          <AlbumCover3D
            index={0}
            position={[0, 0, 0]}
            size={ALBUM_CONFIG.size}
            thickness={ALBUM_CONFIG.thickness}
            tiltAngle={ALBUM_CONFIG.tiltAngle}
            frontImage={frontCover}
            backImage={backCoverDataUrl}
            edgeColor={bgColor}
            isSelected={true}
            isFlipped={isFlipped}
            onClick={() => setIsFlipped((f) => !f)}
          />
        </Canvas>
      </div>
    </div>
  );
}
