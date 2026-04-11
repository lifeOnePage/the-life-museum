"use client";

const POSITIONS = [
  ["top-left", "top-center", "top-right"],
  ["middle-left", "middle-center", "middle-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

const FONTS = [
  { label: "프리텐다드", family: "Pretendard Variable" },
  { label: "모노플렉스", family: "MonoplexKR" },
  { label: "와이드스트릿", family: "Yde street" },
  { label: "북크고딕", family: "Bookk Gothic" },
];

const COLOR_PRESETS = ["#ffffff", "#000000", "#cccccc"];

export default function TitleOverlayEditor({
  position,
  font,
  color,
  stroke,
  onPositionChange,
  onFontChange,
  onColorChange,
  onStrokeChange,
}) {
  return (
    <div className="space-y-4">
      {/* Position grid */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
          위치
        </label>
        <div className="inline-grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-[#2e2720] p-1.5">
          {POSITIONS.map((row) =>
            row.map((pos) => (
              <button
                key={pos}
                onClick={() => onPositionChange(pos)}
                className={`h-7 w-7 rounded transition-all ${
                  position === pos
                    ? "bg-[#e8d5b7 ] shadow-sm"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                title={pos}
              >
                <span
                  className={`mx-auto block h-1.5 w-1.5 rounded-full ${
                    position === pos ? "bg-white" : "bg-[#9b8b7a]"
                  }`}
                />
              </button>
            )),
          )}
        </div>
      </div>

      {/* Font selection */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
          폰트
        </label>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((f) => (
            <button
              key={f.family}
              onClick={() => onFontChange(f.family)}
              style={{ fontFamily: f.family }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                font === f.family
                  ? "border-[#e8d5b7 ] bg-[#e8d5b7 ]/10 text-[#e8d5b7 ]"
                  : "hover:border-[#e8d5b7 ] hover:text-[#e8d5b7 ] border-white/15 bg-white/5 text-[#9b8b7a]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
          색상
        </label>
        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                color === c ? "border-[#e8d5b7 ] scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <label className="relative ml-1 cursor-pointer">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
            />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-[14px] text-[#9b8b7a]"
              title="커스텀 색상"
            >
              +
            </div>
          </label>
        </div>
      </div>

      {/* Stroke selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
          외곽선
        </label>
        <div className="flex items-center gap-2">
          {[
            { value: "none", label: "없음" },
            { value: "white", label: "흰색" },
            { value: "black", label: "검은색" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStrokeChange?.(value)}
              title={label}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                stroke === value
                  ? "border-[#e8d5b7 ] scale-110"
                  : "border-white/20"
              } ${value === "white" ? "bg-white" : value === "black" ? "bg-black" : "transparent"}`}
            >
              {value === "none" && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-full w-full p-0.5 text-[#9b8b7a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="11" />
                  <line x1="5" y1="5" x2="19" y2="19" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
