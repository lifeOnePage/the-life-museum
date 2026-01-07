"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message, type = "success", isOpen, onClose, duration = 2000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // 마이페이지 스타일에 맞춘 색상
  const styles = type === "success"
    ? {
        background: "#000000",
        color: "#ffffff",
        border: "1px solid #ffffff",
      }
    : type === "error"
    ? {
        background: "#ff7d7d11",
        color: "#ff7d7dff",
        border: "1px solid #ff7d7d",
      }
    : {
        background: "#88888811",
        color: "#888888ff",
        border: "1px solid #888888",
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            left: 20,
            right: 20,
            bottom: 30,
            fontSize: 14,
            padding: "12px 14px",
            borderRadius: 10,
            maxWidth: 480,
            margin: "0 auto",
            zIndex: 10001,
            cursor: "pointer",
            ...styles,
          }}
          onClick={onClose}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
