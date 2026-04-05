import {
  Suspense,
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import WallPlane from "./WallPlane";
import FocusClone from "./FocusClone";
import MirrorReflection from "./MirrorReflection";
import GlowBorder from "./GlowBorder";
import {
  CAMERA_START_Z,
  DISPLAY_OFFSET_Z,
  DISPLAY_SCALE,
  FOCUS_SEARCH_RANGE,
  FOCUS_DISMISS_DISTANCE,
  FOCUS_FADE_SPEED,
  FOCUS_MIN_SPEED_RATIO,
  AUTO_RESPAWN_OFFSET,
  OPACITY_PEAK_DIST,
  FLOOR_Y,
  FLOOR_COLOR,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  BASE_HEIGHT,
  CORRIDOR_HALF,
  OPACITY_APPEAR_DIST,
} from "../lib/constants";

// ─── 동시 텍스처 로딩 제한 ───────────────────────────────────────────────
// 50개 동시 HTTP 요청 → 4개로 제한하여 네트워크/CPU 부하 분산
const MAX_CONCURRENT_LOADS = 4;

export default function Scene({ planes, isPlaying, cameraSpeed }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const dirLightRef = useRef();
  const floorRef = useRef();
  const pLight1Ref = useRef();
  const pLight2Ref = useRef();

  // Texture cache: { [planeId]: { texture, aspectRatio } }
  const textureMap = useRef(new Map());

  // Shared counter for concurrent texture loads (passed to all WallPlanes)
  const activeLoadsRef = useRef(0);

  // React state for focus mode - drives conditional rendering (mount/unmount)
  const [focusRender, setFocusRender] = useState({
    mode: "idle",
    targetId: null,
  });

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
    // Display offset used for current manual focus (differs when paused vs playing)
    manualDisplayOffset: DISPLAY_OFFSET_Z,
    // Seen planes for auto selection (avoid re-picking recently shown)
    recentAutoIds: new Set(),
    // Track if playing was just started
    initialized: false,
    // Asymmetric lerp speed to smooth out velocity jumps on focus transitions
    smoothSpeed: cameraSpeed,
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

  // Handle plane click for manual focus (works both playing and paused)
  const handlePlaneClick = useCallback(
    (planeId) => {
      const s = state.current;
      const plane = planes.find((p) => p.id === planeId);
      if (!plane) return;

      // Only allow clicking planes ahead of camera (use wrapped position)
      const wrappedPZ = wrapZ(plane.position[2], s.cameraZ);
      if (wrappedPZ >= s.cameraZ) return;

      // Land at OPACITY_PEAK_DIST so the plane arrives fully visible (opacity=1.0)
      const offset = OPACITY_APPEAR_DIST;

      // Switch to manual mode
      s.focusMode = "manual";
      s.targetPlaneId = planeId;
      s.fadeProgress = 0;
      s.focusCloneZ = s.cameraZ - offset;
      s.manualDisplayOffset = offset;
      s.manualPlaneOriginalPos = [
        plane.position[0],
        plane.position[1],
        wrappedPZ,
      ];
      setFocusRender({ mode: "manual", targetId: planeId });
    },
    [planes, corridorSpan],
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
      manualDisplayOffset: DISPLAY_OFFSET_Z,
      recentAutoIds: new Set(),
      initialized: true,
      smoothSpeed: cameraSpeed,
    };
    camera.position.set(0, 0, CAMERA_START_Z);
  }

  // Note: focus state is intentionally preserved when paused so the focused
  // plane stays visible. The camera simply stops moving.

  // Manual movement refs (used when paused)
  const manualVelocityRef = useRef(0);
  const keysRef = useRef({ fwd: false, back: false });

  // Event listeners for manual movement while paused
  useEffect(() => {
    if (isPlaying) {
      manualVelocityRef.current = 0;
      keysRef.current = { fwd: false, back: false };
      return;
    }
    const onWheel = (e) => {
      manualVelocityRef.current += e.deltaY * 0.8;
    };
    const onKeyDown = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) keysRef.current.fwd = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) keysRef.current.back = true;
    };
    const onKeyUp = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) keysRef.current.fwd = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) keysRef.current.back = false;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isPlaying]);

  // OrbitControls always disabled — play/pause only controls camera movement
  if (controlsRef.current) {
    controlsRef.current.enabled = false;
  }

  useFrame((_, delta) => {
    const s = state.current;

    if (!isPlaying) {
      // Manual movement while paused
      const MANUAL_KEY_SPEED = 200;
      if (keysRef.current.fwd) s.cameraZ -= MANUAL_KEY_SPEED * delta;
      if (keysRef.current.back) s.cameraZ += MANUAL_KEY_SPEED * delta;

      if (Math.abs(manualVelocityRef.current) > 0.5) {
        s.cameraZ -= manualVelocityRef.current * delta;
        manualVelocityRef.current *= Math.pow(0.005, delta);
      } else {
        manualVelocityRef.current = 0;
      }
      camera.position.z = s.cameraZ;

      // Update floor and lights imperatively every frame (no React re-render needed)
      if (floorRef.current) floorRef.current.position.z = s.cameraZ - 4000;
      if (pLight1Ref.current)
        pLight1Ref.current.position.set(
          -CORRIDOR_HALF - 50,
          50,
          s.cameraZ - 400,
        );
      if (pLight2Ref.current)
        pLight2Ref.current.position.set(
          CORRIDOR_HALF + 50,
          50,
          s.cameraZ - 400,
        );
      return;
    }

    // 1. Camera always advances (decelerate during focus cycles)
    let targetEffectiveSpeed = cameraSpeed;
    if (s.focusMode === "auto" || s.focusMode === "manual") {
      const distToClone = Math.abs(s.cameraZ - s.focusCloneZ);
      const focusRange = DISPLAY_OFFSET_Z - FOCUS_DISMISS_DISTANCE;
      // t=0 at cycle start (far from clone), t=1 at dismiss threshold (close to clone)
      const t =
        1 -
        Math.max(
          0,
          Math.min(1, (distToClone - FOCUS_DISMISS_DISTANCE) / focusRange),
        );
      targetEffectiveSpeed =
        cameraSpeed * (1.0 - (1.0 - FOCUS_MIN_SPEED_RATIO) * t);
    }
    // 비대칭 스무딩: 감속은 빠르게(k=6), 가속은 천천히(k=2)
    // → 브레이킹 느낌 유지 + 전환 후 급가속 제거
    const k = targetEffectiveSpeed < s.smoothSpeed ? 6 : 2;
    s.smoothSpeed +=
      (targetEffectiveSpeed - s.smoothSpeed) * (1 - Math.pow(0.01, delta * k));
    s.cameraZ -= s.smoothSpeed * delta;
    camera.position.z = s.cameraZ;

    // Update floor and lights imperatively every frame (no React re-render needed)
    if (floorRef.current) floorRef.current.position.z = s.cameraZ - 4000;
    if (pLight1Ref.current)
      pLight1Ref.current.position.set(-CORRIDOR_HALF, 50, s.cameraZ - 400);
    if (pLight2Ref.current)
      pLight2Ref.current.position.set(CORRIDOR_HALF, 50, s.cameraZ - 400);

    // 2. Focus state machine
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
          s.focusCloneZ = s.cameraZ - AUTO_RESPAWN_OFFSET;
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
  // focusCloneZ: snapshot at render time so that the OUTGOING FocusClone/MirrorReflection
  // keep their original spawn position instead of reading the newly mutated stateRef value.
  const focusCloneZ = state.current.focusCloneZ;

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
      <ambientLight intensity={0.7} />
      <directionalLight ref={dirLightRef} intensity={0.4} />
      {/* Point lights: follow camera ahead+sides — decay=1 (linear) for visible Phong specular */}
      {/* <pointLight
        ref={pLight1Ref}
        position={[-200, 100, -400]}
        intensity={100}
        distance={1500}
        decay={0.5}
        color="#ffdfcb"
      />
      <pointLight
        ref={pLight2Ref}
        position={[200, 100, -400]}
        intensity={100}
        distance={1500}
        decay={0.5}
        color="#ffdfcb"
      /> */}

      {/* Floor - follows camera via useFrame (initial Z is a placeholder) */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, CAMERA_START_Z - 4000]}
      >
        <planeGeometry args={[400, 10000]} />
        <meshBasicMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* Wall Planes - Z-wrapping is handled imperatively inside each WallPlane.useFrame */}
      {planes.map((p) => {
        // "auto" → wall stays, FocusClone shows; "manual" → plane flies to camera
        const focusMode =
          focusRender.targetId === p.id
            ? focusRender.mode // "auto" or "manual"
            : "none";

        return (
          <Suspense key={p.id} fallback={null}>
            <WallPlane
              id={p.id}
              imageUrl={p.imageUrl}
              position={p.position}
              rotation={p.rotation}
              baseHeight={p.baseHeight}
              sign={p.sign}
              focusMode={focusMode}
              onClick={handlePlaneClick}
              onTextureLoaded={handleTextureLoaded}
              displayScale={DISPLAY_SCALE}
              stateRef={state}
              corridorSpan={corridorSpan}
              activeLoadsRef={activeLoadsRef}
              maxConcurrentLoads={MAX_CONCURRENT_LOADS}
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
            cloneZ={focusCloneZ}
          />
          <MirrorReflection
            texture={focusTexInfo.texture}
            aspectRatio={focusTexInfo.aspectRatio}
            baseHeight={focusPlane.baseHeight}
            stateRef={state}
            displayScale={DISPLAY_SCALE}
            cloneZ={focusCloneZ}
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

      {/* Manual Focus: WallPlane itself flies to camera (no FocusClone needed) */}
      {/* Mirror reflection for manual focus */}
      {focusRender.mode === "manual" && focusTexInfo && focusPlane && (
        <MirrorReflection
          texture={focusTexInfo.texture}
          aspectRatio={focusTexInfo.aspectRatio}
          baseHeight={focusPlane.baseHeight}
          stateRef={state}
          displayScale={DISPLAY_SCALE}
          cloneZ={focusCloneZ}
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
