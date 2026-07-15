"use client";
// 모바일 웹 브라우저에서 공개 공유 페이지를 열었을 때 상단에 노출되는 스마트 배너.
// "앱으로 열기"(딥링크 시도 + 미설치 시 스토어 fallback) / "웹으로 보기"(닫기, 영속).
import { useEffect, useState } from "react";
import {
  isMobileWebBrowser,
  getMobileBrowserOS,
  isKakaoInAppBrowser,
} from "@/app/utils/platform";
import {
  openInApp,
  buildKakaoEscapeUrl,
  IOS_APP_STORE_URL,
  ANDROID_STORE_ENABLED,
  ANDROID_STORE_URL,
} from "@/app/utils/deeplink";

const DISMISS_KEY = "smart_banner_dismissed";

const T = {
  ko: { title: "앱에서 더 생생하게 감상하세요", open: "앱으로 열기", web: "웹으로 보기" },
  en: { title: "Enjoy it better in the app", open: "Open in app", web: "Continue in web" },
};

export default function SmartAppBanner({ locale = "ko" }) {
  const [show, setShow] = useState(false);
  const [os, setOS] = useState(null);
  const t = T[locale] || T.ko;

  useEffect(() => {
    try {
      // 세션 단위로만 닫힘 유지 — 나갔다 다시 링크를 열면(새 세션) 다시 노출
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* sessionStorage 접근 불가(프라이빗 모드 등) → 무시하고 노출 시도 */
    }
    if (!isMobileWebBrowser()) return;

    const detected = getMobileBrowserOS();
    // Android는 Play Store 미출시 → 게이팅(노출 안 함)
    if (detected === "android" && !ANDROID_STORE_ENABLED) return;

    setOS(detected);
    setShow(true);
  }, []);

  if (!show) return null;

  const handleOpen = () => {
    // 카카오톡 인앱 브라우저는 커스텀 스킴 이동을 차단 → 항상 스토어로 튕겨나감.
    // 카카오톡 탈출 스킴으로 먼저 기본 브라우저를 띄운 뒤, 그 브라우저에서
    // 다시 "앱으로 열기"를 눌러야 딥링크가 정상 동작한다.
    if (isKakaoInAppBrowser()) {
      window.location.href = buildKakaoEscapeUrl(window.location.href);
      return;
    }
    const storeUrl =
      os === "ios"
        ? IOS_APP_STORE_URL
        : ANDROID_STORE_ENABLED
          ? ANDROID_STORE_URL
          : null;
    openInApp(window.location.pathname, { os, storeUrl });
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t.title}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        paddingTop: "calc(10px + env(safe-area-inset-top))",
        background: "#121212",
        color: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, lineHeight: 1.3 }}>{t.title}</span>
      <button
        type="button"
        onClick={handleOpen}
        style={{
          flexShrink: 0,
          padding: "7px 14px",
          borderRadius: 8,
          border: "none",
          background: "#c4b49a",
          color: "#1a1510",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {t.open}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          flexShrink: 0,
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "#c4b49a",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {t.web}
      </button>
    </div>
  );
}
