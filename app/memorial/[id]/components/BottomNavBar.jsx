"use client";

import { Home, BookOpen, Images, Flower2 } from "lucide-react";

const TABS = [
  { key: "home", label: "홈", icon: Home },
  { key: "story", label: "스토리", icon: BookOpen },
  { key: "memory", label: "메모리", icon: Images },
  { key: "guestbook", label: "방명록", icon: Flower2 },
];

/**
 * 하단 탭 네비게이션 (홈/스토리/메모리/방명록).
 */
export default function BottomNavBar({ activeTab, onChange }) {
  return (
    <div className="absolute bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/10 bg-black/70 pt-[1vh] pb-[max(1vh,env(safe-area-inset-bottom))] backdrop-blur-md">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-[0.6vh] px-[3vw] py-[0.8vh] transition-colors ${
              active ? "text-white" : "text-white/40"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[1.3vh] tracking-wide">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
