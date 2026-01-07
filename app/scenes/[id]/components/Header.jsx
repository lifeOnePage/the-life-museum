"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header({ mode, hasChanges, onSave, onCancel, onBack, onToggleMode, isDisabled, isLocked, onToggleLock, onShowExitConfirm }) {
  const [showLockTooltip, setShowLockTooltip] = useState(false);

  const handleBackClick = () => {
    // 변경사항이 있으면 확인 모달 표시
    if (mode === "edit" && hasChanges && onShowExitConfirm) {
      onShowExitConfirm();
      return;
    }
    if (onBack) {
      onBack(false); // 변경사항 유지
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        {/* 왼쪽 버튼들 - between 배치 */}
        {onBack && (
          <div className="flex items-center justify-between" style={{ width: mode === "view" && onToggleLock !== undefined ? '100%' : 'auto' }}>
            <button
              onClick={handleBackClick}
              disabled={isDisabled}
              className={`transition-colors text-white hover:text-white/70 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 잠금 버튼 - 보기 모드 & 상세보기일 때만 */}
            {mode === "view" && onToggleLock !== undefined && (
              <div className="relative">
                <button
                  onClick={onToggleLock}
                  onMouseEnter={() => setShowLockTooltip(true)}
                  onMouseLeave={() => setShowLockTooltip(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isLocked
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-transparent text-white hover:bg-white/10'
                  }`}
                >
                  {isLocked ? (
                    // 잠금 아이콘 (filled)
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                  ) : (
                    // 잠금 해제 아이콘 (open lock)
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 8h-7V6c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5S9 3.24 9 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                  )}
                </button>

                {/* 툴팁 */}
                <AnimatePresence>
                  {showLockTooltip && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute top-1/2 right-full mr-4 -translate-y-1/2 overflow-hidden z-50"
                    >
                      <div className="bg-black px-4 py-2.5 whitespace-nowrap">
                        <p className="text-xs text-white">
                          {isLocked
                            ? "눌러서 전체 이벤트에 대한 기록을 돌려볼 수 있습니다."
                            : "눌러서 해당 이벤트에 대한 기록만 돌려볼 수 있습니다."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {!onBack && <div className="flex-1"></div>}

        {mode === "edit" && hasChanges && (
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isDisabled}
                className="px-4 py-2 text-white/70 text-sm font-medium hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            )}
            <button
              onClick={onSave}
              disabled={isDisabled}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {isDisabled ? "저장 중..." : "저장하기"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
