import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FOCUS_DISMISS_DISTANCE,
  OPACITY_APPEAR_DIST,
  OPACITY_PEAK_DIST,
  OPACITY_HOLD_DIST,
} from "../lib/constants";

export default function FocusClone({
  texture,
  aspectRatio,
  baseHeight,
  cameraY,
  stateRef,
  displayScale,
}) {
  const meshRef = useRef();

  const h = baseHeight * displayScale;
  const w = h * aspectRatio;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = stateRef.current;
    // Use fixed clone position (set at spawn time, does NOT move with camera)
    meshRef.current.position.set(0, cameraY, s.focusCloneZ);

    // Distance-based opacity (4-zone bell curve):
    // dist ≥ 200              → 0        (보이지 않음)
    // 200 > dist ≥ 130        → 0 → 1    fade-in  (70단위)
    // 130 > dist ≥ 80         → 1.0      hold     (50단위)
    // 80  > dist > 56         → 1 → 0    fade-out (24단위)
    // dist ≤ 56               → 0        (dismiss)
    const dist = Math.abs(s.cameraZ - s.focusCloneZ);
    let opacity = 0;
    if (dist < OPACITY_APPEAR_DIST && dist > FOCUS_DISMISS_DISTANCE) {
      if (dist >= OPACITY_PEAK_DIST) {
        // fade-in 구간
        opacity =
          (OPACITY_APPEAR_DIST - dist) /
          (OPACITY_APPEAR_DIST - OPACITY_PEAK_DIST);
      } else if (dist >= OPACITY_HOLD_DIST) {
        // hold 구간
        opacity = 1.0;
      } else {
        // fade-out 구간
        opacity =
          (dist - FOCUS_DISMISS_DISTANCE) /
          (OPACITY_HOLD_DIST - FOCUS_DISMISS_DISTANCE);
      }
    }
    meshRef.current.material.opacity = opacity;
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[w, h, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
}
