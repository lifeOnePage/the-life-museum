// 이미지 로드 캐시: URL → Promise<HTMLImageElement|null>
//
// R2는 CORS 미설정이라 직접 로드 실패 후 프록시 재시도(왕복 2회)가 발생한다.
// 같은 URL을 화면/컴포넌트마다 재다운로드하지 않도록 모듈 레벨에서 캐시한다.
// (편집 프리뷰 AlbumPreview3D와 편집 페이지 저장 시 낙관적 합성에서 공유)
const imgPromiseCache = new Map();

export function loadCachedImage(src, crossOrigin = true) {
  if (!src) return Promise.resolve(null);
  const lower = src.toLowerCase().split("?")[0];
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov")
  ) {
    return Promise.resolve(null);
  }
  const isBlobOrData = src.startsWith("blob:") || src.startsWith("data:");
  // blob:/data: URL은 선택마다 새로 만들어지고 revoke될 수 있으므로 캐시 제외
  const cacheable = !isBlobOrData;
  if (cacheable && imgPromiseCache.has(src)) return imgPromiseCache.get(src);

  // googleusercontent는 CORS 헤더를 주지 않아 anonymous 직접 로드가 항상 실패한다
  // (바이트를 다 받고 나서 차단됨 = 순수 낭비). 확정 실패는 건너뛰고 바로 프록시로.
  const knownNoCors =
    crossOrigin && !isBlobOrData && src.includes("googleusercontent.com");

  const promise = new Promise((resolve) => {
    const toProxy = () => {
      const proxy = new Image();
      proxy.crossOrigin = "anonymous";
      proxy.onload = () => resolve(proxy);
      proxy.onerror = () => resolve(null);
      proxy.src = `https://the-life-museum-backend-production.up.railway.app/api/v1/scraper/proxy/image?url=${encodeURIComponent(src)}`;
    };

    if (knownNoCors) {
      toProxy();
      return;
    }

    const img = new Image();
    if (crossOrigin && !isBlobOrData) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // CORS 실패 시 백엔드 프록시로 재시도 (R2 버킷 CORS 미설정 대응)
      if (crossOrigin && !isBlobOrData) {
        toProxy();
      } else {
        resolve(null);
      }
    };
    img.src = src;
  });

  if (cacheable) {
    imgPromiseCache.set(src, promise);
    // 일시 장애가 캐시에 박제되지 않도록 실패(null)는 캐시에서 제거
    promise.then((img) => {
      if (!img) imgPromiseCache.delete(src);
    });
  }
  return promise;
}
