"use client";
import { motion } from "framer-motion";

export default function CountPicker({ options, selected, onSelect }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
      {options.map((cnt) => (
        <motion.button
          key={cnt}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(cnt)}
          className={`h-[120px] rounded-[14px] border p-4 text-left cursor-pointer
            ${selected === cnt ? "border-white shadow-[0_0_0_3px_rgba(255,255,255,.5)]" : "border-white/30"}
            bg-black-100 text-white`}
          type="button"
        >
          <div className="text-[18px] font-bold">{cnt}개</div>
        </motion.button>
      ))}
    </div>
  );
}