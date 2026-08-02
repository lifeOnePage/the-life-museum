"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const APP_SCHEME = "thelifemuseum";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const T = {
  ko: {
    verifying: "결제 확인 중...",
    success: "구매 완료!",
    successDesc: (c) => `앨범 생성권 ${c.toLocaleString()}개가 지급되었습니다.`,
    error: "결제 확인 실패",
    returnToApp: "앱으로 돌아가기",
    autoReturn: "잠시 후 앱으로 돌아갑니다...",
  },
  en: {
    verifying: "Verifying payment...",
    success: "Purchase Complete!",
    successDesc: (c) => `${c.toLocaleString()} album credit(s) have been added.`,
    error: "Payment verification failed",
    returnToApp: "Return to App",
    autoReturn: "Returning to app shortly...",
  },
};

function CompleteContent() {
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || "ko";
  const t = T[locale] || T.ko;

  const [status, setStatus] = useState("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [addedCredits, setAddedCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    confirmPayment();
  }, []);

  async function confirmPayment() {
    const pkg = searchParams.get("package") || "album_1";
    const token = searchParams.get("token") || "";
    const couponCode = searchParams.get("couponCode") || "";
    const paymentId = searchParams.get("paymentId"); // PortOne V2 결제 ID
    const v2Code = searchParams.get("code"); // V2 리다이렉트 실패 시 존재

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      // PortOne V2 결제 실패/취소 체크 (실패 시 code + message)
      if (v2Code) {
        const msg = searchParams.get("message") || "Payment cancelled";
        setStatus("error");
        setErrorMsg(msg);
        autoReturnToApp("fail", msg);
        return;
      }
      if (!paymentId) {
        setStatus("error");
        setErrorMsg("Missing payment parameters");
        autoReturnToApp("fail", "Missing payment parameters");
        return;
      }

      // 백엔드가 paymentId 로 PortOne V2 결제를 검증한 뒤 앨범 생성권 지급
      const creditRes = await fetch(`${BASE_URL}/credit/purchase`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          package: pkg,
          payment_id: paymentId,
          ...(couponCode && { couponCode }),
        }),
      });

      if (creditRes.ok) {
        const data = await creditRes.json();
        setAddedCredits(data.added || 0);
        setTotalCredits(data.credits || 0);
        setStatus("success");
        autoReturnToApp("success", "", data.credits, data.added);
      } else {
        const data = await creditRes.json().catch(() => ({}));
        const msg = data.message || data.detail || "Album purchase failed";
        setStatus("error");
        setErrorMsg(msg);
        autoReturnToApp("fail", msg);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
      autoReturnToApp("fail", err.message);
    }
  }

  function autoReturnToApp(result, message = "", credits = 0, added = 0) {
    setTimeout(() => {
      if (result === "success") {
        window.location.href = `${APP_SCHEME}://payment/success?credits=${credits}&added=${added}`;
      } else {
        window.location.href = `${APP_SCHEME}://payment/fail?message=${encodeURIComponent(message)}`;
      }
    }, 2000);
  }

  function returnToApp() {
    if (status === "success") {
      window.location.href = `${APP_SCHEME}://payment/success?credits=${totalCredits}&added=${addedCredits}`;
    } else {
      window.location.href = `${APP_SCHEME}://payment/fail?message=${encodeURIComponent(errorMsg)}`;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-[#1e1a14] p-8 text-center shadow-xl ring-1 ring-white/10">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
            <p className="text-[#e8d5b7]">{t.verifying}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">{t.success}</h2>
            <p className="mb-4 text-sm text-[#9b8b7a]">{t.successDesc(addedCredits)}</p>
            <p className="mb-4 text-xs text-[#9b8b7a]/60">{t.autoReturn}</p>
            <button
              onClick={returnToApp}
              className="w-full rounded-lg bg-[#c4b49a] py-3 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
            >
              {t.returnToApp}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">{t.error}</h2>
            {errorMsg && <p className="mb-4 text-sm text-red-400/80">{errorMsg}</p>}
            <p className="mb-4 text-xs text-[#9b8b7a]/60">{t.autoReturn}</p>
            <button
              onClick={returnToApp}
              className="w-full rounded-lg border border-white/10 py-3 font-medium text-[#c4b49a] transition hover:bg-white/5"
            >
              {t.returnToApp}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
