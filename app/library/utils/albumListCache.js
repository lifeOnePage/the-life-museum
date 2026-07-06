export let cachedAlbums = [];
export function setCachedAlbums(albums) {
  cachedAlbums = albums;
}

// 합성 커버 캐시: album id → { sig, frontImage, backImage }
// sig(커버에 영향을 주는 필드들의 서명)가 같으면 재합성 없이 재사용 —
// 편집 후 라이브러리 복귀 시 변경된 앨범만 다시 그려 반영 지연을 없앤다.
export const coverCache = new Map();
