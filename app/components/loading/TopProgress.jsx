"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** active=true 동안 상단에 얇은 진행바(불특정 길이 루프) */
export default function TopProgress({ active }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) setVisible(true);
    else {
      // 살짝 채우고 사라지는 마감 애니메이션
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "transparent",
            zIndex: 2000,
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 50%, rgba(255,255,255,0) 100%)",
              filter: "drop-shadow(0 0 8px rgba(255,255,255,.6))",
            }}
            animate={{
              left: ["-30%", "130%"],
              width: ["30%", "40%", "30%"],
            }}
            transition={{
              duration: 1.2,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          {/* 옅은 바닥선 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg,#ffffff22,#ffffff11)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
