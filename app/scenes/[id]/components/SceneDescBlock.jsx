"use client";

export default function SceneDescBlock({
  selectedSlot,
  selectedItem,
  isDarkMode = true,
  textOpacity = 1,
  proxify = (url) => url,
}) {
  if (!selectedSlot || !selectedItem) return null;

  return (
    <div className="box-border flex w-full max-w-full min-w-0 flex-col px-6 py-4">
      {/* 첫 번째 줄: 타이틀 - 선 - 날짜 */}
      <div className="flex min-w-0 items-center gap-3">
        {/* 타이틀 */}
        {selectedItem.title && (
          <div className="relative max-w-[60%] min-w-0">
            <p
              className={`px-3 py-1 leading-tight font-medium break-words whitespace-normal ${
                isDarkMode ? "bg-white text-black" : "bg-black text-white"
              }`}
              style={{
                letterSpacing: "-0.05rem",
                fontSize: "clamp(1rem, 2vh, 1.5rem)",
                overflowWrap: "anywhere",
              }}
            >
              {selectedItem.title}
            </p>
          </div>
        )}

        {/* 확장되는 선 */}
        <div
          className={`min-w-[20px] flex-1 border-b ${
            isDarkMode ? "border-white/30" : "border-black/30"
          }`}
        />

        {/* 날짜 */}
        {selectedItem.date && (
          <p
            className={`flex-shrink-0 text-sm leading-tight ${
              isDarkMode ? "text-white/60" : "text-black/60"
            }`}
            style={{
              letterSpacing: "-0.05rem",
            }}
          >
            {selectedItem.date}
          </p>
        )}
      </div>

      {/* 두 번째 줄: 설명 */}
      {selectedItem.desc && (
        <p
          className={`mt-3 text-sm leading-relaxed break-words whitespace-normal ${
            isDarkMode ? "text-white" : "text-black"
          }`}
          style={{ letterSpacing: "-0.05rem", overflowWrap: "anywhere" }}
        >
          {selectedItem.desc}
        </p>
      )}
    </div>
  );
}
