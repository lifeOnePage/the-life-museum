"use client";

import { loadStripe } from "@stripe/stripe-js";

// ── 크레딧 패키지 가격표 ──────────────────────────────
const PACKAGE_PRICES = {
  credit_1000: { krw: 10000, usd: 999, label: "1,000 Credits" },
  credit_3900: { krw: 29000, usd: 2499, label: "3,900 Credits" },
  credit_9900: { krw: 59000, usd: 4999, label: "9,900 Credits" },
};

// ── PortOne (국내) ──────────────────────────────────
const IMP_CODE = "imp22125511";
const PG = "tosspayments.iamporttest_3";

let scriptLoaded = false;

function loadIamportScript() {
  return new Promise((resolve, reject) => {
    if (scriptLoaded && window.IMP) {
      resolve(window.IMP);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.onload = () => {
      scriptLoaded = true;
      window.IMP.init(IMP_CODE);
      resolve(window.IMP);
    };
    script.onerror = () => reject(new Error("Failed to load iamport SDK"));
    document.head.appendChild(script);
  });
}

/**
 * 국내 크레딧 결제 (PortOne V1 팝업)
 */
async function requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, locale = "ko" }) {
  const pricing = PACKAGE_PRICES[pkg];
  if (!pricing) throw new Error(`Invalid package: ${pkg}`);

  const IMP = await loadIamportScript();
  const merchantUid = `${pkg}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  return new Promise((resolve, reject) => {
    IMP.request_pay(
      {
        pg: PG,
        pay_method: "card",
        merchant_uid: merchantUid,
        name: locale === "ko" ? `크레딧 충전 (${pricing.label})` : `Credit Purchase (${pricing.label})`,
        amount: pricing.krw,
        buyer_name: userName || undefined,
        buyer_email: userEmail || undefined,
        m_redirect_url: `${window.location.origin}/payment/success?package=${pkg}`,
      },
      (rsp) => {
        if (rsp.success) {
          resolve(rsp);
        } else {
          reject(new Error(rsp.error_msg || "결제가 취소되었습니다."));
        }
      },
    );
  });
}

// ── Stripe (해외) ──────────────────────────────────

let stripePromise = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/**
 * 해외 크레딧 결제 (Stripe Checkout 리다이렉트)
 */
async function requestCreditPurchaseStripe({ package: pkg, userId, locale = "en" }) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, userId, package: pkg }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const stripe = await getStripe();
  if (data.url) {
    window.location.href = data.url;
  }
}

// ── 통합 함수 (locale 기반 분기) ──────────────────

/**
 * locale에 따라 국내/해외 결제 자동 분기
 */
export async function requestCreditPurchase({ package: pkg, userId, userName, userEmail, locale = "ko" }) {
  if (locale === "ko") {
    return requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, locale });
  } else {
    return requestCreditPurchaseStripe({ package: pkg, userId, locale });
  }
}

// ── 하위호환: 기존 requestAlbumPayment도 export ──
export async function requestAlbumPayment({ userId, userName, userEmail, locale = "ko" }) {
  return requestCreditPurchase({ package: "credit_1000", userId, userName, userEmail, locale });
}
