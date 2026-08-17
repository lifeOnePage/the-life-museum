"use client";

import { ArrowRight } from "lucide-react";
import {
  TONE_STYLES,
  getFrameWrapperStyle,
  getFrameInnerProps,
} from "./introPosterStyles";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

/**
 * 메모리얼 감상 진입 전 인트로 포스터 화면.
 * 세로 순서: 앞면 사진 → 타이틀(이름) → 시작연도~끝연도 → 섭타이틀(부제목) → 안내 문구.
 * 화면을 터치하면 실제 전시(onEnter)로 넘어간다.
 */
export default function IntroPoster({
  name,
  yearRange,
  subtitle,
  profileItem,
  style = "classic",
  tone = "dark",
  aspectRatio = "9:16",
  onEnter,
}) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.dark;
  const frameWrapperStyle = getFrameWrapperStyle(style);
  const frameInner = getFrameInnerProps(style, tone);
  const photoSrc = mediaSrc(profileItem);
  const isPortrait = aspectRatio !== "16:9";

  return (
    <button
      type="button"
      onClick={onEnter}
      className={`relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center overflow-hidden px-[6%] py-[6vh] text-left ${toneStyle.bg}`}
    >
      <div
        className={`flex w-full flex-col items-center ${
          isPortrait ? "max-w-[46vh]" : "max-w-[32vh]"
        }`}
      >
        {/* 앞면 사진 (3:4) */}
        <div className="aspect-[3/4] w-full" style={frameWrapperStyle}>
          <div className={frameInner.className} style={frameInner.style}>
            {photoSrc && (
              <img
                src={photoSrc}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* 타이틀 */}
        <h1 className="mt-[3.5vh] text-center font-serif text-[3.4vh] leading-tight font-medium tracking-wide">
          {name}
        </h1>

        {/* 시작연도~끝연도 */}
        {yearRange && (
          <p
            className={`mt-[1vh] text-center text-[1.7vh] tracking-[0.3em] ${toneStyle.subText}`}
          >
            {yearRange}
          </p>
        )}

        {/* 섭타이틀 */}
        {subtitle && (
          <p
            className={`mt-[2.5vh] max-w-[90%] text-center text-[1.6vh] leading-[1.9] font-light tracking-wide ${toneStyle.subText}`}
          >
            {subtitle}
          </p>
        )}

        {/* 안내 문구 */}
        <p
          className={`mt-[4vh] flex items-center justify-center gap-[0.6vh] text-center text-[1.4vh] tracking-wide ${toneStyle.hintText}`}
        >
          화면을 터치하여 고인의 삶을 만나고 방명록에 글을 남겨주세요
          <ArrowRight className="h-[1.6vh] w-[1.6vh] shrink-0" />
        </p>
      </div>
    </button>
  );
}
