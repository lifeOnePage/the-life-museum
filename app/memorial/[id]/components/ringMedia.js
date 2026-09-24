// MediaRing(3D 미디어 링)을 쓰는 탭들이 공유하는 미디어 목록·인덱스 규칙.
// 메모리 탭과 스토리 탭이 같은 플레인 구성/순환 방향을 쓰도록 한 곳에 모은다.

/**
 * 링에 올릴 미디어 목록 — 커버 이미지는 제외하고, 전부 커버뿐이면 원본 목록으로 폴백.
 * (편집 화면 MemorialPreview와 동일 기준)
 */
export function ringMediaOf(mediaList = []) {
  const filtered = mediaList.filter((m) => !m?.is_cover);
  return filtered.length > 0 ? filtered : mediaList;
}

// 링에서 인덱스 i+1은 왼쪽 이웃, i-1은 오른쪽 이웃.
// "이전 사진"(왼쪽 버튼) = i+1, "다음 사진"(오른쪽 버튼) = i-1 — 자동 넘김도 같은 방향.
export function prevRingIndex(i, count) {
  if (!count) return i;
  return (i + 1) % count;
}

export function nextRingIndex(i, count) {
  if (!count) return i;
  return (i - 1 + count) % count;
}
