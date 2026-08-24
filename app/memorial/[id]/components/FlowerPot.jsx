"use client";

// 꽃이 심긴 화분 (pot.png는 화분+꽃 완성 합성본, 투명 배경 + 글로우 포함).
export default function FlowerPot({ width, className = "", style = {} }) {
  return (
    <img
      src="/images/memorial/pot.png"
      alt=""
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
      style={{
        width,
        aspectRatio: "2 / 3",
        objectFit: "contain",
        ...style,
      }}
    />
  );
}
