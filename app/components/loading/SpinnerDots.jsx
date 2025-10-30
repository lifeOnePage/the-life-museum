"use client";
import { motion } from "framer-motion";

export default function SpinnerDots({ size = 8, gap = 6, duration = 0.9 }) {
  const dot = {
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: size,
    background: "#fff",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={dot}
          animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration, repeat: Infinity, delay: i * (duration / 3) }}
        />
      ))}
    </div>
  );
}
