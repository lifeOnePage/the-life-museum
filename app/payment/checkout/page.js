"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const APP_SCHEME = "thelifemuseum";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

// ── PortOne V1 ──
const IMP_CODE = "imp22125511";
const PG_DOMESTIC = "kginicis.INIpayTest";

// ── PortOne V2 ──
const PORTONE_V2_STORE_ID = "store-80711687-4087-4840-90f6-a41f229d5d00";
const PAYPAL_CHANNEL_KEY = "channel-key-d4b3c48a-8f06-4fab-8b06-c6a1ef309044";

const PACKAGE_PRICES = {
  credit_1000: { krw: 10000, usd: 999, label: "1,000 Credits" },
  credit_3900: { krw: 29000, usd: 2499, label: "3,900 Credits" },
  credit_9900: { krw: 59000, usd: 4999, label: "9,900 Credits" },
};

const T = {
  ko: {
    loading: "결제 준비 중...",
    error: "결제 오류",
    returnToApp: "앱으로 돌아가기",
  },
  en: {
    loading: "Preparing payment...",
    error: "Payment Error",
    returnToApp: "Return to App",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || "ko";
  const pkg = searchParams.get("package") || "credit_1000";
  const method = searchParams.get("method") || "domestic";
  const token = searchParams.get("token") || "";
  const couponCode = searchParams.get("couponCode") || "";
  const t = T[locale] || T.ko;

  const [error, setError] = useState("");

  useEffect(() => {
    if (method === "domestic") {
      startDomesticPayment();
    } else {
      startPayPalPayment();
    }
  }, []);

  async function startDomesticPayment() {
    const pricing = PACKAGE_PRICES[pkg];
    if (!pricing) {
      setError("Invalid package");
      return;
    }

    try {
      // iamport SDK 로드
      await new Promise((resolve, reject) => {
        if (window.IMP) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("SDK load failed"));
        document.head.appendChild(script);
      });

      window.IMP.init(IMP_CODE);
      const merchantUid = `${pkg}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

      // 결제 완료 후 리다이렉트될 URL (이 페이지의 success 핸들링)
      const successUrl = `${window.location.origin}/payment/checkout/complete?package=${pkg}&token=${encodeURIComponent(token)}&locale=${locale}&couponCode=${encodeURIComponent(couponCode)}`;

      window.IMP.request_pay(
        {
          pg: PG_DOMESTIC,
          pay_method: "card",
          merchant_uid: merchantUid,
          name: locale === "ko" ? `크레딧 충전 (${pricing.label})` : `Credit Purchase (${pricing.label})`,
          amount: pricing.krw,
          m_redirect_url: successUrl,
        },
        (rsp) => {
          // PC 환경에서 콜백 (모바일은 m_redirect_url로 리다이렉트)
          if (rsp.success) {
            window.location.href = `${successUrl}&imp_uid=${rsp.imp_uid}&merchant_uid=${rsp.merchant_uid}`;
          } else {
            returnToApp("fail", rsp.error_msg || "결제가 취소되었습니다.");
          }
        },
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function startPayPalPayment() {
    const pricing = PACKAGE_PRICES[pkg];
    if (!pricing) {
      setError("Invalid package");
      return;
    }

    try {
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
          returnToApp("fail", "결제를 취소하였습니다.");
          return;
        }
        returnToApp("fail", response.message || "Payment failed.");
        return;
      }

      // PayPal 결제 성공 → 크레딧 충전 처리
      await confirmAndAddCredits({
        pkg,
        token,
        couponCode,
        paymentId: response.paymentId,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  function returnToApp(status, message = "") {
    const deepLink = `${APP_SCHEME}://payment/${status}?message=${encodeURIComponent(message)}`;
    window.location.href = deepLink;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-[#1e1a14] p-8 text-center shadow-xl ring-1 ring-white/10">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">{t.error}</h2>
            <p className="mb-6 text-sm text-red-400/80">{error}</p>
            <button
              onClick={() => returnToApp("fail", error)}
              className="w-full rounded-lg bg-[#c4b49a] py-3 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
            >
              {t.returnToApp}
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
            <p className="text-[#e8d5b7]">{t.loading}</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 결제 검증 + 크레딧 충전 (PayPal 전용 — 국내는 complete 페이지에서 처리)
 */
async function confirmAndAddCredits({ pkg, token, couponCode, paymentId }) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const creditRes = await fetch(`${BASE_URL}/credit/purchase`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      package: pkg,
      ...(couponCode && { couponCode }),
      ...(paymentId && { paymentId }),
    }),
  });

  if (creditRes.ok) {
    const data = await creditRes.json();
    const deepLink = `${APP_SCHEME}://payment/success?credits=${data.credits || 0}&added=${data.added || 0}`;
    window.location.href = deepLink;
  } else {
    const data = await creditRes.json().catch(() => ({}));
    const msg = data.message || data.detail || "Credit purchase failed";
    window.location.href = `${APP_SCHEME}://payment/fail?message=${encodeURIComponent(msg)}`;
  }
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
