"use client";

import { useState } from "react";
import { UNIFIED_THEMES, THEME_CATEGORIES } from "../themeConfig";
import ScrollableChipRow from "./ScrollableChipRow";

const THEME_LIST = Object.values(UNIFIED_THEMES);

const T = {
  ko: { comingSoon: "준비중이에요" },
  en: { comingSoon: "Coming soon" },
};

// Mini SVG previews for each theme layout
function KitschPreview({ theme }) {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      {/* Paper texture background */}
      <rect width="44" height="56" rx="2" fill="#e8e0d0" />
      {/* Texture lines */}
      <line x1="0" y1="15" x2="44" y2="14" stroke="#d8d0c0" strokeWidth="0.5" />
      <line x1="0" y1="30" x2="44" y2="31" stroke="#d8d0c0" strokeWidth="0.5" />
      {/* Sticker-like decorations */}
      <circle cx="8" cy="8" r="3" fill="#ff69b4" opacity="0.5" />
      <rect
        x="33"
        y="5"
        width="6"
        height="6"
        rx="1"
        fill="#00ccaa"
        opacity="0.5"
      />
      <circle cx="36" cy="44" r="3" fill="#ffcc00" opacity="0.5" />
      {/* Title */}
      <rect
        x="10"
        y="14"
        width="24"
        height="2.5"
        rx="1"
        fill={theme.text}
        opacity="0.7"
      />
      {/* Subtitle */}
      <rect
        x="14"
        y="19"
        width="16"
        height="1.5"
        rx="0.75"
        fill={theme.accent}
        opacity="0.6"
      />
      {/* Timeline rows */}
      <rect
        x="12"
        y="26"
        width="6"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.4"
      />
      <rect
        x="20"
        y="26"
        width="12"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.3"
      />
      <rect
        x="12"
        y="30"
        width="6"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.4"
      />
      <rect
        x="20"
        y="30"
        width="10"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.3"
      />
      <rect
        x="12"
        y="34"
        width="6"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.4"
      />
      <rect
        x="20"
        y="34"
        width="14"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.3"
      />
      {/* Barcode */}
      <rect
        x="4"
        y="46"
        width="12"
        height="5"
        rx="0.5"
        fill={theme.text}
        opacity="0.15"
      />
      {/* Bio text */}
      <rect
        x="20"
        y="47"
        width="18"
        height="1"
        rx="0.5"
        fill={theme.text}
        opacity="0.2"
      />
      <rect
        x="22"
        y="50"
        width="14"
        height="1"
        rx="0.5"
        fill={theme.text}
        opacity="0.2"
      />
    </svg>
  );
}

