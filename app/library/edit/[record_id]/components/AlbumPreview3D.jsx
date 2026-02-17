"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ZoomIn, ZoomOut } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";

const ALBUM_CONFIG = {
  size: 1.8,
  thickness: 0.02,
  tiltAngle: 0,
};

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    const words = paragraph.split("");
    let line = "";
    for (const char of words) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawSectionHeader(ctx, text, y, left, right) {
  const textWidth = ctx.measureText(text).width;
  const centerX = (left + right) / 2;
  const gap = 16;

  ctx.strokeStyle = "rgba(120, 113, 108, 0.4)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(centerX - textWidth / 2 - gap, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + textWidth / 2 + gap, y);
  ctx.lineTo(right, y);
  ctx.stroke();

  ctx.fillStyle = "rgba(120, 113, 108, 0.7)";
  ctx.font = "600 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, centerX, y + 7);
  ctx.textAlign = "left";
}

function generateBackCoverDataUrl(bio, timeline) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Subtle border
  ctx.strokeStyle = "rgba(168, 162, 158, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, size - 80, size - 80);

  const margin = 60;
  const halfW = size / 2;
  const colPadding = 30;
  const topY = 100;

  const hasBio = !!bio;
  const hasTimeline = timeline.length > 0;

  // If only one section exists, use full width
  const bioLeft = margin;
  const bioRight = hasTimeline ? halfW - colPadding / 2 : size - margin;
  const tlLeft = hasBio ? halfW + colPadding / 2 : margin;
  const tlRight = size - margin;

  // Bio section (left or full)
  if (hasBio) {
    const bioColW = bioRight - bioLeft;
    ctx.font = "600 22px sans-serif";
    drawSectionHeader(ctx, "생 애 문", topY, bioLeft, bioRight);
    let cursorY = topY + 60;

    ctx.font = "italic 24px sans-serif";
    ctx.fillStyle = "#1c1917";
    const bioLines = wrapText(ctx, bio, bioColW);
    const maxBioLines = 22;
    const displayLines = bioLines.slice(0, maxBioLines);

    for (const line of displayLines) {
      if (cursorY > size - margin) break;
      ctx.fillText(line, bioLeft, cursorY);
      cursorY += 34;
    }

    if (bioLines.length > maxBioLines) {
      ctx.fillStyle = "rgba(120, 113, 108, 0.5)";
      ctx.font = "22px sans-serif";
      ctx.fillText("...", bioLeft, cursorY);
    }
  }

  // Divider line between columns
  if (hasBio && hasTimeline) {
    ctx.strokeStyle = "rgba(168, 162, 158, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW, margin + 20);
    ctx.lineTo(halfW, size - margin - 20);
    ctx.stroke();
  }

  // Timeline section (right or full)
  if (hasTimeline) {
    ctx.font = "600 22px sans-serif";
    drawSectionHeader(ctx, "타 임 라 인", topY, tlLeft, tlRight);
    let cursorY = topY + 60;

    const dotX = tlLeft + 8;
    const textX = dotX + 22;
    const maxItems = 14;
    const items = timeline.slice(0, maxItems);

    // Vertical line
    const lineTop = cursorY - 6;
    const lineBottom = Math.min(
      cursorY + (items.length - 1) * 52 + 6,
      size - margin,
    );
    ctx.strokeStyle = "rgba(120, 113, 108, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dotX, lineTop);
    ctx.lineTo(dotX, lineBottom);
    ctx.stroke();

    const maxEventLen = hasBio ? 14 : 30;

    for (const item of items) {
      if (cursorY > size - margin) break;

      // Dot
      ctx.beginPath();
      ctx.arc(dotX, cursorY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706";
      ctx.fill();
      ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Year
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText(item.year, textX, cursorY + 7);

      // Event
      const yearWidth = ctx.measureText(item.year).width;
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#78716c";
      const eventText =
        item.event.length > maxEventLen
          ? item.event.slice(0, maxEventLen) + "..."
          : item.event;
      ctx.fillText(eventText, textX + yearWidth + 10, cursorY + 7);

      cursorY += 52;
    }

    if (timeline.length > maxItems) {
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "rgba(120, 113, 108, 0.5)";
      ctx.fillText(
        `+${timeline.length - maxItems}개 더`,
        textX,
        cursorY + 4,
      );
    }
  }

  // Empty state
  if (!hasBio && !hasTimeline) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(168, 162, 158, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
  }

  return canvas.toDataURL("image/png");
}

const ZOOM_MIN = 4;
const ZOOM_MAX = 8;
const ZOOM_STEP = 0.5;
const ZOOM_DEFAULT = 6;

function CameraZoom({ zoom }) {
  const { camera } = useThree();
  const targetZ = useRef(zoom);
  targetZ.current = zoom;

  useEffect(() => {
    camera.position.z = zoom;
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  return null;
}

export default function AlbumPreview3D({ frontCover, bio, timeline }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(bio || "", timeline || []);
  }, [bio, timeline]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex shrink-0 items-center gap-3 py-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX))}
          disabled={zoom >= ZOOM_MAX}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsFlipped((f) => !f)}
          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          {isFlipped ? "앞면" : "뒷면"} 보기
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN))}
          disabled={zoom <= ZOOM_MIN}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 w-full flex-1">
        <Canvas
          camera={{ position: [0, 1.6, 6], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={0.8} />
          <directionalLight position={[-2, 1, 2]} intensity={3} />
          <CameraZoom zoom={zoom} />
          <AlbumCover3D
            index={0}
            position={[0, 0, 0]}
            size={ALBUM_CONFIG.size}
            thickness={ALBUM_CONFIG.thickness}
            tiltAngle={ALBUM_CONFIG.tiltAngle}
            frontImage={frontCover}
            backImage={backCoverDataUrl}
            isSelected={true}
            isFlipped={isFlipped}
            onClick={() => setIsFlipped((f) => !f)}
          />
        </Canvas>
      </div>
    </div>
  );
}
