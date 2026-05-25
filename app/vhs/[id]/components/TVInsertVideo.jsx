"use client";

import { useRef, useEffect } from "react";
import { INSERT_VIDEO_SRC, CROSSFADE_DURATION_MS } from "./lib/constants";

export default function TVInsertVideo({ onEnded, visible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (visible) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [visible]);

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <video
        ref={videoRef}
        src={INSERT_VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        onEnded={onEnded}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
