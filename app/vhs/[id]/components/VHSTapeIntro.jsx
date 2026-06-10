"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  VHS_TAPE_IMAGE,
  TAPE_LABEL,
  CROSSFADE_DURATION_MS,
} from "./lib/constants";

function getContainedImageBounds(containerW, containerH, imgNatW, imgNatH) {
  const imgAspect = imgNatW / imgNatH;
  const containerAspect = containerW / containerH;
  if (containerAspect > imgAspect) {
    const w = containerH * imgAspect;
    return { x: (containerW - w) / 2, y: 0, width: w, height: containerH };
  } else {
    const h = containerW / imgAspect;
    return { x: 0, y: (containerH - h) / 2, width: containerW, height: h };
  }
}

export default function VHSTapeIntro({
  subTitle,
  title,
  lifestory,
  onPlay,
  visible,
}) {
  const containerRef = useRef(null);
  const [labelBounds, setLabelBounds] = useState(null);
  const [imgNatSize, setImgNatSize] = useState(null);

  const recalculate = useCallback(() => {
    if (!containerRef.current || !imgNatSize) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const img = getContainedImageBounds(cw, ch, imgNatSize.w, imgNatSize.h);

    setLabelBounds({
      left: img.x + img.width * TAPE_LABEL.left,
      top: img.y + img.height * TAPE_LABEL.top,
      width: img.width * TAPE_LABEL.width,
      height: img.height * TAPE_LABEL.height,
      // play button: below tape center
      btnTop: img.y + img.height * 0.88,
      // lifestory: above tape
      storyTop: img.y + img.height * 0.05,
      storyWidth: img.width * 0.5,
      storyLeft: img.x + img.width * 0.25,
    });
  }, [imgNatSize]);

  useEffect(() => {
    if (!imgNatSize) return;
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [imgNatSize, recalculate]);

  const handleImgLoad = useCallback((e) => {
    setImgNatSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
        backgroundColor: "#2a1a0e",
      }}
    >
      {/* Tape image fills the entire screen */}
      <img
        src={VHS_TAPE_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        onLoad={handleImgLoad}
        draggable={false}
      />

      {labelBounds && (
        <>
          {/* Lifestory text above tape */}
          {lifestory && (
            <p
              className="absolute line-clamp-3 text-center text-sm leading-relaxed text-white/70"
              style={{
                fontFamily: "serif",
                left: labelBounds.storyLeft,
                top: labelBounds.storyTop,
                width: labelBounds.storyWidth,
              }}
            >
              {lifestory}
            </p>
          )}

          {/* Title on tape label */}
          {title && (
            <div
              className="absolute flex flex-col items-center justify-center overflow-hidden"
              style={{
                left: labelBounds.left,
                top: labelBounds.top,
                width: labelBounds.width,
                height: labelBounds.height,
              }}
            >
              <span
                className="line-clamp-2 text-center font-bold text-neutral-800"
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 1.4rem)",
                  lineHeight: 2.0,
                }}
              >
                {title}
              </span>
              <span
                className="line-clamp-2 text-center text-neutral-800"
                style={{
                  fontSize: "clamp(0.75rem, 1.5vw, 1.0rem)",
                  lineHeight: 1.3,
                }}
              >
                {subTitle}
              </span>
            </div>
          )}

          {/* Play button below tape */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: labelBounds.btnTop }}
          >
            <button
              onClick={onPlay}
              className="rounded-full bg-white/20 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              재생하기 ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
