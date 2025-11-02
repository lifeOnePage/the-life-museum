"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDown, IoIosArrowUp, IoIosLogOut } from "react-icons/io";
import { MdPerson } from "react-icons/md";
import { FiEye, FiEyeOff, FiSave } from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdAdd } from "react-icons/md";

export default function FloatingToolbar({
  mypage,
  preview,
  save,
  logout,
  addItem,
  isSaved = true,
  isPreview = false,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(null);

  const contStyle = {
    position: "relative",
    display: "inline-block",
    margin: "auto",
  };

  const tooltipStyle = {
    position: "absolute",
    bottom: "150%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "6px 10px",
    fontSize: "12px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
    zIndex: 10,
  };

  const items = [
    {
      key: "add",
      onClick: addItem,
      icon: <MdAdd size={20} />,
      disabled: false,
      getLabel: () => "타임라인 항목 추가",
    },
    {
      key: "preview",
      onClick: preview,
      icon: isPreview ? <FiEyeOff size={20} /> : <FiEye size={20} />,
      disabled: false,
      getLabel: () => (isPreview ? "클릭하여 편집" : "클릭하여 미리보기"),
    },
    {
      key: "save",
      onClick: save,
      icon: isSaved ? (
        <IoMdCheckmarkCircleOutline size={20} />
      ) : (
        <FiSave size={20} />
      ),
      disabled: isSaved,
      getLabel: () => (isSaved ? "변경사항이 저장됨" : "저장하려면 클릭하세요"),
    },
    {
      key: "mypage",
      onClick: mypage,
      disabled: !isSaved,
      icon: <MdPerson size={20} />,
      getLabel: () => "계정 설정",
    },
    {
      key: "logout",
      onClick: logout,
      disabled: !isSaved,
      icon: <IoIosLogOut size={20} />,
      getLabel: () => "로그아웃",
    },
  ];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{ height: collapsed ? 68 : "auto" }}
        transition={{ duration: 0.3 }}
        style={{
          pointerEvents: "auto",
          background: "#1a1a1aff",
          padding: collapsed ? "8px" : "12px",
          borderRadius: "28px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          width: 100,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* 접기/펼치기 */}
        <div
          style={contStyle}
          onMouseEnter={() => setHovered(collapsed ? "minimize" : "maximize")}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === "minimize" || hovered === "maximize" ? (
            <div style={tooltipStyle}>{collapsed ? "툴바 펼치기" : "툴바 접기"}</div>
          ) : null}
          <button
            style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <>
              {items.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  style={contStyle}
                  onMouseEnter={() => setHovered(item.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {hovered === item.key && (
                    <div style={tooltipStyle}>{item.getLabel()}</div>
                  )}
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    style={{
                      opacity: item.disabled ? 0.3 : 1,
                      cursor: item.disabled ? "default" : "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    {item.icon}
                  </button>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

