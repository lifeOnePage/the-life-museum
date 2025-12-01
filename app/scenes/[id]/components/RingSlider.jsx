"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * RingSlider - 링 조작을 위한 2단 슬라이더
 * @param {Array} items - 아이템 배열
 * @param {Object} textureData - { textures, itemRanges }
 * @param {number} leftIndex - 현재 leftmost 인덱스
 * @param {Function} onChangeLeftIndex - leftIndex 변경 콜백
 * @param {Function} onItemClick - 아이템 클릭 콜백
 */
export default function RingSlider({
  items = [],
  textureData,
  leftIndex = 0,
  onChangeLeftIndex,
  onItemClick,
}) {
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragOffsetRef = useRef(0);

  // 현재 leftIndex가 속한 아이템 찾기
  const currentItem = items.find((item) => {
    const range = textureData.itemRanges[item.id];
    if (!range) return false;
    return leftIndex >= range.start && leftIndex <= range.end;
  });

  // 현재 아이템의 인덱스
  const currentItemIndex = currentItem ? items.findIndex((item) => item.id === currentItem.id) : 0;

  // 이전/다음 아이템
  const prevItem = items[(currentItemIndex - 1 + items.length) % items.length];
  const nextItem = items[(currentItemIndex + 1) % items.length];

  // 잠금 상태에 따른 조작 가능 범위
  const [minIndex, maxIndex] = isLocked && currentItem
    ? [textureData.itemRanges[currentItem.id]?.start || 0, textureData.itemRanges[currentItem.id]?.end || 0]
    : [0, textureData.textures.length - 1];

  // 아이템 클릭 핸들러
  const handleItemClick = (item, direction) => {
    if (item && onItemClick) {
      onItemClick(item);
    }
  };

  // 잠금 토글
  const handleLockToggle = () => {
    setIsLocked((prev) => !prev);
  };

  const tickWidth = 20; // 각 눈금의 너비 (px)

  // clientX 좌표 가져오기 (마우스/터치 통합)
  const getClientX = (e) => {
    if (e.touches && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return e.changedTouches[0].clientX;
    }
    return e.clientX;
  };

  // 슬라이더 드래그 핸들러 (마우스/터치 통합)
  const handleStart = (e) => {
    isDraggingRef.current = true;
    startXRef.current = getClientX(e);
    dragOffsetRef.current = 0;
  };

  const handleMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const deltaX = getClientX(e) - startXRef.current;
    const ticksDelta = Math.round(deltaX / tickWidth);

    // 드래그한 거리만큼 인덱스 변경
    const newIndex = leftIndex - ticksDelta;
    if (newIndex >= minIndex && newIndex <= maxIndex && newIndex !== leftIndex) {
      onChangeLeftIndex?.(newIndex);
      startXRef.current = getClientX(e);
    }
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const handleGlobalMove = (e) => handleMove(e);
    const handleGlobalEnd = () => handleEnd();

    // 마우스 이벤트
    document.addEventListener("mousemove", handleGlobalMove);
    document.addEventListener("mouseup", handleGlobalEnd);
    // 터치 이벤트
    document.addEventListener("touchmove", handleGlobalMove, { passive: false });
    document.addEventListener("touchend", handleGlobalEnd);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMove);
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchmove", handleGlobalMove);
      document.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [leftIndex, minIndex, maxIndex]);

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border-t border-white/10">
      {/* 첫 번째 단: 아이템 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        {/* 이전 아이템 */}
        <button
          onClick={() => handleItemClick(prevItem, "prev")}
          className="text-[10px] text-white/50 hover:text-white/80 transition-colors truncate max-w-[30%]"
        >
          {prevItem?.title || ""}
        </button>

        {/* 현재 아이템 (잠금 토글) */}
        <button
          onClick={handleLockToggle}
          className="flex items-center gap-2 text-sm font-bold text-white truncate max-w-[40%]"
        >
          {isLocked && <Lock className="w-4 h-4" />}
          {currentItem?.title || ""}
        </button>

        {/* 다음 아이템 */}
        <button
          onClick={() => handleItemClick(nextItem, "next")}
          className="text-[10px] text-white/50 hover:text-white/80 transition-colors truncate max-w-[30%]"
        >
          {nextItem?.title || ""}
        </button>
      </div>

      {/* 두 번째 단: 네비게이션 버튼 */}
      <div className="flex items-center justify-center gap-6 px-4 py-2 border-b border-white/10">
        <button
          onClick={() => {
            const newIndex = leftIndex - 1;
            if (newIndex >= minIndex) {
              onChangeLeftIndex?.(newIndex);
            }
          }}
          disabled={leftIndex <= minIndex}
          className="text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            const newIndex = leftIndex + 1;
            if (newIndex <= maxIndex) {
              onChangeLeftIndex?.(newIndex);
            }
          }}
          disabled={leftIndex >= maxIndex}
          className="text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 세 번째 단: 인덱스 슬라이더 */}
      <div className="relative px-4 py-4 overflow-hidden">
        {/* 중앙 기준선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80 z-10 pointer-events-none" />

        {/* 눈금 슬라이더 */}
        <div
          ref={containerRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <div
            className="flex items-center"
            style={{
              transform: `translateX(calc(50% - ${leftIndex * tickWidth}px))`,
              transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
            }}
          >
            {Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => {
              const index = minIndex + i;
              const isCurrent = index === leftIndex;
              return (
                <div
                  key={index}
                  className={`flex-shrink-0 flex flex-col items-center transition-colors ${
                    isCurrent ? "text-white" : "text-white/30"
                  }`}
                  style={{ width: `${tickWidth}px` }}
                >
                  <div
                    className={`transition-all ${
                      isCurrent ? "h-6 w-1 bg-white" : "h-4 w-px bg-white/30"
                    }`}
                  />
                  {i % 5 === 0 && (
                    <span className="text-[10px] mt-1">{index}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 인덱스 표시 */}
        {/* <div className="text-center text-xs text-white/70 mt-2">
          {leftIndex} / {maxIndex}
          {isLocked && ` (${currentItem?.title || ""})`}
        </div> */}
      </div>
    </div>
  );
}
