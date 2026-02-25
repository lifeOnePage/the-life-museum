import { Suspense, useRef, useMemo, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import WallPlane from "./WallPlane";
import FocusClone from "./FocusClone";
import MirrorReflection from "./MirrorReflection";
import GlowBorder from "./GlowBorder";
import {
  CAMERA_SPEED,
  CAMERA_START_Z,
  DISPLAY_OFFSET_Z,
  DISPLAY_SCALE,
  FOCUS_SEARCH_RANGE,
  FOCUS_DISMISS_DISTANCE,
  FOCUS_FADE_SPEED,
  FLOOR_Y,
  FLOOR_COLOR,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  BASE_HEIGHT,
} from "../lib/constants";

export default function Scene({ planes, isPlaying }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const dirLightRef = useRef();

  // Texture cache: { [planeId]: { texture, aspectRatio } }
  const textureMap = useRef(new Map());

  // React state for focus mode - drives conditional rendering (mount/unmount)
  const [focusRender, setFocusRender] = useState({
    mode: "idle",
    targetId: null,
  });

  // Force re-render periodically so wrapped positions stay fresh
  const [renderTick, setRenderTick] = useState(0);

  // Camera & focus state (all in one ref to avoid re-renders)
  const state = useRef({
    cameraZ: CAMERA_START_Z,
    // Focus state machine
    focusMode: "idle", // 'idle' | 'auto' | 'manual'
    targetPlaneId: null,
    fadeProgress: 0,
    // Fixed Z position where clone was spawned (does NOT move with camera)
    focusCloneZ: 0,
    // For manual: the plane flies to camera, so we track its original position
    manualPlaneOriginalPos: null,
    // Seen planes for auto selection (avoid re-picking recently shown)
    recentAutoIds: new Set(),
    // Track if playing was just started
    initialized: false,
    // For periodic re-render trigger
    lastChunk: 0,
  });

  // Corridor span for wrapping
  const deepestZ = useMemo(() => {
    if (planes.length === 0) return -1000;
    return Math.min(...planes.map((p) => p.position[2]));
  }, [planes]);

  const shallowestZ = useMemo(() => {
    if (planes.length === 0) return 0;
    return Math.max(...planes.map((p) => p.position[2]));
  }, [planes]);

  const corridorSpan = useMemo(() => {
    if (planes.length === 0) return 1;
    return shallowestZ - deepestZ + 60;
  }, [shallowestZ, deepestZ]);

  // Wrap a Z position so it falls within [cameraZ + buffer, cameraZ + buffer - span]
  // This places each plane at the nearest repeating copy around the camera
  function wrapZ(originalZ, cameraZ) {
    const behindBuffer = 200;
    let delta = cameraZ + behindBuffer - originalZ;
    delta = ((delta % corridorSpan) + corridorSpan) % corridorSpan;
    return cameraZ + behindBuffer - delta;
  }

  // Handle texture loaded from WallPlane
  const handleTextureLoaded = useCallback((planeId, texture, aspectRatio) => {
    textureMap.current.set(planeId, { texture, aspectRatio });
  }, []);

  // Handle plane click for manual focus
  const handlePlaneClick = useCallback(
    (planeId) => {
      if (!isPlaying) return;
      const s = state.current;
      const plane = planes.find((p) => p.id === planeId);
      if (!plane) return;

      // Only allow clicking planes ahead of camera (use wrapped position)
      const wrappedPZ = wrapZ(plane.position[2], s.cameraZ);
      if (wrappedPZ >= s.cameraZ) return;

      // Switch to manual mode
      s.focusMode = "manual";
      s.targetPlaneId = planeId;
      s.fadeProgress = 0;
      s.focusCloneZ = s.cameraZ - DISPLAY_OFFSET_Z;
      s.manualPlaneOriginalPos = [
        plane.position[0],
        plane.position[1],
        wrappedPZ,
      ];
      setFocusRender({ mode: "manual", targetId: planeId });
    },
    [isPlaying, planes, corridorSpan],
  );

  // Pick a random plane ahead of camera for auto focus (uses wrapped positions)
  function pickAutoTarget(s) {
    const candidates = planes.filter((p) => {
      const wrappedPZ = wrapZ(p.position[2], s.cameraZ);
      const dz = s.cameraZ - wrappedPZ;
      return dz > 0 && dz < FOCUS_SEARCH_RANGE && !s.recentAutoIds.has(p.id);
    });

    if (candidates.length === 0) {
      // If all recent, clear the set and retry
      s.recentAutoIds.clear();
      const retry = planes.filter((p) => {
        const wrappedPZ = wrapZ(p.position[2], s.cameraZ);
        const dz = s.cameraZ - wrappedPZ;
        return dz > 0 && dz < FOCUS_SEARCH_RANGE;
      });
      if (retry.length === 0) return null;
      return retry[Math.floor(Math.random() * retry.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Reset when play starts
  if (isPlaying && !state.current.initialized) {
    state.current = {
      cameraZ: CAMERA_START_Z,
      focusMode: "idle",
      targetPlaneId: null,
      fadeProgress: 0,
      focusCloneZ: 0,
      manualPlaneOriginalPos: null,
      recentAutoIds: new Set(),
      initialized: true,
      lastChunk: Math.floor(CAMERA_START_Z / 500),
    };
    camera.position.set(0, 0, CAMERA_START_Z);
  }

  if (!isPlaying) {
    state.current.initialized = false;
    if (state.current.focusMode !== "idle") {
      state.current.focusMode = "idle";
      state.current.targetPlaneId = null;
      state.current.fadeProgress = 0;
      state.current.manualPlaneOriginalPos = null;
      setFocusRender({ mode: "idle", targetId: null });
    }
  }

  // OrbitControls toggle
  if (controlsRef.current) {
    controlsRef.current.enabled = !isPlaying;
  }

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const s = state.current;

    // 1. Camera always advances
    s.cameraZ -= CAMERA_SPEED * delta;
    camera.position.z = s.cameraZ;

    // Keep directional light following camera (forward direction)
    if (dirLightRef.current) {
      dirLightRef.current.position.set(0, 2, 0);
      dirLightRef.current.target.position.set(0, 0, 1);
      dirLightRef.current.target.updateMatrixWorld();
    }

    // 2. Periodic re-render to keep wrapped plane positions fresh
    const currentChunk = Math.floor(s.cameraZ / 500);
    if (currentChunk !== s.lastChunk) {
      s.lastChunk = currentChunk;
      setRenderTick((t) => t + 1);
    }

    // 3. Focus state machine
    if (s.focusMode === "idle") {
      // Pick new auto target
      const target = pickAutoTarget(s);
      if (target) {
        s.focusMode = "auto";
        s.targetPlaneId = target.id;
        s.fadeProgress = 0;
        s.focusCloneZ = s.cameraZ - DISPLAY_OFFSET_Z;
        s.recentAutoIds.add(target.id);
        setFocusRender({ mode: "auto", targetId: target.id });
      }
    } else if (s.focusMode === "auto" || s.focusMode === "manual") {
      // Update fade progress
      s.fadeProgress = Math.min(1, s.fadeProgress + FOCUS_FADE_SPEED * delta);

      // Dismiss when camera approaches the clone's fixed position
      const distToClone = Math.abs(s.cameraZ - s.focusCloneZ);

      if (distToClone < FOCUS_DISMISS_DISTANCE) {
        // Dismiss
        s.focusMode = "idle";
        s.targetPlaneId = null;
        s.fadeProgress = 0;
        s.focusCloneZ = 0;
        s.manualPlaneOriginalPos = null;

        // Immediately pick next auto
        const next = pickAutoTarget(s);
        if (next) {
          s.focusMode = "auto";
          s.targetPlaneId = next.id;
          s.fadeProgress = 0;
          s.focusCloneZ = s.cameraZ - DISPLAY_OFFSET_Z;
          s.recentAutoIds.add(next.id);
          setFocusRender({ mode: "auto", targetId: next.id });
        } else {
          setFocusRender({ mode: "idle", targetId: null });
        }
      }
    }
  });

  // Get current focus info for rendering (use focusRender React state)
  const camZ = state.current.cameraZ;

  const focusPlane =
    focusRender.targetId !== null
      ? planes.find((p) => p.id === focusRender.targetId)
      : null;
  const focusTexInfo =
    focusRender.targetId !== null
      ? textureMap.current.get(focusRender.targetId)
      : null;

  // Compute wrapped position for focused plane's GlowBorder
  const focusPlaneWrappedPos = focusPlane
    ? [
        focusPlane.position[0],
        focusPlane.position[1],
        wrapZ(focusPlane.position[2], camZ),
      ]
    : null;

  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />

      {/* Lighting */}
      <ambientLight intensity={6} />
      <directionalLight ref={dirLightRef} intensity={10} />
      <pointLight position={[-300, 80, camZ]} intensity={0.4} distance={2000} />
      <pointLight position={[300, 80, camZ]} intensity={0.4} distance={2000} />

      {/* Floor - follows camera for infinite appearance */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, camZ - 4000]}
        receiveShadow
      >
        <planeGeometry args={[400, 10000]} />
        <meshStandardMaterial
          color={FLOOR_COLOR}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Wall Planes - wrapped positions for infinite corridor */}
      {planes.map((p) => {
        const wrappedZ = wrapZ(p.position[2], camZ);
        const dist = Math.abs(camZ - wrappedZ);
        // Skip planes far beyond fog range
        if (dist > FOG_FAR + 500) return null;

        let focusMode = "none";
        if (focusRender.targetId === p.id) {
          if (focusRender.mode === "manual") {
            focusMode = "manual-display";
          } else if (focusRender.mode === "auto") {
            focusMode = "auto";
          }
        }

        return (
          <Suspense key={p.id} fallback={null}>
            <WallPlane
              id={p.id}
              imageUrl={p.imageUrl}
              position={[p.position[0], p.position[1], wrappedZ]}
              rotation={p.rotation}
              baseHeight={p.baseHeight}
              sign={p.sign}
              focusMode={focusMode}
              cameraPosition={[
                camera.position.x,
                camera.position.y,
                camera.position.z,
              ]}
              onClick={handlePlaneClick}
              onTextureLoaded={handleTextureLoaded}
              displayOffsetZ={DISPLAY_OFFSET_Z}
              displayScale={DISPLAY_SCALE}
            />
          </Suspense>
        );
      })}

      {/* Auto Focus: Clone + Mirror + GlowBorder */}
      {focusRender.mode === "auto" && focusTexInfo && focusPlane && (
        <>
          <FocusClone
            texture={focusTexInfo.texture}
            aspectRatio={focusTexInfo.aspectRatio}
            baseHeight={focusPlane.baseHeight}
            cameraY={camera.position.y}
            stateRef={state}
            displayScale={DISPLAY_SCALE}
          />
          <MirrorReflection
            texture={focusTexInfo.texture}
            aspectRatio={focusTexInfo.aspectRatio}
            baseHeight={focusPlane.baseHeight}
            stateRef={state}
            displayScale={DISPLAY_SCALE}
          />
          <GlowBorder
            position={focusPlaneWrappedPos}
            rotation={focusPlane.rotation}
            sign={focusPlane.sign}
            width={focusPlane.baseHeight * (focusTexInfo.aspectRatio || 1)}
            height={focusPlane.baseHeight}
            stateRef={state}
          />
        </>
      )}

      {/* Manual Focus: Mirror only (plane itself flies, no clone needed) */}
      {focusRender.mode === "manual" && focusTexInfo && focusPlane && (
        <MirrorReflection
          texture={focusTexInfo.texture}
          aspectRatio={focusTexInfo.aspectRatio}
          baseHeight={focusPlane.baseHeight}
          stateRef={state}
          displayScale={DISPLAY_SCALE}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        target={[0, 0, -200]}
        minDistance={10}
        maxDistance={14000}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}
