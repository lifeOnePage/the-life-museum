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

  // 이벤트가 적으면 컨테이너 폭을 칸 수로 균등 분할(라벨이 가운데 오도록), 많아지면
  // 칸당 최소 18vw 를 확보해 가로 스크롤로 넘긴다 (라벨 max-w-[16vw] 가 안 잘리게)
  const MIN_COL_VW = 18;

  return (
    <div className="scrollbar-hide w-full overflow-x-auto">
      <div
        className="relative flex"
        style={{ width: `max(100%, ${MIN_COL_VW * count}vw)` }}
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
              style={{ width: `${100 / count}%` }}
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
    // 한 프레임 레이아웃: 페이지 스크롤 없이(overflow-hidden, 스크롤바 없음) 세로 공간을
    // 나눠 쓴다 — 슬라이드쇼가 남는 높이를 모두 차지(flex-1)하고, 텍스트·타임라인은
    // 고정 높이, 생애문만 상한(max-h) 안에서 필요 시 내부 스크롤(스크롤바 숨김).
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-black px-[6%] pt-[4vh] text-white"
      style={{ paddingBottom: "calc(8vh + env(safe-area-inset-bottom))" }}
    >
      {/* 사진 슬라이드쇼 — 메모리 탭의 플레인 선택(포커스) 구도를 그대로 재사용 */}
      {ringCount > 0 && (
        <div className="relative min-h-[26vh] w-full flex-1">
          <div className="absolute inset-0 h-full w-full">
            <MediaRing
              mediaList={ringMedia}
              focusedIndex={idx}
              onFocusChange={setIdx}
              isDark
              lockFocus
              autoAdvanceMs={AUTO_ADVANCE_MS}
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
      <div className="mx-auto mt-[2.5vh] flex w-full max-w-[86%] shrink-0 flex-col items-center text-center">
        <h2 className="line-clamp-1 font-serif text-[2.6vh] leading-tight font-medium tracking-wide">
          {name}
        </h2>
        {yearRange && (
          <p className="mt-[0.8vh] text-[1.5vh] tracking-[0.25em] text-white/50">
            {yearRange}
          </p>
        )}
        {motto && (
          <p className="mt-[1.2vh] line-clamp-1 font-serif text-[1.7vh] leading-[1.6] text-white/70 italic">
            {motto}
          </p>
        )}
        {subtitle && (
          <p className="mt-[1vh] line-clamp-1 text-[1.4vh] leading-[1.7] font-light text-white/60">
            {subtitle}
          </p>
        )}
      </div>

      {/* 대각선 플래그 타임라인 */}
      {events.length > 0 && (
        <div className="mt-[2.5vh] w-full shrink-0">
          <FlagTimeline
            events={events}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          {selectedEvent?.description && (
            <div className="mx-auto mt-[1.5vh] w-full max-w-[90%] text-center">
              <p className="line-clamp-2 text-[1.45vh] leading-[1.8] font-light text-white/55">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 생애문(bio) — 상한 높이 안에서만 표시, 길면 내부 스크롤(스크롤바 숨김) */}
      {bio && (
        <p className="scrollbar-hide mt-[2.5vh] max-h-[14vh] min-h-[3vh] w-full max-w-[92%] overflow-y-auto text-[1.45vh] leading-[1.9] font-light whitespace-pre-line text-white/60">
          {bio}
        </p>
      )}
    </div>
  );
}
