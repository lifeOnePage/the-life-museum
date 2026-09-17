"use client";

import { useCallback, useMemo, useState } from "react";
import MediaRing, { MAX_PLANES } from "./MediaRing";
import MediaRingNav from "./MediaRingNav";
import { nextRingIndex, prevRingIndex, ringMediaOf } from "./ringMedia";

function shortYear(ts) {
  return String(ts ?? "").slice(0, 4);
}

// 스토리 탭 슬라이드쇼 자동 넘김 간격 (ms) — 유휴 시 다음 사진으로
const AUTO_ADVANCE_MS = 4500;
// images 기본값 — 매 렌더 새 배열이면 ringMedia 메모가 무효화되므로 모듈 상수로 고정
const EMPTY_LIST = [];

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
 * 순서: 사진 슬라이드쇼(MediaRing 포커스 구도) → 타이틀/연도/좌우명/섭타이틀
 *       → 연도 축 대각선 플래그 타임라인 → 생애문(bio).
 * props: mediaList(우선, 커버 포함 image+video) / images(레거시 폴백) / motto(좌우명)
 */
export default function StoryTab({
  name,
  yearRange,
  subtitle,
  motto,
  mediaList,
  images = EMPTY_LIST,
  events = [],
  bio,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedEvent = events[selectedIndex] || null;

  // 슬라이드쇼 미디어 — 메모리 탭과 같은 목록(커버 제외, image+video).
  // mediaList가 없으면(레거시 호출) 이미지 목록으로 폴백
  const ringMedia = useMemo(
    () => ringMediaOf(mediaList ?? images),
    [mediaList, images],
  );
  const ringCount = Math.min(ringMedia.length, MAX_PLANES);
  const [idx, setIdx] = useState(0);

  // 좌우 넘김 — 메모리 탭 포커스 뷰와 같은 방향 규칙
  const goPrev = useCallback(
    () => setIdx((i) => prevRingIndex(i, ringCount)),
    [ringCount],
  );
  const goNext = useCallback(
    () => setIdx((i) => nextRingIndex(i, ringCount)),
    [ringCount],
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-black px-[6%] pt-[5vh] pb-[10vh] text-white">
      {/* 사진 슬라이드쇼 — 메모리 탭의 플레인 선택(포커스) 구도를 그대로 재사용.
          세로 스크롤 페이지 안이라 touch-action: pan-y (가로 드래그만 링이 받음) */}
      {ringCount > 0 && (
        <div className="relative w-full" style={{ height: "48vh" }}>
          <div className="absolute inset-0 h-full w-full">
            <MediaRing
              mediaList={ringMedia}
              focusedIndex={idx}
              onFocusChange={setIdx}
              isDark
              lockFocus
              autoAdvanceMs={AUTO_ADVANCE_MS}
              touchAction="pan-y"
            />
          </div>
          <MediaRingNav
            isDark
            onPrev={goPrev}
            onNext={goNext}
            showArrows={ringCount > 1}
          />
        </div>
      )}

      {/* 타이틀/연도/좌우명/섭타이틀 — 포커스 구도가 블록 폭을 거의 채우므로 아래에 중앙 배치 */}
      <div className="mx-auto mt-[3vh] flex w-full max-w-[86%] flex-col items-center text-center">
        <h2 className="font-serif text-[2.6vh] leading-tight font-medium tracking-wide">
          {name}
        </h2>
        {yearRange && (
          <p className="mt-[1vh] text-[1.5vh] tracking-[0.25em] text-white/50">
            {yearRange}
          </p>
        )}
        {motto && (
          <p className="mt-[1.5vh] font-serif text-[1.7vh] leading-[1.7] italic text-white/70">
            {motto}
          </p>
        )}
        {subtitle && (
          <p className="mt-[1.5vh] text-[1.4vh] leading-[1.8] font-light text-white/60">
            {subtitle}
          </p>
        )}
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
