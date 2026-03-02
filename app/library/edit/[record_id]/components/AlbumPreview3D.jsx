"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ZoomIn, ZoomOut } from "lucide-react";
import AlbumCover3D from "./AlbumCover3D";
import { UNIFIED_THEMES } from "../themeConfig";

// Load custom fonts for canvas
let bookkFontLoaded = false;
let monoplexFontLoaded = false;
if (typeof document !== "undefined") {
  const bookkLight = new FontFace(
    "Bookk Gothic",
    "url(/fonts/BookkGothic_Light.woff2)",
    { weight: "300" },
  );
  const bookkBold = new FontFace(
    "Bookk Gothic",
    "url(/fonts/BookkGothic_Bold.woff2)",
    { weight: "700" },
  );
  const monoplex = new FontFace(
    "MonoplexKR",
    "url(/fonts/MonoplexKR-Light.woff2)",
    { weight: "300" },
  );
  Promise.all([bookkLight.load(), bookkBold.load()])
    .then(([l, b]) => {
      document.fonts.add(l);
      document.fonts.add(b);
      bookkFontLoaded = true;
    })
    .catch(() => {});
  monoplex
    .load()
    .then((f) => {
      document.fonts.add(f);
      monoplexFontLoaded = true;
    })
    .catch(() => {});
}

const ALBUM_CONFIG = {
  size: 1.8,
  thickness: 0.03,
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

// ─── Elegant layout ───
// 우상단 bio, 좌하단 사진, 우하단 제목+타임라인, 우측 accent line
function drawElegantLayout(
  ctx,
  size,
  theme,
  bio,
  timeline,
  frontCoverImg,
  albumTitle,
) {
  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);

  const margin = 50;
  const midX = size * 0.4;
  const midY = size * 0.6;

  // Right accent line
  ctx.fillStyle = theme.accent;
  ctx.fillRect(midX + margin, margin, 2, size - margin * 2);

  // Top-right: Bio section
  if (bio) {
    const bioLeft = size - (midX - margin);
    const bioRight = size - 40;
    const bioWidth = bioRight - bioLeft;

    // ctx.font = "bold 18px sans-serif";
    // ctx.fillStyle = theme.accent;
    // ctx.fillText("LIFE STORY", bioLeft, margin + 24);

    const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
    ctx.font = `20px ${bookkFont}`;
    // ctx.fillStyle = theme.text;
    ctx.textAlign = "right";
    ctx.fillStyle = theme.accent;
    const bioLines = wrapText(ctx, bio, bioWidth);
    let y = margin + 56;
    const maxLines = 12;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      if (y > midY - 10) break;
      ctx.fillText(bioLines[i], bioRight, y);
      y += 28;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "80";
      ctx.font = `18px ${bookkFont}`;
      ctx.fillText("...", bioRight, y);
    }
    ctx.textAlign = "left";
  }

  // Bottom-left: Front cover photo
  if (frontCoverImg) {
    const photoX = margin;
    const photoY = midY + 10;
    const photoW = midX - margin - 10;
    const photoH = size - midY - margin - 10;

    ctx.save();
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(photoX + r, photoY);
    ctx.lineTo(photoX + photoW - r, photoY);
    ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + r);
    ctx.lineTo(photoX + photoW, photoY + photoH - r);
    ctx.quadraticCurveTo(
      photoX + photoW,
      photoY + photoH,
      photoX + photoW - r,
      photoY + photoH,
    );
    ctx.lineTo(photoX + r, photoY + photoH);
    ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - r);
    ctx.lineTo(photoX, photoY + r);
    ctx.quadraticCurveTo(photoX, photoY, photoX + r, photoY);
    ctx.closePath();
    ctx.clip();

    // Cover-fit the image
    const imgRatio = frontCoverImg.width / frontCoverImg.height;
    const boxRatio = photoW / photoH;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = frontCoverImg.height;
      sw = sh * boxRatio;
      sx = (frontCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = frontCoverImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (frontCoverImg.height - sh) / 2;
    }
    ctx.drawImage(
      frontCoverImg,
      sx,
      sy,
      sw,
      sh,
      photoX,
      photoY,
      photoW,
      photoH,
    );
    ctx.restore();
  } else {
    // Photo placeholder
    const photoX = margin;
    const photoY = midY + 10;
    const photoW = midX - margin - 10;
    const photoH = size - midY - margin - 10;
    ctx.fillStyle = theme.text + "15";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = theme.text + "30";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTO", photoX + photoW / 2, photoY + photoH / 2);
    ctx.textAlign = "left";
  }

  // Bottom-right: Title + Timeline
  const tlLeft = midX + margin * 2;
  const tlRight = size - margin;
  let cursorY = midY + 10;

  // Album title
  if (albumTitle) {
    ctx.font = "48px sans-serif";
    ctx.fillStyle = theme.accent;
    ctx.letterSpacing = "8px";
    ctx.textAlign = "right";
    const titleLines = wrapText(ctx, albumTitle, tlRight - tlLeft);
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, tlRight, cursorY + 20);
      cursorY += 30;
    }
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    cursorY += 14;
  }

  // Thin divider
  // ctx.fillStyle = theme.accent + "40";
  // ctx.fillRect(tlLeft, cursorY, tlRight - tlLeft, 1.5);
  // cursorY += 16;

  // Timeline items
  if (timeline.length > 0) {
    const maxItems = 8;
    const items = timeline.slice(0, maxItems);
    const dotX = tlLeft + 6;
    const textX = dotX + 18;

    for (const item of items) {
      if (cursorY > size - margin - 10) break;

      // // Dot
      // ctx.beginPath();
      // ctx.arc(dotX, cursorY, 4, 0, Math.PI * 2);
      // ctx.fillStyle = theme.accent;
      // ctx.fill();

      // Year (left-aligned)
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "left";
      ctx.fillText(item.year, textX, cursorY + 30);

      // Event (right-aligned)
      ctx.font = "16px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "right";
      const maxEventLen = 12;
      const eventText =
        item.event.length > maxEventLen
          ? item.event.slice(0, maxEventLen) + "..."
          : item.event;
      ctx.fillText(eventText, tlRight, cursorY + 30);
      ctx.textAlign = "left";

      cursorY += 40;
    }

    if (timeline.length > maxItems) {
      ctx.font = "16px sans-serif";
      ctx.fillStyle = theme.text + "60";
      ctx.fillText(`+${timeline.length - maxItems}개 더`, textX, cursorY + 4);
    }
  }

  // Empty state
  if (!bio && timeline.length === 0 && !frontCoverImg) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = theme.text + "40";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
    ctx.textAlign = "left";
  }
}

