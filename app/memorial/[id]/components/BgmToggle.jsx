"use client";

import { Play, Pause } from "lucide-react";

/**
 * 앨범 BGM 재생/정지 토글 버튼 — 인트로 포스터 화면과 탭 화면 양쪽에서 공용.
 * 재생 여부(isPlaying)는 부모(MemorialExhibition)가 useBGM 상태로 계산해 내려준다.
 * 부모가 <button>(IntroPoster)인 경우 중첩 인터랙티브 요소를 피하기 위해
 * 형제 오버레이로 배치하고, 클릭 전파를 막아 포스터의 onEnter가 함께 발동하지 않게 한다.
 */
export default function BgmToggle({ isPlaying, onToggle, className = "" }) {
  return (
    <button
      type="button"
      // window 의 최초 제스처 자동재생(pointerdown) 리스너까지 닿지 않게 막는다 —
      // 그렇지 않으면 pointerdown 이 재생을 시작하고 이어지는 click 이 바로 정지시킨다
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white ${className}`}
      aria-label={isPlaying ? "음악 정지" : "음악 재생"}
    >
      {isPlaying ? (
        <Pause size={16} />
      ) : (
        // 재생 삼각형은 시각적 중심이 왼쪽으로 치우쳐 보여 살짝 오른쪽으로 보정
        <Play size={16} className="translate-x-[1px]" />
      )}
    </button>
  );
}
