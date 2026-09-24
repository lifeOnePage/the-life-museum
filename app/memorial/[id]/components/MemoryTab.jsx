"use client";

import { useCallback, useMemo, useState } from "react";
import MediaRing, { MAX_PLANES } from "./MediaRing";
import MediaRingNav from "./MediaRingNav";
import { nextRingIndex, prevRingIndex, ringMediaOf } from "./ringMedia";
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

  // 커버 이미지는 링에서 제외 (스토리 탭과 동일 기준 — ringMedia.js)
  const ringMedia = useMemo(() => ringMediaOf(mediaList), [mediaList]);

  // 링에 실제로 올라간 플레인 수 (MediaRing의 샘플링과 동일)
  const ringCount = Math.min(ringMedia.length, MAX_PLANES);

  // 링에서 인덱스 i+1은 왼쪽, i-1은 오른쪽 이웃
  const goLeft = useCallback(
    () =>
      setFocusedIndex((i) => (i == null ? i : prevRingIndex(i, ringCount))),
    [ringCount],
  );
  const goRight = useCallback(
    () =>
      setFocusedIndex((i) => (i == null ? i : nextRingIndex(i, ringCount))),
    [ringCount],
  );
  const close = useCallback(() => setFocusedIndex(null), []);

  // 하단 탭바(BottomNavBar)와 3D 캔버스가 겹치지 않도록 예약하는 높이
  const navClearance = "calc(8vh + env(safe-area-inset-bottom))";

  if (ringMedia.length === 0) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${toneStyle.bg}`}
        style={{ paddingBottom: navClearance }}
      >
        <p className={`text-[1.6vh] ${toneStyle.subText}`}>
          {mediaLoading ? "미디어를 불러오는 중..." : "표시할 미디어가 없습니다"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${toneStyle.bg}`}
      style={{ paddingBottom: navClearance }}
    >
      <MediaRing
        mediaList={ringMedia}
        focusedIndex={focusedIndex}
        onFocusChange={setFocusedIndex}
        isDark={isDark}
      />

      {/* 포커스 중: 닫기 + 좌우 넘김 버튼 */}
      {focusedIndex != null && (
        <MediaRingNav
          isDark={isDark}
          onClose={close}
          onPrev={goLeft}
          onNext={goRight}
          showArrows={ringCount > 1}
        />
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
