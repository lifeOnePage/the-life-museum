"use client";
import { FiCreditCard } from "react-icons/fi";
import { cardStyle } from "./styles";

export default function PlanPlaceholder() {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FiCreditCard />
        <strong style={{ color: "#fff" }}>Plan</strong>
        <span
          style={{
            marginLeft: 8,
            fontSize: 12,
            color: "#bbb",
            border: "1px solid #333",
            padding: "2px 6px",
            borderRadius: 999,
          }}
        >
          Beta
        </span>
      </div>
      <p style={{ margin: 0, color: "#bbb" }}>
        구독/요금제 관리 기능이 곧 제공됩니다.
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        <Skel height={52} />
        <Skel height={52} />
        <Skel height={90} />
      </div>
    </div>
  );
}

function Skel({ height = 44 }) {
  return (
    <div
      style={{
        height,
        borderRadius: 10,
        background:
          "linear-gradient(90deg,#101010 0%,#202020 50%,#101010 100%)",
        backgroundSize: "200% 100%",
        animation: "skel 1.2s ease-in-out infinite",
      }}
    />
  );
}

// 전역 keyframe (중복 주입 방지)
if (typeof document !== "undefined") {
  const id = "skel-anim-style";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `@keyframes skel { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`;
    document.head.appendChild(style);
  }
}
