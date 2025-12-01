"use client";

export default function Header({ mode, hasChanges, onSave, onBack }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
      {onBack && (
        <button
          onClick={onBack}
          className="text-white hover:text-white/70 transition-colors"
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
      {mode === "edit" && hasChanges && (
        <button
          onClick={onSave}
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          저장하기
        </button>
      )}
    </div>
  );
}
