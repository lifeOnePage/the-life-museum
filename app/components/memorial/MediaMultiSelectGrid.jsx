"use client";

import { useCallback, useState } from "react";
import { Play } from "lucide-react";
import { useChunkedGrid } from "@/app/lib/useChunkedGrid";
import { getProxiedUrl } from "@/app/lib/proxy";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";

// 기준 행 높이(px) — 행 양쪽 정렬(justify) 과정에서 소폭 늘어날 수 있다
const ROW_HEIGHT = 150;

/**
 * 미디어 다중 선택 그리드 (추모 앨범 생성/전환용).
 *
 * 구글포토식 justified 레이아웃: 각 셀이 원본 비율만큼 가로 공간을 차지하고
 * (flex-grow/basis ∝ 비율), 뷰포트 너비에 따라 한 줄의 개수가 자연스럽게
 * 조정된다. 비율은 이미지 로드 시 naturalWidth/Height로 측정(로드 전 1:1).
 *
 * - selectedKeys: 선택 순서를 보존하는 key 배열 (key = original_url)
 * - 수천 장 앨범 대응: useChunkedGrid 무한스크롤
 * - max 도달 시 미선택 타일 딤 처리
 */
export default function MediaMultiSelectGrid({
  items,
  selectedKeys,
  onToggle,
  max = MEMORIAL_MAX_MEDIA,
  disabled = false,
}) {
  const { visibleCount, sentinelRef, hasMore } = useChunkedGrid(items.length);
  const atMax = selectedKeys.length >= max;

  // 로드된 이미지의 원본 비율 (key → w/h)
  const [ratios, setRatios] = useState({});
  const handleLoad = useCallback((key, e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    if (w > 0 && h > 0) {
      setRatios((prev) => (prev[key] ? prev : { ...prev, [key]: w / h }));
    }
  }, []);

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, visibleCount).map((media, i) => {
        const key = media.original_url;
        const ratio = ratios[key] || 1;
        const order = selectedKeys.indexOf(key);
        const selected = order >= 0;
        const blocked = disabled || (atMax && !selected);
        return (
          <button
            key={key || i}
            type="button"
            disabled={blocked}
            onClick={() => onToggle(media, key)}
            style={{
              height: ROW_HEIGHT,
              flexGrow: ratio * 100,
              flexBasis: ratio * ROW_HEIGHT,
            }}
            className={`relative overflow-hidden rounded-md bg-black/10 transition-opacity ${
              selected ? "ring-2 ring-[#3E5A81] ring-offset-2" : ""
            } ${blocked && !selected ? "pointer-events-none opacity-40" : ""}`}
            title={
              atMax && !selected
                ? `최대 ${max}장까지 선택할 수 있어요`
                : undefined
            }
          >
            <img
              src={getProxiedUrl(media.thumbnail_url || media.original_url)}
              alt=""
              loading="lazy"
              draggable={false}
              onLoad={(e) => handleLoad(key, e)}
              className="h-full w-full object-cover"
            />
            {media.type === "video" && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 p-1">
                <Play size={10} className="text-white" fill="white" />
              </span>
            )}
            {selected && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3E5A81] text-[10px] font-semibold text-white">
                {order + 1}
              </span>
            )}
          </button>
        );
      })}
      {/* 마지막 행이 과도하게 늘어나지 않도록 잡아주는 스페이서 */}
      <div style={{ flexGrow: 100000 }} aria-hidden />
      {hasMore && <div ref={sentinelRef} className="h-6 w-full" />}
    </div>
  );
}
