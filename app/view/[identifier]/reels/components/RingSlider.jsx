"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * RingSlider
 * props:
 * - totalSlots: number
 * - leftIndex: number
 * - onChangeLeftIndex: (n:number)=>void
 * - sections: Array<{ key:string, label:string, start:number, end:number }>
 * - activeKey: string
 * - onChangeSection: (key:string)=>void
 * - snapSoundUrl?: string
 */
export default function RingSlider({
  totalSlots = 0,
  leftIndex = 0,
  onChangeLeftIndex,
  sections = [],
  activeKey = "all",
  onChangeSection,
  snapSoundUrl = "/sounds/paper.mp3",
}) {
  const [open, setOpen] = useState(false);

  // 안전 가드 유틸
  const toInt = (v, f = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : f;
  };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // 현재 섹션의 [start,end] 폴백 계산
  const currentRange = useMemo(() => {
    const fallback = [0, Math.max(0, toInt(totalSlots) - 1)];
    if (!Array.isArray(sections) || sections.length === 0) return fallback;
    const s = sections.find((x) => x.key === activeKey);
    if (!s) return fallback;
    const a = toInt(s.start, fallback[0]);
    const b = toInt(s.end, fallback[1]);
    return [Math.min(a, b), Math.max(a, b)];
  }, [sections, activeKey, totalSlots]);

  const minIdx = toInt(currentRange?.[0], 0);
  const maxIdx = Math.max(minIdx, toInt(currentRange?.[1], 0));

  // 슬라이더 표시값(항상 유효 숫자)
  const displayValue = clamp(toInt(leftIndex, minIdx), minIdx, maxIdx);

  // --- 사운드: 이중 풀 ---
  const audioPoolRef = useRef([]);
  const poolIdxRef = useRef(0);
  useEffect(() => {
    if (typeof Audio === "undefined") return;
    audioPoolRef.current = [new Audio(), new Audio()];
    for (const a of audioPoolRef.current) {
      a.src = snapSoundUrl;
      a.preload = "auto";
    }
  }, [snapSoundUrl]);

  const playSnap = () => {
    const pool = audioPoolRef.current;
    if (!pool?.length) return;
    poolIdxRef.current = (poolIdxRef.current + 1) % pool.length;
    const a = pool[poolIdxRef.current];
    try {
      a.currentTime = 0;
      a.play();
    } catch {}
  };

  // --- 이동 로직(범위 내 순환) ---
  const stepPrev = () => {
    const next = displayValue - 1 < minIdx ? maxIdx : displayValue - 1;
    onChangeLeftIndex?.(next);
    playSnap();
  };
  const stepNext = () => {
    const next = displayValue + 1 > maxIdx ? minIdx : displayValue + 1;
    onChangeLeftIndex?.(next);
    playSnap();
  };

  // 길게 누르기 반복
  const holdTimerRef = useRef(null);
  const startHold = (fn) => {
    if (holdTimerRef.current) return;
    fn(); // 즉시 1회
    holdTimerRef.current = setInterval(fn, 1000);
  };
  const stopHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // 드롭다운 그룹핑
  const grouped = useMemo(() => {
    const common = [];
    const childhood = [];
    const memories = [];
    const rels = [];
    const others = [];
    for (const s of sections || []) {
      console.log(s);
      if (s.key === "all") continue;
      if (s.key === "profile" || s.key === "lifestory" || s.key === "childhood")
        common.push(s);
      else if (s.key?.startsWith("memory:")) memories.push(s);
      else if (s.key?.startsWith("relationship:")) rels.push(s);
      else others.push(s);
    }
    return { common, memories, rels, others };
  }, [sections]);

  const disabled = maxIdx <= minIdx; // 슬롯 0개 또는 1개면 비활성화
  // console.log(sections)
  return (
    <div className="w-full">
      <div className="relative flex items-center gap-2 rounded-t-2xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
        {/* Prev */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 active:scale-95 disabled:opacity-40"
          // onMouseDown={() => !disabled && startHold(stepPrev)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onClick={() => stepPrev()}
          // onTouchStart={() => !disabled && startHold(stepPrev)}
          // onTouchEnd={stopHold}
          disabled={disabled}
          aria-label="이전"
        >
          <ChevronLeft className="h-5 w-5 text-white/90" />
        </button>

        {/* Slider */}
        <input
          type="range"
          min={minIdx}
          max={maxIdx}
          step={1}
          value={displayValue}
          onChange={(e) => {
            if (disabled) return;
            const raw = Number(e.target.value);
            const v = clamp(toInt(raw, minIdx), minIdx, maxIdx);
            onChangeLeftIndex?.(v);
            playSnap();
          }}
          className="flex-1 accent-white disabled:opacity-40"
          disabled={disabled}
        />

        {/* Next */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 active:scale-95 disabled:opacity-40"
          // onMouseDown={() => !disabled && startHold(stepNext)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onClick={() => stepNext()}
          // onTouchStart={() => !disabled && startHold(stepNext)}
          // onTouchEnd={stopHold}
          disabled={disabled}
          aria-label="다음"
        >
          <ChevronRight className="h-5 w-5 text-white/90" />
        </button>

        {/* 메뉴 버튼 */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg.white/5 ml-2 flex h-9 items-center gap-1 rounded-lg border border-white/10 px-2 text-sm text-white/90 active:scale-95"
          aria-expanded={open}
          aria-haspopup="true"
        >
          목차{" "}
          {open ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            <ChevronUp className="ml-1 h-4 w-4" />
          )}
        </button>

        {/* 드롭다운 (위로) */}
        {open && (
          <div className="absolute right-0 bottom-12 z-50 w-[min(92vw,340px)] rounded-xl border border-white/10 bg-black/80 p-2 backdrop-blur-md">
            {sections?.some((s) => s.key === "all") && (
              <>
                <div className="my-4">
                  <MenuSectionHeader>전체</MenuSectionHeader>
                  {sections
                    .filter((s) => s.key === "all")
                    .map((s) => (
                      <MenuItem
                        key={s.key}
                        active={activeKey === s.key}
                        onClick={() => {
                          onChangeSection?.(s.key);
                          setOpen(false);
                          playSnap();
                        }}
                      >
                        {s.label}
                      </MenuItem>
                    ))}
                </div>
              </>
            )}

            {grouped.common.length > 0 && (
              <>
                <div className="my-4">
                  <MenuSectionHeader>공통</MenuSectionHeader>
                  {grouped.common.map((s) => (
                    <MenuItem
                      key={s.key}
                      active={activeKey === s.key}
                      onClick={() => {
                        onChangeSection?.(s.key);
                        setOpen(false);
                        playSnap();
                      }}
                    >
                      {s.label}
                    </MenuItem>
                  ))}
                </div>
              </>
            )}

            {grouped.memories.length > 0 && (
              <>
                <div className="my-4">
                  <MenuSectionHeader>소중한 기억</MenuSectionHeader>
                  {grouped.memories.map((s) => (
                    <MenuItem
                      key={s.key}
                      active={activeKey === s.key}
                      onClick={() => {
                        onChangeSection?.(s.key);
                        setOpen(false);
                        playSnap();
                      }}
                    >
                      {s.label}
                    </MenuItem>
                  ))}
                </div>
              </>
            )}

            {grouped.rels.length > 0 && (
              <>
                <MenuSectionHeader>소중한 인연</MenuSectionHeader>
                {grouped.rels.map((s) => (
                  <MenuItem
                    key={s.key}
                    active={activeKey === s.key}
                    onClick={() => {
                      onChangeSection?.(s.key);
                      setOpen(false);
                      playSnap();
                    }}
                  >
                    {s.label}
                  </MenuItem>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuSectionHeader({ children }) {
  return (
    <div className="flex items-center justify-between gap-1 px-2 py-1 text-[11px] font-semibold tracking-wide text-white/60">
      {children}
      <div className="h-px flex-1 bg-white/50"></div>
    </div>
  );
}
function MenuItem({ children, active, onClick }) {
  return (
    <button
      className={`w-full rounded-md px-2 py-1.5 text-left text-[13px] ${
        active
          ? "bg-white/15 text-white"
          : "text-white/85 hover:bg-white/10 active:bg-white/15"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
