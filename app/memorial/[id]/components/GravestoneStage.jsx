"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SLIDE_CROSSFADE_MS, FADE_MS } from "./lib/constants";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

function SlideMedia({ item }) {
  if (!item) return null;
  if (item.type === "video") {
    return (
      <video
        src={mediaSrc(item)}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
      />
    );
  }
  return (
    <img
      src={mediaSrc(item)}
      alt=""
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/**
 * 중앙 스테이지(정사각).
 * - phase "profile": 프로필 이미지가 크게 표시 (layoutId="mem-profile"로 좌상단 슬롯과 모핑 공유).
 * - phase "slideshow": 배경 미디어가 랜덤 크로스페이드.
 */
export default function GravestoneStage({
  phase,
  profileItem,
  slideItem,
  slideIndex,
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-black/50 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
      {phase === "profile" && profileItem && (
        <motion.img
          layoutId="mem-profile"
          src={mediaSrc(profileItem)}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
        />
      )}

      {phase === "slideshow" && (
        <AnimatePresence>
          <motion.div
            key={slideIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: SLIDE_CROSSFADE_MS / 1000,
              ease: "easeInOut",
            }}
          >
            <SlideMedia item={slideItem} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
