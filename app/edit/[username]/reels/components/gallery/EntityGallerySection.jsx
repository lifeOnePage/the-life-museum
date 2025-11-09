// components/gallery/EntityGallerySection.jsx
"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiUpload, FiTrash2, FiCheckCircle } from "react-icons/fi";
import MediaGrid from "./MediaGrid";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const makeTmpId = () =>
  `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function EntityGallerySection({
  type,                     // 'experience' | 'relationship'
  items: initialItems = [],
  setItems,
  maxCards = 12,
  hasUnsavedChanges,
  onSave,
  onSavedNext,
  headerTitle,
  headerDesc,
  primaryFields,
  extraFields = [],
  showRepresentative = false,
  savingState,
}) {
  const fileRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const items = initialItems;

  
  const addCard = () => {
    if (items.length >= maxCards) return;
    const empty = { _tmpId: makeTmpId(), media: [] };
    [...primaryFields, ...extraFields].forEach((f) => (empty[f.key] = ""));
    if (showRepresentative) empty.representative = 0;
    setItems((prev) => [empty, ...prev]); // ← 맨 앞에만 추가, 재정렬 없음
  };

  const deleteCard = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  
  const updateField = (i, key, val) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: val };
      return copy;
    });
  };

  const onPickFiles = (i) => {
    setSelectedIndex(i);
    fileRef.current?.click();
  };

  
  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (selectedIndex == null) return;

    const mapped = files.map((f) => ({
      file: f,
      caption: "",
      preview: URL.createObjectURL(f),
    }));

    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[selectedIndex];
      const media = Array.isArray(cur.media) ? cur.media : [];
      copy[selectedIndex] = { ...cur, media: [...media, ...mapped] };
      return copy;
    });

    setSelectedIndex(null);
    e.target.value = "";
  };

  
  const onDeleteMedia = (itemIdx, mediaIdx) => {
    setItems((prev) => {
      const copy = [...prev];
      const cur = { ...copy[itemIdx] };
      const media = [...(cur.media || [])];
      media.splice(mediaIdx, 1);
      cur.media = media;
      copy[itemIdx] = cur;
      return copy;
    });
  };

  
  const onCaption = (itemIdx, mediaIdx, caption) => {
    setItems((prev) => {
      const copy = [...prev];
      const cur = { ...copy[itemIdx] };
      const media = [...(cur.media || [])];
      media[mediaIdx] = { ...media[mediaIdx], caption };
      cur.media = media;
      copy[itemIdx] = cur;
      return copy;
    });
  };

  
  const onPickRepresentative = (itemIdx, mediaIdx) => {
    if (!showRepresentative) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[itemIdx] = { ...copy[itemIdx], representative: mediaIdx };
      return copy;
    });
  };


  return (
    <motion.section variants={fade} initial="initial" animate="animate" className="w-full">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{headerTitle}</h3>
          {headerDesc && <p className="text-sm text-white/70">{headerDesc}</p>}
        </div>

        {hasUnsavedChanges ? (
          <button
            onClick={onSave}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-black transition hover:opacity-90"
          >
            저장
          </button>
        ) : (
          <div className="flex items-center gap-2 text-white/60">
            <FiCheckCircle className="text-white" />
            <span className="text-sm">모든 변경사항이 저장되었습니다</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {savingState?.isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 w-full"
          >
            <div className="h-2 w-full rounded bg-white/10">
              <div
                className="h-2 rounded bg-white transition-[width] duration-300"
                style={{ width: `${savingState.progress ?? 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-white/60">
              저장 중... {savingState.progress ?? 0}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 카드 추가 (맨 앞) */}
      {items.length < maxCards && (
        <button
          onClick={addCard}
          className="mb-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/30 py-6 text-white/80 transition hover:border-white/60 hover:text-white"
        >
          <FiPlus /> {type === "experience" ? "새 경험 추가" : "새 인연 추가"}
        </button>
      )}

      {/* 카드들 (순서 유지) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {items.map((it, i) => {
          const thumbs = it.media?.slice?.(0, 4) ?? [];
          const key = it.id ?? it._tmpId ?? i; // 키 안정성
          return (
            <motion.div key={key} layout className="relative rounded-2xl border border-white/15 bg-black-200 p-4">
              <div className="absolute right-2 top-2">
                <button
                  onClick={() => deleteCard(i)}
                  className="rounded-full bg-black/60 p-2 transition hover:bg-black"
                  aria-label="카드 삭제"
                >
                  <FiTrash2 className="text-white" />
                </button>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-2">
                {primaryFields.map((f) => (
                  <input
                    key={f.key}
                    value={it[f.key] ?? ""}
                    onChange={(e) => updateField(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white outline-none placeholder-white/40 focus:border-white/40"
                  />
                ))}
                {extraFields.map((f) =>
                  f.kind === "textarea" ? (
                    <textarea
                      key={f.key}
                      value={it[f.key] ?? ""}
                      onChange={(e) => updateField(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white outline-none placeholder-white/40 focus:border-white/40"
                    />
                  ) : (
                    <input
                      key={f.key}
                      value={it[f.key] ?? ""}
                      onChange={(e) => updateField(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white outline-none placeholder-white/40 focus:border-white/40"
                    />
                  )
                )}
              </div>

              {/* 요약 썸네일 */}
              {thumbs?.length > 0 && (
                <div className="mt-3 flex items-center justify-between gap-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <span>미디어 {it.media?.length ?? 0}개</span>
                  </div>
                  <div className="-space-x-1 flex">
                    {thumbs.map((m, t) => (
                      <img
                        key={t}
                        src={m.preview || m.url}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover ring-1 ring-black/50"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 업로드 버튼 */}
              <button
                onClick={() => onPickFiles(i)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white transition hover:border-white/40"
              >
                <FiUpload /> 이미지/동영상 업로드
              </button>

              {/* representative 안내 */}
              {showRepresentative && (it.media?.length ?? 0) > 0 && (
                <p className="mt-2 text-xs text-white/60">
                  이미지를 클릭하면 대표로 지정됩니다.
                </p>
              )}

              {/* 미디어 그리드 */}
              {it.media?.length > 0 && (
                <div className="mt-3">
                  <MediaGrid
                    items={it.media}
                    onDelete={(mi) => onDeleteMedia(i, mi)}
                    onCaption={(mi, v) => onCaption(i, mi, v)}
                    onPickRepresentative={
                      showRepresentative ? (mi) => onPickRepresentative(i, mi) : undefined
                    }
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 파일 입력기 */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={onFiles}
        className="hidden"
      />

      {!!onSavedNext && (
        <p className="mt-4 text-xs text-white/60">
          저장이 완료되면 자동으로 다음 섹션으로 이동합니다.
        </p>
      )}
    </motion.section>
  );
}
