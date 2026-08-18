"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import MediaRing from "./MediaRing";
import { TONE_STYLES } from "./introPosterStyles";

/**
 * "메모리" 탭 — 앨범의 모든 미디어를 3D 링으로 감상.
 * 톤(dark/white)은 인트로 포스터 설정을 따른다.
 */
export default function MemoryTab({
  mediaList = [],
  mediaLoading = false,
  tone = "dark",
}) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.dark;
  const isDark = tone !== "white";

  // 커버 이미지는 링에서 제외 (편집 화면 MemorialPreview와 동일 기준)
  const ringMedia = useMemo(() => {
    const filtered = mediaList.filter((m) => !m.is_cover);
    return filtered.length > 0 ? filtered : mediaList;
  }, [mediaList]);

  if (ringMedia.length === 0) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${toneStyle.bg}`}
      >
        <p className={`text-[1.6vh] ${toneStyle.subText}`}>
          {mediaLoading ? "미디어를 불러오는 중..." : "표시할 미디어가 없습니다"}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${toneStyle.bg}`}>
      <MediaRing
        mediaList={ringMedia}
        focusedIndex={focusedIndex}
        onFocusChange={setFocusedIndex}
        isDark={isDark}
      />

      {/* 포커스 해제 버튼 */}
      {focusedIndex != null && (
        <button
          type="button"
          onClick={() => setFocusedIndex(null)}
          className={`absolute top-5 left-1/2 z-30 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
            isDark
              ? "bg-white/10 text-white/80 hover:bg-white/20"
              : "bg-black/10 text-black/70 hover:bg-black/20"
          }`}
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      )}

      {/* 안내 문구 (오버뷰 상태에서만) */}
      {focusedIndex == null && (
        <p
          className={`pointer-events-none absolute bottom-[12vh] left-1/2 -translate-x-1/2 text-[1.4vh] tracking-wide ${toneStyle.hintText}`}
        >
          사진을 터치하면 크게 볼 수 있어요
        </p>
      )}
    </div>
  );
}
