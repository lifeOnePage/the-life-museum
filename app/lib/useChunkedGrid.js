"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 대용량 목록 그리드의 청크 마운트 훅.
 *
 * 수천 장 앨범에서 그리드 셀 DOM을 전량 마운트하면 모바일 스크롤이 저하되므로,
 * 처음 chunkSize개만 렌더하고 하단 sentinel이 뷰포트(또는 스크롤 컨테이너)에
 * 가까워지면 chunkSize씩 늘린다.
 *
 * 사용:
 *   const { visibleCount, sentinelRef, hasMore } = useChunkedGrid(items.length);
 *   items.slice(0, visibleCount).map(...)
 *   {hasMore && <div ref={sentinelRef} className="col-span-full h-6" />}
 */
export function useChunkedGrid(totalCount, chunkSize = 60) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(chunkSize, totalCount),
  );
  const sentinelRef = useRef(null);

  // 목록이 바뀌면(새로고침 등) 처음부터 다시
  useEffect(() => {
    setVisibleCount(Math.min(chunkSize, totalCount));
  }, [totalCount, chunkSize]);

  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + chunkSize, totalCount));
        }
      },
      // 스크롤이 sentinel에 닿기 전에 미리 확장해 끊김을 줄인다
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, totalCount, chunkSize]);

  return { visibleCount, sentinelRef, hasMore };
}
