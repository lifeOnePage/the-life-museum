import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProxiedUrl } from "../lib/constants";

const BOX_DEPTH = 10;
const FRAME_COLOR = "#1a1a2e";
const BACK_COLOR = "#0a0a15";
const SCREEN_OFF_COLOR = "#050510";

// Flicker duration in seconds
const FLICKER_DURATION = 1.2;

// TV power-on flicker pattern: normalized time (0-1) -> brightness (0-1)
function flickerBrightness(t) {
  if (t < 0.05) return 0;
  if (t < 0.08) return 0.6;
  if (t < 0.12) return 0;
  if (t < 0.18) return 0.3;
  if (t < 0.22) return 0;
  if (t < 0.30) return 0.7;
  if (t < 0.35) return 0.1;
  if (t < 0.45) return 0.8;
  if (t < 0.48) return 0.2;
  if (t < 0.55) return 0.9;
  if (t < 0.58) return 0.4;
  if (t < 0.65) return 0.95;
  if (t < 0.68) return 0.6;
  if (t < 0.78) return 1.0;
  if (t < 0.80) return 0.7;
  // Final settle
  const settle = (t - 0.80) / 0.20;
  return 0.7 + 0.3 * Math.min(1, settle);
}

export default function WallPlane({
  id,
  imageUrl,
  position,
  rotation,
  baseHeight,
  sign,
  focusMode, // 'none' | 'auto' | 'manual-fly' | 'manual-display'
  cameraPosition,
  onClick,
  onTextureLoaded,
  displayOffsetZ,
  displayScale,
}) {
  const meshRef = useRef();
  const frontMatRef = useRef();

  // All mutable state in refs (no React re-renders needed for visuals)
  const aspectRef = useRef(1);
  const wallScaleRef = useRef([baseHeight * 1.2, baseHeight, 1]);

  const animState = useRef({
    currentPos: [...position],
    currentRot: [0, 0, 0],
    currentScale: [baseHeight * 1.2, baseHeight, 1],
    targetPos: [...position],
    targetRot: [0, 0, 0],
    targetScale: [baseHeight * 1.2, baseHeight, 1],
  });

  // Flicker state
  const flickerState = useRef({
    active: false,
    elapsed: 0,
    done: false,
  });

  // Original rotation: face toward corridor center
  const originalRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    dummy.rotateX(rotation[0]);
    dummy.rotateY(rotation[1]);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [rotation, sign]);

  // Load texture — entirely imperative, no setState
  useEffect(() => {
    if (!imageUrl) return;
    let disposed = false;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (disposed) return;
      try {
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        const aspect = img.width / img.height;
        aspectRef.current = aspect;
        const h = baseHeight;
        const w = h * aspect;
        wallScaleRef.current = [w, h, 1];

        animState.current.currentScale = [w, h, 1];
        animState.current.targetScale = [w, h, 1];

        // Apply texture to front material imperatively
        const mat = frontMatRef.current;
        if (mat) {
          mat.map = tex;
          mat.needsUpdate = true;
        }

        // Start flicker animation
        flickerState.current = { active: true, elapsed: 0, done: false };

        onTextureLoaded?.(id, tex, aspect);
      } catch (err) {
        console.error("Texture creation error:", err);
      }
    };

    img.onerror = (err) => {
      console.error("Image load failed:", imageUrl.substring(0, 80), err);
    };

    img.src = getProxiedUrl(imageUrl);

    return () => {
      disposed = true;
      const mat = frontMatRef.current;
      if (mat && mat.map) {
        mat.map.dispose();
        mat.map = null;
        mat.needsUpdate = true;
      }
    };
  }, [imageUrl, baseHeight]);

  // Update targets based on focusMode
  useEffect(() => {
    const state = animState.current;
    const aspect = aspectRef.current;

    if (focusMode === "manual-fly" && cameraPosition) {
      state.targetPos = [
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2] - displayOffsetZ,
      ];
      state.targetRot = [0, 0, 0];
      const displayH = baseHeight * displayScale;
      const displayW = displayH * aspect;
      state.targetScale = [displayW, displayH, 1];
    } else if (focusMode === "manual-display" && cameraPosition) {
      state.targetPos = [
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2] - displayOffsetZ,
      ];
      state.targetRot = [0, 0, 0];
      const displayH = baseHeight * displayScale;
      const displayW = displayH * aspect;
      state.targetScale = [displayW, displayH, 1];
    } else {
      state.targetPos = [...position];
      state.targetRot = [...originalRotation];
      state.targetScale = [...wallScaleRef.current];
    }
  }, [
    focusMode,
    cameraPosition,
    position,
    originalRotation,
    baseHeight,
    displayOffsetZ,
    displayScale,
  ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
    const lerpFactor = 1 - Math.pow(0.01, delta);

    for (let i = 0; i < 3; i++) {
      state.currentPos[i] +=
        (state.targetPos[i] - state.currentPos[i]) * lerpFactor;
      state.currentRot[i] +=
        (state.targetRot[i] - state.currentRot[i]) * lerpFactor;
      state.currentScale[i] +=
        (state.targetScale[i] - state.currentScale[i]) * lerpFactor;
    }

    meshRef.current.position.set(...state.currentPos);
    meshRef.current.rotation.set(...state.currentRot);
    meshRef.current.scale.set(...state.currentScale);

    // TV flicker animation on front material
    const mat = frontMatRef.current;
    if (!mat) return;

    const flicker = flickerState.current;
    if (flicker.active && !flicker.done) {
      flicker.elapsed += delta;
      const t = Math.min(1, flicker.elapsed / FLICKER_DURATION);
      const brightness = flickerBrightness(t);

      // color multiplies with texture: 0=black, 1=full texture
      mat.color.setScalar(brightness);
      mat.emissive.setScalar(brightness * 0.15);

      if (t >= 1) {
        flicker.done = true;
        flicker.active = false;
        mat.color.setScalar(1);
        mat.emissive.setScalar(0);
        mat.emissiveIntensity = 0;
      }
    }
  });

  // Box faces: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z(front/corridor-facing), 5=-Z(back/wall-facing)
  return (
    <mesh
      ref={meshRef}
      castShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id);
      }}
    >
      <boxGeometry args={[1, 1, BOX_DEPTH]} />
      <meshStandardMaterial attach="material-0" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-1" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-2" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-3" color={FRAME_COLOR} />
      <meshStandardMaterial
        ref={frontMatRef}
        attach="material-4"
        color={SCREEN_OFF_COLOR}
        emissive={SCREEN_OFF_COLOR}
        emissiveIntensity={0.5}
      />
      <meshStandardMaterial attach="material-5" color={BACK_COLOR} />
    </mesh>
  );
}