function IllustrationPreview({ theme }) {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      {/* Sky gradient background */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="60%" stopColor="#b8dff0" />
          <stop offset="100%" stopColor="#7ab648" />
        </linearGradient>
      </defs>
      <rect width="44" height="56" rx="2" fill="url(#skyGrad)" />
      {/* Clouds */}
      <ellipse cx="14" cy="10" rx="7" ry="3" fill="white" opacity="0.5" />
      <ellipse cx="32" cy="14" rx="5" ry="2" fill="white" opacity="0.4" />
      {/* Title */}
      <rect
        x="10"
        y="6"
        width="24"
        height="2.5"
        rx="1"
        fill="white"
        opacity="0.9"
      />
      {/* Subtitle */}
      <rect
        x="14"
        y="11"
        width="16"
        height="1.5"
        rx="0.75"
        fill="white"
        opacity="0.7"
      />
      {/* Horizontal timeline */}
      <line
        x1="6"
        y1="28"
        x2="38"
        y2="28"
        stroke="white"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="10" cy="28" r="2" fill="white" opacity="0.8" />
      <circle cx="22" cy="28" r="2" fill="white" opacity="0.8" />
      <circle cx="34" cy="28" r="2" fill="white" opacity="0.8" />
      {/* Year labels */}
      <rect
        x="7"
        y="24"
        width="6"
        height="1"
        rx="0.5"
        fill="white"
        opacity="0.6"
      />
      <rect
        x="19"
        y="24"
        width="6"
        height="1"
        rx="0.5"
        fill="white"
        opacity="0.6"
      />
      <rect
        x="31"
        y="24"
        width="6"
        height="1"
        rx="0.5"
        fill="white"
        opacity="0.6"
      />
      {/* Dark bottom band */}
      <rect x="0" y="40" width="44" height="16" rx="0" fill="rgba(0,0,0,0.4)" />
      {/* Bio text in band */}
      <rect
        x="8"
        y="44"
        width="28"
        height="1.5"
        rx="0.75"
        fill="white"
        opacity="0.7"
      />
      <rect
        x="10"
        y="48"
        width="24"
        height="1.5"
        rx="0.75"
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}

function MinimalistPreview({ theme }) {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      {/* White background */}
      <rect width="44" height="56" rx="2" fill="#ffffff" />
      <rect
        width="44"
        height="56"
        rx="2"
        fill="none"
        stroke="#eee"
        strokeWidth="0.5"
      />
      {/* Title */}
      <rect
        x="10"
        y="6"
        width="24"
        height="2"
        rx="1"
        fill={theme.accent}
        opacity="0.7"
      />
      {/* Subtitle */}
      <rect
        x="14"
        y="10"
        width="16"
        height="1.5"
        rx="0.75"
        fill={theme.text}
        opacity="0.4"
      />
      {/* Center photo */}
      <rect x="10" y="15" width="24" height="16" rx="1.5" fill="#f0f0f0" />
      <rect x="15" y="20" width="14" height="6" rx="1" fill="#e0e0e0" />
      {/* Horizontal timeline */}
      <line x1="6" y1="37" x2="38" y2="37" stroke="#ddd" strokeWidth="1" />
      <circle
        cx="10"
        cy="37"
        r="1.5"
        fill="white"
        stroke={theme.accent}
        strokeWidth="1"
      />
      <circle
        cx="22"
        cy="37"
        r="1.5"
        fill="white"
        stroke={theme.accent}
        strokeWidth="1"
      />
      <circle
        cx="34"
        cy="37"
        r="1.5"
        fill="white"
        stroke={theme.accent}
        strokeWidth="1"
      />
      {/* Year labels */}
      <rect
        x="7"
        y="34"
        width="6"
        height="1"
        rx="0.5"
        fill={theme.accent}
        opacity="0.5"
      />
      <rect
        x="19"
        y="34"
        width="6"
        height="1"
        rx="0.5"
        fill={theme.accent}
        opacity="0.5"
      />
      <rect
        x="31"
        y="34"
        width="6"
        height="1"
        rx="0.5"
        fill={theme.accent}
        opacity="0.5"
      />
      {/* Album Story label */}
      <rect
        x="14"
        y="44"
        width="16"
        height="1"
        rx="0.5"
        fill={theme.text}
        opacity="0.3"
      />
      {/* Bio text */}
      <rect
        x="10"
        y="47"
        width="24"
        height="1"
        rx="0.5"
        fill={theme.text}
        opacity="0.25"
      />
      <rect
        x="12"
        y="50"
        width="20"
        height="1"
        rx="0.5"
        fill={theme.text}
        opacity="0.25"
      />
    </svg>
  );
}

function FullImagePreview() {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      {/* Full bleed photo placeholder */}
      <defs>
        <linearGradient id="fullImgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a4a" />
          <stop offset="100%" stopColor="#1a1a2a" />
        </linearGradient>
      </defs>
      <rect width="44" height="56" rx="2" fill="url(#fullImgGrad)" />
      {/* Photo icon hint */}
      <rect
        x="14"
        y="18"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      <circle cx="18" cy="22" r="2" fill="rgba(255,255,255,0.3)" />
      <path
        d="M14 28 l5-4 4 3 4-5 3 6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        fill="none"
      />
      {/* Label */}
      <rect
        x="10"
        y="36"
        width="24"
        height="1.5"
        rx="0.75"
        fill="rgba(255,255,255,0.2)"
      />
      <rect
        x="14"
        y="40"
        width="16"
        height="1"
        rx="0.5"
        fill="rgba(255,255,255,0.15)"
      />
    </svg>
  );
}

function MemorialLightPreview() {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      <rect width="44" height="56" rx="2" fill="#ece7df" />
      {/* Title */}
      <rect x="11" y="10" width="22" height="2" rx="1" fill="#3a352e" opacity="0.8" />
      {/* Subtitle */}
      <rect x="16" y="14" width="12" height="1.2" rx="0.6" fill="#8a8478" />
      {/* Short divider */}
      <line x1="19" y1="18" x2="25" y2="18" stroke="#8a8478" strokeWidth="0.5" />
      {/* Two-column timeline dashes */}
      {[23, 26.5, 30].map((y) => (
        <g key={y}>
          <rect x="7" y={y} width="10" height="1" rx="0.5" fill="#8a8478" opacity="0.7" />
          <rect x="24" y={y} width="10" height="1" rx="0.5" fill="#8a8478" opacity="0.7" />
        </g>
      ))}
      <line x1="21.5" y1="22" x2="21.5" y2="31" stroke="#8a8478" strokeWidth="0.4" opacity="0.4" />
      {/* Divider */}
      <line x1="6" y1="35" x2="38" y2="35" stroke="#8a8478" strokeWidth="0.4" opacity="0.4" />
      {/* Quote */}
      <rect x="12" y="39" width="20" height="1" rx="0.5" fill="#3a352e" opacity="0.5" />
      <rect x="15" y="42" width="14" height="1" rx="0.5" fill="#3a352e" opacity="0.5" />
      {/* Bottom dot */}
      <circle cx="22" cy="47" r="0.7" fill="#8a8478" />
    </svg>
  );
}

