import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FLOOR_Y,
  FOCUS_DISMISS_DISTANCE,
  OPACITY_APPEAR_DIST,
  OPACITY_PEAK_DIST,
  OPACITY_HOLD_DIST,
} from "../lib/constants";

export default function MirrorReflection({
  texture,
  aspectRatio,
  baseHeight,
  stateRef,
  displayScale,
  cloneZ,
}) {
  const meshRef = useRef();

  const h = baseHeight * displayScale;
  const w = h * aspectRatio;

  // Reflection opacity: same 4-zone distance curve as WallPlane/FocusClone,
  // scaled down to REFLECTION_MAX for a subtle floor reflection effect.
  const REFLECTION_MAX = 0.15;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = stateRef.current;

    // In manual mode, track the WallPlane's animated Z instead of the final target
    const actualZ =
      s.focusMode === "manual" && s.manualCurrentZ != null
        ? s.manualCurrentZ
        : cloneZ;

    const dist = Math.abs(s.cameraZ - actualZ);

    let baseOpacity = 0;
    if (dist < OPACITY_APPEAR_DIST && dist > FOCUS_DISMISS_DISTANCE) {
      if (dist >= OPACITY_PEAK_DIST) {
        baseOpacity =
          (OPACITY_APPEAR_DIST - dist) /
          (OPACITY_APPEAR_DIST - OPACITY_PEAK_DIST);
      } else if (dist >= OPACITY_HOLD_DIST) {
        baseOpacity = 1.0;
      } else {
        baseOpacity =
          (dist - FOCUS_DISMISS_DISTANCE) /
          (OPACITY_HOLD_DIST - FOCUS_DISMISS_DISTANCE);
      }
    }

    // In manual mode, match the WallPlane's actual scale (includes padding, no displayScale)
    const scl = s.manualCurrentScale;
    const actualW = s.focusMode === "manual" && scl ? scl[0] : w;
    const actualH = s.focusMode === "manual" && scl ? scl[1] : h;

    const opacity = baseOpacity * REFLECTION_MAX;
    meshRef.current.scale.set(actualW, actualH, 1);
    meshRef.current.position.set(0, FLOOR_Y + 0.1 - actualH, actualZ);
    meshRef.current.material.opacity = opacity;
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[w, h, 1]} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
