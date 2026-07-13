"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, RotateCw, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import ThemeSelector from "./ThemeSelector";
import { DEFAULT_OWNED_PACK_IDS } from "../themeConfig";

const T = {
  ko: {
    title: "뒷면 테마 편집",
    themeLabel: "테마",
    stickerLabel: "스티커",
    noStickers: "아직 스티커가 없어요",
    locked: "테마 구매 후 사용 가능",
    hint: "스티커를 눌러 추가하고, 미리보기 위에서 드래그해 위치를 잡아보세요",
    cancel: "취소",
    save: "저장",
  },
  en: {
    title: "Edit Back Theme",
    themeLabel: "Theme",
    stickerLabel: "Stickers",
    noStickers: "No stickers yet",
    locked: "Unlocks after purchasing the theme pack",
    hint: "Tap a sticker to add it, then drag it into place on the preview",
    cancel: "Cancel",
    save: "Save",
  },
};

let stickerIdSeq = 0;

const BackThemeEditorModal = ({
  isOpen,
  onClose,
  locale,
  theme,
  stickers,
  previewImageUrl,
  onThemePreview,
  onSave,
  ownedPackIds = DEFAULT_OWNED_PACK_IDS,
}) => {
  const t = T[locale] || T.ko;
  const [draftTheme, setDraftTheme] = useState(theme);
  const [draftStickers, setDraftStickers] = useState(stickers || []);
  const [selectedId, setSelectedId] = useState(null);
  const [stickerPacks, setStickerPacks] = useState([]);
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDraftTheme(theme);
      setDraftStickers(stickers || []);
      setSelectedId(null);
    }
  }, [isOpen, theme, stickers]);

  // public/stickers/<packId>/ 폴더 구조를 그대로 반영한 팩 목록을 불러온다.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/stickers")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStickerPacks(data.packs || []);
      })
      .catch(() => {
        if (!cancelled) setStickerPacks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 팝업에서 테마를 바꾸는 즉시 부모의 미리보기(3D 텍스처)도 갱신되도록 알림.
  // 스티커는 테마가 아니라 "팩" 소유 여부에 달려 있으므로, 테마를 바꿔도
  // 이미 놓은 스티커는 그대로 유지된다.
  const handleThemeSelect = (key) => {
    setDraftTheme(key);
    onThemePreview?.(key);
  };

  const isPackOwned = (packId) => ownedPackIds.includes(packId);
  const selectedSticker = draftStickers.find((s) => s.id === selectedId);

  const updateSticker = (id, patch) => {
    setDraftStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const addSticker = (asset, packId) => {
    if (!isPackOwned(packId)) return;
    const id = `sticker-${Date.now()}-${stickerIdSeq++}`;
    setDraftStickers((prev) => [
      ...prev,
      {
        id,
        assetId: asset.id,
        src: asset.src,
        x: 0.5,
        y: 0.5,
        rotation: 0,
        scale: 1,
      },
    ]);
    setSelectedId(id);
  };

  const removeSticker = (id) => {
    setDraftStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const handlePointerDown = (e, sticker) => {
    e.stopPropagation();
    e.preventDefault();
    if (!stageRef.current) return;
    e.target.setPointerCapture(e.pointerId);
    setSelectedId(sticker.id);
    dragRef.current = {
      id: sticker.id,
      rect: stageRef.current.getBoundingClientRect(),
      startX: sticker.x,
      startY: sticker.y,
      pointerX: e.clientX,
      pointerY: e.clientY,
    };
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.pointerX) / drag.rect.width;
    const dy = (e.clientY - drag.pointerY) / drag.rect.height;
    updateSticker(drag.id, {
      x: Math.min(1, Math.max(0, drag.startX + dx)),
      y: Math.min(1, Math.max(0, drag.startY + dy)),
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleSave = () => {
    onSave(draftTheme, draftStickers);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-full flex-col overflow-y-auto bg-[#2a2318] shadow-xl sm:h-[92vh] sm:max-h-[900px] sm:w-[94vw] sm:max-w-5xl sm:rounded-xl md:flex-row md:overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-md bg-black/20 text-[#9b8b7a] hover:text-[#e8d5b7]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Preview + drag stage */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-4 border-b border-white/10 p-4 sm:p-6 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:border-r md:border-b-0">
              <div
                ref={stageRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
                className="relative aspect-square w-full max-w-[420px] shrink-0 touch-none overflow-hidden rounded-lg border border-white/10 bg-black/20 select-none"
              >
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {draftStickers.map((s) => (
                  <img
                    key={s.id}
                    src={s.src}
                    alt=""
                    draggable={false}
                    onPointerDown={(e) => handlePointerDown(e, s)}
                    className={`absolute h-16 w-16 max-w-[40%] cursor-grab touch-none object-contain active:cursor-grabbing ${
                      selectedId === s.id
                        ? "outline outline-2 outline-offset-2 outline-[#c4b49a]"
                        : ""
                    }`}
                    style={{
                      left: `${s.x * 100}%`,
                      top: `${s.y * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                    }}
                  />
                ))}
              </div>

              {selectedSticker ? (
                <div className="flex w-full max-w-[420px] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <RotateCw className="h-4 w-4 shrink-0 text-[#9b8b7a]" />
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedSticker.rotation}
                    onChange={(e) =>
                      updateSticker(selectedSticker.id, {
                        rotation: Number(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.05"
                    value={selectedSticker.scale}
                    onChange={(e) =>
                      updateSticker(selectedSticker.id, {
                        scale: Number(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeSticker(selectedSticker.id)}
                    className="shrink-0 text-[#9b8b7a] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="max-w-[420px] text-center text-xs text-[#9b8b7a]">
                  {t.hint}
                </p>
              )}
            </div>

            {/* Theme + sticker palette */}
            <div className="flex w-full shrink-0 flex-col gap-5 p-4 sm:p-6 md:min-h-0 md:w-72 md:shrink md:overflow-y-auto">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#e8d5b7]">
                  {t.themeLabel}
                </p>
                <ThemeSelector
                  selectedTheme={draftTheme}
                  onThemeChange={handleThemeSelect}
                  locale={locale}
                />
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#e8d5b7]">
                  {t.stickerLabel}
                </p>
                {stickerPacks.length === 0 ? (
                  <p className="text-xs text-[#9b8b7a]">{t.noStickers}</p>
                ) : (
                  stickerPacks.map((pack) => {
                    const owned = isPackOwned(pack.id);
                    return (
                      <div key={pack.id}>
                        <div className="mb-2 flex items-center gap-1.5">
                          <p className="text-xs font-medium text-[#c4b49a]">
                            {locale === "en" ? pack.nameEn : pack.name}
                          </p>
                          {!owned && (
                            <span
                              title={t.locked}
                              className="flex items-center gap-1 text-[10px] text-[#9b8b7a]"
                            >
                              <Lock className="h-3 w-3" />
                              {t.locked}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {pack.stickers.map((asset) => (
                            <button
                              key={asset.id}
                              onClick={() => addSticker(asset, pack.id)}
                              disabled={!owned}
                              title={owned ? asset.label : t.locked}
                              className={`relative flex aspect-square items-center justify-center rounded-md border p-1.5 ${
                                owned
                                  ? "border-white/10 bg-white/5 hover:border-[#c4b49a]/60"
                                  : "cursor-not-allowed border-white/5 bg-white/2"
                              }`}
                            >
                              <img
                                src={asset.src}
                                alt={asset.label}
                                className={`h-full w-full object-contain ${
                                  owned ? "" : "opacity-30 grayscale"
                                }`}
                              />
                              {!owned && (
                                <Lock className="absolute h-4 w-4 text-[#e8d5b7]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-auto flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/15 text-[#9b8b7a] hover:border-white/30 hover:text-[#e8d5b7]"
                >
                  {t.cancel}
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {t.save}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackThemeEditorModal;
