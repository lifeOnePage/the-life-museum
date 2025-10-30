// components/gallery/MediaGrid.jsx
"use client";
import { FiTrash2 } from "react-icons/fi";

export default function MediaGrid({ items, onDelete, onCaption, cols = 3 }) {
  console.log(items)
  return (
    
    <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 lg:grid-cols-3">
      {items.map((m, idx) => (
        <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-white/20">
          {m.file ? (
            m.file.type?.startsWith("video") ? (
              <video src={m.preview || URL.createObjectURL(m.file)} muted loop className="w-full h-full object-cover" />
            ) : (
              <img src={m.preview || URL.createObjectURL(m.file)} alt="" className="w-full h-full object-cover" />
            )
          ) : m.url && m.url.match(/\.(mp4|mov|webm|m4v|avi)$/i) ? (
            <video src={m.url} muted loop className="w-full h-full object-cover" />
          ) : (
            <img src={m.url} alt="" className="w-full h-full object-cover" />
          )}

          <button
            onClick={() => onDelete?.(idx)}
            className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 hover:bg-black transition-colors"
            aria-label="삭제"
          >
            <FiTrash2 className="text-white" />
          </button>

          <input
            value={m.caption ?? ""}
            onChange={(e) => onCaption?.(idx, e.target.value)}
            placeholder="캡션"
            className="absolute bottom-0 w-full bg-black/50 text-white text-[12px] px-2 py-1 border-t border-white/20 outline-none"
          />
        </div>
      ))}
    </div>
  );
}
