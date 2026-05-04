"use client";

import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const T = {
  ko: {
    title: "공개 범위 설정",
    copied: "복사됨",
    copy: "복사",
    close: "닫기",
  },
  en: {
    title: "Visibility Settings",
    copied: "Copied",
    copy: "Copy",
    close: "Close",
  },
};

export default function ShareModal({ albumId, albumTitle, initialIsPublic = false, onClose, locale }) {
  const t = T[locale] || T.ko;
  const [isShared, setIsShared] = useState(initialIsPublic);
  const [copied, setCopied] = useState(false);

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${albumId}`
      : "";

  const handleSetPublic = async (value) => {
    if (value === isShared) return;
    setIsShared(value); // 낙관적 업데이트
    try {
      const res = await authedFetch(`${BASE_URL}/record/${albumId}/public`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: value }),
      });
      const json = await res.json();
      if (!json.ok) setIsShared(!value); // 실패 시 롤백
    } catch (err) {
      console.error("Failed to update share status:", err);
      setIsShared(!value); // 실패 시 롤백
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-[#e8d5b7]">{t.title}</h2>
        <p className="mb-5 text-sm text-[#9b8b7a]">{albumTitle}</p>

        {/* Public / Private 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSetPublic(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition ${
              isShared
                ? "bg-[#c4b49a] text-[#1a1510]"
                : "border border-white/10 text-[#9b8b7a] hover:bg-white/5"
            }`}
          >
            <Globe size={15} /> Public
          </button>
          <button
            onClick={() => handleSetPublic(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition ${
              !isShared
                ? "bg-[#c4b49a] text-[#1a1510]"
                : "border border-white/10 text-[#9b8b7a] hover:bg-white/5"
            }`}
          >
            <Lock size={15} /> Private
          </button>
        </div>

        {/* 링크 + 복사 */}
        {isShared && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e8d5b7] outline-none"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-[#c4b49a] px-4 py-2 text-sm font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        )}

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-white/10 py-2 font-medium text-[#c4b49a] transition hover:bg-white/5"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
