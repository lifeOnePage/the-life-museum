"use client";

import { UNIFIED_THEMES } from "../themeConfig";

const THEME_LIST = Object.values(UNIFIED_THEMES);

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
      <rect x="14" y="18" width="16" height="12" rx="2" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <circle cx="18" cy="22" r="2" fill="rgba(255,255,255,0.3)" />
      <path d="M14 28 l5-4 4 3 4-5 3 6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      {/* Label */}
      <rect x="10" y="36" width="24" height="1.5" rx="0.75" fill="rgba(255,255,255,0.2)" />
      <rect x="14" y="40" width="16" height="1" rx="0.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

const PREVIEW_MAP = {
  fullimage: FullImagePreview,
  kitsch: KitschPreview,
  illustration: IllustrationPreview,
  minimalist: MinimalistPreview,
};

const ThemeSelector = ({ selectedTheme, onThemeChange, locale }) => {
  return (
    <div className="space-y-3">
      {THEME_LIST.map((option) => {
        const isSelected = selectedTheme === option.key;
        const PreviewComponent = PREVIEW_MAP[option.key];
        const description = locale === "en" ? option.descriptionEn : option.description;
        return (
          <button
            key={option.key}
            onClick={() => onThemeChange(option.key)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
              isSelected
                ? "border-[#c4b49a] bg-[#c4b49a]/5"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {/* Mini preview card */}
            <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-white/10 shadow-sm">
              {PreviewComponent && <PreviewComponent theme={option} />}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#e8d5b7]">
                {option.name}
              </p>
              <p className="text-xs text-[#9b8b7a]">{description}</p>
            </div>

            {/* Radio indicator */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-[#c4b49a] bg-[#c4b49a]"
                  : "border-white/25"
              }`}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
