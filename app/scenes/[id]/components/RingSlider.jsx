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
  isPanelOpen = false,
  onTogglePanel,
  isDesktop = false,
  onOpenProfileCurtain,
}) {
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const wheelAccumulatorRef = useRef(0); // 휠 스크롤 누적값

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

  const tickWidth = 20; // 각 눈금의 너비 (px) - 구 버전용
  const filmFrameWidth = 40; // 필름 프레임 너비 (px)
  const filmFrameHeight = 30; // 필름 프레임 높이 (px) - 4:3 비율

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
    const framesDelta = Math.round(deltaX / filmFrameWidth);

    // 드래그한 거리만큼 인덱스 변경
    const newIndex = leftIndex - framesDelta;
    if (newIndex >= minIndex && newIndex <= maxIndex && newIndex !== leftIndex) {
      onChangeLeftIndex?.(newIndex);
      startXRef.current = getClientX(e);
    }
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  // 휠 스크롤 핸들러 (데스크탑용)
  const handleWheel = (e) => {
    if (!isDesktop) return;

    e.preventDefault();

    // 가로 스크롤 우선 (트랙패드 두 손가락 좌우)
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;

    // 가로 스크롤이 세로보다 크면 가로 스크롤로 처리
    const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY);
    const scrollAmount = isHorizontalScroll ? deltaX : deltaY;

    // 스크롤 값을 누적
    wheelAccumulatorRef.current += scrollAmount;

    // 임계값 설정 (이 값을 넘으면 한 프레임 이동)
    const threshold = 40; // 값이 작을수록 민감, 클수록 둔감

    // 누적값이 임계값을 넘으면 이동
    if (Math.abs(wheelAccumulatorRef.current) >= threshold) {
      const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
      const newIndex = leftIndex + direction;

      if (newIndex >= minIndex && newIndex <= maxIndex) {
        onChangeLeftIndex?.(newIndex);
        // 이동 후 누적값에서 임계값만큼 빼기 (나머지 유지)
        wheelAccumulatorRef.current -= direction * threshold;
      } else {
        // 범위를 벗어나면 누적값 초기화
        wheelAccumulatorRef.current = 0;
      }
    }
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

  // 휠 이벤트 리스너 등록 (passive: false로 설정하여 preventDefault 활성화)
  useEffect(() => {
    if (!isDesktop) return;

    const sliderElement = containerRef.current?.parentElement;
    if (!sliderElement) return;

    sliderElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      sliderElement.removeEventListener("wheel", handleWheel);
    };
  }, [isDesktop, leftIndex, minIndex, maxIndex]);

  return (
    <div className="w-full  border-white/10">
      {/* 데스크탑 - 프로필 버튼만 표시 */}
      {isDesktop && (
        <div className="flex justify-end items-center px-4 py-2 border-b border-white/10">
          <button
            onClick={onOpenProfileCurtain}
            className="flex flex-row items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xs">프로필 보기</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="6"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M3 13c0-2.5 2-4 5-4s5 1.5 5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 모바일 - 토글 버튼 양쪽 표시 */}
      {!isDesktop && (
        <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
          {/* 전체 보기 / 닫기 버튼 - 왼쪽 */}
          <button
            onClick={onTogglePanel}
            className="flex flex-row items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            {isPanelOpen ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs">닫기</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform rotate-180"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs">전체 보기</span>
              </>
            )}
          </button>

          {/* 프로필 보기 버튼 - 오른쪽 */}
          <button
            onClick={onOpenProfileCurtain}
            className="flex flex-row items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xs">프로필 보기</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="6"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M3 13c0-2.5 2-4 5-4s5 1.5 5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 첫 번째 단: 아이템 네비게이션 */}
      <div className="relative bg-black/30 backdrop-blur-md py-3 border-b border-white/10" style={{ perspective: "1000px" }}>
        {/* 이전 아이템 - 왼쪽 */}
        <button
          onClick={() => handleItemClick(prevItem, "prev")}
          className="absolute left-4 top-1/2 text-[14px] text-white/50 hover:text-white/80 transition-all truncate max-w-[25%]"
          style={{
            transform: "translateY(-50%) rotateY(15deg) scale(0.9)",
            transformOrigin: "right center",
          }}
        >
          {prevItem?.title || ""}
        </button>

        {/* 현재 아이템 (잠금 토글) - 중앙 */}
        <div className="flex justify-center">
          <button
            onClick={handleLockToggle}
            className="flex items-center gap-2 text-sm font-bold text-white truncate max-w-[40%] transition-all"
            style={{
              transform: "scale(1)",
              zIndex: 10,
            }}
          >
            {isLocked && <Lock className="w-4 h-4" />}
            {currentItem?.title || ""}
          </button>
        </div>

        {/* 다음 아이템 - 오른쪽 */}
        <button
          onClick={() => handleItemClick(nextItem, "next")}
          className="absolute right-4 top-1/2  text-[14px] text-white/50 hover:text-white/80 transition-all truncate max-w-[25%]"
          style={{
            transform: "translateY(-50%) rotateY(-15deg) scale(0.9)",
            transformOrigin: "left center",
          }}
        >
          {nextItem?.title || ""}
        </button>
      </div>

      {/* 두 번째 단: 네비게이션 버튼 */}
      {/* <div className="flex items-center justify-center gap-6 px-4 py-2 border-b border-white/10">
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
      </div> */}

      {/* 세 번째 단: 필름 스트립 슬라이더 */}
      <div
        className="relative bg-black/30 backdrop-blur-md px-4 py-4 overflow-hidden"
        style={{
          maskImage: "radial-gradient(ellipse 100% 120% at 50% 50%, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 120% at 50% 50%, black 40%, transparent 70%)",
        }}
      >
        {/* 필름 스트립 */}
        <div
          ref={containerRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className="cursor-grab active:cursor-grabbing select-none relative z-10"
        >
          <div
            className="flex items-center gap-1"
            style={{
              // 잠금 상태일 때: minIndex를 기준으로 오프셋 계산
              // 잠금 해제 상태일 때: 0을 기준으로 오프셋 계산
              transform: `translateX(calc(50% - ${(leftIndex - minIndex) * filmFrameWidth}px - ${(leftIndex - minIndex) * 4}px - ${filmFrameWidth / 2}px))`,
              transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
            }}
          >
            {Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => {
              const index = minIndex + i;
              const isCurrent = index === leftIndex;
              const texture = textureData?.textures?.[index];
              const imageUrl = texture?.url || null;
              const kind = texture?.kind || texture?.type || "empty";

              // 중앙으로부터의 거리 계산 (왜곡 효과용)
              const distanceFromCenter = index - leftIndex;
              const absDistance = Math.abs(distanceFromCenter);

              // 볼록한 곡선을 따라 Y축 이동 (중앙이 위로 올라감)
              const curveY = -Math.pow(absDistance, 1.5) * 2;

              // 거리에 따른 스케일 (중앙이 크고 양쪽이 작아짐)
              const scale = isCurrent ? 1.2 : Math.max(0.75, 1 - absDistance * 0.12);

              // 거리에 따른 밝기
              const brightness = isCurrent ? 100 : Math.max(60, 100 - absDistance * 8);

              // 거리에 따른 투명도
              const opacity = Math.max(0.5, 1 - absDistance * 0.12);

              return (
                <div
                  key={index}
                  className="flex-shrink-0 transition-all duration-200"
                  style={{
                    width: `${filmFrameWidth}px`,
                    height: `${filmFrameHeight}px`,
                    transform: `translateY(${curveY}px) scale(${scale})`,
                    filter: `brightness(${brightness}%)`,
                    opacity: opacity,
                  }}
                >
                  <div className="relative w-full h-full bg-black/80 border border-white/30 overflow-hidden">
                    {/* 상단 필름 구멍 */}
                    <div className="absolute top-0.5 left-0 right-0 h-1 flex justify-around px-0.5">
                      {Array.from({ length: 3 }).map((_, holeIdx) => (
                        <div key={`hole-top-${holeIdx}`} className="w-1 h-1 bg-white/20 rounded-[2px]" />
                      ))}
                    </div>
                    {/* 하단 필름 구멍 */}
                    <div className="absolute bottom-0.5 left-0 right-0 h-1 flex justify-around px-0.5">
                      {Array.from({ length: 3 }).map((_, holeIdx) => (
                        <div key={`hole-bottom-${holeIdx}`} className="w-1 h-1 bg-white/20 rounded-[2px]" />
                      ))}
                    </div>
                    {imageUrl && kind !== "empty" ? (
                      kind === "video" ? (
                        <video
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={`Frame ${index}`}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                        {index}
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 border-2 border-white/60 pointer-events-none" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 구 버전: 눈금 슬라이더 (주석처리) */}
      {/* <div className="relative px-4 py-4 overflow-hidden">
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
      </div> */}
    </div>
  );
}
