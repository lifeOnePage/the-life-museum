"use client";

const LAYOUT_OPTIONS = [
  {
    key: "chronological",
    name: "Chronological",
    icon: (
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <rect x="4" y="6" width="32" height="2" rx="1" fill="#94a3b8" />
        <rect x="4" y="12" width="24" height="2" rx="1" fill="#cbd5e1" />
        <rect x="4" y="18" width="32" height="2" rx="1" fill="#94a3b8" />
        <rect x="4" y="24" width="20" height="2" rx="1" fill="#cbd5e1" />
        <rect x="4" y="30" width="28" height="2" rx="1" fill="#94a3b8" />
        <rect x="4" y="36" width="16" height="2" rx="1" fill="#cbd5e1" />
      </svg>
    ),
  },
  {
    key: "photo-grid",
    name: "Photo Grid",
    icon: (
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <rect x="3" y="3" width="15" height="15" rx="2" fill="#cbd5e1" />
        <rect x="22" y="3" width="15" height="15" rx="2" fill="#94a3b8" />
        <rect x="3" y="22" width="15" height="15" rx="2" fill="#94a3b8" />
        <rect x="22" y="22" width="15" height="15" rx="2" fill="#cbd5e1" />
      </svg>
    ),
  },
  {
    key: "split-view",
    name: "Split View",
    icon: (
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <rect x="3" y="4" width="14" height="2" rx="1" fill="#94a3b8" />
        <rect x="3" y="9" width="12" height="1.5" rx="0.75" fill="#cbd5e1" />
        <rect x="3" y="13" width="14" height="1.5" rx="0.75" fill="#cbd5e1" />
        <rect x="3" y="17" width="10" height="1.5" rx="0.75" fill="#cbd5e1" />
        <line x1="20" y1="3" x2="20" y2="37" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="23" y="4" width="14" height="2" rx="1" fill="#94a3b8" />
        <rect x="23" y="9" width="10" height="1.5" rx="0.75" fill="#cbd5e1" />
        <rect x="23" y="13" width="14" height="1.5" rx="0.75" fill="#cbd5e1" />
        <rect x="23" y="17" width="8" height="1.5" rx="0.75" fill="#cbd5e1" />
        <rect x="23" y="21" width="12" height="1.5" rx="0.75" fill="#cbd5e1" />
      </svg>
    ),
  },
];

const LayoutSelector = ({ selectedLayout, onLayoutChange }) => {
  return (
    <div className="flex gap-3">
      {LAYOUT_OPTIONS.map((option) => {
        const isSelected = selectedLayout === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onLayoutChange(option.key)}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
              isSelected
                ? "border-[#833f6e] bg-[#833f6e]/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="h-10 w-10">{option.icon}</div>
            <span
              className={`text-[11px] font-medium ${
                isSelected ? "text-[#833f6e]" : "text-gray-500"
              }`}
            >
              {option.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LayoutSelector;
