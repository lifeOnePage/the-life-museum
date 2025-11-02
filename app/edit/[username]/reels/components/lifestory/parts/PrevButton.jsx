"use client";
import { motion } from "framer-motion";

export default function PrevButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="absolute -top-20 -left-2 h-10 rounded-full text-white flex items-center cursor-pointer text-sm"
      type="button"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="#fafafa" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      이전으로
    </motion.button>
  );
}