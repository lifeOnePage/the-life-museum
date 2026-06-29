import { useState, useEffect, useRef, useCallback } from "react";
import {
  PROFILE_HOLD_MS,
  SLIDE_HOLD_MS,
  SLIDESHOW_DURATION_MS,
} from "./constants";

/**
 * Gravestone 중앙 스테이지 사이클 상태머신.
 *
 *   profile ──(PROFILE_HOLD_MS)──▶ slideshow ──(SLIDESHOW_DURATION_MS)──▶ profile ...
 *
 * - profile: 프로필 이미지가 중앙에 크게 표시.
 * - slideshow: 프로필이 좌상단 슬롯으로 모핑(상위 컴포넌트의 layoutId가 담당)되고,
 *              중앙에는 배경 미디어 중 랜덤 1개가 SLIDE_HOLD_MS마다 교체된다.
 *
 * @param {{ slideCount: number, active: boolean }} opts
 * @returns {{ phase: "profile"|"slideshow", slideIndex: number }}
 */
export function useGravestoneCycle({ slideCount, active }) {
  const [phase, setPhase] = useState("profile");
  const [slideIndex, setSlideIndex] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // 직전과 다른 랜덤 인덱스 선택
  const pickRandom = useCallback(
    (exclude) => {
      if (slideCount <= 1) return 0;
      let idx = Math.floor(Math.random() * slideCount);
      if (idx === exclude) idx = (idx + 1) % slideCount;
      return idx;
    },
    [slideCount],
  );

  useEffect(() => {
    clearTimers();
    if (!active || slideCount === 0) {
      setPhase("profile");
      return;
    }

    if (phase === "profile") {
      // 프로필 노출 후 슬라이드쇼로 전환
      const t = setTimeout(() => {
        setSlideIndex((prev) => pickRandom(prev));
        setPhase("slideshow");
      }, PROFILE_HOLD_MS);
      timersRef.current.push(t);
    } else if (phase === "slideshow") {
      // 일정 간격마다 다음 랜덤 슬라이드
      const tick = setInterval(() => {
        setSlideIndex((prev) => pickRandom(prev));
      }, SLIDE_HOLD_MS);
      timersRef.current.push(tick);

      // 쿨타임 만료 → 다시 프로필로
      const end = setTimeout(() => {
        clearInterval(tick);
        setPhase("profile");
      }, SLIDESHOW_DURATION_MS);
      timersRef.current.push(end);
    }

    return clearTimers;
    // phase/active/slideCount 변화 시 재구동
  }, [phase, active, slideCount, pickRandom, clearTimers]);

  return { phase, slideIndex };
}
