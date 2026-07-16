"use client";

export default function LegalModal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-[#1e1a14] shadow-xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-[#e8d5b7]">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 transition hover:text-white/70"
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-xs leading-relaxed whitespace-pre-line text-[#c4b49a]">
          {children}
        </div>
      </div>
    </div>
  );
}
