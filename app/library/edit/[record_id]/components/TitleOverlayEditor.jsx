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
  strokeOpacity,
  onPositionChange,
  onFontChange,
  onColorChange,
  onStrokeChange,
  onStrokeOpacityChange,
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
                    ? "bg-[#c4b49a] shadow-sm"
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
                  ? "border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
                  : "hover:border-[#c4b49a] hover:text-[#c4b49a] border-white/15 bg-white/5 text-[#9b8b7a]"
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
                color === c ? "border-[#c4b49a] scale-110" : "border-white/20"
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

      {/* Background selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
          배경
        </label>
        <div className="flex items-center gap-2">
          {/* none */}
          <button
            onClick={() => onStrokeChange?.("none")}
            title="없음"
            className={`h-7 w-7 shrink-0 rounded-full border-2 transition-all ${
              stroke === "none" ? "border-[#c4b49a] scale-110" : "border-white/20"
            } relative overflow-hidden bg-white/10`}
          >
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="block h-[1.5px] w-5 rotate-45 bg-[#9b8b7a]" />
            </span>
          </button>
          {/* black */}
          <button
            onClick={() => onStrokeChange?.("black")}
            title="검정"
            className={`h-7 w-7 shrink-0 rounded-full border-2 transition-all ${
              stroke === "black" ? "border-[#c4b49a] scale-110" : "border-white/20"
            } bg-black`}
          />
          {/* white */}
          <button
            onClick={() => onStrokeChange?.("white")}
            title="흰색"
            className={`h-7 w-7 shrink-0 rounded-full border-2 transition-all ${
              stroke === "white" ? "border-[#c4b49a] scale-110" : "border-white/20"
            } bg-white`}
          />
          {/* custom color */}
          <label className="relative ml-1 shrink-0 cursor-pointer">
            <input
              type="color"
              value={stroke && stroke !== "none" && stroke !== "black" && stroke !== "white" ? stroke : "#888888"}
              onChange={(e) => onStrokeChange?.(e.target.value)}
              className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
            />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-[14px] text-[#9b8b7a]"
              title="커스텀 색상"
            >
              +
            </div>
          </label>

          {/* Opacity slider — only when a background is active */}
          {stroke && stroke !== "none" && (
            <div className="ml-2 flex min-w-0 flex-1 items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={strokeOpacity ?? 100}
                onChange={(e) => onStrokeOpacityChange?.(Number(e.target.value))}
                className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#c4b49a]"
              />
              <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[#9b8b7a]">
                {strokeOpacity ?? 100}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
