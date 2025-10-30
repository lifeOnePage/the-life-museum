"use client";
import { motion } from "framer-motion";

export default function Header({ title, subtitle }) {
  return (
    <div className="mb-4">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[22px] m-0 font-semibold">
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="opacity-80 mt-1.5">
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
