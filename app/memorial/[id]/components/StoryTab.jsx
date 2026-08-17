"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

function shortYear(ts) {
  return String(ts ?? "").slice(0, 4);
}

// 유휴 상태에서 자동으로 회전하는 속도 (아이템/ms)
const IDLE_SPEED = 0.00004;
// 화살표 클릭 시 다음/이전 사진으로 스냅되는 데 걸리는 시간(ms)
const SNAP_DURATION_MS = 900;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 원형으로 배치된 사진들 — 천천히 자동 회전하며, 화살표로 특정 사진에 스냅 포커싱된다.
function PhotoCarousel({ images }) {
  const count = images.length;
  const [pos, setPos] = useState(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const snapRef = useRef(null); // { from, to, start }

  useEffect(() => {
    if (count === 0) return;

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      setPos((prev) => {
        if (snapRef.current) {
          const { from, to, start } = snapRef.current;
          const t = Math.min(1, (ts - start) / SNAP_DURATION_MS);
          const eased = easeInOutCubic(t);
          const next = from + (to - from) * eased;
          if (t >= 1) {
            snapRef.current = null;
            return to % count;
          }
          return next;
        }
        return (prev + dt * IDLE_SPEED) % count;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [count]);

  const snapTo = (dir) => {
    if (count === 0) return;
    const currentTarget = snapRef.current ? snapRef.current.to : pos;
    snapRef.current = {
      from: pos,
      to: currentTarget + dir,
      start: performance.now(),
    };
  };

  if (count === 0) return null;

  return (
    <div
      className="relative h-full w-full shrink-0"
      style={{ perspective: "1600px" }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {images.map((img, i) => {
          let offset = ((i - pos + count / 2) % count) - count / 2;
          if (offset < -count / 2) offset += count;
          const absOffset = Math.abs(offset);
          const scale = Math.max(0.5, 1 - absOffset * 0.18);
          const opacity = Math.max(0.12, 1 - absOffset * 0.32);
          const translateX = offset * 32; // vw
          const translateY = absOffset * absOffset * 1.4; // vh — 원호를 그리며 아래로 처짐
          const rotateY = offset * -26; // deg
          const zIndex = Math.round(1000 - absOffset * 10);

          return (
            <div
              key={img.id ?? i}
              className="absolute top-1/2 left-1/2 h-[42vh] w-[30vh] overflow-hidden bg-white/5"
              style={{
                transform: `translate(-50%, -50%) translate(${translateX}vw, ${translateY}vh) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                transition: "opacity 0.2s linear",
              }}
            >
              <img
                src={mediaSrc(img)}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => snapTo(-1)}
            className="absolute top-1/2 left-[2%] z-[2000] -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
            aria-label="이전 사진"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={() => snapTo(1)}
            className="absolute top-1/2 right-[2%] z-[2000] -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
            aria-label="다음 사진"
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>
  );
}

const H_ABOVE = 9; // vh — 축 위 라벨 영역
const H_BELOW = 8; // vh — 축 아래 라벨 영역

// 가운데를 가로지르는 긴 연도 축 + 사용자가 입력한 순서 그대로 한 칸씩 배치되는 연도 행.
// 지그재그(위/아래 번갈아) 순서로 대각선을 빼서 이벤트 라벨을 붙인다.
function FlagTimeline({ events, selectedIndex, onSelect }) {
  const count = events.length;
  if (count === 0) return null;

  // 라벨(max-w-[16vw])이 안 잘리도록 칸 너비 최소값을 넉넉히 두고, 많아지면 가로 스크롤로 넘긴다.
  const colWidth = Math.max(100 / count, 18); // vw

  return (
    <div className="scrollbar-hide w-full overflow-x-auto">
      <div
        className="relative flex"
        style={{ width: `${colWidth * count}vw`, minWidth: "100%" }}
      >
        {/* 가운데를 가로지르는 긴 연도 축 */}
        <div
          className="pointer-events-none absolute right-0 left-0 h-px bg-white/25"
          style={{ top: `${H_ABOVE}vh` }}
        />

        {events.map((ev, i) => {
          const active = i === selectedIndex;
          const above = i % 2 === 0;

          return (
            <div
              key={i}
              className="flex shrink-0 flex-col items-center"
              style={{ width: `${colWidth}vw` }}
            >
              {/* 위쪽 영역 */}
              <div
                className="flex w-full flex-col items-center justify-end"
                style={{ height: `${H_ABOVE}vh` }}
              >
                {above && (
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className="flex flex-col items-center"
                  >
                    <span
                      className={`max-w-[16vw] px-[0.3vw] text-center text-[1.4vh] leading-tight break-keep transition-colors ${
                        active
                          ? "font-medium text-white"
                          : "font-light text-white/40"
                      }`}
                    >
                      {ev.title}
                    </span>
                    <div
                      className="h-[2vh] w-px bg-white/25"
                      style={{ transform: "rotate(22deg)" }}
                    />
                  </button>
                )}
              </div>

              {/* 연도 축 위의 연도 텍스트 (사용자가 입력한 그대로) */}
              <span
                className={`mt-[0.6vh] text-[1.7vh] tracking-wide transition-colors ${
                  active ? "font-medium text-white" : "font-light text-white/50"
                }`}
              >
                {shortYear(ev.timestamp)}
              </span>

              {/* 아래쪽 영역 */}
              <div
                className="flex w-full flex-col items-center justify-start"
                style={{ height: `${H_BELOW}vh` }}
              >
                {!above && (
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="h-[2vh] w-px bg-white/25"
                      style={{ transform: "rotate(-22deg)" }}
                    />
                    <span
                      className={`max-w-[16vw] px-[0.3vw] text-center text-[1.4vh] leading-tight break-keep transition-colors ${
                        active
                          ? "font-medium text-white"
                          : "font-light text-white/40"
                      }`}
                    >
                      {ev.title}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "스토리" 탭.
 * 순서: 사진 3D 회전 카드 → 타이틀/연도/섭타이틀 → 연도 축 대각선 플래그 타임라인 → 생애문(bio).
 */
export default function StoryTab({
  name,
  yearRange,
  subtitle,
  images = [],
  events = [],
  bio,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedEvent = events[selectedIndex] || null;

  return (
    <div className="h-full w-full overflow-y-auto bg-black px-[6%] pt-[5vh] pb-[10vh] text-white">
      {/* 사진 회전 + 타이틀/연도/섭타이틀 (오른쪽 아래에 겹쳐서 배치) */}
      <div className="relative w-full" style={{ height: "48vh" }}>
        <PhotoCarousel images={images} />

        <div className="absolute right-[2%] bottom-0 z-[2100] flex max-w-[46%] flex-col items-end text-right">
          <h2 className="font-serif text-[2.6vh] leading-tight font-medium tracking-wide">
            {name}
          </h2>
          {yearRange && (
            <p className="mt-[1vh] text-[1.5vh] tracking-[0.25em] text-white/50">
              {yearRange}
            </p>
          )}
          {subtitle && (
            <p className="mt-[1.5vh] text-[1.4vh] leading-[1.8] font-light text-white/60">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 대각선 플래그 타임라인 */}
      {events.length > 0 && (
        <div className="mt-[4vh] w-full">
          <FlagTimeline
            events={events}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          {selectedEvent?.description && (
            <div className="mx-auto mt-[2vh] w-full max-w-[90%] text-center">
              <p className="text-[1.5vh] leading-[1.9] font-light text-white/55">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 생애문(bio) */}
      {bio && (
        <p className="mt-[4vh] max-w-[92%] text-[1.5vh] leading-[2] font-light whitespace-pre-line text-white/60">
          {bio}
        </p>
      )}
    </div>
  );
}
