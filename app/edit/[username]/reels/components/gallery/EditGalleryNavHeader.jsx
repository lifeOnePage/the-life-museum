"use client";
import { motion } from "framer-motion";

export default function NavHeader({ items, active, setActive }) {
  return (
    <div className="box-border flex w-full text-white border-b border-white/20">
      {items.map((it, i) => {
        const show = active === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-selected={show}
            className={`relative flex-1 py-3 text-center text-base outline-none
              ${show ? "font-bold text-white" : "text-white/60 hover:text-white"}
            `}
          >
            {it.label}
            {show && (
              <motion.span
                layoutId="nav-underline"                // 🔥 같은 layoutId로 이동/리사이즈 애니메이션
                className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-white"
                transition={{ type: "spring", stiffness: 500, damping: 60 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
