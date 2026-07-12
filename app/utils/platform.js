"use client";
// app/utils/platform.js
// 앱(Capacitor WebView) vs 웹 브라우저 구분 + 모바일 OS 감지 유틸.
// Capacitor 앱은 server.url로 동일 웹 번들을 로드하므로 브라우저/앱이 같은 코드를
// 실행한다. 앱에서는 Capacitor 브리지가 주입되어 isNativePlatform()이 true가 된다.
import { Capacitor } from "@capacitor/core";

/** 네이티브 Capacitor 앱(WebView) 안에서 실행 중인가 */
export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** 현재 플랫폼 반환: "ios" | "android" | "web" */
export function getPlatform() {
  try {
    return Capacitor.getPlatform();
  } catch {
    return "web";
  }
}

/** getPlatform()의 별칭 (가독성용) */
export const getCapacitorPlatform = getPlatform;

/**
 * 모바일 브라우저 OS 감지 (네이티브 앱이 아님을 전제).
 * @returns {'ios' | 'android' | null}
 */
export function getMobileBrowserOS() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  // iPadOS 13+ 는 데스크톱 Safari처럼 위장(Macintosh) → 터치 지원으로 보정
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) &&
      typeof document !== "undefined" &&
      "ontouchend" in document);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

/** 배너 노출 후보: 모바일 브라우저이고 네이티브 앱이 아님 */
export function isMobileWebBrowser() {
  return !isNativeApp() && getMobileBrowserOS() !== null;
}

/**
 * 카카오톡 인앱 브라우저 여부.
 * 카카오톡 웹뷰는 보안 정책상 커스텀 URL 스킴(thelifemuseum://) 이동을 차단하므로,
 * 커스텀 스킴을 직접 쏘면 항상 실패 → openInApp의 스토어 fallback이 매번 발동한다.
 * 반드시 카카오톡 자체 탈출 스킴(kakaotalk://web/openExternal)으로 먼저
 * 기본 브라우저를 띄운 뒤, 그 브라우저에서 커스텀 스킴을 시도해야 한다.
 */
export function isKakaoInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /KAKAOTALK/i.test(navigator.userAgent || "");
}
