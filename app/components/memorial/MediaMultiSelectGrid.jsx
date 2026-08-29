"use client";

import { Play } from "lucide-react";
import LazyImage from "@/app/lib/LazyImage";
import { useChunkedGrid } from "@/app/lib/useChunkedGrid";
import { getProxiedUrl } from "@/app/lib/proxy";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";

/**
 * 미디어 다중 선택 그리드 (추모 앨범 생성/전환용).
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

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.slice(0, visibleCount).map((media, i) => {
        const key = media.original_url;
        const order = selectedKeys.indexOf(key);
        const selected = order >= 0;
        const blocked = disabled || (atMax && !selected);
        return (
          <button
            key={key || i}
            type="button"
            disabled={blocked}
            onClick={() => onToggle(media, key)}
            className={`relative aspect-square overflow-hidden rounded-md transition-opacity ${
              selected ? "ring-2 ring-[#3E5A81] ring-offset-2" : ""
            } ${blocked && !selected ? "pointer-events-none opacity-40" : ""}`}
            title={
              atMax && !selected
                ? `최대 ${max}장까지 선택할 수 있어요`
                : undefined
            }
          >
            <LazyImage
              src={getProxiedUrl(media.thumbnail_url || media.original_url)}
              alt=""
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
      {hasMore && <div ref={sentinelRef} className="col-span-full h-6" />}
    </div>
  );
}
