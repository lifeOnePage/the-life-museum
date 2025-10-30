"use client";
import { motion } from "framer-motion";

export function Primary({ children, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        h-12 min-w-[120px] px-4 rounded-xl border border-white-200 text-base
        ${disabled ? "border-none bg-white/10 text-white/20 cursor-not-allowed" : "bg-black/60 text-white"}
        font-extrabold
      `}
      type="button"
    >
      {children}
    </motion.button>
  );
}

export function Secondary({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="h-12 min-w-[100px] px-4 rounded-xl border border-white-200 bg-black-100 text-white/90 font-bold"
      type="button"
    >
      {children}
    </motion.button>
  );
}