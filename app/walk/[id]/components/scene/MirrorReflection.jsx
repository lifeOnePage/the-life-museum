import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FLOOR_Y } from "../lib/constants";

export default function MirrorReflection({
  texture,
  aspectRatio,
  baseHeight,
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
    // Position so the top edge of the flipped plane aligns with the floor
    const opacity = s.fadeProgress * 0.05;
    meshRef.current.position.set(0, FLOOR_Y + 0.1 - h, s.focusCloneZ);
    meshRef.current.material.opacity = opacity;
    meshRef.current.material.emissiveIntensity = opacity * 0.5;
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[w, h, 1]} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
        emissive="#ffffff"
        emissiveMap={texture}
        emissiveIntensity={0}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}
