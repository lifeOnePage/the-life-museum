"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FLOWER_LABELS, fetchGuestbook } from "./guestbookApi";

const PAGE_SIZE = 50;

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/**
 * 남겨진 방명록을 읽는 바텀시트 — 최초 열림 시 로드, "더 보기"로 페이지네이션.
 */
export default function GuestbookListSheet({ open, tone, recordId, onClose }) {
  const isDark = tone !== "white";
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false);

  const load = async (offset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuestbook(recordId, {
        limit: PAGE_SIZE,
        offset,
      });
      setEntries((prev) =>
        offset === 0 ? data.entries : [...prev, ...data.entries],
      );
      setTotal(data.total);
      loadedRef.current = true;
    } catch (e) {
      setError(e?.message || "방명록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !loadedRef.current) load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const surface = isDark
    ? "bg-[#161616] text-white"
    : "bg-[#f4efe8] text-[#1a1510]";
  const subText = isDark ? "text-white/50" : "text-black/45";
  const divider = isDark ? "border-white/8" : "border-black/8";
  const chip = isDark
    ? "bg-white/10 text-white/70"
    : "bg-black/8 text-black/60";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl shadow-2xl ${surface}`}
          >
            <div className="flex items-center justify-between px-[6%] pt-[2.4vh] pb-[1.6vh]">
              <h3 className="font-serif text-[1.9vh] font-medium tracking-wide">
                추모의 기록 {total > 0 && <span className={subText}>{total}</span>}
              </h3>
              <button type="button" onClick={onClose} aria-label="닫기">
                <X size={18} className={subText} />
              </button>
            </div>

            <div
              className="overflow-y-auto px-[6%]"
              style={{
                paddingBottom: "calc(2.4vh + env(safe-area-inset-bottom))",
              }}
            >
              {error && (
                <div className="py-[4vh] text-center">
                  <p className={`text-[1.5vh] ${subText}`}>{error}</p>
                  <button
                    type="button"
                    onClick={() => load(0)}
                    className={`mt-[1.5vh] rounded-full px-4 py-[1vh] text-[1.4vh] ${chip}`}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!error && entries.length === 0 && !loading && (
                <p className={`py-[4vh] text-center text-[1.5vh] ${subText}`}>
                  아직 남겨진 기록이 없습니다
                </p>
              )}

              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`border-b py-[1.8vh] last:border-b-0 ${divider}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[1.6vh] font-medium">
                      {entry.authorName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-[0.3vh] text-[1.15vh] ${chip}`}
                    >
                      {FLOWER_LABELS[entry.flowerType] || entry.flowerType}
                    </span>
                    <span className={`ml-auto text-[1.25vh] ${subText}`}>
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-[0.8vh] text-[1.5vh] leading-[1.8] font-light break-words whitespace-pre-wrap">
                    {entry.message}
                  </p>
                </div>
              ))}

              {loading && (
                <p className={`py-[2.5vh] text-center text-[1.4vh] ${subText}`}>
                  불러오는 중...
                </p>
              )}

              {!loading && !error && entries.length < total && (
                <button
                  type="button"
                  onClick={() => load(entries.length)}
                  className={`mx-auto my-[2vh] block rounded-full px-5 py-[1.1vh] text-[1.4vh] ${chip}`}
                >
                  더 보기
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
