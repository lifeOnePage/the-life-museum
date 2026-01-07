"use client";

import { AnimatePresence, motion } from "framer-motion";
import TooltipPortal from "../../TooltipPortal";

export default function NewItemButton({
  buttonRef,
  onClick,
  showTooltip,
  tooltipPosition,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <>
      <div className="relative z-50">
        <button
          ref={buttonRef}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="flex items-center gap-2 py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/10 w-full cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 5V15M5 10H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-white text-base">새로 만들기</span>
        </button>

        {/* 툴팁 */}
        <AnimatePresence>
          {showTooltip && (
            <TooltipPortal>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  position: 'fixed',
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                  transform: 'translateX(-50%)',
                }}
                className="z-[9999] pointer-events-none bg-black px-4 py-2.5 whitespace-nowrap"
              >
                <p className="text-white text-xs">새로운 기억을 추가하고 사진을 추가합니다.</p>
              </motion.div>
            </TooltipPortal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
