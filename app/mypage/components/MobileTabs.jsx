"use client";
import { motion } from "framer-motion";

export default function MobileTabs({ active, onChange }) {
  const tabs = [
    { key: "reel", label: "LifeReels" },
    { key: "records", label: "LifeRecords" },
    { key: "plan", label: "Plan" },
  ];

  return (
    <div style={{ display: "flex", position: "relative", borderBottom: "1px solid #2e2e2e", marginTop: 18 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1,
            padding: "12px 8px",
            background: "transparent",
            color: "#fff",
            border: "none",
            borderBottom: "2px solid transparent",
            fontWeight: active === t.key ? 800 : 500,
            cursor: "pointer",
            position: "relative",
          }}
        >
          {t.label}
          {active === t.key && (
            <motion.div
              layoutId="mobileTabIndicator"
              style={{ position: "absolute", left: 0, right: 0, bottom: -2, height: 2, background: "#fff" }}
              transition={{ type: "spring", stiffness: 480, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
