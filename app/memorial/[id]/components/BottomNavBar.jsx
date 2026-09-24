"use client";

import { Home, BookOpen, Images, Flower2, Link2 } from "lucide-react";

const TABS = [
  { key: "home", label: "홈", icon: Home },
  { key: "story", label: "스토리", icon: BookOpen },
  { key: "memory", label: "메모리", icon: Images },
  { key: "guestbook", label: "방명록", icon: Flower2 },
];

// 프로토콜이 없는 URL(example.com)은 상대 경로로 열리므로 https:// 를 붙인다
export function normalizeExternalUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * 하단 탭 네비게이션 (홈/스토리/메모리/방명록[/사용자 지정 링크]).
 * showGuestbook=false면 방명록 탭을 숨긴다 (앨범 설정의 방명록 off).
 * customTab={ label, url, mode }가 있으면 방명록 뒤에 링크 탭을 추가한다 —
 *   mode "newtab": 새 창으로 열고 활성 탭은 바꾸지 않음
 *   mode "embed": onChange("custom") 으로 임베드 탭 표시
 */
export default function BottomNavBar({
  activeTab,
  onChange,
  showGuestbook = true,
  customTab = null,
}) {
  const tabs = [
    ...(showGuestbook ? TABS : TABS.filter((tab) => tab.key !== "guestbook")),
    ...(customTab
      ? [{ key: "custom", label: customTab.label, icon: Link2 }]
      : []),
  ];

  const handleClick = (key) => {
    if (key === "custom" && customTab) {
      if (customTab.mode === "embed") {
        onChange("custom");
      } else {
        window.open(
          normalizeExternalUrl(customTab.url),
          "_blank",
          "noopener,noreferrer",
        );
      }
      return;
    }
    onChange(key);
  };

  return (
    <div className="absolute bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/10 bg-black/70 pt-[1vh] pb-[max(1vh,env(safe-area-inset-bottom))] backdrop-blur-md">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            className={`flex max-w-[22vw] flex-col items-center gap-[0.6vh] px-[3vw] py-[0.8vh] transition-colors ${
              active ? "text-white" : "text-white/40"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span className="max-w-full truncate text-[1.3vh] tracking-wide">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
