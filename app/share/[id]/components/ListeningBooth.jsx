"use client";

export default function ListeningBooth() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 0, -0.4]} receiveShadow>
        <boxGeometry args={[2.4, 2.4, 0.05]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} metalness={0} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-1.225, 0, 0]} receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.8]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} metalness={0} />
      </mesh>

      {/* Right wall */}
      <mesh position={[1.225, 0, 0]} receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.8]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} metalness={0} />
      </mesh>

      {/* Top wall */}
      <mesh position={[0, 1.225, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.05, 0.85]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} metalness={0} />
      </mesh>

      {/* Bottom wall */}
      <mesh position={[0, -1.225, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.05, 0.85]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}
