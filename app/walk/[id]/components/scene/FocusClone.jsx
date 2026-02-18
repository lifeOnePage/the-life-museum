import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
    meshRef.current.material.opacity = s.fadeProgress;
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[w, h, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
