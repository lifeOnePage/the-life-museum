// 미디어 프록시 URL 생성 유틸 (프록시 주소의 단일 출처)
//
// R2 공개 도메인은 CORS가 설정돼 있어(웹·앱 Origin 허용) 직접 로드가 가능하므로
// 프록시를 우회한다 — 커버·트랜스코딩 동영상·아이클라우드 사진이 Railway를
// 거치지 않게 되어 백엔드 트래픽이 크게 줄고 로드도 빨라진다.
// 그 외(googleusercontent 등 CORS 미허용 원본)만 백엔드 프록시를 경유한다.

export const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const R2_HOST = "pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev";

/**
 * @param {string} url 원본 미디어 URL
 * @param {{ force?: boolean }} [opts] force=true면 R2 우회 없이 항상 프록시 경유
 *   — 직접 로드가 이미 실패한 뒤의 폴백 경로(loadCachedImage 등)에서 사용
 */
export function getProxiedUrl(url, { force = false } = {}) {
  if (!url) return url;
  // blob:/data:/상대경로는 프록시 대상이 아님
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  ) {
    return url;
  }
  if (!force) {
    try {
      if (new URL(url).host === R2_HOST) return url;
    } catch {
      return url;
    }
  }
  // cv(cache version): CORS 캐시 오염 복구용 캐시 키 버전.
  // 과거 프록시 응답이 ACAO/Vary 없이 24h 캐시되어(crossOrigin 없는 <img>가 저장),
  // 이후 crossOrigin 로드가 오염된 엔트리에 걸려 CORS 실패를 무한 반복했다.
  // 백엔드가 항상 ACAO를 부착하도록 수정됐지만, 이미 오염된 클라이언트 캐시를
  // 즉시 우회하기 위해 키를 1회 갈아준다. (백엔드 수정 배포 후에 올릴 것)
  return `${API_BASE}/scraper/proxy/image?url=${encodeURIComponent(url)}&cv=2`;
}
