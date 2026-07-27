"use client";

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { X } from "lucide-react";
import {
  VHS_TAPE_IMAGE,
  VHS_TAPE_IMAGE_MOBILE,
  TAPE_LABEL,
  TAPE_LABEL_MOBILE,
  TAPE_INTRO_LAYOUT,
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
  onExit,
  visible,
}) {
  const containerRef = useRef(null);
  const [labelBounds, setLabelBounds] = useState(null);
  const [imgNatSize, setImgNatSize] = useState(null);
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== "undefined"
      ? window.innerHeight > window.innerWidth
      : false,
  );

  const tapeSrc = isPortrait ? VHS_TAPE_IMAGE_MOBILE : VHS_TAPE_IMAGE;
  const imgRef = useRef(null);

  // Asset switch → previous measurements are for the other image. A cached image
  // can fire onLoad BEFORE this reset effect runs (which would wipe the size and
  // never re-fire), so re-measure synchronously from the element when it's
  // already complete.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgNatSize({ w: img.naturalWidth, h: img.naturalHeight });
    } else {
      setImgNatSize(null);
      setLabelBounds(null);
    }
  }, [tapeSrc]);

  const recalculate = useCallback(() => {
    if (!containerRef.current || !imgNatSize) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const img = getContainedImageBounds(cw, ch, imgNatSize.w, imgNatSize.h);
    const label = isPortrait ? TAPE_LABEL_MOBILE : TAPE_LABEL;
    const layout = isPortrait
      ? TAPE_INTRO_LAYOUT.mobile
      : TAPE_INTRO_LAYOUT.desktop;

    // Cap the story block's height so it can never reach the tape body —
    // use the explicit layout value if set, otherwise fall back to the
    // actual gap between storyTop and the label (works for desktop too).
    const storyCapFraction =
      layout.storyMaxHeight ?? Math.max(0, label.top - layout.storyTop);

    setLabelBounds({
      left: img.x + img.width * label.left,
      top: img.y + img.height * label.top,
      width: img.width * label.width,
      height: img.height * label.height,
      // play button: below tape
      btnTop: img.y + img.height * layout.btnTop,
      // lifestory: above tape
      storyTop: img.y + img.height * layout.storyTop,
      storyWidth: img.width * layout.storyWidth,
      storyLeft: img.x + img.width * layout.storyLeft,
      storyMaxHeight: storyCapFraction
        ? img.height * storyCapFraction
        : undefined,
    });
  }, [imgNatSize, isPortrait]);

  useEffect(() => {
    if (!imgNatSize) return;
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [imgNatSize, recalculate]);

  // Orientation watcher — switches between desktop/mobile portrait assets
  useEffect(() => {
    const onResize = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleImgLoad = useCallback((e) => {
    setImgNatSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }, []);

  // Web fonts swapping in after the first measurement changes text metrics,
  // so both fit passes below re-run once all fonts are loaded.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts?.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Lifestory text (max 250자) — no "..." truncation, but must never overlap
  // the tape body. Instead of clamping lines, wrap freely and shrink the font
  // until it fits the reserved area (storyMaxHeight); floors out at an
  // absolute minimum.
  const storyRef = useRef(null);
  const [storyFontPx, setStoryFontPx] = useState(null);
  const baseStoryFontSize = isPortrait
    ? "clamp(0.65rem, 2.8vw, 0.85rem)"
    : "clamp(0.75rem, 1.5vw, 1.0rem)";

  useLayoutEffect(() => {
    const el = storyRef.current;
    if (!el || !lifestory || !labelBounds?.storyMaxHeight) {
      setStoryFontPx(null);
      return;
    }
    el.style.fontSize = baseStoryFontSize;
    const basePx = parseFloat(getComputedStyle(el).fontSize);
    let size = basePx;
    const minSize = 8;
    while (el.scrollHeight > labelBounds.storyMaxHeight && size > minSize) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
    setStoryFontPx(size);
  }, [lifestory, labelBounds, baseStoryFontSize, fontsReady]);

  // Title (max 20자) + subtitle (max 25자) on the tape label — same policy
  // as lifestory: wrap freely, then shrink both fonts by a shared scale
  // until the pair fits the label box. Never uses "..." truncation.
  const labelBoxRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const [labelFontPx, setLabelFontPx] = useState(null);
  const baseTitleFontSize = isPortrait
    ? "clamp(0.8rem, 3.6vw, 1.05rem)"
    : "clamp(0.75rem, 2vw, 1.4rem)";
  const baseSubFontSize = isPortrait
    ? "clamp(0.65rem, 2.8vw, 0.85rem)"
    : "clamp(0.75rem, 1.5vw, 1.0rem)";

  useLayoutEffect(() => {
    const box = labelBoxRef.current;
    const titleEl = titleRef.current;
    if (!box || !titleEl || !title || !labelBounds) {
      setLabelFontPx(null);
      return;
    }
    const subEl = subRef.current;
    titleEl.style.fontSize = baseTitleFontSize;
    if (subEl) subEl.style.fontSize = baseSubFontSize;
    const titleBase = parseFloat(getComputedStyle(titleEl).fontSize);
    const subBase = subEl ? parseFloat(getComputedStyle(subEl).fontSize) : 0;

    // offsetHeight (not box.scrollHeight): the box centers its content, so
    // upward overflow is invisible to scrollHeight.
    const fits = () => {
      const h = titleEl.offsetHeight + (subEl ? subEl.offsetHeight : 0);
      const w = Math.max(titleEl.scrollWidth, subEl ? subEl.scrollWidth : 0);
      return h <= box.clientHeight + 1 && w <= box.clientWidth + 1;
    };

    let scale = 1;
    const minScale = Math.min(1, 8 / titleBase);
    while (!fits() && scale > minScale) {
      scale = Math.max(scale - 0.05, minScale);
      titleEl.style.fontSize = `${titleBase * scale}px`;
      if (subEl) subEl.style.fontSize = `${subBase * scale}px`;
    }
    setLabelFontPx(
      scale < 1 ? { title: titleBase * scale, sub: subBase * scale } : null,
    );
  }, [
    title,
    subTitle,
    labelBounds,
    baseTitleFontSize,
    baseSubFontSize,
    fontsReady,
  ]);

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
        ref={imgRef}
        src={tapeSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        onLoad={handleImgLoad}
        draggable={false}
      />

      {/* 나가기 — 로그인 유저는 라이브러리로, 아니면 랜딩으로 (VHSExhibition에서 결정) */}
      {onExit && (
        <button
          onClick={onExit}
          aria-label="나가기"
          className="absolute top-[max(env(safe-area-inset-top),1.25rem)] left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {labelBounds && (
        <>
          {/* Lifestory text above tape */}
          {lifestory && (
            <p
              ref={storyRef}
              className="absolute text-center leading-relaxed break-words text-white/70"
              style={{
                fontFamily: "serif",
                fontSize: storyFontPx ? `${storyFontPx}px` : baseStoryFontSize,
                left: labelBounds.storyLeft,
                top: labelBounds.storyTop,
                width: labelBounds.storyWidth,
                maxHeight: labelBounds.storyMaxHeight,
                overflow: "hidden",
              }}
            >
              {lifestory}
            </p>
          )}

          {/* Title on tape label */}
          {title && (
            <div
              ref={labelBoxRef}
              className="absolute flex flex-col items-center justify-center overflow-hidden"
              style={{
                left: labelBounds.left,
                top: labelBounds.top,
                width: labelBounds.width,
                height: labelBounds.height,
              }}
            >
              <span
                ref={titleRef}
                className="w-full text-center font-bold break-words text-neutral-800"
                style={{
                  fontSize: labelFontPx
                    ? `${labelFontPx.title}px`
                    : baseTitleFontSize,
                  lineHeight: isPortrait ? 1.35 : 1.5,
                }}
              >
                {title}
              </span>
              {subTitle && (
                <span
                  ref={subRef}
                  className="w-full text-center break-words text-neutral-800"
                  style={{
                    fontSize: labelFontPx
                      ? `${labelFontPx.sub}px`
                      : baseSubFontSize,
                    lineHeight: 1.3,
                  }}
                >
                  {subTitle}
                </span>
              )}
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
