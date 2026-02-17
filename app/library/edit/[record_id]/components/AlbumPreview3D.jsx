"use client";

import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
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

function drawSectionHeader(ctx, text, y, canvasWidth) {
  const padding = 60;
  const textWidth = ctx.measureText(text).width;
  const lineY = y;
  const gap = 16;

  ctx.strokeStyle = "rgba(120, 113, 108, 0.4)";
  ctx.lineWidth = 1;

  const leftLineEnd = (canvasWidth - textWidth) / 2 - gap;
  const rightLineStart = (canvasWidth + textWidth) / 2 + gap;

  ctx.beginPath();
  ctx.moveTo(padding, lineY);
  ctx.lineTo(leftLineEnd, lineY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightLineStart, lineY);
  ctx.lineTo(canvasWidth - padding, lineY);
  ctx.stroke();

  ctx.fillStyle = "rgba(120, 113, 108, 0.7)";
  ctx.font = "600 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvasWidth / 2, y + 7);
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

  const padding = 70;
  let cursorY = 100;

  // Bio section
  if (bio) {
    ctx.font = "600 22px sans-serif";
    drawSectionHeader(ctx, "생 애 문", cursorY, size);
    cursorY += 80;

    ctx.font = "italic 26px sans-serif";
    ctx.fillStyle = "#1c1917";
    const bioLines = wrapText(ctx, bio, size - padding * 2);
    const maxBioLines = timeline.length > 0 ? 12 : 22;
    const displayLines = bioLines.slice(0, maxBioLines);

    for (const line of displayLines) {
      ctx.fillText(line, padding, cursorY);
      cursorY += 36;
    }

    if (bioLines.length > maxBioLines) {
      ctx.fillStyle = "rgba(120, 113, 108, 0.5)";
      ctx.font = "22px sans-serif";
      ctx.fillText("...", padding, cursorY);
      cursorY += 30;
    }

    cursorY += 20;
  }

  // Timeline section
  if (timeline.length > 0) {
    ctx.font = "600 22px sans-serif";
    drawSectionHeader(ctx, "타 임 라 인", cursorY, size);
    cursorY += 70;

    const dotX = padding + 8;
    const lineX = dotX;
    const textX = dotX + 24;
    const maxItems = bio ? 5 : 10;
    const items = timeline.slice(0, maxItems);

    // Vertical line
    const lineTop = cursorY - 6;
    const lineBottom = cursorY + (items.length - 1) * 52 + 6;
    ctx.strokeStyle = "rgba(120, 113, 108, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lineX, lineTop);
    ctx.lineTo(lineX, lineBottom);
    ctx.stroke();

    for (const item of items) {
      // Dot
      ctx.beginPath();
      ctx.arc(dotX, cursorY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706";
      ctx.fill();
      ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Year
      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText(item.year, textX, cursorY + 7);

      // Event
      const yearWidth = ctx.measureText(item.year).width;
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "#78716c";
      const eventText =
        item.event.length > 30 ? item.event.slice(0, 30) + "..." : item.event;
      ctx.fillText(eventText, textX + yearWidth + 14, cursorY + 7);

      cursorY += 52;
    }

    if (timeline.length > maxItems) {
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "rgba(120, 113, 108, 0.5)";
      ctx.fillText(`+${timeline.length - maxItems}개 더`, textX, cursorY + 4);
    }
  }

  // Empty state
  if (!bio && timeline.length === 0) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(168, 162, 158, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
  }

  return canvas.toDataURL("image/png");
}

export default function AlbumPreview3D({ frontCover, bio, timeline }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(bio || "", timeline || []);
  }, [bio, timeline]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="h-full w-full">
        <Canvas
          camera={{ position: [0, 1.6, 6], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={0.8} />
          <directionalLight position={[-2, 1, 2]} intensity={3} />
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
      <button
        onClick={() => setIsFlipped((f) => !f)}
        className="mt-2 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        클릭하여 {isFlipped ? "앞면" : "뒷면"} 보기
      </button>
    </div>
  );
}
