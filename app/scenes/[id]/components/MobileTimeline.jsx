"use client";

import { MdLock, MdLockOpen } from "react-icons/md";

export default function MobileTimeline({
  items,
  profile,
  currentItem,
  lockedItemId,
  itemOpacities,
  itemRefs,
  timelineRef,
  handleItemClick,
  scrollToItemWithSteps,
  setLockedItemId,
}) {
  return (
    <div
      ref={timelineRef}
      className="absolute top-auto bottom-0 left-4 z-20 max-h-[36vh] overflow-y-auto py-10 [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      {/* 상단 패딩 (중앙 정렬용) */}
      <div className="h-[20vh]" />

      <div className="flex flex-col gap-3 pb-[20vh]">
        {items.map((item) => {
          const year = item.date ? item.date.match(/\d{4}/)?.[0] : "";

          const isLocked = lockedItemId === item.id;
          const isCurrentItem = currentItem?.id === item.id;

          // 모든 아이템에 동일한 거리 기반 투명도 적용
          const itemOpacity = itemOpacities[item.id] ?? 0.15;

          return (
            <button
              key={item.id}
              ref={(el) => (itemRefs.current[item.id] = el)}
              onClick={() => {
                // 현재 아이템이 아닌 경우에만 이동
                if (!isCurrentItem) {
                  setLockedItemId(null);
                  scrollToItemWithSteps(item);
                }
              }}
              onTouchEnd={(e) => {
                // 모바일 터치 지원
                e.preventDefault(); // 중복 이벤트 방지
                if (!isCurrentItem) {
                  setLockedItemId(null);
                  scrollToItemWithSteps(item);
                }
              }}
              className="relative cursor-pointer px-2 py-2 text-left text-white transition-opacity duration-200"
              style={{
                opacity: itemOpacity,
                touchAction: "manipulation", // 모바일 터치 최적화
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {item.isProfile ? (
                    // 프로필 아이템: {이름}\n{생년} 형식
                    <>
                      <div
                        className={`text-sm leading-tight ${isCurrentItem ? "font-bold" : "font-normal"}`}
                      >
                        {profile.name || "대표 타이틀"}
                      </div>
                      {profile.birthDate && (
                        <div className="mt-0.5 text-xs opacity-70">
                          {profile.birthDate.match(/\d{4}/)?.[0] ||
                            profile.birthDate}
                        </div>
                      )}
                    </>
                  ) : (
                    // 일반 아이템
                    <>
                      <div
                        className={`text-sm leading-tight ${isCurrentItem ? "font-bold" : "font-normal"}`}
                      >
                        {item.title || "제목 없음"}
                      </div>
                      {year && (
                        <div className="mt-0.5 text-xs opacity-70">
                          {year}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* 잠금 아이콘 - 현재 선택된 아이템에만 표시 (프로필 제외) */}
                {isCurrentItem && !item.isProfile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 버튼 클릭 이벤트 차단
                      handleItemClick(item); // 잠금 토글
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation(); // 부모 버튼 터치 이벤트 차단
                      e.preventDefault();
                      handleItemClick(item); // 잠금 토글
                    }}
                    className="flex-shrink-0 p-3 -m-3 touch-manipulation"
                    aria-label={isLocked ? "잠금 해제" : "잠금"}
                  >
                    {isLocked ? (
                      <MdLock className="h-4 w-4 text-white/70" />
                    ) : (
                      <MdLockOpen className="h-4 w-4 text-white/40" />
                    )}
                  </button>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
