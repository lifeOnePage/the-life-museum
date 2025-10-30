"use client";
import { AnimatePresence, motion } from "framer-motion";
import SpinnerDots from "./SpinnerDots";

export default function FullscreenBusy({ show, message = "처리 중..." }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(2px)",
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1900,
          }}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              width: "min(92vw, 380px)",
              background: "#121212",
              color: "#fff",
              border: "1px solid #2e2e2e",
              borderRadius: 12,
              padding: "40px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "grid", gap: 12, placeItems: "center" }}>
              <SpinnerDots size={8} />
              <div style={{ fontSize: 15, color: "#ddd" }}>{message}</div>
              <div
                style={{
                  width: "100%",
                  height: 2,
                  background: "#2a2a2a",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                <motion.div
                  animate={{ x: ["-100%", "0%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "30%",
                    height: "100%",
                    background: "linear-gradient(90deg,#fff,#aaa)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
