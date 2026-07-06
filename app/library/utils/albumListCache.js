export let cachedAlbums = [];
export function setCachedAlbums(albums) {
  cachedAlbums = albums;
}

// 합성 커버 캐시: album id → { sig, frontImage, backImage }
// sig(커버에 영향을 주는 필드들의 서명)가 같으면 재합성 없이 재사용 —
// 편집 후 라이브러리 복귀 시 변경된 앨범만 다시 그려 반영 지연을 없앤다.
export const coverCache = new Map();

// ── 낙관적 커버 (저장 직후 라이브러리 복귀용) ────────────────────────────────
// 인메모리 캐시는 dev/HMR 리로드·웹뷰 리로드·새로고침에 증발한다. 그 사이에
// 라이브러리로 복귀하면 fetch가 raw URL로 폴백해 재합성까지 원본이 노출되므로,
// 낙관적 합성본은 sessionStorage에 이중으로 보관해 리로드에도 살아남게 한다.
const OPT_KEY = (id) => `tlm:optimisticCover:${id}`;
const OPT_TTL_MS = 5 * 60 * 1000;

export function setOptimisticCover(id, { frontImage, backImage }) {
  coverCache.set(id, { sig: null, optimistic: true, frontImage, backImage });
  try {
    sessionStorage.setItem(
      OPT_KEY(id),
      JSON.stringify({ frontImage, backImage, ts: Date.now() }),
    );
  } catch {
    // quota 초과 등 — 메모리 캐시만으로 동작
  }
}

export function getOptimisticCover(id) {
  const mem = coverCache.get(id);
  if (mem?.optimistic) return mem;
  try {
    const raw = sessionStorage.getItem(OPT_KEY(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.ts || 0) > OPT_TTL_MS) {
      sessionStorage.removeItem(OPT_KEY(id));
      return null;
    }
    return {
      sig: null,
      optimistic: true,
      frontImage: parsed.frontImage ?? null,
      backImage: parsed.backImage ?? null,
    };
  } catch {
    return null;
  }
}

export function clearOptimisticCover(id) {
  try {
    sessionStorage.removeItem(OPT_KEY(id));
  } catch {}
}
