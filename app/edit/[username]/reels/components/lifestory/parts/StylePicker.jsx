// app/components/lifestory/parts/StylePicker.jsx
"use client";
import { motion } from "framer-motion";

export default function StylePicker({ options, selected, onSelect }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {options.map((label) => (
        <motion.button
          key={label}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(label)}
          className={`h-[120px] rounded-[14px] border p-4 text-left cursor-pointer
            ${selected === label ? "bg-black-200 border-white shadow-[0_0_0_3px_rgba(255,255,255,.5)]" : "border-white/30"}
            bg-black-100 text-white`}
          type="button"
        >
          <div className="text-[18px] font-bold">{label}</div>
          <div className="text-[13px] opacity-70 mt-1.5">
            {desc[label] ?? ""}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
const desc = {
  진중한: "차분하고 깊이 있게.",
  낭만적인: "따뜻하고 서정적으로.",
  재치있는: "위트 있고 가볍게.",
  신비로운: "몽환적이고 은유적으로.",
};