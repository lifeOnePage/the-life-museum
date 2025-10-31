"use client";
import { motion } from "framer-motion";

export default function VerticalNav({ active, onChange }) {
  const items = [
    { key: "data", label: "Data" },
    { key: "plan", label: "Plan" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #2e2e2e",
        backgroundColor: "#1a1a1a55",
        borderRadius: 10,
        overflow: "hidden",
        color: "#fff",
        minHeight: "100%",
      }}
    >
      {items.map((it) => (
        <motion.button
          key={it.key}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(it.key)}
          style={{
            appearance: "none",
            textAlign: "left",
            padding: 16,
            background: active === it.key ? "#2a2a2a55" : "transparent",
            color: "#fff",
            border: "none",
            borderBottom: "1px solid #2e2e2e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <span>{it.label}</span>
          {/* 선택된 항목에 오른쪽 보더 강조 */}
          <motion.span
            layout
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, background: "#fff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: active === it.key ? 1 : 0 }}
            transition={{ duration: 0.18 }}
          />
        </motion.button>
      ))}
    </nav>
  );
}
