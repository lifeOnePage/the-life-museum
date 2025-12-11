// app/components/main/LandingTypography.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useWindowSize from "@/app/hooks/useWindowSize";

const WORDS_LINE1 = ["ARCHIVE", "PRESERVE", "CHRONICLE"];
const WORDS_LINE2 = ["YOUR", "EVERY", "THE"];
const WORDS_LINE3 = ["LIFE", "MEMORY", "STORY"];

// 폰트 크기 자동 맞춤 훅
function useFitFontToViewport({
  candidates,
  fontFamily = "Pretendard",
  defaultWeight = 800,
  letterSpacing = "-1rem",
  min = 40,
  max = 720,
  horizontalPadding = 0,
  viewportWidth,
}) {
  const [size, setSize] = useState(min);

  useEffect(() => {
    if (!viewportWidth) return;

    const rootPx =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    const letterSpacingToPx = (sz) => {
      const v = String(letterSpacing).trim();
      if (v.endsWith("rem")) return parseFloat(v) * rootPx;
      if (v.endsWith("em")) return parseFloat(v) * sz;
      if (v.endsWith("px")) return parseFloat(v);
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const measureAt = (sz) => {
      const lsPx = letterSpacingToPx(sz);
      let widest = 0;
      for (const item of candidates) {
        const w = item.weight ?? defaultWeight;
        ctx.font = `${w} ${sz}px ${fontFamily}`;
        const text = item.text;
        const width = ctx.measureText(text).width + (text.length - 1) * lsPx;
        if (width > widest) widest = width;
      }
      return widest;
    };

    const target = Math.max(0, viewportWidth - 2 * horizontalPadding);

    const solve = () => {
      let lo = min,
        hi = max;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        const w = measureAt(mid);
        if (w < target) lo = mid;
        else hi = mid;
      }
      setSize((lo + hi) / 2);
    };

    if (document.fonts?.ready) document.fonts.ready.then(solve);
    else solve();
  }, [
    viewportWidth,
    candidates,
    fontFamily,
    defaultWeight,
    letterSpacing,
    min,
    max,
    horizontalPadding,
  ]);

  return size;
}

// 단어 플리퍼
function WordFlipper({ words, weight = 800 }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(id);
  }, [words.length]);

  const flip = {
    enter: {
      rotateX: 90,
      opacity: 0,
      transformOrigin: "top",
    },
    center: {
      rotateX: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.45, 0, 0.55, 1] },
    },
    exit: {
      rotateX: -90,
      opacity: 0,
      transition: { duration: 0.7, ease: [0.45, 0, 0.55, 1] },
    },
  };

  return (
    <div style={{ perspective: 1000, display: "inline-block" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={words[idx]}
          variants={flip}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            display: "inline-block",
            fontWeight: weight,
          }}
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// 메인 타이포 컴포넌트
export default function LandingTypography() {
  const { width } = useWindowSize();
  const isSmall = width < 768;

  const candidates = useMemo(
    () => [
      ...WORDS_LINE1.map((t) => ({ text: t, weight: 800 })),
      ...WORDS_LINE2.map((t) => ({ text: t, weight: 300 })),
      ...WORDS_LINE3.map((t) => ({ text: t, weight: 800 })),
    ],
    []
  );

  const fittedFontSize = useFitFontToViewport({
    candidates,
    fontFamily: "Pretendard",
    defaultWeight: 800,
    letterSpacing: isSmall ? "-0.3rem" : "-1rem",
    min: 40,
    max: 720,
    horizontalPadding: isSmall ? 20 : 40,
    viewportWidth: width * 0.95,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      style={{
        position: "absolute",
        left: isSmall ? "20px" : "40px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "Pretendard",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          fontSize: `${Math.round(fittedFontSize)}px`,
          lineHeight: 0.85,
          fontWeight: 800,
          letterSpacing: isSmall ? "-0.3rem" : "-1rem",
          color: "#ffffff",
          mixBlendMode: "difference",
          // border:"1px solid black"
          textShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ minWidth: "100%", textAlign: "left",mixBlendMode: "difference" }}>
          <WordFlipper words={WORDS_LINE1} weight={800} />
        </div>
        <div style={{ minWidth: "100%", textAlign: "left",mixBlendMode: "difference" }}>
          <WordFlipper words={WORDS_LINE2} weight={300} />
        </div>
        <div style={{ minWidth: "100%", textAlign: "left",mixBlendMode: "difference" }}>
          <WordFlipper words={WORDS_LINE3} weight={800} />
        </div>
      </div>
    </motion.div>
  );
}
