"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Scene from "./scene/Scene";
import { API_BASE, SEED, CAMERA_SPEED } from "./lib/constants";
import { mulberry32, generatePlanes } from "./lib/planeGenerator";

// Playback Controls UI
function PlaybackControls({
  isPlaying,
  onTogglePlay,
  cameraSpeed,
  onCameraSpeedChange,
}) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
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
        max={100}
        value={cameraSpeed}
        onChange={(e) => onCameraSpeedChange(Number(e.target.value))}
        className="w-24 accent-white"
      />
    </div>
  );
}

export default function DisplayScene({ recordId }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(CAMERA_SPEED);

  // API fetch
  useEffect(() => {
    if (!recordId) return;

    async function fetchMedia() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/record/${recordId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const mediaItems = data?.data?.mediaList;

        if (mediaItems && mediaItems.length > 0) {
          const images = mediaItems.filter((m) => m.type === "image");
          setMediaList(images);
        } else {
          throw new Error("No media found");
        }
      } catch (err) {
        console.error("Failed to fetch media:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [recordId]);

  const planes = useMemo(() => {
    if (mediaList.length === 0) return [];
    const rng = mulberry32(SEED);
    return generatePlanes(rng, mediaList);
  }, [mediaList]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
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
      />

      <Canvas
        camera={{
          position: [0, 0, 300],
          fov: 80,
          near: 0.1,
          far: 15000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene
            planes={planes}
            isPlaying={isPlaying}
            cameraSpeed={cameraSpeed}
          />
        </Suspense>
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.8} radius={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
