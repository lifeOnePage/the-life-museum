"use client";

import { isNativeApp } from "./platform";

// ── 크레딧 패키지 가격표 ──────────────────────────────
const PACKAGE_PRICES = {
  credit_1000: { krw: 10000, usd: 999, label: "1,000 Credits" },
  credit_3000: { krw: 24000, usd: 2099, label: "3,000 Credits" },
  credit_6000: { krw: 39000, usd: 3399, label: "6,000 Credits" },
};

// ── 앱 딥링크 & 웹 URL ──────────────────────────────
const APP_SCHEME = "thelifemuseum";
const WEB_ORIGIN = "https://the-life-museum.vercel.app";

// ── PortOne V2 채널 (이 스토어는 전부 V2 — V1 채널 없음) ──────────
const PORTONE_V2_STORE_ID = "store-80711687-4087-4840-90f6-a41f229d5d00";
// KG이니시스 (국내). 실결제 채널 (MID MOI6967107) 사용 중:
//   실결제:  channel-key-8365f96d-7754-4b0e-8364-72b98565054a  (MID MOI6967107) ← 현재
//   테스트:  channel-key-17cb310e-e15c-4ac2-8911-d426ab37193f  (INIpayTest)
const KG_INICIS_CHANNEL_KEY = "channel-key-8365f96d-7754-4b0e-8364-72b98565054a";
// PayPal (해외) — 실결제(라이브) 채널
//   라이브:  channel-key-04062b22-b3ed-4ca5-9be9-b0facc13c054 ← 현재
//   테스트:  channel-key-d4b3c48a-8f06-4fab-8b06-c6a1ef309044
const PAYPAL_CHANNEL_KEY = "channel-key-04062b22-b3ed-4ca5-9be9-b0facc13c054";

/**
 * 네이티브 앱 → 외부 브라우저에서 결제 페이지 열기
 */
async function requestCreditPurchaseNative({ package: pkg, userId, userName, userEmail, userPhone, locale = "ko", method = "domestic", couponCode }) {
  const { Browser } = await import("@capacitor/browser");

  const token = localStorage.getItem("app_token") || "";
  const params = new URLSearchParams({
    package: pkg,
    locale,
    method,
    token,
  });
  if (userId) params.set("id", userId);
  if (couponCode) params.set("couponCode", couponCode);
  if (userName) params.set("name", userName);
  if (userEmail) params.set("email", userEmail);
  if (userPhone) params.set("phone", userPhone);

  const url = `${WEB_ORIGIN}/payment/checkout?${params.toString()}`;
  await Browser.open({ url });

  // 외부 브라우저로 넘겼으므로 앱에서는 결과를 기다리지 않음
  // 결제 완료 후 딥링크로 앱에 복귀
  return { native: true };
}

/**
 * 국내 크레딧 결제 (PortOne V2 → KG이니시스 카드)
 */
async function requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, userPhone, locale = "ko" }) {
  const pricing = PACKAGE_PRICES[pkg];
  if (!pricing) throw new Error(`Invalid package: ${pkg}`);

  const PortOne = await import("@portone/browser-sdk/v2");
  const paymentId = `${pkg}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  const response = await PortOne.requestPayment({
    storeId: PORTONE_V2_STORE_ID,
    channelKey: KG_INICIS_CHANNEL_KEY,
    paymentId,
    orderName: locale === "ko" ? `크레딧 충전 (${pricing.label})` : `Credit Purchase (${pricing.label})`,
    totalAmount: pricing.krw,
    currency: "CURRENCY_KRW",
    payMethod: "CARD",
    // KG이니시스 V2 일반결제는 fullName + phoneNumber 필수
    customer: {
      fullName: userName || "회원",
      phoneNumber: userPhone || "01000000000",
      ...(userEmail && { email: userEmail }),
    },
    // 결제-유저 바인딩: 백엔드가 이 userId 를 로그인 유저와 대조해 도용 차단
    customData: JSON.stringify({ userId: userId || "" }),
    // 모바일은 리다이렉트 방식 — 완료 후 돌아올 URL
    redirectUrl: `${window.location.origin}/payment/success?package=${pkg}`,
  });

  if (response.code) {
    if (response.code === "PAY_PROCESS_CANCELED") {
      throw new Error("결제를 취소하였습니다.");
    }
    throw new Error(response.message || "결제 중 오류가 발생했습니다.");
  }

  return { paymentId: response.paymentId, imp_uid: null };
}

/**
 * 해외 크레딧 결제 (PortOne V2 → PayPal)
 */
async function requestCreditPurchasePayPal({ package: pkg, userId, userName, userEmail, locale = "en" }) {
  const pricing = PACKAGE_PRICES[pkg];
  if (!pricing) throw new Error(`Invalid package: ${pkg}`);

  const PortOne = await import("@portone/browser-sdk/v2");

  const paymentId = `${pkg}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  const response = await PortOne.requestPayment({
    storeId: PORTONE_V2_STORE_ID,
    channelKey: PAYPAL_CHANNEL_KEY,
    paymentId,
    orderName: `Credit Purchase (${pricing.label})`,
    totalAmount: pricing.usd,
    currency: "CURRENCY_USD",
    payMethod: "PAYPAL",
    // 결제-유저 바인딩
    customData: JSON.stringify({ userId: userId || "" }),
  });

  if (response.code) {
    if (response.code === "PAY_PROCESS_CANCELED") {
      throw new Error("결제를 취소하였습니다.");
    }
    throw new Error(response.message || "Payment cancelled.");
  }

  return { paymentId: response.paymentId, imp_uid: null };
}

// ── 통합 함수 (method 기반 분기) ──────────────────

/**
 * method ("domestic" | "international") 에 따라 결제 분기
 * 네이티브 앱이면 외부 브라우저로 결제 페이지 오픈
 */
export async function requestCreditPurchase({ package: pkg, userId, userName, userEmail, userPhone, locale = "ko", method = "domestic", couponCode }) {
  if (isNativeApp()) {
    return requestCreditPurchaseNative({ package: pkg, userId, userName, userEmail, userPhone, locale, method, couponCode });
  }
  if (method === "domestic") {
    return requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, userPhone, locale });
  } else {
    return requestCreditPurchasePayPal({ package: pkg, userId, userName, userEmail, locale });
  }
}

// ── 하위호환: 기존 requestAlbumPayment도 export ──
export async function requestAlbumPayment({ userId, userName, userEmail, locale = "ko" }) {
  return requestCreditPurchase({ package: "credit_1000", userId, userName, userEmail, locale });
}

export { APP_SCHEME, WEB_ORIGIN };
