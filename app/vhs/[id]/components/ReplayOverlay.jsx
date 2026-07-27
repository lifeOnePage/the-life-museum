"use client";

import { RotateCcw } from "lucide-react";

/**
 * 재생 종료(루프 off) 시 TV 화면 영역 위에 뜨는 "다시 재생" 버튼.
 * TV 프레임 이미지·클릭 캡처 레이어(zIndex 2·3)보다 위(zIndex 4)에 두어야
 * 클릭이 막히지 않는다. bounds는 TV 화면(screenBounds)과 동일하게 전달한다.
 */
export default function ReplayOverlay({ bounds, onReplay, borderRadius }) {
  if (!bounds) return null;
  return (
    <button
      type="button"
      aria-label="다시 재생"
      onClick={(e) => {
        e.stopPropagation();
        onReplay?.();
      }}
      className="absolute flex flex-col items-center justify-center gap-[5%] bg-black/55 text-white"
      style={{
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        borderRadius,
        zIndex: 4,
      }}
    >
      <span className="flex aspect-square w-[20%] max-w-[80px] min-w-[36px] items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105">
        <RotateCcw className="h-1/2 w-1/2" strokeWidth={2.2} />
      </span>
      <span className="text-xs font-medium tracking-tight text-white/90">
        다시 재생
      </span>
    </button>
  );
}
