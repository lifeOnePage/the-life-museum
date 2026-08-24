"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { FLOWER_LABELS, FLOWER_TYPES } from "./guestbookApi";

/**
 * 방명록 작성 바텀시트.
 * POST는 부모(GuestbookTab)가 수행하고, 시트는 선택된 꽃 이미지의 화면 좌표를
 * 측정해 제출 페이로드와 함께 넘긴다(제출 애니메이션의 시작 위치).
 */
export default function GuestbookSheet({ open, tone, onClose, onSubmit }) {
  const isDark = tone !== "white";
  const [authorName, setAuthorName] = useState("");
  const [flowerType, setFlowerType] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const flowerRefs = useRef({});

  const canSubmit =
    authorName.trim().length > 0 &&
    message.trim().length > 0 &&
    flowerType != null &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    // 시트가 언마운트되기 전에 선택된 꽃 이미지 위치를 캡처
    const img = flowerRefs.current[flowerType];
    const rect = img ? img.getBoundingClientRect() : null;
    try {
      await onSubmit(
        {
          authorName: authorName.trim(),
          flowerType,
          message: message.trim(),
        },
        rect,
      );
      // 성공 시 부모가 시트를 닫는다 — 다음 열림을 위해 폼 초기화
      setAuthorName("");
      setFlowerType(null);
      setMessage("");
    } catch (e) {
      setError(e?.message || "잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
    }
  };

  const surface = isDark
    ? "bg-[#161616] text-white"
    : "bg-[#f4efe8] text-[#1a1510]";
  const subText = isDark ? "text-white/50" : "text-black/45";
  const fieldBg = isDark
    ? "bg-white/5 border-white/10 placeholder:text-white/25"
    : "bg-white/70 border-black/10 placeholder:text-black/25";
  const cardBase = isDark
    ? "border-white/10 bg-white/5"
    : "border-black/10 bg-white/60";
  const cardActive = isDark
    ? "border-white/70 bg-white/10"
    : "border-black/60 bg-white";

  const numBadge = (n) => (
    <span
      className={`flex h-[2.4vh] w-[2.4vh] shrink-0 items-center justify-center rounded-full text-[1.3vh] font-medium ${
        isDark ? "bg-white/15 text-white/80" : "bg-black/70 text-white"
      }`}
    >
      {n}
    </span>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 스크림 — 탭하면 닫힘 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30"
            onClick={() => !submitting && onClose()}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-y-auto rounded-t-3xl px-[6%] pt-[2.4vh] shadow-2xl ${surface}`}
            style={{
              paddingBottom: "calc(2.4vh + env(safe-area-inset-bottom))",
            }}
          >
            {/* 닫기 */}
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className={`absolute top-[2vh] right-[5%] ${subText}`}
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            {/* ① 이름 */}
            <div className="flex items-center gap-[2%]">
              {numBadge(1)}
              <span className="text-[1.7vh] font-medium">
                이름을 입력해주세요
              </span>
            </div>
            <div className="relative mt-[1.2vh]">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value.slice(0, 10))}
                maxLength={10}
                placeholder="이름을 입력해주세요"
                className={`w-full rounded-lg border px-4 py-[1.4vh] pr-14 text-[1.6vh] outline-none ${fieldBg}`}
              />
              <span
                className={`absolute top-1/2 right-4 -translate-y-1/2 text-[1.3vh] ${subText}`}
              >
                {authorName.length}/10
              </span>
            </div>

            {/* ② 꽃 선택 */}
            <div className="mt-[2.6vh] flex items-center gap-[2%]">
              {numBadge(2)}
              <span className="text-[1.7vh] font-medium">
                추모의 꽃을 선택해주세요
              </span>
            </div>
            <div className="mt-[1.2vh] grid grid-cols-3 gap-[2.5%]">
              {FLOWER_TYPES.map((type) => {
                const active = flowerType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFlowerType(type)}
                    className={`flex flex-col items-center rounded-xl border px-[4%] py-[1.4vh] transition-colors ${
                      active ? cardActive : cardBase
                    }`}
                  >
                    <img
                      ref={(el) => (flowerRefs.current[type] = el)}
                      src="/images/memorial/flower.png"
                      alt={FLOWER_LABELS[type]}
                      draggable={false}
                      className="pointer-events-none h-[9vh] w-auto select-none"
                    />
                    <span className={`mt-[1vh] text-[1.4vh] ${subText}`}>
                      {FLOWER_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ③ 한마디 */}
            <div className="mt-[2.6vh] flex items-center gap-[2%]">
              {numBadge(3)}
              <span className="text-[1.7vh] font-medium">
                추모의 한마디를 남겨주세요
              </span>
            </div>
            <div className="relative mt-[1.2vh]">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                maxLength={300}
                rows={3}
                placeholder="따뜻한 마음을 전해주세요"
                className={`w-full resize-none rounded-lg border px-4 py-[1.4vh] text-[1.6vh] outline-none ${fieldBg}`}
              />
              <span
                className={`absolute right-4 bottom-[1.2vh] text-[1.3vh] ${subText}`}
              >
                {message.length}/300
              </span>
            </div>

            {error && (
              <p className="mt-[1.2vh] text-center text-[1.4vh] text-red-400">
                {error}
              </p>
            )}

            {/* 제출 */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`mt-[2vh] flex w-full items-center justify-center gap-2 rounded-full py-[1.8vh] text-[1.7vh] font-medium transition-opacity disabled:opacity-40 ${
                isDark ? "bg-white text-black" : "bg-[#1a1510] text-white"
              }`}
            >
              {submitting ? (
                <span className="h-[1.8vh] w-[1.8vh] animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  추모의 글 남기기
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