function MemorialDarkPreview() {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      <rect width="44" height="56" rx="2" fill="#141414" />
      {/* Title */}
      <rect x="11" y="10" width="22" height="2" rx="1" fill="#e8d5b7" opacity="0.9" />
      {/* Subtitle */}
      <rect x="16" y="14" width="12" height="1.2" rx="0.6" fill="#a89d89" />
      {/* Short divider */}
      <line x1="19" y1="18" x2="25" y2="18" stroke="#a89d89" strokeWidth="0.5" />
      {/* Full divider */}
      <line x1="6" y1="21" x2="38" y2="21" stroke="#a89d89" strokeWidth="0.4" opacity="0.4" />
      {/* Two-column timeline dashes */}
      {[25, 28.5, 32].map((y) => (
        <g key={y}>
          <rect x="7" y={y} width="10" height="1" rx="0.5" fill="#a89d89" opacity="0.7" />
          <rect x="24" y={y} width="10" height="1" rx="0.5" fill="#a89d89" opacity="0.7" />
        </g>
      ))}
      <line x1="21.5" y1="24" x2="21.5" y2="33" stroke="#a89d89" strokeWidth="0.4" opacity="0.4" />
      {/* Quote */}
      <rect x="12" y="40" width="20" height="1" rx="0.5" fill="#e8d5b7" opacity="0.6" />
      <rect x="15" y="43" width="14" height="1" rx="0.5" fill="#e8d5b7" opacity="0.6" />
      {/* Bottom label with flanking lines */}
      <line x1="6" y1="52" x2="15" y2="52" stroke="#a89d89" strokeWidth="0.4" opacity="0.5" />
      <rect x="17" y="51.3" width="10" height="1.2" rx="0.4" fill="#a89d89" opacity="0.6" />
      <line x1="29" y1="52" x2="38" y2="52" stroke="#a89d89" strokeWidth="0.4" opacity="0.5" />
    </svg>
  );
}

const PREVIEW_MAP = {
  fullimage: FullImagePreview,
  kitsch: KitschPreview,
  illustration: IllustrationPreview,
  minimalist: MinimalistPreview,
  memorial_light: MemorialLightPreview,
  memorial_dark: MemorialDarkPreview,
};

const ThemeSelector = ({ selectedTheme, onThemeChange, locale = "ko" }) => {
  const t = T[locale] || T.ko;
  const selectedCategory = THEME_LIST.find(
    (o) => o.key === selectedTheme,
  )?.category;
  const [activeCategory, setActiveCategory] = useState(
    selectedCategory || "basic",
  );

  const themesInCategory = THEME_LIST.filter(
    (o) => o.category === activeCategory,
  );

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <ScrollableChipRow>
        {THEME_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[#c4b49a] bg-[#c4b49a]/15 text-[#e8d5b7]"
                  : "border-white/10 text-[#9b8b7a] hover:border-white/25"
              }`}
            >
              {locale === "en" ? cat.nameEn : cat.name}
            </button>
          );
        })}
      </ScrollableChipRow>

      {/* Theme grid */}
      {themesInCategory.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 py-10 text-center">
          <p className="text-sm text-[#9b8b7a]">{t.comingSoon}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {themesInCategory.map((option) => {
            const isSelected = selectedTheme === option.key;
            const PreviewComponent = PREVIEW_MAP[option.key];
            return (
              <button
                key={option.key}
                onClick={() => onThemeChange(option.key)}
                className={`flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-all ${
                  isSelected
                    ? "border-[#c4b49a] bg-[#c4b49a]/5"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="relative flex aspect-44/56 w-full shrink-0 items-center justify-center overflow-hidden rounded-sm border border-white/10 shadow-sm">
                  {PreviewComponent && <PreviewComponent theme={option} />}
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c4b49a]">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p className="truncate text-xs font-medium text-[#e8d5b7]">
                  {option.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
