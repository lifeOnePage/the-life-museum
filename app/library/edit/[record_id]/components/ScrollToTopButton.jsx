"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

// 가장 가까운 스크롤 가능한 조상 엘리먼트를 찾는다.
function getScrollParent(el) {
  let node = el?.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * 스크롤 컨테이너 우하단에 떠 있는 "맨 위로" 버튼.
 * - 마운트 시 가장 가까운 스크롤 컨테이너를 탐색해, 그 컨테이너 모서리에
 *   position:fixed 로 고정 → 스크롤해도 항상 같은 위치에 떠 있다.
 * - `targetRef`가 주어지면 컨테이너 최상단(0)이 아니라 해당 엘리먼트가
 *   시작되는 지점(예: 포토드라이브 사진 목록 시작점)으로 스크롤한다.
 * - `enabled`(예: 사진이 일정 수 이상)일 때만 활성화하고,
 *   목록 시작점에서 `threshold`px 이상 내려갔을 때만 노출한다.
 */
export default function ScrollToTopButton({
  enabled = true,
  threshold = 50,
  label = "맨 위로",
  targetRef,
}) {
  const anchorRef = useRef(null);
  const scrollElRef = useRef(null);
  const targetScrollTopRef = useRef(0); // 목록 시작점의 스크롤 위치(px)
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(null); // 뷰포트 기준 {right, bottom} px

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    const scrollEl = getScrollParent(anchorRef.current);
    scrollElRef.current = scrollEl;
    if (!scrollEl) return;

    const update = () => {
      const cRect = scrollEl.getBoundingClientRect();
      setPos({
        right: window.innerWidth - cRect.right + 16,
        bottom: window.innerHeight - cRect.bottom + 16,
      });
      // 목록 시작점(targetRef)의 스크롤 컨테이너 내 절대 위치 계산
      const targetEl = targetRef?.current;
      const targetTop = targetEl
        ? scrollEl.scrollTop +
          (targetEl.getBoundingClientRect().top - cRect.top)
        : 0;
      targetScrollTopRef.current = Math.max(0, targetTop);
      setVisible(scrollEl.scrollTop - targetScrollTopRef.current > threshold);
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, threshold, targetRef]);

  const scrollToTop = useCallback(() => {
    scrollElRef.current?.scrollTo({
      top: targetScrollTopRef.current,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      {/* 스크롤 컨테이너 탐색용 앵커 (렌더링 안 됨) */}
      <span ref={anchorRef} className="hidden" aria-hidden />
      {enabled && visible && pos && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={label}
          style={{
            position: "fixed",
            right: `${pos.right}px`,
            bottom: `${pos.bottom}px`,
            zIndex: 50,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4b49a] text-[#1a1510] shadow-lg ring-1 ring-black/10 transition-all hover:bg-[#e8d5b7] active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
