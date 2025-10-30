"use client";
import { cardStyle } from "./styles";

export default function Section({ title, children }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
