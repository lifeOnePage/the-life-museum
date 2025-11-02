"use client";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

const toneStyles = {
  success: "border-l-4 border-green-400",
  info: "border-l-4 border-blue-400",
  error: "border-l-4 border-red-400",
};

const toneIcon = {
  success: <FiCheckCircle className="shrink-0" />,
  info: <FiInfo className="shrink-0" />,
  error: <FiAlertTriangle className="shrink-0" />,
};

export default function ToastStack({ toasts = [], onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[2000] flex justify-center">
      <div className="flex w-full max-w-md flex-col gap-2 px-4">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: 4, opacity: 1 }}
              exit={{ y: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto relative rounded-xl bg-black-200/90 text-white shadow-xl backdrop-blur border border-white/10 ${toneStyles[t.tone] ?? ""}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="mt-[2px]">{toneIcon[t.tone] ?? toneIcon.info}</div>
                <div className="flex-1 text-sm leading-5">{t.message}</div>
                <button
                  onClick={() => onDismiss?.(t.id)}
                  className="rounded p-1 hover:bg-white/10 active:bg-white/20"
                  aria-label="닫기"
                >
                  <FiX />
                </button>
              </div>

              {/* 진행바 */}
              {t.duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 overflow-hidden rounded-b-xl"
                  initial={false}
                >
                  <motion.div
                    className="h-full bg-white/80"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: t.duration / 1000, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