// ─── Natural layout ───
// 상단 대형 사진(70%), 좌하단 타임라인, 우하단 3색dots + bio
function drawNaturalLayout(ctx, size, theme, bio, timeline, frontCoverImg) {
  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);

  const margin = 40;
  const photoHeight = size * 0.62;

  // Top: large front cover photo
  if (frontCoverImg) {
    const photoX = margin;
    const photoY = margin;
    const photoW = size - margin * 2;
    const photoH = photoHeight - margin;

    ctx.save();
    const r = 10;
    ctx.beginPath();
    ctx.moveTo(photoX + r, photoY);
    ctx.lineTo(photoX + photoW - r, photoY);
    ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + r);
    ctx.lineTo(photoX + photoW, photoY + photoH - r);
    ctx.quadraticCurveTo(
      photoX + photoW,
      photoY + photoH,
      photoX + photoW - r,
      photoY + photoH,
    );
    ctx.lineTo(photoX + r, photoY + photoH);
    ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - r);
    ctx.lineTo(photoX, photoY + r);
    ctx.quadraticCurveTo(photoX, photoY, photoX + r, photoY);
    ctx.closePath();
    ctx.clip();

    const imgRatio = frontCoverImg.width / frontCoverImg.height;
    const boxRatio = photoW / photoH;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = frontCoverImg.height;
      sw = sh * boxRatio;
      sx = (frontCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = frontCoverImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (frontCoverImg.height - sh) / 2;
    }
    ctx.drawImage(
      frontCoverImg,
      sx,
      sy,
      sw,
      sh,
      photoX,
      photoY,
      photoW,
      photoH,
    );
    ctx.restore();
  } else {
    ctx.fillStyle = theme.text + "10";
    ctx.fillRect(margin, margin, size - margin * 2, photoHeight - margin);
    ctx.fillStyle = theme.text + "25";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTO", size / 2, margin + (photoHeight - margin) / 2);
    ctx.textAlign = "left";
  }

  const bottomY = photoHeight + 14;
  const halfW = size / 2;

  // Bottom-left: Timeline
  if (timeline.length > 0) {
    const tlLeft = margin;
    const dotX = tlLeft + 6;
    const textX = dotX + 18;
    let cursorY = bottomY + 10;

    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText("TIMELINE", tlLeft, cursorY);
    cursorY += 24;

    const maxItems = 6;
    const items = timeline.slice(0, maxItems);

    // Vertical line
    ctx.strokeStyle = theme.accent + "40";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dotX, cursorY - 4);
    ctx.lineTo(
      dotX,
      Math.min(cursorY + (items.length - 1) * 36, size - margin),
    );
    ctx.stroke();

    for (const item of items) {
      if (cursorY > size - margin) break;

      ctx.beginPath();
      ctx.arc(dotX, cursorY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = theme.accent;
      ctx.fill();

      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.fillText(item.year, textX, cursorY + 5);

      const yearW = ctx.measureText(item.year).width;
      ctx.font = "14px sans-serif";
      ctx.fillStyle = theme.text;
      const maxLen = 10;
      const eventText =
        item.event.length > maxLen
          ? item.event.slice(0, maxLen) + "..."
          : item.event;
      ctx.fillText(eventText, textX + yearW + 6, cursorY + 5);

      cursorY += 36;
    }
  }

  // Bottom-right: 3-color dots + bio
  const dotsColors = theme.dots || ["#c8c4b8", "#556b2f", "#3a4a23"];
  const bioLeft = halfW + 10;
  const bioRight = size - margin;
  let bioY = bottomY + 10;

  // 3-color dots
  const dotSpacing = 18;
  const startDotX = bioLeft;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(startDotX + i * dotSpacing, bioY + 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = dotsColors[i];
    ctx.fill();
  }
  bioY += 28;

  // Bio text
  if (bio) {
    ctx.font = "italic 16px sans-serif";
    ctx.fillStyle = theme.text;
    const bioLines = wrapText(ctx, bio, bioRight - bioLeft);
    const maxLines = 8;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      if (bioY > size - margin) break;
      ctx.fillText(bioLines[i], bioLeft, bioY);
      bioY += 24;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "60";
      ctx.font = "14px sans-serif";
      ctx.fillText("...", bioLeft, bioY);
    }
  }

  // Empty state
  if (!bio && timeline.length === 0 && !frontCoverImg) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = theme.text + "40";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
    ctx.textAlign = "left";
  }
}

