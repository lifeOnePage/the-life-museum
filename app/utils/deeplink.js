// app/utils/deeplink.js
// 딥링크 상수 + helper. "앱으로 열기" 버튼과 네이티브 appUrlOpen 핸들러가 공유한다.

/** 커스텀 URL 스킴 (네이티브 Info.plist / AndroidManifest, 결제 리다이렉트와 공용) */
export const APP_SCHEME = "thelifemuseum";

/** Universal Links / App Links 호스트 (AASA·assetlinks·entitlements와 일치) */
export const UNIVERSAL_HOST = "the-life-museum.vercel.app";

// ── 스토어 fallback ──────────────────────────────────────────────
// App Store Connect Apple ID: 6772857701 (Bundle ID: com.theliferecord.rec)
export const IOS_APP_STORE_URL = "https://apps.apple.com/app/id6772857701";

// Android는 Play Store 미출시 → 출시 전까지 비활성(게이팅).
// 출시 시 ANDROID_STORE_ENABLED = true 로 변경.
export const ANDROID_STORE_ENABLED = false;
export const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.lifeonepage.museum";

function toAppPath(pathname) {
  if (!pathname) return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/** 커스텀 스킴 URL: lifemuseum:///ko/share/abc */
export function buildSchemeUrl(pathname) {
  return `${APP_SCHEME}://${toAppPath(pathname)}`;
}

/** Universal Link URL (= 동일 https URL): https://host/ko/share/abc */
export function buildUniversalUrl(pathname) {
  return `https://${UNIVERSAL_HOST}${toAppPath(pathname)}`;
}

/**
 * 카카오톡 인앱 브라우저 탈출 URL.
 * 카카오톡 웹뷰는 커스텀 스킴 이동을 차단하므로, 이 스킴으로 먼저
 * 기본 브라우저(Safari/Chrome)에 대상 URL을 열게 한 뒤 그 브라우저에서
 * 다시 "앱으로 열기"를 시도해야 커스텀 스킴 딥링크가 정상 동작한다.
 */
export function buildKakaoEscapeUrl(url) {
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
}

/**
 * iOS deferred deep link.
 * 같은 도메인 JS에서는 Universal Link가 안정적으로 안 열리므로 커스텀 스킴으로
 * 앱 호출을 시도하고, 일정 시간 내 백그라운드 전환(=앱 열림)이 없으면 스토어로 fallback.
 *
 * @param {string} pathname 현재 경로 (예: /ko/share/abc)
 * @param {{ os: 'ios'|'android'|null, storeUrl: string|null }} opts
 */
export function openInApp(pathname, { os, storeUrl } = {}) {
  if (typeof window === "undefined") return;
  const scheme = buildSchemeUrl(pathname);

  let didHide = false;
  const onVisibility = () => {
    if (document.visibilityState === "hidden") didHide = true;
  };
  document.addEventListener("visibilitychange", onVisibility);

  const fallback = setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    // 앱이 열렸으면 페이지가 백그라운드(hidden) → fallback 취소
    if (!didHide && storeUrl) {
      window.location.href = storeUrl;
    }
  }, 1200);

  // 페이지를 실제로 떠나면(앱 전환 등) 타이머 정리
  window.addEventListener(
    "pagehide",
    () => {
      clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onVisibility);
    },
    { once: true },
  );

  // 커스텀 스킴으로 앱 호출 시도
  window.location.href = scheme;
}
