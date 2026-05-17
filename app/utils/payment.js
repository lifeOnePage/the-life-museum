"use client";

import { loadStripe } from "@stripe/stripe-js";

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
 * 국내 결제 (PortOne V1 팝업)
 * @returns {Promise<object>} { imp_uid, merchant_uid, ... }
 */
export async function requestAlbumPaymentKR({ userId, userName, userEmail, locale = "ko" }) {
  const IMP = await loadIamportScript();
  const merchantUid = `album_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  return new Promise((resolve, reject) => {
    IMP.request_pay(
      {
        pg: PG,
        pay_method: "card",
        merchant_uid: merchantUid,
        name: locale === "ko" ? "앨범 1권 구매" : "Album Purchase (1)",
        amount: 10000,
        buyer_name: userName || undefined,
        buyer_email: userEmail || undefined,
        m_redirect_url: `${window.location.origin}/payment/success`,
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
 * 해외 결제 (Stripe Checkout 리다이렉트)
 */
export async function requestAlbumPaymentStripe({ userId, locale = "en" }) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, userId }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const stripe = await getStripe();
  if (data.url) {
    // Stripe Checkout 페이지로 리다이렉트
    window.location.href = data.url;
  }
}

// ── 통합 함수 (locale 기반 분기) ──────────────────

/**
 * locale에 따라 국내/해외 결제 자동 분기
 */
export async function requestAlbumPayment({ userId, userName, userEmail, locale = "ko" }) {
  if (locale === "ko") {
    return requestAlbumPaymentKR({ userId, userName, userEmail, locale });
  } else {
    return requestAlbumPaymentStripe({ userId, locale });
  }
}
