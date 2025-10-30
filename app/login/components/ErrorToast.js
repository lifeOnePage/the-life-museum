// app/login/components/ErrorToast.js
"use client";

import { AnimatePresence, motion } from "framer-motion"; // external

export default function ErrorToast({ message, onClear }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 60,
            background: "#ff7d7d11",
            color: "#ff7d7dff",
            fontSize: 14,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ff7d7d",
          }}
          onClick={onClear}
          role="alert"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
