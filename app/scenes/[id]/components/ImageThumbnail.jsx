"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ImageThumbnail({ id, imgUrl, onDelete, isUploading }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transform ? "none" : undefined,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-[4/3] bg-white/5 rounded-lg overflow-hidden ${
        isUploading ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
      } touch-none ${
        isDragging ? "opacity-70 scale-105" : "opacity-100 scale-100"
      }`}
    >
      <img
        src={imgUrl}
        alt="Thumbnail"
        className="w-full h-full object-cover"
      />
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isUploading) {
            onDelete();
          }
        }}
        disabled={isUploading}
        className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/70 z-10"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3L3 9M3 3L9 9"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
