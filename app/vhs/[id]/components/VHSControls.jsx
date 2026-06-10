"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { SlLogout } from "react-icons/sl";
import {
  CROSSFADE_DURATION_MS,
  IMAGE_DURATION_OPTIONS,
  VIDEO_MODE_OPTIONS,
  FILTER_OPTIONS,
  TRANSITION_OPTIONS,
} from "./lib/constants";

function Tooltip({ label, children }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

export default function VHSControls({
  isPlaying,
  onTogglePlay,
  imageDuration,
  onImageDurationChange,
  videoMode,
  onVideoModeChange,
  colorFilter,
  onColorFilterChange,
  transitionType,
  onTransitionTypeChange,
  isFullscreen,
  onToggleFullscreen,
  onExit,
  visible,
}) {
  return (
    <div
      className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm transition-opacity duration-300 max-w-[calc(100vw-2rem)]"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Exit */}
      <Tooltip label="나가기">
        <button
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <SlLogout className="h-4 w-4 text-white" />
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-white/20" />

      {/* Play / Pause */}
      <Tooltip label={isPlaying ? "일시정지" : "재생"}>
        <button
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-white/20" />

      {/* Image duration select */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/60">사진</span>
        <select
          value={imageDuration}
          onChange={(e) => onImageDurationChange(Number(e.target.value))}
          className="cursor-pointer rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
        >
          {IMAGE_DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Video mode select */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/60">영상</span>
        <select
          value={videoMode}
          onChange={(e) => onVideoModeChange(Number(e.target.value))}
          className="cursor-pointer rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
        >
          {VIDEO_MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transition style select */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/60">전환</span>
        <select
          value={transitionType}
          onChange={(e) => onTransitionTypeChange(e.target.value)}
          className="cursor-pointer rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
        >
          {TRANSITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color filter select */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/60">필터</span>
        <select
          value={colorFilter}
          onChange={(e) => onColorFilterChange(e.target.value)}
          className="cursor-pointer rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors outline-none hover:bg-white/20 [&>option]:bg-neutral-900 [&>option]:text-white"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-white/20" />

      {/* Fullscreen */}
      <Tooltip label={isFullscreen ? "전체화면 해제" : "전체화면"}>
        <button
          onClick={onToggleFullscreen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-white" />
          ) : (
            <Maximize2 className="h-5 w-5 text-white" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
