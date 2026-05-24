"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const T = {
  ko: {
    verifying: "결제 확인 중...",
    success: "충전 완료!",
    successDesc: (c) => `${c.toLocaleString()} 크레딧이 충전되었습니다.`,
    goLibrary: "라이브러리로 이동",
    error: "결제 확인 실패",
  },
  en: {
    verifying: "Verifying payment...",
    success: "Credits Added!",
    successDesc: (c) => `${c.toLocaleString()} credits have been added.`,
    goLibrary: "Go to Library",
    error: "Payment verification failed",
  },
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = searchParams.get("locale") || "ko";
  const t = T[locale] || T.ko;

  const [status, setStatus] = useState("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [addedCredits, setAddedCredits] = useState(0);

  useEffect(() => {
    const pkg = searchParams.get("package") || "credit_1000";
    // PortOne 모바일 리다이렉트 결과
    const impUid = searchParams.get("imp_uid");
    const merchantUid = searchParams.get("merchant_uid");
    const impSuccess = searchParams.get("imp_success");

    async function confirmAndPurchase() {
      try {
        // Step 1: PortOne 결제 검증
        if (impUid && merchantUid) {
          if (impSuccess === "false") {
            setStatus("error");
            setErrorMsg(searchParams.get("error_msg") || "Payment cancelled");
            return;
          }
          const confirmRes = await authedFetch(`${BASE_URL}/payment/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imp_uid: impUid, merchant_uid: merchantUid }),
          });
          if (!confirmRes.ok) {
            const data = await confirmRes.json().catch(() => ({}));
            setStatus("error");
            setErrorMsg(data.message || data.detail || `Error ${confirmRes.status}`);
            return;
          }
        } else if (!impUid) {
          setStatus("error");
          setErrorMsg("Missing payment parameters");
          return;
        }

        // Step 2: Add credits via backend
        const creditRes = await authedFetch(`${BASE_URL}/credit/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: pkg }),
        });

        if (creditRes.ok) {
          const data = await creditRes.json();
          setAddedCredits(data.added || 0);
          // Update stored user credits
          try {
            const stored = JSON.parse(localStorage.getItem("app_user") || "{}");
            stored.credits = data.credits;
            localStorage.setItem("app_user", JSON.stringify(stored));
          } catch {}
          setStatus("success");
        } else {
          const data = await creditRes.json().catch(() => ({}));
          setStatus("error");
          setErrorMsg(data.message || data.detail || `Error ${creditRes.status}`);
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    }

    confirmAndPurchase();
  }, [searchParams]);

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
            <p className="mb-6 text-sm text-[#9b8b7a]">
              {t.successDesc(addedCredits)}
            </p>
            <button
              onClick={() => router.push(`/${locale}/library`)}
              className="w-full rounded-lg bg-[#c4b49a] py-3 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
            >
              {t.goLibrary}
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
            {errorMsg && <p className="mb-6 text-sm text-red-400/80">{errorMsg}</p>}
            <button
              onClick={() => router.push(`/${locale}/library`)}
              className="w-full rounded-lg border border-white/10 py-3 font-medium text-[#c4b49a] transition hover:bg-white/5"
            >
              {t.goLibrary}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
