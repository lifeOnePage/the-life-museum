"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const T = {
  ko: {
    title: "결제 실패",
    goBack: "돌아가기",
  },
  en: {
    title: "Payment Failed",
    goBack: "Go Back",
  },
};

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = searchParams.get("locale") || "ko";
  const t = T[locale] || T.ko;

  const errorCode = searchParams.get("code") || "";
  const errorMessage = searchParams.get("message") || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-[#1e1a14] p-8 text-center shadow-xl ring-1 ring-white/10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">{t.title}</h2>
        {errorCode && (
          <p className="mb-1 text-xs text-white/30">{errorCode}</p>
        )}
        {errorMessage && (
          <p className="mb-6 text-sm text-[#9b8b7a]">{errorMessage}</p>
        )}
        <button
          onClick={() => router.push(`/${locale}/library`)}
          className="w-full rounded-lg border border-white/10 py-3 font-medium text-[#c4b49a] transition hover:bg-white/5"
        >
          {t.goBack}
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1a1510]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#c4b49a]" />
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
