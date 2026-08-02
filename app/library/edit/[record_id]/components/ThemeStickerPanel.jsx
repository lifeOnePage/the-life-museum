"use client";

import { useEffect, useState } from "react";
import ThemeSelector from "./ThemeSelector";

const T = {
  ko: {
    themeLabel: "테마",
    stickerLabel: "스티커",
    noStickers: "아직 스티커가 없어요",
    hint: "스티커를 누르면 오른쪽 미리보기에 추가돼요. 몸통은 드래그로 이동 · 위쪽 손잡이로 회전 · 모서리 손잡이로 크기 조절하세요",
  },
  en: {
    themeLabel: "Theme",
    stickerLabel: "Stickers",
    noStickers: "No stickers yet",
    hint: "Tap a sticker to add it to the preview on the right — drag the body to move, the top handle to rotate, the corner handle to resize",
  },
};

let stickerIdSeq = 0;

const ThemeStickerPanel = ({
  locale,
  theme,
  onThemeChange,
  stickers,
  onStickersChange,
}) => {
  const t = T[locale] || T.ko;
  const [stickerPacks, setStickerPacks] = useState([]);
  const [activeStickerPack, setActiveStickerPack] = useState(null);

  // public/stickers/<packId>/ 폴더 구조를 그대로 반영한 팩 목록을 불러온다.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stickers")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          const packs = data.packs || [];
          setStickerPacks(packs);
          setActiveStickerPack((cur) =>
            cur && packs.some((p) => p.id === cur) ? cur : packs[0]?.id ?? null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setStickerPacks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addSticker = (asset) => {
    const id = `sticker-${Date.now()}-${stickerIdSeq++}`;
    onStickersChange([
      ...stickers,
      { id, assetId: asset.id, src: asset.src, x: 0.5, y: 0.5, rotation: 0, scale: 1 },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Theme selector */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[#e8d5b7]">{t.themeLabel}</p>
        <ThemeSelector
          selectedTheme={theme}
          onThemeChange={onThemeChange}
          locale={locale}
        />
      </div>

      {/* Sticker palette */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#e8d5b7]">{t.stickerLabel}</p>
        <p className="text-xs leading-relaxed text-[#9b8b7a]">{t.hint}</p>
        {stickerPacks.length === 0 ? (
          <p className="text-xs text-[#9b8b7a]">{t.noStickers}</p>
        ) : (
          <>
            {/* Pack chips */}
            <div
              className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
              onWheel={(e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {stickerPacks.map((pack) => {
                const isActive = activeStickerPack === pack.id;
                return (
                  <button
                    key={pack.id}
                    onClick={() => setActiveStickerPack(pack.id)}
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-[#c4b49a] bg-[#c4b49a]/15 text-[#e8d5b7]"
                        : "border-white/10 text-[#9b8b7a] hover:border-white/25"
                    }`}
                  >
                    {locale === "en" ? pack.nameEn : pack.name}
                  </button>
                );
              })}
            </div>

            {/* Active pack's stickers */}
            {(() => {
              const pack = stickerPacks.find((p) => p.id === activeStickerPack);
              if (!pack) return null;
              return (
                <div className="grid grid-cols-4 gap-2">
                  {pack.stickers.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => addSticker(asset)}
                      title={asset.label}
                      className="relative flex aspect-square items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 hover:border-[#c4b49a]/60"
                    >
                      <img
                        src={asset.src}
                        alt={asset.label}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeStickerPanel;
