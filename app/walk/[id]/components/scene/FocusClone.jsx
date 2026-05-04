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
  cloneZ,
  isVideo,
  videoTexture,
  videoPlayStateRef,
  planeId,
  onClick,
}) {
  const meshRef = useRef();

  const h = baseHeight * displayScale;
  const w = h * aspectRatio;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = stateRef.current;
    // Use the prop-captured spawn position so this instance never reads a
    // stateRef value that was mutated for the NEXT clone cycle.
    meshRef.current.position.set(0, cameraY, cloneZ);

    // Distance-based opacity (4-zone bell curve):
    // dist ≥ 200              → 0        (보이지 않음)
    // 200 > dist ≥ 130        → 0 → 1    fade-in  (70단위)
    // 130 > dist ≥ 80         → 1.0      hold     (50단위)
    // 80  > dist > 56         → 1 → 0    fade-out (24단위)
    // dist ≤ 56               → 0        (dismiss)
    const dist = Math.abs(s.cameraZ - cloneZ);
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

    // Video: imperatively switch between poster and video texture based on play state
    if (isVideo && videoTexture && videoPlayStateRef) {
      const vps = videoPlayStateRef.current;
      // Show video texture when this plane is the active video (even if paused)
      // so the paused frame stays visible instead of switching to poster (black screen)
      const shouldShowVideo = vps.activePlaneId === planeId;
      const activeTexture = shouldShowVideo ? videoTexture : texture;

      if (meshRef.current.material.map !== activeTexture) {
        console.log(`[FocusClone] Texture switch: plane=${planeId} toVideo=${shouldShowVideo}`);
        meshRef.current.material.map = activeTexture;
        meshRef.current.material.needsUpdate = true;
      }

      // Only mark video texture needsUpdate each frame while actually playing
      if (shouldShowVideo && vps.isPlaying && opacity > 0) {
        videoTexture.needsUpdate = true;
      }
    }
  });

  if (!texture) return null;

  return (
    <mesh
      ref={meshRef}
      scale={[w, h, 1]}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
    >
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
