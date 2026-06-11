"use client";

import { useState, useEffect } from "react";

const T = {
  ko: {
    title: "AI 데이터 처리 동의",
    description:
      "이 기능은 외부 AI 서비스를 사용합니다. 다음 데이터가 AI 서비스 제공업체에 전송됩니다:",
    storyData: "앨범 제목, 설명 텍스트",
    coverData: "프롬프트 텍스트, 참조 이미지(선택 시)",
    provider: "서비스 제공업체: ",
    storyProvider: "OpenAI",
    coverProvider: "AI 이미지 생성 서비스",
    privacy:
      "전송된 데이터는 AI 처리 목적으로만 사용되며, 개인정보 처리방침에 따라 관리됩니다.",
    remember: "이 세션에서 다시 묻지 않기",
    cancel: "취소",
    agree: "동의하고 계속",
  },
  en: {
    title: "AI Data Processing Consent",
    description:
      "This feature uses an external AI service. The following data will be sent to the AI service provider:",
    storyData: "Album title, description text",
    coverData: "Prompt text, reference image (if selected)",
    provider: "Service provider: ",
    storyProvider: "OpenAI",
    coverProvider: "AI image generation service",
    privacy:
      "The transmitted data is used only for AI processing and is managed in accordance with our privacy policy.",
    remember: "Don't ask again in this session",
    cancel: "Cancel",
    agree: "Agree and continue",
  },
};

const CONSENT_KEY = "ai_consent_agreed";

export function hasAIConsent() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CONSENT_KEY) === "true";
}

export default function AIConsentModal({ type, locale, onAgree, onCancel }) {
  const t = T[locale] || T.ko;
  const [remember, setRemember] = useState(false);

  const dataText = type === "story" ? t.storyData : t.coverData;
  const providerText = type === "story" ? t.storyProvider : t.coverProvider;

  const handleAgree = () => {
    if (remember) {
      sessionStorage.setItem(CONSENT_KEY, "true");
    }
    onAgree();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-lg font-semibold text-[#e8d5b7]">
          {t.title}
        </h3>

        <p className="mb-3 text-sm text-[#9b8b7a]">{t.description}</p>

        <div className="mb-3 rounded-lg bg-white/5 p-3">
          <p className="text-sm text-[#c4b49a]">• {dataText}</p>
          <p className="mt-1 text-sm text-[#c4b49a]">
            • {t.provider}
            {providerText}
          </p>
        </div>

        <p className="mb-4 text-xs text-[#9b8b7a]">{t.privacy}</p>

        <label className="mb-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-[#c4b49a]"
          />
          <span className="text-sm text-[#9b8b7a]">{t.remember}</span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-[#9b8b7a] transition hover:bg-white/5"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleAgree}
            className="flex-1 rounded-lg bg-[#c4b49a] py-2.5 text-sm font-medium text-[#1e1a14] transition hover:bg-[#d4c4aa]"
          >
            {t.agree}
          </button>
        </div>
      </div>
    </div>
  );
}
