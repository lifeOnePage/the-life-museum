"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

// 톤별 둥근 버튼 스타일 — MemoryTab의 기존 버튼과 동일
function roundBtnClass(isDark) {
  return `flex items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
    isDark
      ? "bg-white/10 text-white/80 hover:bg-white/20"
      : "bg-black/10 text-black/70 hover:bg-black/20"
  }`;
}

/**
 * MediaRing 위에 겹치는 좌우 넘김 버튼(+선택적 닫기 버튼).
 * 부모는 `relative` 컨테이너여야 하며, 버튼은 absolute로 배치된다.
 * - onPrev / onNext: 좌·우 버튼 (없으면 해당 버튼 숨김)
 * - onClose: 상단 중앙 닫기 버튼 (없으면 숨김)
 */
export default function MediaRingNav({
  isDark = true,
  onPrev,
  onNext,
  onClose,
  showArrows = true,
}) {
  return (
    <>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 left-1/2 z-30 h-9 w-9 -translate-x-1/2 ${roundBtnClass(isDark)}`}
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      )}

      {showArrows && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className={`absolute top-1/2 left-2 z-30 h-10 w-10 -translate-y-1/2 ${roundBtnClass(isDark)}`}
          aria-label="이전 사진"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {showArrows && onNext && (
        <button
          type="button"
          onClick={onNext}
          className={`absolute top-1/2 right-2 z-30 h-10 w-10 -translate-y-1/2 ${roundBtnClass(isDark)}`}
          aria-label="다음 사진"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </>
  );
}
