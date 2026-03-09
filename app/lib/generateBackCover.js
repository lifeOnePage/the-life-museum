import { UNIFIED_THEMES } from "@/app/library/edit/[record_id]/themeConfig";

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

    const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
    ctx.font = `19px ${bookkFont}`;
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

  // Timeline items
  if (timeline.length > 0) {
    const maxItems = 8;
    const items = timeline.slice(0, maxItems);
    const dotX = tlLeft + 6;
    const textX = dotX + 18;

    for (const item of items) {
      if (cursorY > size - margin - 10) break;

      // Year (left-aligned)
      ctx.font = "bold 19px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "left";
      ctx.fillText(item.year, textX, cursorY + 30);

      // Event (right-aligned)
      ctx.font = "20px sans-serif";
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
function drawNaturalLayout(
  ctx,
  size,
  theme,
  bio,
  timeline,
  frontCoverImg,
  albumTitle,
  extractedColors,
) {
  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);

  const margin = 50;
  const photoHeight = size * 0.52;

  // Top: large front cover photo
  if (frontCoverImg) {
    const photoX = margin;
    const photoY = margin;
    const photoW = size - margin * 2;
    const photoH = photoHeight - margin;

    ctx.save();
    const r = 0;
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

  const bottomY = photoHeight + 60;
  const halfW = size / 2;

  // Bottom-left: Timeline
  if (timeline.length > 0) {
    const tlLeft = margin;
    const dotX = tlLeft + 6;
    const textX = dotX;
    let cursorY = bottomY + 10;

    const maxItems = 10;
    const items = timeline.slice(0, maxItems);

    for (const item of items) {
      if (cursorY > size - margin) break;

      ctx.font = "bold 17px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.fillText(item.year, textX, cursorY + 5);

      const yearW = ctx.measureText(item.year).width;
      ctx.font = "18px sans-serif";
      ctx.fillStyle = theme.text;
      const maxLen = 20;
      const eventText =
        item.event.length > maxLen
          ? item.event.slice(0, maxLen) + "..."
          : item.event;
      ctx.fillText(eventText, textX + yearW + 30, cursorY + 5);
      cursorY += 36;
    }
  }

  // Bottom-right: 3-color squares + title + bio
  const squareColors = extractedColors ||
    theme.dots || ["#c8c4b8", "#556b2f", "#3a4a23"];
  const bioLeft = halfW + 20;
  const bioRight = size - margin;
  let bioY = bottomY;

  // 3-color dots (right-aligned)
  const dotRadius = 20;
  const dotSpacing = 15;
  const totalDotsWidth = 3 * dotRadius * 2 + 2 * dotSpacing;
  const dotStartX = bioRight - totalDotsWidth + dotRadius;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      dotStartX + i * (dotRadius * 2 + dotSpacing),
      bioY + dotRadius,
      dotRadius,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = squareColors[i];
    ctx.fill();
  }
  bioY += dotRadius * 2 + 70;

  // Album title (right-aligned)
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  if (albumTitle) {
    ctx.font = `50px ${bookkFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "right";
    ctx.letterSpacing = "10px";
    const titleLines = wrapText(ctx, albumTitle, bioRight - bioLeft);
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, bioRight, bioY);
      bioY += 26;
    }
    ctx.textAlign = "left";
    bioY += 30;
  }

  // Bio text (right-aligned)
  if (bio) {
    ctx.font = `17px ${bookkFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "right";
    ctx.letterSpacing = "1px";
    const bioLines = wrapText(ctx, bio, bioRight - bioLeft - 10);
    const maxLines = 8;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      if (bioY > size - margin) break;
      ctx.fillText(bioLines[i], bioRight, bioY);
      bioY += 27;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "60";
      ctx.font = "14px sans-serif";
      ctx.fillText("...", bioRight, bioY);
    }
    ctx.textAlign = "left";
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

  // Donut overlay (big circle with center hole punched out like a CD)
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;
  const holeRadius = size * 0.05;

  // Draw white donut using offscreen canvas to punch hole
  const donutCanvas = document.createElement("canvas");
  donutCanvas.width = size;
  donutCanvas.height = size;
  const dCtx = donutCanvas.getContext("2d");

  // Draw big circle
  dCtx.beginPath();
  dCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  dCtx.fillStyle = theme.circle || "#ffffff";
  dCtx.fill();

  // Punch center hole
  dCtx.globalCompositeOperation = "destination-out";
  dCtx.beginPath();
  dCtx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.globalCompositeOperation = "source-over";

  // Composite donut onto main canvas
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.drawImage(donutCanvas, 0, 0);
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // Hole border
  ctx.beginPath();
  ctx.arc(cx, cy, holeRadius + 10, 0, Math.PI * 2);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Content inside circle (below hole)
  const innerLeft = cx - radius * 0.4;
  const innerRight = cx + radius * 0.4;
  const innerWidth = innerRight - innerLeft;
  let cursorY = size / 2 - radius * 0.7;
  // Timeline (left-aligned, year + event side by side)
  if (timeline.length > 0) {
    const maxItems = 6;
    const items = timeline.slice(0, maxItems);
    const tlLeft = innerLeft;

    ctx.textAlign = "left";
    for (const item of items) {
      if (cursorY > cy + radius * 0.4) break;

      // Year
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = theme.accent;
      ctx.fillText(item.year, tlLeft, cursorY);

      // Event (next to year)
      const yearW = ctx.measureText(item.year).width;
      ctx.font = "17px sans-serif";
      ctx.fillStyle = theme.text;
      const maxLen = 16;
      const eventText =
        item.event.length > maxLen
          ? item.event.slice(0, maxLen) + "..."
          : item.event;
      ctx.fillText(eventText, tlLeft + yearW + 50, cursorY);

      cursorY += 40;
    }
  }

  // Bio text (centered)
  if (bio) {
    const monoplexFont = monoplexFontLoaded ? '"MonoplexKR"' : "sans-serif";
    ctx.font = `18px ${monoplexFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.letterSpacing = "1.2px";
    const bioLines = wrapText(ctx, bio, innerWidth * 1.2);
    const maxLines = 6;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      if (cursorY > cy + radius * 0.55) break;
      ctx.fillText(bioLines[i], cx - 10, cursorY + 200);
      cursorY += 24;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "60";
      ctx.font = "14px sans-serif";
      ctx.fillText("...", cx - 10, cursorY + 140);
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

export function generateBackCoverDataUrl(
  themeKey,
  bio,
  timeline,
  frontCoverImg,
  albumTitle,
  extractedColors,
) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.elegant;

  switch (themeKey) {
    case "natural":
      drawNaturalLayout(
        ctx,
        size,
        theme,
        bio,
        timeline,
        frontCoverImg,
        albumTitle,
        extractedColors,
      );
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
