"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ItemBlock({ id, title, date, mode, onClick, onDelete, hasUnsavedChanges = false }) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between py-4 border-b-white-300 border-b px-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        {hasUnsavedChanges && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
        {mode === "edit" && (
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white/80 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="8"
                x2="16"
                y2="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="12"
                x2="16"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
        <span className="text-white text-base cursor-pointer text-sm" onClick={onClick}>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/70 text-sm cursor-pointer text-xs" onClick={onClick}>{date}</span>
        {mode === "edit" && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-white/50 hover:text-white/80 transition-colors p-1"
            aria-label="삭제"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="4"
                y1="4"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="4"
                x2="4"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
