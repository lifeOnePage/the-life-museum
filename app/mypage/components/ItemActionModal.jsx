"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSave, FiX } from "react-icons/fi";
import { iconBtn, inputStyle } from "./styles";

export default function ItemActionModal({ open, type, item, onClose, onSaveIdentifier, onOpenEditor }) {
  const [val, setVal] = useState(item?.identifier || "");
  const [name, setName] = useState(item?.name || "")
  useEffect(() => {
    setName(item?.name || "");
    setVal(item?.identifier || "");
  }, [item?.identifier, open]);

  if (!open || !item) return null;

  const submit = () => {
    const v = val.trim();
    const n = name.trim();
    if (!/^[a-z0-9_-]{3,32}$/i.test(v)) {
      alert("identifier는 3~32자, 영문/숫자/언더스코어/하이픈만 허용해요.");
      return;
    }
    else if (n == "") {
      alert("이름은 비워둘 수 없어요.")
      return;
    }
    onSaveIdentifier(type, item.id, v, n);
  };
  console.group("ItemActionModal")
  console.log(item)
  console.groupEnd()

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", zIndex: 1000 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(80vw, 760px)", background: "#121212", border: "1px solid #2e2e2e", borderRadius: 12, padding:"40px 16px", color: "#fff" }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3 style={{ margin: 0, flex: 1 }}>{type === "reel" ? "Life-Reels" : "Life-Records"} 설정</h3>
          <button onClick={onClose} style={{ ...iconBtn, padding: 6 }}>
            <FiX />
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>이름</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={inputStyle} />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>ID</div>
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="identifier" style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={() => onOpenEditor(type, item)} style={iconBtn}>에딧 페이지로 이동</button>
          <button onClick={submit} style={iconBtn}><FiSave /> 저장</button>
        </div>
      </motion.div>
    </div>
  );
}
