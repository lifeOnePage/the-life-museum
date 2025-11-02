"use client";
import * as React from "react";

/**
 * props (기존 그대로 유지)
 * - sections: [{ key, label, start, end }]  ← 여기에 {key:'all', label:'전체', start:0, end:nReal-1} 를 포함해 전달
 * - activeSectionKey
 * - onChangeSection: (key) => void
 * - sliderMin, sliderMax, sliderValue
 * - onSliderChange: (val) => void         ← leftmost 실제 인덱스를 의미
 * - onStep: (delta) => void                ← ◀ -1 / ▶ +1 한 장씩 이동
 */
export default function RingHUD({
  sections,
  activeSectionKey,
  onChangeSection,
  sliderMin,
  sliderMax,
  sliderValue,
  onSliderChange,
  onStep,
}) {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-auto w-[92%] max-w-[680px]">
      {/* 섹션 탭 (프로필 / 생애문 / … / 전체) */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {sections.map((s) => {
          const active = s.key === activeSectionKey;
          return (
            <button
              key={s.key}
              onClick={() => onChangeSection(s.key)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 슬라이더 + ◀ ▶ */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onStep?.(-1)}
          className="rounded-full border border-white/30 px-3 py-1 text-white hover:bg-white/10"
          aria-label="prev"
        >
          ◀
        </button>

        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={sliderValue}
          onChange={(e) => onSliderChange?.(Number(e.target.value))}
          className="w-full accent-white"
        />

        <button
          onClick={() => onStep?.(1)}
          className="rounded-full border border-white/30 px-3 py-1 text-white hover:bg-white/10"
          aria-label="next"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
