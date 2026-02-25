"use client";

import { UNIFIED_THEMES } from "../themeConfig";

const THEME_LIST = Object.values(UNIFIED_THEMES);

// Mini SVG previews for each theme layout
function ElegantPreview({ theme }) {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      <rect width="44" height="56" rx="2" fill={theme.bg} />
      {/* Right accent line */}
      <rect x="40" y="6" width="2" height="44" rx="1" fill={theme.accent} />
      {/* Top-right: bio lines */}
      <rect x="22" y="7" width="14" height="1.5" rx="0.75" fill={theme.text} opacity="0.4" />
      <rect x="22" y="11" width="12" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
      <rect x="22" y="15" width="15" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
      {/* Bottom-left: photo */}
      <rect x="4" y="24" width="16" height="20" rx="2" fill={theme.accent} opacity="0.2" />
      <rect x="7" y="31" width="10" height="6" rx="1" fill={theme.accent} opacity="0.15" />
      {/* Bottom-right: title + timeline dots */}
      <rect x="22" y="25" width="12" height="2" rx="1" fill={theme.text} opacity="0.6" />
      <circle cx="23.5" cy="32" r="1.5" fill={theme.accent} />
      <rect x="27" y="31" width="10" height="1.5" rx="0.75" fill={theme.text} opacity="0.4" />
      <circle cx="23.5" cy="37" r="1.5" fill={theme.accent} />
      <rect x="27" y="36" width="8" height="1.5" rx="0.75" fill={theme.text} opacity="0.4" />
      <circle cx="23.5" cy="42" r="1.5" fill={theme.accent} />
      <rect x="27" y="41" width="11" height="1.5" rx="0.75" fill={theme.text} opacity="0.4" />
    </svg>
  );
}

function NaturalPreview({ theme }) {
  const dots = theme.dots || ["#c8c4b8", "#556b2f", "#3a4a23"];
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      <rect width="44" height="56" rx="2" fill={theme.bg} />
      {/* Top: large photo */}
      <rect x="4" y="4" width="36" height="28" rx="2" fill={theme.accent} opacity="0.2" />
      <rect x="12" y="14" width="20" height="8" rx="1" fill={theme.accent} opacity="0.12" />
      {/* Bottom-left: timeline */}
      <line x1="7" y1="36" x2="7" y2="50" stroke={theme.accent} strokeWidth="1" opacity="0.4" />
      <circle cx="7" cy="37" r="1.5" fill={theme.accent} />
      <rect x="10" y="36" width="8" height="1.5" rx="0.75" fill={theme.text} opacity="0.5" />
      <circle cx="7" cy="42" r="1.5" fill={theme.accent} />
      <rect x="10" y="41" width="6" height="1.5" rx="0.75" fill={theme.text} opacity="0.5" />
      <circle cx="7" cy="47" r="1.5" fill={theme.accent} />
      <rect x="10" y="46" width="9" height="1.5" rx="0.75" fill={theme.text} opacity="0.5" />
      {/* Bottom-right: 3 dots + bio */}
      <circle cx="25" cy="36" r="2" fill={dots[0]} />
      <circle cx="30" cy="36" r="2" fill={dots[1]} />
      <circle cx="35" cy="36" r="2" fill={dots[2]} />
      <rect x="24" y="41" width="14" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
      <rect x="24" y="45" width="12" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
      <rect x="24" y="49" width="10" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
    </svg>
  );
}

function CirclePreview({ theme }) {
  return (
    <svg viewBox="0 0 44 56" className="h-full w-full">
      {/* Dark photo background */}
      <rect width="44" height="56" rx="2" fill="#555" />
      {/* White circle */}
      <circle cx="22" cy="28" r="18" fill={theme.circle || "#fff"} opacity="0.9" />
      {/* Small circle photo */}
      <circle cx="22" cy="18" r="5" fill={theme.accent} opacity="0.3" />
      <circle cx="22" cy="18" r="5" fill="none" stroke={theme.accent} strokeWidth="1" />
      {/* Bio lines */}
      <rect x="14" y="26" width="16" height="1.5" rx="0.75" fill={theme.text} opacity="0.4" />
      <rect x="15" y="29.5" width="14" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
      {/* Divider */}
      <line x1="16" y1="34" x2="28" y2="34" stroke={theme.accent} strokeWidth="0.5" opacity="0.5" />
      {/* Timeline */}
      <rect x="16" y="37" width="12" height="1.5" rx="0.75" fill={theme.accent} opacity="0.5" />
      <rect x="17" y="40" width="10" height="1.5" rx="0.75" fill={theme.text} opacity="0.3" />
    </svg>
  );
}

const PREVIEW_MAP = {
  elegant: ElegantPreview,
  natural: NaturalPreview,
  circle: CirclePreview,
};

const ThemeSelector = ({ selectedTheme, onThemeChange }) => {
  return (
    <div className="space-y-3">
      {THEME_LIST.map((option) => {
        const isSelected = selectedTheme === option.key;
        const PreviewComponent = PREVIEW_MAP[option.key];
        return (
          <button
            key={option.key}
            onClick={() => onThemeChange(option.key)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
              isSelected
                ? "border-[#67add1] bg-[#67add1]/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Mini preview card */}
            <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-gray-100 shadow-sm">
              {PreviewComponent && <PreviewComponent theme={option} />}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{option.name}</p>
              <p className="text-xs text-gray-400">{option.description}</p>
            </div>

            {/* Radio indicator */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-[#67add1] bg-[#67add1]"
                  : "border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
