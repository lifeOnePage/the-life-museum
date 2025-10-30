// components/gallery/ChildhoodSection.jsx
"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiTrash2, FiCheckCircle } from "react-icons/fi";
import MediaGrid from "./MediaGrid";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ChildhoodSection({
  items, setItems,
  hasUnsavedChanges,
  onSave,
  savingState,
}) {
  const fileRef = useRef(null);

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ file: f, caption: "", preview: URL.createObjectURL(f) }));
    setItems([...(items || []), ...mapped]);
    e.target.value = "";
  };

  const onDelete = (idx) => {
    const copy = [...items];
    copy.splice(idx, 1);
    setItems(copy);
  };

  const onCaption = (idx, v) => {
    const copy = [...items];
    copy[idx].caption = v;
    setItems(copy);
  };

  return (
    <motion.section variants={fade} initial="initial" animate="animate" className="min-h-screen w-full flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-white text-lg font-semibold">유년시절</h3>
          <p className="text-white/70 text-sm">어린 시절의 사진과 영상을 올려주세요. 최대 30장 권장.</p>
        </div>

        {hasUnsavedChanges ? (
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full mb-3">
            <div className="w-full h-2 bg-white/10 rounded">
              <div className="h-2 bg-white rounded transition-[width] duration-300" style={{ width: `${savingState.progress ?? 0}%` }} />
            </div>
            <p className="text-xs text-white/60 mt-1">저장 중... {savingState.progress ?? 0}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-sm bg-black/50 border border-white/20 hover:border-white/40 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition"
        >
          <FiUpload /> 이미지/동영상 업로드
        </button>
      </div>

      {items?.length > 0 && (
        <MediaGrid items={items} onDelete={onDelete} onCaption={onCaption} cols={3} />
      )}

      <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={addFiles} className="hidden" />
    </motion.section>
  );
}
