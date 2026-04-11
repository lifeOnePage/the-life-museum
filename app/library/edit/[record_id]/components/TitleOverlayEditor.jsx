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
        <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
          위치
        </label>
        <div className="inline-grid grid-cols-3 gap-1 rounded-lg border border-gray-200 bg-[#CFCFD1] p-1.5">
          {POSITIONS.map((row) =>
            row.map((pos) => (
              <button
                key={pos}
                onClick={() => onPositionChange(pos)}
                className={`h-7 w-7 rounded transition-all ${
                  position === pos
                    ? "bg-[#67add1] shadow-sm"
                    : "bg-white/60 hover:bg-white"
                }`}
                title={pos}
              >
                <span
                  className={`mx-auto block h-1.5 w-1.5 rounded-full ${
                    position === pos ? "bg-white" : "bg-gray-400"
                  }`}
                />
              </button>
            )),
          )}
        </div>
      </div>

      {/* Font selection */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
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
                  ? "border-[#67add1] bg-[#67add1]/10 text-[#67add1]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-[#67add1] hover:text-[#67add1]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
          색상
        </label>
        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                color === c ? "scale-110 border-[#67add1]" : "border-gray-300"
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
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-[14px] text-gray-400"
              title="커스텀 색상"
            >
              +
            </div>
          </label>
        </div>
      </div>

      {/* Stroke selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
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
                  ? "scale-110 border-[#67add1]"
                  : "border-gray-300"
              } ${value === "white" ? "bg-white" : value === "black" ? "bg-black" : "transparent"}`}
            >
              {value === "none" && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-full w-full p-0.5 text-gray-400"
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
