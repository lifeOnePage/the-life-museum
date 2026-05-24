"use client";

// ── 크레딧 패키지 가격표 ──────────────────────────────
const PACKAGE_PRICES = {
  credit_1000: { krw: 10000, usd: 999, label: "1,000 Credits" },
  credit_3900: { krw: 29000, usd: 2499, label: "3,900 Credits" },
  credit_9900: { krw: 59000, usd: 4999, label: "9,900 Credits" },
};

// ── PortOne V1 (국내 — 토스페이먼츠) ──────────────────
const IMP_CODE = "imp22125511";
const PG_DOMESTIC = "tosspayments.iamporttest_3";

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
 * 국내 크레딧 결제 (PortOne V1 → 토스페이먼츠)
 */
async function requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, locale = "ko" }) {
  const pricing = PACKAGE_PRICES[pkg];
  if (!pricing) throw new Error(`Invalid package: ${pkg}`);

  const IMP = await loadIamportScript();
  const merchantUid = `${pkg}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  return new Promise((resolve, reject) => {
    IMP.request_pay(
      {
        pg: PG_DOMESTIC,
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

// ── PortOne V2 (해외 — PayPal) ──────────────────
const PORTONE_V2_STORE_ID = "store-80711687-4087-4840-90f6-a41f229d5d00";
const PAYPAL_CHANNEL_KEY = "channel-key-d4b3c48a-8f06-4fab-8b06-c6a1ef309044";

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
 */
export async function requestCreditPurchase({ package: pkg, userId, userName, userEmail, locale = "ko", method = "domestic" }) {
  if (method === "domestic") {
    return requestCreditPurchaseKR({ package: pkg, userId, userName, userEmail, locale });
  } else {
    return requestCreditPurchasePayPal({ package: pkg, userId, userName, userEmail, locale });
  }
}

// ── 하위호환: 기존 requestAlbumPayment도 export ──
export async function requestAlbumPayment({ userId, userName, userEmail, locale = "ko" }) {
  return requestCreditPurchase({ package: "credit_1000", userId, userName, userEmail, locale });
}
