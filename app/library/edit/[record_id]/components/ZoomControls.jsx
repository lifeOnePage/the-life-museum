"use client";

import { Minus, Plus } from "lucide-react";

const ZoomControls = ({ zoom, onZoomChange }) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 5, 150));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 5, 50));
  };

  return (
    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm">
      <button
        onClick={handleZoomOut}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[40px] text-center text-xs font-medium text-gray-600">
        {zoom}%
      </span>
      <button
        onClick={handleZoomIn}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ZoomControls;
