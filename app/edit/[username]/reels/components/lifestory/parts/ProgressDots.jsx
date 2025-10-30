"use client";
import { motion } from "framer-motion";

export default function ProgressDots({ total, current, onDotClick }) {
  return (
    <div className="flex gap-2.5 flex-wrap items-center">
      {new Array(Math.max(total, 0)).fill(0).map((_, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const bg = state === "current" ? "bg-white" : "bg-transparent";
        const scale = state === "current" ? 1.2 : 1;
        return (
          <motion.button
            key={i}
            onClick={() => i <= current && onDotClick(i)}
            whileHover={{ scale: state === "todo" ? 1.05 : 1.1 }}
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className={`w-3 h-3 rounded-full border border-white ${bg}`}
            aria-label={`질문 ${i + 1}`}
            type="button"
          />
        );
      })}
    </div>
  );
}