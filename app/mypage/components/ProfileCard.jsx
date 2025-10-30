"use client";
import { motion } from "framer-motion";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { iconBtn, inputStyle, cardStyle } from "./styles";

export default function ProfileCard({
  form,
  setForm,
  editing,
  onToggle,
  onCancel,
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>내 정보</h3>
        <div style={{ flex: 1 }} />
        {!editing ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggle}
            style={iconBtn}
          >
            <FiEdit2 /> 편집
          </motion.button>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              style={iconBtn}
            >
              <FiX /> 취소
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggle}
              style={iconBtn}
            >
              <FiSave /> 저장
            </motion.button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
        <Field label="이름">
          {!editing ? (
            <ValueText>{form.name || "-"}</ValueText>
          ) : (
            <input
              value={form.name}
              onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))}
              placeholder="홍길동"
              style={inputStyle}
            />
          )}
        </Field>
        <Field label="전화번호">
          {!editing ? (
            <ValueText>{form.mobile || "-"}</ValueText>
          ) : (
            <input
              value={form.mobile}
              onChange={(e) =>
                setForm((d) => ({ ...d, mobile: e.target.value }))
              }
              placeholder="01012345678"
              style={inputStyle}
            />
          )}
        </Field>
        <Field label="이메일">
          {!editing ? (
            <ValueText>{form.email || "-"}</ValueText>
          ) : (
            <input
              value={form.email}
              onChange={(e) =>
                setForm((d) => ({ ...d, email: e.target.value }))
              }
              placeholder="name@example.com"
              style={inputStyle}
            />
          )}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px dashed #c4c6cb22",
      }}
    >
      <div style={{ color: "#aaa", fontSize: 14 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function ValueText({ children }) {
  return <div style={{ fontSize: 16 }}>{children}</div>;
}
