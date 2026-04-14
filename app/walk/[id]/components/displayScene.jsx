"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import { LogOut } from "lucide-react";
import Scene from "./scene/Scene";
import { SEED, CAMERA_SPEED, getTextureConfig } from "./lib/constants";
import { mulberry32, generatePlanes } from "./lib/planeGenerator";
import { useRecordData } from "@/app/lib/useRecordData";

// Playback Controls UI
function PlaybackControls({
  isPlaying,
  onTogglePlay,
  cameraSpeed,
  onCameraSpeedChange,
  onExit,
}) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
      <button
        onClick={onExit}
        className="flex h-10 items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm whitespace-nowrap text-white transition-colors hover:bg-white/30"
      >
        <LogOut className="h-4 w-4" />
        나가기
      </button>

      <div className="h-6 w-px bg-white/20" />

      <button
        onClick={onTogglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <input
        type="range"
        min={5}
        max={300}
        value={cameraSpeed}
        onChange={(e) => onCameraSpeedChange(Number(e.target.value))}
        className="w-24 accent-white"
      />
    </div>
  );
}

export default function DisplayScene({ recordId }) {
  const router = useRouter();
  const { data: recordData, loading, error } = useRecordData(recordId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(CAMERA_SPEED);
  const textureConfig = useMemo(() => getTextureConfig(), []);

  const mediaList = useMemo(
    () => (recordData?.mediaList ?? []).filter((m) => m.type === "image"),
    [recordData],
  );

  const planes = useMemo(() => {
    if (mediaList.length === 0) return [];
    const rng = mulberry32(SEED);
    return generatePlanes(rng, mediaList);
  }, [mediaList]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleAutoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">Loading...</div>
          <div className="text-sm text-gray-400">
            Fetching media from server
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl text-red-500">Error</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  // if (recordData?.isPublic === false) {
  //   return (
  //     <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
  //       <p className="text-2xl">🔒</p>
  //       <p className="text-sm font-light tracking-wide text-white/60">
  //         비공개 앨범입니다
  //       </p>
  //       <p className="text-xs tracking-wider text-white/30">
  //         앨범 소유자만 열람할 수 있어요
  //       </p>
  //     </div>
  //   );
  // }

  if (mediaList.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">No Media Found</div>
          <div className="text-sm text-gray-400">
            The album appears to be empty
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <PlaybackControls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        cameraSpeed={cameraSpeed}
        onCameraSpeedChange={setCameraSpeed}
        onExit={() => router.back()}
      />

      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 300],
          fov: 80,
          near: 0.1,
          far: 7200,
        }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene
            planes={planes}
            isPlaying={isPlaying}
            cameraSpeed={cameraSpeed}
            textureConfig={textureConfig}
            onAutoPlay={handleAutoPlay}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
