import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLOW_COLOR } from "../lib/constants";

export default function GlowBorder({
  position,
  rotation,
  sign,
  width,
  height,
  stateRef,
}) {
  const lineRef = useRef();
  const lightRef = useRef();

  // Compute the same rotation as WallPlane uses
  const boxRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    dummy.rotateX(rotation[0]);
    dummy.rotateY(rotation[1]);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [rotation, sign]);

  // Line geometry: rectangle loop (5 points to close the loop)
  const geometry = useMemo(() => {
    const hw = width / 2 + 5;
    const hh = height / 2 + 5;
    const points = [
      new THREE.Vector3(-hw, hh, 0),
      new THREE.Vector3(hw, hh, 0),
      new THREE.Vector3(hw, -hh, 0),
      new THREE.Vector3(-hw, -hh, 0),
      new THREE.Vector3(-hw, hh, 0), // close the loop
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [width, height]);

  useFrame(() => {
    if (!lineRef.current) return;

    const fadeProgress = stateRef.current.fadeProgress;
    lineRef.current.material.opacity = fadeProgress;

    if (lightRef.current) {
      lightRef.current.intensity = fadeProgress * 2;
    }
  });

  return (
    <group position={position} rotation={boxRotation}>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          color={GLOW_COLOR}
          transparent
          opacity={0}
          linewidth={10}
          depthWrite={false}
        />
      </line>
      <pointLight
        ref={lightRef}
        color={GLOW_COLOR}
        intensity={100}
        distance={200}
      />
    </group>
  );
}
