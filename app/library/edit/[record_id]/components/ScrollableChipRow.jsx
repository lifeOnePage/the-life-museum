"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 가로 스크롤 칩 목록을 감싸서, 넘칠 때만 좌/우 화살표 버튼을 보여준다.
const ScrollableChipRow = ({ children }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    el.addEventListener("scroll", updateScrollState);
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [children]);

  const scrollBy = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-120)}
          aria-label="scroll left"
          className="absolute top-1/2 left-0 z-10 flex h-6 w-6 -translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[#e8d5b7] shadow-md hover:border-white/25"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
        onWheel={(e) => {
          // 데스크탑 마우스 휠은 기본적으로 세로 스크롤만 발생시키므로,
          // 세로 휠 입력을 가로 스크롤로 변환해준다(트랙패드 좌우 스와이프는 그대로 동작).
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(120)}
          aria-label="scroll right"
          className="absolute top-1/2 right-0 z-10 flex h-6 w-6 translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[#e8d5b7] shadow-md hover:border-white/25"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default ScrollableChipRow;
