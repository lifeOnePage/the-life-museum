"use client";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";

export default function HorizontalThumbs({
  items,
  label,
  onOpenCreate,
  onOpenAction,
}) {
  return (
    <div
      style={{
        display: "flex",
        padding: "50px 0px",
        gap: 10,
        width: "100%",
        overflowX:"scroll"
      }}
    >
      <CreateThumb onClick={onOpenCreate} />
      {items.reverse().map((it) => (
        <Thumb
          key={`${label}-${it.id}`}
          item={it}
          onClick={() => onOpenAction(it)}
        />
      ))}
    </div>
  );
}

function Thumb({ item, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        minWidth: 140,
        height: "auto",
        borderRadius: 12,
        border: "1px solid #2e2e2e",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        color: "#fff",
        textAlign: "left",
        padding: "16px 12px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          paddingTop: 40,
          fontWeight: 700,
          fontSize: 18,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.name ?? "새로운 Reels"}
      </div>
      <div
        style={{
          paddingTop: 12,
          fontWeight: 400,
          fontSize: 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.identifier}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#bbb" }}>
        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
      </div>
    </motion.button>
  );
}

function CreateThumb({ onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        minWidth: 140,
        height: "auto",
        borderRadius: 12,
        border: "1px dashed #3a3a3a",
        background: "transparent",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}
      >
        <FiPlus /> 새로 만들기
      </div>
    </motion.button>
  );
}
