"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { hapticTap } from "@/app/utils/haptics";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

// 잠금 해제(영구 활성화) 비용 — 백엔드 COSTS["album_create"]와 동일
const UNLOCK_COST = 900;

const T = {
  ko: {
    title: "체험 기간이 만료되었어요",
    titleActive: "앨범 잠금 해제",
    desc: "무료 체험 앨범이에요. 크레딧으로 잠금을 해제하면 계속 보고 공유할 수 있어요.",
    balance: "보유 크레딧",
    cost: "필요 크레딧",
    unlock: "잠금 해제",
    insufficient: "크레딧이 부족해요. 충전 후 다시 시도해 주세요.",
    buy: "크레딧 구매하기",
    close: "닫기",
    error: "잠금 해제에 실패했어요. 다시 시도해 주세요.",
  },
  en: {
    title: "Your free trial has ended",
    titleActive: "Unlock album",
    desc: "This is a free trial album. Unlock it with credits to keep viewing and sharing it.",
    balance: "Your credits",
    cost: "Required",
    unlock: "Unlock",
    insufficient: "Not enough credits. Please top up and try again.",
    buy: "Buy credits",
    close: "Close",
    error: "Failed to unlock. Please try again.",
  },
};

export default function UnlockTrialModal({
  albumId,
  albumTitle,
  expired = true,
  onClose,
  onUnlocked,
  locale,
}) {
  const t = T[locale] || T.ko;
  const router = useRouter();
  const { user, refreshCredits } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const balance = user?.credits ?? 0;
  const canAfford = balance >= UNLOCK_COST;

  const handleUnlock = async () => {
    hapticTap();
    setSubmitting(true);
    setError("");
    try {
      const res = await authedFetch(`${BASE_URL}/record/${albumId}/activate`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        await refreshCredits();
        onUnlocked?.();
        onClose();
      } else {
        setError(json.message || json.detail || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuy = () => {
    hapticTap();
    router.push(`/${locale}/account`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2 text-[#c4b49a]">
          <Lock size={18} />
          <h2 className="text-lg font-semibold text-[#e8d5b7]">
            {expired ? t.title : t.titleActive}
          </h2>
        </div>
        <p className="mb-1 text-sm text-[#9b8b7a]">{albumTitle}</p>
        <p className="mb-5 text-sm text-[#9b8b7a]">{t.desc}</p>

        {/* 크레딧 현황 */}
        <div className="mb-5 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <div className="flex justify-between text-[#9b8b7a]">
            <span>{t.cost}</span>
            <span className="text-[#e8d5b7]">{UNLOCK_COST.toLocaleString()} C</span>
          </div>
          <div className="flex justify-between text-[#9b8b7a]">
            <span>{t.balance}</span>
            <span className={canAfford ? "text-[#e8d5b7]" : "text-red-400"}>
              {balance.toLocaleString()} C
            </span>
          </div>
        </div>

        {!canAfford && (
          <p className="mb-3 text-center text-xs text-red-400">{t.insufficient}</p>
        )}
        {error && (
          <p className="mb-3 text-center text-xs text-red-400">{error}</p>
        )}

        {canAfford ? (
          <button
            onClick={handleUnlock}
            disabled={submitting}
            className="w-full rounded-lg bg-[#c4b49a] py-2.5 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-60"
          >
            {t.unlock} ({UNLOCK_COST.toLocaleString()} C)
          </button>
        ) : (
          <button
            onClick={handleBuy}
            className="w-full rounded-lg bg-[#c4b49a] py-2.5 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
          >
            {t.buy}
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-white/10 py-2 font-medium text-[#c4b49a] transition hover:bg-white/5"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
