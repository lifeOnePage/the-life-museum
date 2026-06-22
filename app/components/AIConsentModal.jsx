"use client";

import { useState } from "react";

const T = {
  ko: {
    title: "AI 데이터 처리 동의",
    description:
      "이 기능은 외부 AI 서비스를 사용합니다. 계속하기 전에 아래 내용을 확인해 주세요.",
    dataTitle: "전송되는 데이터:",
    storyData: [
      "앨범 제목",
      "앨범 부제목(설명 텍스트)",
    ],
    coverData: [
      "사용자가 입력한 프롬프트 텍스트",
      "참조 이미지 (선택한 경우)",
    ],
    providerTitle: "데이터 수신자:",
    storyProvider: "OpenAI (미국, https://openai.com)",
    coverProvider: "Replicate / Minimax (미국, https://replicate.com)",
    purpose: "목적: AI를 통한 콘텐츠 생성에만 사용되며, 그 외 목적으로 사용되지 않습니다.",
    privacyNote:
      "자세한 내용은 개인정보 처리방침을 참조해 주세요.",
    remember: "이 세션에서 다시 묻지 않기",
    cancel: "취소",
    agree: "동의하고 계속",
  },
  en: {
    title: "AI Data Processing Consent",
    description:
      "This feature uses an external AI service. Please review the following before continuing.",
    dataTitle: "Data that will be sent:",
    storyData: [
      "Album title",
      "Album subtitle (description text)",
    ],
    coverData: [
      "Prompt text entered by you",
      "Reference image (if selected)",
    ],
    providerTitle: "Data recipient:",
    storyProvider: "OpenAI (United States, https://openai.com)",
    coverProvider: "Replicate / Minimax (United States, https://replicate.com)",
    purpose: "Purpose: Used solely for AI content generation and not for any other purpose.",
    privacyNote:
      "For more details, please refer to our Privacy Policy.",
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

  const dataItems = type === "story" ? t.storyData : t.coverData;
  const providerText = type === "story" ? t.storyProvider : t.coverProvider;

  const handleAgree = () => {
    if (remember) {
      sessionStorage.setItem(CONSENT_KEY, "true");
    }
    onAgree();
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
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

        <div className="mb-3 rounded-lg bg-white/5 p-3 space-y-2">
          <p className="text-xs font-medium text-[#e8d5b7]">{t.dataTitle}</p>
          {dataItems.map((item, i) => (
            <p key={i} className="text-sm text-[#c4b49a]">• {item}</p>
          ))}

          <p className="text-xs font-medium text-[#e8d5b7] pt-2">{t.providerTitle}</p>
          <p className="text-sm text-[#c4b49a]">• {providerText}</p>
        </div>

        <p className="mb-2 text-xs text-[#9b8b7a]">{t.purpose}</p>
        <p className="mb-4 text-xs text-[#9b8b7a]">{t.privacyNote}</p>

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
