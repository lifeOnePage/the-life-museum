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

const COLOR_PRESETS = ["#ffffff", "#000000", "#cccccc", "#67add1"];

export default function TitleOverlayEditor({
  position,
  font,
  color,
  onPositionChange,
  onFontChange,
  onColorChange,
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
                  className={`block h-1.5 w-1.5 rounded-full mx-auto ${
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
                color === c ? "border-[#67add1] scale-110" : "border-gray-300"
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
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-[10px] text-gray-400"
              title="커스텀 색상"
            >
              +
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
