"use client";

import { useMemo } from "react";

function yearNum(ts) {
  const m = String(ts || "").match(/\d{4}/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
}

function Column({ items, align }) {
  return (
    <div
      className={`flex flex-col gap-[2.2vh] ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      {items.map((ev, i) => (
        <div key={i} className="flex flex-col">
          {/* 연도 — 프로토타입 대비 약 3배 */}
          <span className="text-[2.1vh] font-light tracking-[0.2em] text-white/45">
            {ev.timestamp}
          </span>
          {/* 제목 — 프로토타입 대비 약 3배. 길면 줄바꿈하여 코너 안에 유지 */}
          <span className="font-serif text-[2.9vh] leading-tight tracking-wide break-keep whitespace-normal text-white/80">
            {ev.title}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * 하단 좌/우 타임라인. timeline.events를 연도순 정렬 후 절반씩 좌/우로 분할.
 * 폰트는 프로토타입 대비 약 3배 크기.
 */
export default function TimelineColumns({ events = [] }) {
  const { left, right } = useMemo(() => {
    const sorted = [...events].sort((a, b) => yearNum(a.timestamp) - yearNum(b.timestamp));
    const half = Math.ceil(sorted.length / 2);
    return { left: sorted.slice(0, half), right: sorted.slice(half) };
  }, [events]);

  if (events.length === 0) return null;

  return (
    <>
      <div className="pointer-events-none absolute bottom-[5vh] left-[3vw] z-10 max-w-[26vw]">
        <Column items={left} align="left" />
      </div>
      <div className="pointer-events-none absolute right-[3vw] bottom-[5vh] z-10 max-w-[26vw]">
        <Column items={right} align="right" />
      </div>
    </>
  );
}
