"use client";

import { ExternalLink } from "lucide-react";
import { TONE_STYLES } from "./introPosterStyles";

/**
 * 사용자 지정 링크 탭 (mode="embed") — 앨범에 연결된 외부 URL을 페이지 안 iframe으로 띄운다.
 * 상단 슬림 바에 탭 라벨 + "새 창에서 열기" 버튼, 그 아래 iframe.
 * X-Frame-Options / CSP 로 임베드를 막는 사이트는 빈 화면으로 보일 수 있어 안내 문구를 둔다.
 */
export default function CustomLinkTab({ label, url, tone = "dark" }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.dark;
  const isDark = tone !== "white";
  const navClearance = "calc(8vh + env(safe-area-inset-bottom))";

  const openInNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden ${toneStyle.bg}`}
      style={{ paddingBottom: navClearance }}
    >
      {/* 상단 바 — 뒤로가기/BGM 버튼(top-5, h-9)과 겹치지 않도록 높이를 맞춘다 */}
      <div
        className={`flex shrink-0 items-center justify-center gap-3 border-b px-[18vw] pt-5 pb-[1.2vh] ${
          isDark ? "border-white/10" : "border-black/10"
        }`}
      >
        <span className="truncate text-[1.6vh] font-medium tracking-wide">
          {label}
        </span>
        <button
          type="button"
          onClick={openInNewTab}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[1.3vh] transition-colors ${
            isDark
              ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              : "bg-black/10 text-black/70 hover:bg-black/15 hover:text-black"
          }`}
        >
          <ExternalLink size={12} />
          새 창에서 열기
        </button>
      </div>
      <p
        className={`shrink-0 py-[0.8vh] text-center text-[1.25vh] tracking-wide ${toneStyle.hintText}`}
      >
        일부 사이트는 페이지 안에서 열리지 않을 수 있어요
      </p>

      {/* 임베드 영역 */}
      {/* 임베드를 거부하는 사이트(X-Frame-Options/CSP)나 로딩 중엔 이 배경이 보인다 — 톤에 맞춘다 */}
      <div className={`min-h-0 flex-1 ${isDark ? "bg-[#0d0d0d]" : "bg-white"}`}>
        <iframe
          src={url}
          title={label}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    </div>
  );
}
