"use client";

const THEME_OPTIONS = [
  {
    key: "elegant",
    name: "Elegant",
    description: "클래식한, 따뜻한",
    colors: { bg: "#fefbea", year: "#f64b16", text: "#475569" },
  },
  {
    key: "mono",
    name: "Mono-tone",
    description: "클래식한, 따뜻한",
    colors: { bg: "#ffffff", year: "#000000", text: "#1e293b" },
  },
  {
    key: "violet",
    name: "Violet",
    description: "클래식한, 따뜻한",
    colors: { bg: "#fcf8ff", year: "#d8b4fe", text: "#581c87" },
  },
  {
    key: "dark",
    name: "Dark-tone",
    description: "클래식한, 따뜻한",
    colors: { bg: "#211811", year: "#eeeeee", text: "#c7c7c7" },
  },
];

const ThemeSelector = ({ selectedTheme, onThemeChange }) => {
  return (
    <div className="space-y-3">
      {THEME_OPTIONS.map((option) => {
        const isSelected = selectedTheme === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onThemeChange(option.key)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
              isSelected
                ? "border-[#833f6e] bg-[#833f6e]/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Mini preview card */}
            <div
              className="flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-sm border border-gray-100 shadow-sm"
              style={{ backgroundColor: option.colors.bg }}
            >
              <div className="mb-1 flex w-6 flex-col gap-[2px]">
                <div
                  className="h-[2px] rounded-full"
                  style={{ backgroundColor: option.colors.year, width: "60%" }}
                />
                <div
                  className="h-[2px] rounded-full"
                  style={{ backgroundColor: option.colors.text, opacity: 0.5, width: "100%" }}
                />
                <div
                  className="h-[2px] rounded-full"
                  style={{ backgroundColor: option.colors.text, opacity: 0.3, width: "80%" }}
                />
              </div>
              <div className="flex w-6 gap-[1px]">
                <div className="flex-1">
                  <div
                    className="h-[2px] rounded-full"
                    style={{ backgroundColor: option.colors.year, width: "40%" }}
                  />
                </div>
                <div
                  className="h-3 w-px"
                  style={{ backgroundColor: option.colors.text, opacity: 0.15 }}
                />
                <div className="flex-1">
                  <div
                    className="h-[2px] rounded-full"
                    style={{ backgroundColor: option.colors.year, width: "40%" }}
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{option.name}</p>
              <p className="text-xs text-gray-400">{option.description}</p>
            </div>

            {/* Radio indicator */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-[#833f6e] bg-[#833f6e]"
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
