"use client";

import { motion } from "framer-motion";

export default function SceneDescBlock({
  selectedSlot,
  selectedItem,
  isDarkMode = true,
  textOpacity = 1,
  proxify = (url) => url,
}) {
  if (!selectedSlot || !selectedItem) return null;

  return (
    <div
      className={`absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center px-8 transition-colors duration-500 ${
        isDarkMode ? "bg-white/10 text-white" : "bg-black/5 text-black"
      } backdrop-blur-md`}
      style={{ height: "calc(100vh / 12)", opacity: textOpacity }}
    >
      <div className="flex h-full w-full items-center gap-6">

        {/* 제목 */}
        {selectedItem.title && (
          <>
            <div className="flex flex-shrink-0 items-center justify-center px-4" style={{ minWidth: "15%" }}>
              <div className="relative inline-block px-3">
                {/* 기본 텍스트 */}
                <h2
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                  style={{
                    letterSpacing: "-0.05rem",
                    fontSize: "clamp(1rem, 2vh, 1.5rem)",
                  }}
                >
                  {selectedItem.title}
                </h2>

                {/* 애니메이션 레이어 (배경 확장 + 텍스트 색상 반전) */}
                <motion.div
                  key={selectedItem.id}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 overflow-hidden px-3 ${
                    isDarkMode ? "bg-white" : "bg-black"
                  }`}
                >
                  <h2
                    className={`font-medium whitespace-nowrap ${
                      isDarkMode ? "text-black" : "text-white"
                    }`}
                    style={{
                      letterSpacing: "-0.05rem",
                      fontSize: "clamp(1rem, 2vh, 1.5rem)",
                    }}
                  >
                    {selectedItem.title}
                  </h2>
                </motion.div>
              </div>
            </div>

            {/* 세로 구분선 */}
            <div
              className={`h-3/5 w-px ${
                isDarkMode ? "bg-white/20" : "bg-black/20"
              }`}
            />
          </>
        )}

        {/* 날짜 */}
        {selectedItem.date && (
          <>
            <div className="flex flex-shrink-0 items-center justify-center px-4" style={{ minWidth: "12%" }}>
              <p
                className={`${
                  isDarkMode ? "text-white/70" : "text-black/70"
                }`}
                style={{
                  letterSpacing: "-0.05rem",
                  fontSize: "clamp(0.75rem, 1.5vh, 1.25rem)",
                }}
              >
                {selectedItem.date}
              </p>
            </div>

            {/* 세로 구분선 */}
            <div
              className={`h-3/5 w-px ${
                isDarkMode ? "bg-white/20" : "bg-black/20"
              }`}
            />
          </>
        )}

        {/* 설명 */}
        {selectedItem.desc && (
          <div className="flex flex-1 items-center overflow-hidden px-4">
            <p
              className={`line-clamp-3 leading-relaxed ${
                isDarkMode ? "text-white/80" : "text-black/80"
              }`}
              style={{
                letterSpacing: "-0.05rem",
                fontSize: "clamp(0.75rem, 1.5vh, 1.25rem)",
              }}
            >
              {selectedItem.desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
