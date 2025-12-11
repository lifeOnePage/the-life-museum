"use client";

export default function Header({ mode, hasChanges, onSave, onBack, onToggleMode, isDisabled }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
      {onBack && (
        <button
          onClick={onBack}
          disabled={isDisabled}
          className="text-white hover:text-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
      <div className="flex-1"></div>

      {/* 편집 모드 토글 버튼 */}
      {onToggleMode && (
        <button
          onClick={onToggleMode}
          className={`p-2 rounded-lg transition-colors border ${
            mode === "edit"
              ? "bg-white/20 border-white/30 text-white"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title={mode === "edit" ? "보기 모드로 전환" : "편집 모드로 전환"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
              stroke="currentColor"
              fill="none"
            />
          </svg>
        </button>
      )}

      {mode === "edit" && hasChanges && (
        <button
          onClick={onSave}
          disabled={isDisabled}
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          {isDisabled ? "업로드 중..." : "저장하기"}
        </button>
      )}
    </div>
  );
}