// ─── Circle layout ───
// 전체 사진 배경 + 흰 원 오버레이 (타임라인 → 원형사진 → bio)
function drawCircleLayout(ctx, size, theme, bio, timeline, frontCoverImg) {
  // Full background photo (or solid color)
  if (frontCoverImg) {
    const imgRatio = frontCoverImg.width / frontCoverImg.height;
    let sx, sy, sw, sh;
    if (imgRatio > 1) {
      sh = frontCoverImg.height;
      sw = sh;
      sx = (frontCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = frontCoverImg.width;
      sh = sw;
      sx = 0;
      sy = (frontCoverImg.height - sh) / 2;
    }
    ctx.drawImage(frontCoverImg, sx, sy, sw, sh, 0, 0, size, size);

    // Darken overlay for readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = "#2c2c2c";
    ctx.fillRect(0, 0, size, size);
  }

  // White circle overlay
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.circle || "#ffffff";
  ctx.globalAlpha = 0.92;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // Content inside circle
  const innerLeft = cx - radius * 0.7;
  const innerRight = cx + radius * 0.7;
  const innerWidth = innerRight - innerLeft;
  let cursorY = cy - radius * 0.6;

  // Small circular photo at top of circle
  if (frontCoverImg) {
    const smallR = 40;
    const photoY = cursorY + smallR + 4;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, smallR, 0, Math.PI * 2);
    ctx.clip();

    const imgRatio = frontCoverImg.width / frontCoverImg.height;
    let sx, sy, sw, sh;
    if (imgRatio > 1) {
      sh = frontCoverImg.height;
      sw = sh;
      sx = (frontCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = frontCoverImg.width;
      sh = sw;
      sx = 0;
      sy = (frontCoverImg.height - sh) / 2;
    }
    ctx.drawImage(
      frontCoverImg,
      sx,
      sy,
      sw,
      sh,
      cx - smallR,
      photoY - smallR,
      smallR * 2,
      smallR * 2,
    );
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(cx, cy, smallR, 0, Math.PI * 2);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    cursorY = photoY + smallR + 16;
  } else {
    cursorY += 20;
  }
  // Timeline (left-aligned, year + event side by side)
  if (timeline.length > 0) {
    const maxItems = 4;
    const items = timeline.slice(0, maxItems);
    const tlLeft = innerLeft;

    ctx.textAlign = "left";
    for (const item of items) {
      if (cursorY > cy + radius * 0.7) break;

      // Year
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.fillText(item.year, tlLeft, cursorY);

      // Event (next to year)
      const yearW = ctx.measureText(item.year).width;
      ctx.font = "13px sans-serif";
      ctx.fillStyle = theme.text;
      const maxLen = 16;
      const eventText =
        item.event.length > maxLen
          ? item.event.slice(0, maxLen) + "..."
          : item.event;
      ctx.fillText(eventText, tlLeft + yearW + 8, cursorY);

      cursorY += 28;
    }
  }

  // Bio text (centered)
  if (bio) {
    const monoplexFont = monoplexFontLoaded ? '"MonoplexKR"' : "sans-serif";
    ctx.font = `17px ${monoplexFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.letterSpacing = "1px";
    const bioLines = wrapText(ctx, bio, innerWidth * 0.8);
    const maxLines = 5;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      if (cursorY > cy + radius * 0.55) break;
      ctx.fillText(bioLines[i], cx, cursorY + 140);
      cursorY += 24;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "60";
      ctx.font = "14px sans-serif";
      ctx.fillText("...", cx, cursorY + 140);
      cursorY += 20;
    }
    ctx.textAlign = "left";
  }

  // Empty state
  if (!bio && timeline.length === 0 && !frontCoverImg) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = theme.text + "80";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", cx, cy);
    ctx.textAlign = "left";
  }
}

function generateBackCoverDataUrl(
  themeKey,
  bio,
  timeline,
  frontCoverImg,
  albumTitle,
) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.elegant;

  switch (themeKey) {
    case "natural":
      drawNaturalLayout(ctx, size, theme, bio, timeline, frontCoverImg);
      break;
    case "circle":
      drawCircleLayout(ctx, size, theme, bio, timeline, frontCoverImg);
      break;
    case "elegant":
    default:
      drawElegantLayout(
        ctx,
        size,
        theme,
        bio,
        timeline,
        frontCoverImg,
        albumTitle,
      );
      break;
  }

  return canvas.toDataURL("image/png");
}

const ZOOM_MIN = 5;
const ZOOM_MAX = 7;
const ZOOM_STEP = 0.25;
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

export default function AlbumPreview3D({
  frontCover,
  bio,
  timeline,
  selectedTheme,
  albumTitle,
  flipped,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [frontCoverImg, setFrontCoverImg] = useState(null);

  // Load front cover as HTMLImageElement for canvas drawing
  // Video URLs (mp4/webm/mov) cannot be drawn to canvas synchronously — skip loading
  useEffect(() => {
    if (!frontCover || typeof document === "undefined") {
      setFrontCoverImg(null);
      return;
    }

    const lower = frontCover.toLowerCase().split("?")[0];
    const isVideo =
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov");
    if (isVideo) {
      setFrontCoverImg(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFrontCoverImg(img);
    img.onerror = () => setFrontCoverImg(null);
    img.src = frontCover;
  }, [frontCover]);

  // Sync with external flipped prop (tab switch)
  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped);
    }
  }, [flipped]);
  const dragStartX = useRef(null);

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 50) {
      setIsFlipped((f) => !f);
    }
    dragStartX.current = null;
  };

  const themeKey = selectedTheme || "elegant";
  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.elegant;

  const backCoverDataUrl = useMemo(() => {
    if (typeof document === "undefined") return null;
    return generateBackCoverDataUrl(
      themeKey,
      bio || "",
      timeline || [],
      frontCoverImg,
      albumTitle || "",
    );
  }, [themeKey, bio, timeline, frontCoverImg, albumTitle]);

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
      <div
        className="min-h-0 w-full flex-1 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragStartX.current = null;
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 30 }}
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
            edgeColor={theme.bg}
            isSelected={true}
            isFlipped={isFlipped}
            onClick={() => setIsFlipped((f) => !f)}
          />
        </Canvas>
      </div>
    </div>
  );
}
