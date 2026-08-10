import { UNIFIED_THEMES } from "@/app/library/edit/[record_id]/themeConfig";

// Load custom fonts for canvas
let bookkFontLoaded = false;
let monoplexFontLoaded = false;
let a2gFontLoaded = false;
let yangjinFontLoaded = false;
let escoredreamFontLoaded = false;
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
  const a2gSemiBold = new FontFace(
    "A2G",
    "url(/fonts/에이투지체-6SemiBold.woff2)",
    { weight: "600" },
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
  a2gSemiBold
    .load()
    .then((f) => {
      document.fonts.add(f);
      a2gFontLoaded = true;
    })
    .catch(() => {});
  const yangjin = new FontFace(
    "yangjin",
    "url(https://cdn.jsdelivr.net/gh/supernovice-lab/font@0.9/yangjin.woff)",
    { weight: "normal" },
  );
  yangjin
    .load()
    .then((f) => {
      document.fonts.add(f);
      yangjinFontLoaded = true;
    })
    .catch(() => {});
  const escoredreamWeights = [
    ["100", "S-CoreDream-1Thin"],
    ["200", "S-CoreDream-2ExtraLight"],
    ["300", "S-CoreDream-3Light"],
    ["normal", "S-CoreDream-4Regular"],
    ["500", "S-CoreDream-5Medium"],
    ["600", "S-CoreDream-6Bold"],
    ["700", "S-CoreDream-7ExtraBold"],
    ["800", "S-CoreDream-8Heavy"],
    ["900", "S-CoreDream-9Black"],
  ];
  Promise.all(
    escoredreamWeights.map(([weight, file]) => {
      const face = new FontFace(
        "Escoredream",
        `url(https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/${file}.woff)`,
        { weight },
      );
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => {
      escoredreamFontLoaded = true;
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

// ─── Barcode helper for Kitsch theme ───
function drawBarcode(ctx, x, y, width, height) {
  ctx.fillStyle = "#2c2c2c";
  const barCount = 40;
  const barWidth = width / (barCount * 2);
  for (let i = 0; i < barCount; i++) {
    const bw = barWidth * (0.5 + Math.random() * 1.2);
    ctx.fillRect(x + i * (width / barCount), y, bw, height);
  }
  // Numbers below barcode
  ctx.font = "14px monospace";
  ctx.fillStyle = "#2c2c2c";
  ctx.textAlign = "center";
  ctx.fillText("8 809721 371024", x + width / 2, y + height + 16);
  ctx.textAlign = "left";
}

// ─── Full Image layout ───
// backCoverImg을 전면 꽉 채워 표시
function drawFullImageLayout(ctx, size, backCoverImg) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  if (!backCoverImg) return;

  const imgRatio = backCoverImg.width / backCoverImg.height;
  // cover-fit (1:1 square canvas)
  let sx, sy, sw, sh;
  if (imgRatio > 1) {
    sh = backCoverImg.height;
    sw = sh;
    sx = (backCoverImg.width - sw) / 2;
    sy = 0;
  } else {
    sw = backCoverImg.width;
    sh = sw;
    sx = 0;
    sy = (backCoverImg.height - sh) / 2;
  }
  ctx.drawImage(backCoverImg, sx, sy, sw, sh, 0, 0, size, size);
}

// ─── Kitsch layout ───
// Paper texture background with sticker decorations, vertical timeline, barcode
function drawKitschLayout(
  ctx,
  size,
  theme,
  bio,
  timeline,
  albumTitle,
  albumSubTitle,
  themeBgImg,
  backCoverImg,
  themeStickerImg,
) {
  // Background
  if (themeBgImg) {
    ctx.drawImage(themeBgImg, 0, 0, size, size);
  } else {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size, size);
  }

  const margin = 100;
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const rightPhotoW = size * 0.28;
  const contentRight = size - margin - rightPhotoW - 30; // left content area limit
  let cursorY = margin;

  // Right side — front cover photo
  if (backCoverImg) {
    const photoX = size - margin - rightPhotoW;
    const photoY = margin + 140;
    const photoH = size * 0.45;
    const r = 8;

    // Hot pink backing rectangle (offset behind photo)
    ctx.fillStyle = "#E236A5";
    ctx.beginPath();
    ctx.roundRect(photoX + 12, photoY + 12, rightPhotoW, photoH, r);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(photoX + r, photoY);
    ctx.lineTo(photoX + rightPhotoW - r, photoY);
    ctx.quadraticCurveTo(
      photoX + rightPhotoW,
      photoY,
      photoX + rightPhotoW,
      photoY + r,
    );
    ctx.lineTo(photoX + rightPhotoW, photoY + photoH - r);
    ctx.quadraticCurveTo(
      photoX + rightPhotoW,
      photoY + photoH,
      photoX + rightPhotoW - r,
      photoY + photoH,
    );
    ctx.lineTo(photoX + r, photoY + photoH);
    ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - r);
    ctx.lineTo(photoX, photoY + r);
    ctx.quadraticCurveTo(photoX, photoY, photoX + r, photoY);
    ctx.closePath();
    ctx.clip();

    // Cover-fit
    const imgRatio = backCoverImg.width / backCoverImg.height;
    const boxRatio = rightPhotoW / photoH;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = backCoverImg.height;
      sw = sh * boxRatio;
      sx = (backCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = backCoverImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (backCoverImg.height - sh) / 2;
    }
    ctx.drawImage(
      backCoverImg,
      sx,
      sy,
      sw,
      sh,
      photoX,
      photoY,
      rightPhotoW,
      photoH,
    );
    ctx.restore();

    // Subtle border
    ctx.strokeStyle = theme.text + "20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, rightPhotoW, photoH, r);
    ctx.stroke();
  }

  // Sticker overlay — drawn on top of photo (top-right area)
  if (themeStickerImg) {
    const stickerW = size * 0.2;
    const stickerH =
      stickerW * (themeStickerImg.height / themeStickerImg.width);
    const stickerX = size - margin - stickerW + 20;
    const stickerY = margin - 20;
    ctx.drawImage(themeStickerImg, stickerX, stickerY, stickerW, stickerH);
  }

  // Title — center, large bold dark text with cyan stroke (A2G font)
  const kitschTitleFont = yangjinFontLoaded ? '"yangjin"' : bookkFont;
  if (albumTitle) {
    ctx.font = `56px ${kitschTitleFont}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "-3px";
    const titleLines = wrapText(ctx, albumTitle, size - margin * 2);
    for (const line of titleLines.slice(0, 2)) {
      ctx.lineJoin = "round";
      // Outer stroke — lime green
      ctx.lineWidth = 20;
      // ctx.strokeStyle = "#E334A1";
      ctx.strokeText(line, size / 2, cursorY + 50);
      // Outer stroke — lime green
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#ABD263";
      ctx.strokeText(line, size / 2, cursorY + 50);
      // Inner stroke — cyan
      // ctx.lineWidth = 8;
      // ctx.strokeStyle = "#222";
      // ctx.strokeText(line, size / 2, cursorY + 50);
      // Fill
      ctx.fillStyle = "#000";
      ctx.fillText(line, size / 2, cursorY + 50);
      cursorY += 56;
    }
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    cursorY += 0;
  }

  // Subtitle — center, magenta stroke
  if (albumSubTitle) {
    // const monoplexFont = monoplexFontLoaded ? '"MonoplexKR"' : "sans-serif";
    ctx.font = `bold 28px ${bookkFont}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "-2px";
    const subtitleLine =
      albumSubTitle.length > 30
        ? albumSubTitle.slice(0, 30) + "..."
        : albumSubTitle;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";
    ctx.strokeText(subtitleLine, size / 2, cursorY + 50);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(subtitleLine, size / 2, cursorY + 50);
    ctx.textAlign = "left";
    cursorY += 70;
  }

  // Timeline — vertical list, centered
  if (timeline.length > 0) {
    const escoredreamFont = escoredreamFontLoaded ? '"Escoredream"' : bookkFont;
    const maxItems = Math.min(timeline.length, 10);
    const items = timeline.slice(0, maxItems);
    const useDense = items.length > 5;
    const yearFontSize = useDense ? 18 : 18;
    const eventFontSize = useDense ? 18 : 18;
    const lineHeight = useDense ? 20 : 42;
    const itemSpacing = useDense ? 36 : 72;
    cursorY += useDense ? 30 : 60;

    for (const item of items) {
      if (cursorY > (bio ? size - margin - 160 : size - 100)) break;
      ctx.letterSpacing = "-0.5px";

      // Year
      ctx.font = `bold ${yearFontSize}px ${escoredreamFont}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = "right";
      ctx.fillText(item.year, size / 2 - 210, cursorY);

      // Event
      ctx.font = `${eventFontSize}px ${escoredreamFont}`;
      ctx.fillStyle = theme.text + "cc";
      ctx.textAlign = "left";
      const eventX = size / 2 - 170;
      const eventMaxW = (backCoverImg ? contentRight : size - margin) - eventX;
      const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 2);
      for (let li = 0; li < eventLines.length; li++) {
        ctx.fillText(eventLines[li], eventX, cursorY + li * lineHeight);
      }

      cursorY += itemSpacing + (eventLines.length - 1) * lineHeight;
    }
    ctx.textAlign = "left";
  }

  // Barcode — bottom-left
  // drawBarcode(ctx, margin, size - margin - 40, 160, 50);

  // "Album story" label + bio text — bottom-right
  if (bio) {
    const bioBottom = size - margin - 60;
    const escoredreamFont = escoredreamFontLoaded ? '"Escoredream"' : bookkFont;
    ctx.font = `bold 14px ${bookkFont}`;
    ctx.fillStyle = theme.text + "80";
    ctx.textAlign = "center";
    ctx.letterSpacing = "3px";
    ctx.fillText("ALBUM STORY", size / 2, bioBottom - 80);
    ctx.letterSpacing = "0px";

    ctx.font = `500 18px ${escoredreamFont}`;
    ctx.fillStyle = theme.text + "aa";
    const bioLines = wrapText(ctx, bio, rightPhotoW + 330);
    const maxBioLines = 6;
    for (let i = 0; i < Math.min(bioLines.length, maxBioLines); i++) {
      ctx.fillText(bioLines[i], size / 2, bioBottom - 42 + i * 24);
    }
    ctx.textAlign = "left";
  }

  // Empty state
  if (!bio && timeline.length === 0 && !backCoverImg) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = theme.text + "40";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
    ctx.textAlign = "left";
  }
}

// ─── Illustration layout ───
// Scenic landscape background, horizontal timeline, dark bottom band with bio
function drawIllustrationLayout(
  ctx,
  size,
  theme,
  bio,
  timeline,
  albumTitle,
  albumSubTitle,
  themeBgImg,
) {
  // Background
  if (themeBgImg) {
    ctx.drawImage(themeBgImg, 0, 0, size, size);
  } else {
    // Gradient sky fallback
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#87CEEB");
    grad.addColorStop(0.6, "#b8dff0");
    grad.addColorStop(1, "#7ab648");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const margin = 95;
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const yangjinFont = yangjinFontLoaded ? '"yangjin"' : bookkFont;
  // Title — top center, white bold with drop shadow
  let cursorY = margin + 100;
  if (albumTitle) {
    ctx.font = `50px ${yangjinFont}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    const titleLines = wrapText(ctx, albumTitle, size - margin * 2);
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, size / 2 + 2, cursorY + 2);
      cursorY += 45;
    }
    // Main text
    cursorY = margin + 100;
    ctx.fillStyle = "#ffffff";
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, size / 2, cursorY);
      cursorY += 45;
    }
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    cursorY += 10;
  }

  // Subtitle — below title, white with shadow
  if (albumSubTitle) {
    const subtitleLine =
      albumSubTitle.length > 40
        ? albumSubTitle.slice(0, 40) + "..."
        : albumSubTitle;
    ctx.font = `24px ${bookkFont}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(subtitleLine, size / 2, cursorY);
    ctx.textAlign = "left";
    cursorY += 40;
  }

  // Timeline — horizontal line(s) in middle area with filled circle dots
  if (timeline.length > 0) {
    const maxItems = Math.min(timeline.length, 10);
    const items = timeline.slice(0, maxItems);
    const useMultiRow = items.length > 5;
    const rows = useMultiRow ? [items.slice(0, 5), items.slice(5)] : [items];

    const tlLeft = margin + 40;
    const tlRight = size - margin - 40;
    const tlWidth = tlRight - tlLeft;
    const firstRowY = useMultiRow ? size * 0.43 : size * 0.52;
    const rowSpacing = 155;

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowItems = rows[rowIdx];
      const tlY = firstRowY + rowIdx * rowSpacing;
      const rowMaxItems = rowItems.length;

      // Horizontal line
      ctx.strokeStyle = "#406E78";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tlLeft, tlY);
      ctx.lineTo(tlRight, tlY);
      ctx.stroke();

      // Dots and labels
      for (let i = 0; i < rowMaxItems; i++) {
        const x =
          rowMaxItems === 1
            ? (tlLeft + tlRight) / 2
            : tlLeft + (i / (rowMaxItems - 1)) * tlWidth;
        const item = rowItems[i];

        // Filled circle dot
        ctx.beginPath();
        ctx.arc(x, tlY, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();

        // Year above
        ctx.font = `bold 17px ${bookkFont}`;
        ctx.fillStyle = "#406E78";
        ctx.textAlign = "center";
        ctx.fillText(item.year, x, tlY - 25);

        // Event below
        ctx.font = `600 17px ${bookkFont}`;
        ctx.textAlign = "center";
        const itemSpacing =
          rowMaxItems > 1 ? tlWidth / (rowMaxItems - 1) : tlWidth;
        const eventMaxW = Math.max(
          Math.min(itemSpacing, tlWidth / 4) * 0.95,
          100,
        );
        const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 4);
        ctx.fill();
        ctx.fillStyle = "#406E78";
        for (let li = 0; li < eventLines.length; li++) {
          ctx.fillText(eventLines[li], x, tlY + 40 + li * 22);
        }
      }
      ctx.textAlign = "left";
    }
  }

  // Bottom — semi-transparent dark overlay band with bio text
  const bandH = 220;
  const bandY = size - bandH;
  ctx.fillStyle = "rgba(0,0,0,0.45)";

  if (bio) {
    const monoplexFont = monoplexFontLoaded ? '"MonoplexKR"' : "sans-serif";
    const escoredreamFont = escoredreamFontLoaded ? '"Escoredream"' : bookkFont;
    ctx.font = `500 18px ${escoredreamFont}`;
    const bioLines = wrapText(ctx, bio, size - margin * 2 - 40);
    const maxLines = 5;
    const lineCount = Math.min(bioLines.length, maxLines);
    const textBlockH = lineCount * 26 + 20;

    // Semi-transparent semicircle backdrop behind bio text
    // const scR = size * 0.62;
    // const scCx = size / 2;
    // const scCy = size * 1.3; // flat edge at very bottom
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(scCx, scCy, scR, Math.PI, 0); // upper half-circle
    // ctx.closePath();
    // ctx.fillStyle = "rgba(110, 156, 193, 0.3)";
    // ctx.fill();
    // ctx.restore();

    ctx.font = `500 21px ${escoredreamFont}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "-1px";
    let bioY = bandY + 20;
    const padX = 14;
    const padY = 5;
    const lineH = 20;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      const lineW = ctx.measureText(bioLines[i]).width;
      const rectX = size / 2 - lineW / 2 - padX;
      const rectY = bioY - lineH - padY + 4;
      // Highlight rect
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#cfca8f";
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, lineW + padX * 2, lineH + padY * 1.5, 4);
      ctx.fill();
      ctx.restore();
      // Text
      ctx.fillStyle = "#406E78";
      ctx.fillText(bioLines[i], size / 2, bioY);
      bioY += 38;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("...", size / 2, bioY);
    }
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
  }

  // Empty state
  if (!bio && timeline.length === 0) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
    ctx.textAlign = "left";
  }
}

// ─── Minimalist layout ───
// White background, centered photo, horizontal timeline, clean text
function drawMinimalistLayout(
  ctx,
  size,
  theme,
  bio,
  timeline,
  backCoverImg,
  albumTitle,
  albumSubTitle,
) {
  // Background — pure white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const margin = 100;
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  let cursorY = margin;

  // Title — top center, black bold text (Escoredream)
  const escoredreamFont = escoredreamFontLoaded ? '"Escoredream"' : bookkFont;
  if (albumTitle) {
    ctx.font = `700 44px ${escoredreamFont}`;
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    ctx.letterSpacing = "0px";
    const titleLines = wrapText(ctx, albumTitle, size - margin * 2);
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, size / 2, cursorY + 44);
      cursorY += 42;
    }
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    cursorY += 6;
  }

  // Subtitle — below title, gray text
  if (albumSubTitle) {
    ctx.font = `20px ${escoredreamFont}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    const subtitleLine =
      albumSubTitle.length > 35
        ? albumSubTitle.slice(0, 35) + "..."
        : albumSubTitle;
    ctx.fillText(subtitleLine, size / 2, cursorY + 44);
    ctx.textAlign = "left";
    cursorY += 120;
  }

  // Center — front cover photo (rectangular)
  const photoW = size * 0.68;
  const photoH = timeline.length > 5 ? size * 0.33 : size * 0.4;
  const photoX = (size - photoW) / 2;
  const photoY = cursorY - 50;

  if (backCoverImg) {
    ctx.save();
    // Rounded rect clip
    const r = 6;
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

    // Cover-fit the image
    const imgRatio = backCoverImg.width / backCoverImg.height;
    const boxRatio = photoW / photoH;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = backCoverImg.height;
      sw = sh * boxRatio;
      sx = (backCoverImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = backCoverImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (backCoverImg.height - sh) / 2;
    }
    ctx.drawImage(backCoverImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
    ctx.restore();
  } else {
    // Photo placeholder
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = "#ccc";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTO", photoX + photoW / 2, photoY + photoH / 2 + 6);
    ctx.textAlign = "left";
  }

  cursorY = photoY + photoH + 35;

  // Timeline — horizontal line(s) below photo, open circle dots
  if (timeline.length > 0) {
    const maxItems = Math.min(timeline.length, 10);
    const items = timeline.slice(0, maxItems);
    const useMultiRow = items.length > 5;
    const rows = useMultiRow ? [items.slice(0, 5), items.slice(5)] : [items];

    const tlLeft = margin + 30;
    const tlRight = size - margin - 30;
    const tlWidth = tlRight - tlLeft;
    const firstRowY = cursorY + 20;
    const rowSpacing = 130;

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowItems = rows[rowIdx];
      const tlY = firstRowY + rowIdx * rowSpacing;
      const rowMaxItems = rowItems.length;

      // Horizontal line
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tlLeft, tlY);
      ctx.lineTo(tlRight, tlY);
      ctx.stroke();

      // Open circle dots and labels
      for (let i = 0; i < rowMaxItems; i++) {
        const x =
          rowMaxItems === 1
            ? (tlLeft + tlRight) / 2
            : tlLeft + (i / (rowMaxItems - 1)) * tlWidth;
        const item = rowItems[i];

        // Open circle dot
        ctx.beginPath();
        ctx.arc(x, tlY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Year above
        ctx.font = `bold 16px ${escoredreamFont}`;
        ctx.fillStyle = theme.accent;
        ctx.textAlign = "center";
        ctx.fillText(item.year, x, tlY - 16);

        // Event below
        ctx.font = `600 15px ${escoredreamFont}`;
        ctx.letterSpacing = "-0.7px";
        ctx.fillStyle = theme.text;
        const itemSpacing =
          rowMaxItems > 1 ? tlWidth / (rowMaxItems - 1) : tlWidth;
        const eventMaxW = Math.max(
          Math.min(itemSpacing, tlWidth / 4) * 0.85,
          100,
        );
        const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 4);
        for (let li = 0; li < eventLines.length; li++) {
          ctx.fillText(eventLines[li], x, tlY + 28 + li * 24);
        }
      }
      ctx.textAlign = "left";
    }
    cursorY = firstRowY + (rows.length - 1) * rowSpacing + 50;
  }

  // "ALBUM STORY" label + bio text at bottom, centered with top/bottom lines
  if (bio) {
    const storyY = Math.max(cursorY + 20, size - 160);
    const lineLeft = margin + 60;
    const lineRight = size - margin - 60;

    ctx.font = `bold 13px ${escoredreamFont}`;
    ctx.fillStyle = theme.text + "80";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("ALBUM STORY", size / 2, storyY - 10);
    ctx.letterSpacing = "0px";

    // Top line
    // ctx.strokeStyle = theme.text;
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.moveTo(lineLeft, storyY);
    // ctx.lineTo(lineRight, storyY);
    // ctx.stroke();

    ctx.font = `400 20px ${escoredreamFont}`;
    ctx.fillStyle = theme.text;
    const bioLines = wrapText(ctx, bio, size - margin * 2 - 50);
    const maxLines = 5;
    let bioY = storyY + 24;
    for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
      ctx.fillText(bioLines[i], size / 2, bioY);
      bioY += 25;
    }
    if (bioLines.length > maxLines) {
      ctx.fillStyle = theme.text + "60";
      ctx.fillText("...", size / 2, bioY);
      bioY += 22;
    }

    // Bottom line
    // ctx.strokeStyle = theme.text;
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.moveTo(lineLeft, bioY + 6);
    // ctx.lineTo(lineRight, bioY + 6);
    // ctx.stroke();

    ctx.textAlign = "left";
  }

  // Empty state
  if (!bio && timeline.length === 0 && !backCoverImg) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = theme.text + "40";
    ctx.textAlign = "center";
    ctx.fillText("뒷면 콘텐츠", size / 2, size / 2);
    ctx.textAlign = "left";
  }
}

// ─── Memorial themes: shared two-column timeline helper ───
// (year, event)를 가로 한 줄로 좌/우 두 컬럼에 나눠 그린다.
function drawMemorialTwoColumnTimeline(
  ctx,
  timeline,
  {
    left,
    right,
    top,
    colGap,
    rowHeight,
    yearFont,
    eventFont,
    yearColor,
    eventColor,
    maxRows,
  },
) {
  const items = timeline.slice(0, maxRows * 2);
  if (items.length === 0) return top;
  const leftItems = items.slice(0, maxRows);
  const rightItems = items.slice(maxRows, maxRows * 2);
  const colWidth = (right - left - colGap) / 2;
  const leftX = left;
  const rightX = left + colWidth + colGap;
  const rowCount = Math.max(leftItems.length, rightItems.length);

  const renderCol = (colItems, colX) => {
    ctx.textAlign = "left";
    colItems.forEach((item, i) => {
      const y = top + i * rowHeight;
      ctx.font = yearFont;
      ctx.fillStyle = yearColor;
      ctx.fillText(item.year, colX, y);
      const yearWidth = ctx.measureText(item.year).width;
      const eventX = colX + yearWidth + 24;
      ctx.font = eventFont;
      ctx.fillStyle = eventColor;
      // event가 길면 컬럼 폭(옆 컬럼 침범 방지)에 맞춰 한 줄로 잘라서 표시
      const eventMaxW = colWidth - (eventX - colX);
      const eventLine = wrapText(ctx, item.event || "", eventMaxW)[0] || "";
      ctx.fillText(eventLine, eventX, y);
    });
  };
  renderCol(leftItems, leftX);
  renderCol(rightItems, rightX);

  // Vertical divider between columns
  if (rightItems.length > 0) {
    ctx.strokeStyle = eventColor;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + colWidth + colGap / 2, top - 24);
    ctx.lineTo(
      left + colWidth + colGap / 2,
      top + (rowCount - 1) * rowHeight + 8,
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = "left";
  return top + (rowCount - 1) * rowHeight;
}

// ─── Memorial (Light) layout ───
// 크림 배경 · 상단 원형 사진 · 2단 타임라인 · 하단 인용구
function drawMemorialLightLayout(
  ctx,
  size,
  bio,
  timeline,
  albumTitle,
  albumSubTitle,
) {
  const bg = "#ece7df";
  const textDark = "#3a352e";
  const textMuted = "#8a8478";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const font = escoredreamFontLoaded ? '"Escoredream"' : "serif";
  const margin = 90;
  let cursorY = 130;

  // Title
  if (albumTitle) {
    ctx.font = `700 40px ${font}`;
    ctx.fillStyle = textDark;
    ctx.textAlign = "center";
    const titleLines = wrapText(ctx, albumTitle, size - margin * 2).slice(0, 2);
    for (const line of titleLines) {
      cursorY += 44;
      ctx.fillText(line, size / 2, cursorY);
    }
    cursorY += 12;
  }

  // Subtitle (연도)
  if (albumSubTitle) {
    ctx.font = `400 24px ${font}`;
    ctx.fillStyle = textMuted;
    ctx.textAlign = "center";
    ctx.fillText(albumSubTitle, size / 2, cursorY + 26);
    cursorY += 60;
  }

  // Short divider
  ctx.strokeStyle = textMuted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 28, cursorY + 18);
  ctx.lineTo(size / 2 + 28, cursorY + 18);
  ctx.stroke();
  cursorY += 55;

  // Two-column timeline
  if (timeline.length > 0) {
    cursorY = drawMemorialTwoColumnTimeline(ctx, timeline, {
      left: margin + 10,
      right: size - margin - 10,
      top: cursorY + 40,
      colGap: 60,
      rowHeight: 58,
      yearFont: `700 16px ${font}`,
      eventFont: `400 14px ${font}`,
      yearColor: textDark,
      eventColor: textMuted,
      maxRows: 6,
    });
    cursorY += 45;
  }

  // Full-width divider
  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(margin, cursorY);
  ctx.lineTo(size - margin, cursorY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  cursorY += 55;

  // Quote (bio)
  if (bio) {
    ctx.font = `italic 400 22px ${font}`;
    ctx.fillStyle = textDark;
    ctx.textAlign = "center";
    const quoteLines = wrapText(ctx, `"${bio}"`, size - margin * 2 - 60).slice(
      0,
      3,
    );
    for (const line of quoteLines) {
      ctx.fillText(line, size / 2, cursorY);
      cursorY += 32;
    }
  }

  // Bottom decorative dot
  ctx.fillStyle = textMuted;
  ctx.beginPath();
  ctx.arc(size / 2, size - 55, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
}

// ─── Memorial (Dark) layout ───
// 검정 배경 · 2단 타임라인 · 하단 "THANK YOU FOR YOUR LOVE"
function drawMemorialDarkLayout(
  ctx,
  size,
  bio,
  timeline,
  albumTitle,
  albumSubTitle,
) {
  const bg = "#141414";
  const textLight = "#e8d5b7";
  const textMuted = "#a89d89";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const font = escoredreamFontLoaded ? '"Escoredream"' : "serif";
  const margin = 90;
  let cursorY = 130;

  // Title
  if (albumTitle) {
    ctx.font = `700 40px ${font}`;
    ctx.fillStyle = textLight;
    ctx.textAlign = "center";
    const titleLines = wrapText(ctx, albumTitle, size - margin * 2).slice(0, 2);
    for (const line of titleLines) {
      cursorY += 44;
      ctx.fillText(line, size / 2, cursorY);
    }
    cursorY += 12;
  }

  // Subtitle
  if (albumSubTitle) {
    ctx.font = `400 24px ${font}`;
    ctx.fillStyle = textMuted;
    ctx.textAlign = "center";
    ctx.fillText(albumSubTitle, size / 2, cursorY + 26);
    cursorY += 55;
  }

  // Short divider
  ctx.strokeStyle = textMuted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 28, cursorY + 18);
  ctx.lineTo(size / 2 + 28, cursorY + 18);
  ctx.stroke();
  cursorY += 50;

  // Full-width divider
  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(margin, cursorY);
  ctx.lineTo(size - margin, cursorY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  cursorY += 55;

  // Two-column timeline
  if (timeline.length > 0) {
    cursorY = drawMemorialTwoColumnTimeline(ctx, timeline, {
      left: margin + 10,
      right: size - margin - 10,
      top: cursorY + 30,
      colGap: 60,
      rowHeight: 58,
      yearFont: `700 16px ${font}`,
      eventFont: `400 14px ${font}`,
      yearColor: textLight,
      eventColor: textMuted,
      maxRows: 6,
    });
  }

  // Quote (bio) — centered, above the bottom band
  if (bio) {
    ctx.font = `italic 400 22px ${font}`;
    ctx.fillStyle = textLight;
    ctx.textAlign = "center";
    const quoteLines = wrapText(ctx, `"${bio}"`, size - margin * 2 - 60).slice(
      0,
      3,
    );
    let qy = Math.max(cursorY + 70, size - 200);
    for (const line of quoteLines) {
      ctx.fillText(line, size / 2, qy);
      qy += 32;
    }
  }

  // Bottom: lines flanking "THANK YOU FOR YOUR LOVE"
  const bottomY = size - 70;
  ctx.font = `600 13px ${font}`;
  ctx.fillStyle = textMuted;
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  const label = "THANK YOU FOR YOUR LOVE";
  const labelWidth = ctx.measureText(label).width;
  ctx.fillText(label, size / 2, bottomY);
  ctx.letterSpacing = "0px";

  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, bottomY - 4);
  ctx.lineTo(size / 2 - labelWidth / 2 - 20, bottomY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size / 2 + labelWidth / 2 + 20, bottomY - 4);
  ctx.lineTo(size - margin, bottomY - 4);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = "left";
}

// ─── Travel Diary layout ───
// 크래프트지 배경 프레임(travel1_back.svg) 위에 트랙리스트 스타일 타임라인을 얹는다.
// 프레임 원본 에셋이 1080×1080 기준으로 제작되어 있어, size(보통 1024)에
// 맞춰 전부 scale = size / 1080 배율로 좌표를 환산한다.
function drawTravelLayout(ctx, size, theme, timeline, frameImg) {
  const scale = size / 1080;
  const s = (v) => v * scale;

  // Fallback 배경(프레임 로딩 전에도 자연스럽게) + 프레임 전체
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, size, size);
  }

  const monoFont = monoplexFontLoaded ? '"MonoplexKR"' : "monospace";
  const titleFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const margin = s(60);

  // "TRACKLIST" 헤더 + 밑줄
  const headerY = s(96);
  ctx.font = `700 ${s(30)}px ${titleFont}`;
  ctx.fillStyle = theme.text;
  ctx.letterSpacing = `${s(1)}px`;
  ctx.textAlign = "left";
  const headerText = "TRACKLIST";
  ctx.fillText(headerText, margin, headerY);
  ctx.letterSpacing = "0px";
  const headerWidth = ctx.measureText(headerText).width;
  ctx.strokeStyle = theme.text;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = s(1.5);
  ctx.beginPath();
  ctx.moveTo(margin, headerY + s(10));
  ctx.lineTo(margin + headerWidth, headerY + s(10));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 타임라인 → 트랙 넘버 리스트
  const items = (timeline || []).slice(0, 10);
  let cursorY = headerY + s(56);
  const rowGap = s(40);
  const maxTextWidth = size - margin - s(80);
  ctx.textAlign = "left";
  items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    ctx.font = `600 ${s(19)}px ${monoFont}`;
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.7;
    ctx.fillText(num, margin, cursorY);
    ctx.globalAlpha = 1;

    ctx.font = `400 ${s(19)}px ${monoFont}`;
    ctx.fillStyle = theme.text;
    const lines = wrapText(ctx, item.event || "", maxTextWidth - s(40)).slice(
      0,
      1,
    );
    ctx.fillText(lines[0] || "", margin + s(40), cursorY);
    cursorY += rowGap;
  });

  // 좌측 하단 — 지구본 아이콘 + 발행 정보
  const footerY = size - s(70);
  const globeCx = margin + s(9);
  const globeCy = footerY - s(6);
  const globeR = s(9);
  ctx.strokeStyle = theme.text;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = s(1.3);
  ctx.beginPath();
  ctx.ellipse(globeCx, globeCy, globeR, globeR, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(globeCx, globeCy, globeR * 0.42, globeR, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(globeCx - globeR, globeCy);
  ctx.lineTo(globeCx + globeR, globeCy);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const year = new Date().getFullYear();
  const footerLine1 = `RECORDED IN ${year}`;
  const footerLine2 = "ALL RIGHTS RESERVED.";
  ctx.font = `600 ${s(13)}px ${monoFont}`;
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.75;
  ctx.letterSpacing = `${s(0.5)}px`;
  ctx.fillText(footerLine1, margin + globeR * 2 + s(10), footerY - s(11));
  ctx.fillText(footerLine2, margin + globeR * 2 + s(10), footerY + s(9));
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
}

function drawHeartIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.9);
  ctx.bezierCurveTo(
    cx - r * 1.6,
    cy - r * 0.6,
    cx - r * 0.5,
    cy - r * 1.6,
    cx,
    cy - r * 0.5,
  );
  ctx.bezierCurveTo(
    cx + r * 0.5,
    cy - r * 1.6,
    cx + r * 1.6,
    cy - r * 0.6,
    cx,
    cy + r * 0.9,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Couple layout (뒷면) — 크림 배경 + "OUR STORY" + 짧은 글 + 액자 사진 +
// 2단 넘버링 타임라인. couple_1/couple_2 공용.
function drawCoupleLayout(ctx, size, bio, timeline, photoImg) {
  const bg = "#f2ece3";
  const textMain = "#3a2a22";
  const textMuted = "#8a7566";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const titleFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const monoFont = monoplexFontLoaded ? '"MonoplexKR"' : "monospace";

  // 하트 + "OUR STORY"
  drawHeartIcon(ctx, size / 2, size * 0.06, size * 0.014, textMain);
  ctx.textAlign = "center";
  ctx.font = `700 ${size * 0.032}px ${titleFont}`;
  ctx.fillStyle = textMain;
  ctx.letterSpacing = "2px";
  ctx.fillText("OUR STORY", size / 2, size * 0.18);
  ctx.letterSpacing = "0px";

  // 짧은 글 (bio)
  let cursorY = size * 0.25;
  if (bio) {
    ctx.font = `400 ${size * 0.0165}px ${titleFont}`;
    ctx.fillStyle = textMuted;
    const lines = wrapText(ctx, bio, size * 0.5).slice(0, 4);
    for (const line of lines) {
      ctx.fillText(line, size / 2, cursorY);
      cursorY += size * 0.028;
    }
  } else {
    cursorY += size * 0.02;
  }

  // 액자 사진
  const photoW = size * 0.22;
  const photoH = photoW * 1.05;
  const photoX = size / 2 - photoW / 2;
  const photoY = cursorY + size * 0.02;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
  if (photoImg) {
    const imgRatio = photoImg.width / photoImg.height;
    const boxRatio = photoW / photoH;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = photoImg.height;
      sw = sh * boxRatio;
      sx = (photoImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = photoImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (photoImg.height - sh) / 2;
    }
    ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = "#d8cfc2";
    ctx.fillRect(photoX, photoY, photoW, photoH);
  }
  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  ctx.strokeRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
  ctx.globalAlpha = 1;

  // 2단 넘버링 타임라인
  const items = (timeline || []).slice(0, 10);
  const left = size * 0.14;
  const right = size * 0.86;
  const colGap = size * 0.06;
  const colWidth = (right - left - colGap) / 2;
  const rowHeight = size * 0.034;
  let listY = photoY + photoH + size * 0.09;
  const maxRows = 5;
  const leftItems = items.slice(0, maxRows);
  const rightItems = items.slice(maxRows, maxRows * 2);

  const renderRow = (item, i, colX) => {
    const y = listY + i * rowHeight;
    ctx.textAlign = "left";
    ctx.font = `600 ${size * 0.014}px ${monoFont}`;
    ctx.fillStyle = textMuted;
    const yearText = item.year || "";
    ctx.fillText(yearText, colX, y);
    // year 글자 수에 따라 폭이 달라지므로 실측 후 여백을 더해 event가 겹치지 않게 한다
    const yearWidth = ctx.measureText(yearText).width;
    const eventX = colX + Math.max(yearWidth + size * 0.012, size * 0.032);
    ctx.font = `400 ${size * 0.0145}px ${titleFont}`;
    ctx.fillStyle = textMain;
    const eventMaxW = colWidth - (eventX - colX);
    const eventLine = wrapText(ctx, item.event || "", eventMaxW)[0] || "";
    ctx.fillText(eventLine, eventX, y);
  };
  leftItems.forEach((item, i) => renderRow(item, i, left));
  rightItems.forEach((item, i) => renderRow(item, i, left + colWidth + colGap));

  // 하단 카피
  const rowCount = Math.max(leftItems.length, rightItems.length, 1);
  const footerY = listY + (rowCount - 1) * rowHeight + size * 0.055;
  ctx.textAlign = "center";
  ctx.font = `500 ${size * 0.014}px ${titleFont}`;
  ctx.fillStyle = textMuted;
  ctx.letterSpacing = "2px";
  ctx.fillText(
    "LAST YEARS, OUR STORY",
    size / 2,
    Math.min(footerY, size - size * 0.04),
  );
  ctx.letterSpacing = "0px";

  ctx.textAlign = "left";
}

// ─── Children/Parenting 배경(뒷면) — 작은 원형 액자 사진 + "OUR STORY" + 짧은 글 +
// 가로 넘버링 타임라인 + 하트 카피. children_1(화이트)/children_2(황토) 공용.
function drawChildrenLayout(ctx, size, bio, timeline, photoImg, isWhite) {
  const bg = isWhite ? "#fbf9f5" : "#e8ddc9";
  const textMain = isWhite ? "#3a352e" : "#4a3f2e";
  const textMuted = isWhite ? "#9a9184" : "#8f7d5f";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const titleFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const monoFont = monoplexFontLoaded ? '"MonoplexKR"' : "monospace";
  ctx.textAlign = "center";

  // 작은 정사각형 액자 사진
  const photoR = size * 0.06;
  const photoCx = size / 2;
  const photoCy = size * 0.105;
  ctx.save();
  ctx.beginPath();
  ctx.rect(photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
  ctx.clip();
  ctx.fillStyle = isWhite ? "#e6e0d5" : "#d8cbaa";
  ctx.fillRect(photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
  if (photoImg) {
    const imgRatio = photoImg.width / photoImg.height;
    let sx, sy, sw, sh;
    if (imgRatio > 1) {
      sh = photoImg.height;
      sw = sh;
      sx = (photoImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = photoImg.width;
      sh = sw;
      sx = 0;
      sy = (photoImg.height - sh) / 2;
    }
    ctx.drawImage(
      photoImg,
      sx,
      sy,
      sw,
      sh,
      photoCx - photoR,
      photoCy - photoR,
      photoR * 2,
      photoR * 2,
    );
  }
  ctx.restore();
  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
  ctx.globalAlpha = 1;

  // 짧은 세로 구분선
  const divider = (y) => {
    ctx.strokeStyle = textMain;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2, y);
    ctx.lineTo(size / 2, y + size * 0.028);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  let cursorY = photoCy + photoR + size * 0.065;
  divider(cursorY - size * 0.033);
  cursorY += size * 0.04;

  // OUR STORY
  ctx.font = `700 ${size * 0.026}px ${titleFont}`;
  ctx.fillStyle = textMain;
  ctx.letterSpacing = "3px";
  ctx.fillText("OUR STORY", size / 2, cursorY);
  ctx.letterSpacing = "0px";
  cursorY += size * 0.045;

  // 짧은 글 (bio)
  if (bio) {
    ctx.font = `400 ${size * 0.016}px ${titleFont}`;
    ctx.fillStyle = textMuted;
    const lines = wrapText(ctx, bio, size * 0.6).slice(0, 6);
    for (const line of lines) {
      ctx.fillText(line, size / 2, cursorY);
      cursorY += size * 0.027;
    }
  }
  cursorY += size * 0.005;
  divider(cursorY);
  cursorY += size * 0.085;

  // 타임라인 헤더
  ctx.font = `700 ${size * 0.026}px ${titleFont}`;
  ctx.fillStyle = textMain;
  ctx.letterSpacing = "3px";
  ctx.fillText("OUR TIMELINE", size / 2, cursorY);
  ctx.letterSpacing = "0px";
  cursorY += size * 0.05;

  // 가로 넘버링 타임라인 (최대 10개, 5개씩 두 줄 — 기본 테마들과 동일한 규칙)
  const items = (timeline || []).slice(0, 10);
  if (items.length > 0) {
    const left = size * 0.14;
    const right = size * 0.86;
    const useMultiRow = items.length > 5;
    const rows = useMultiRow ? [items.slice(0, 5), items.slice(5)] : [items];
    const eventLineHeight = size * 0.017;
    const rowSpacing = size * 0.11;
    const firstRowY = cursorY + size * 0.018;

    const step = (rowItems) =>
      rowItems.length > 1 ? (right - left) / (rowItems.length - 1) : 0;
    const labelMaxWidth = (rowItems) =>
      (rowItems.length > 1 ? step(rowItems) : size * 0.6) * 0.9;
    const truncate = (text, maxWidth) => {
      if (ctx.measureText(text).width <= maxWidth) return text;
      let t = text;
      while (t.length > 0 && ctx.measureText(t + "…").width > maxWidth) {
        t = t.slice(0, -1);
      }
      return t + "…";
    };

    let maxEventLines = 1;
    rows.forEach((rowItems, rowIdx) => {
      const lineY = firstRowY + rowIdx * rowSpacing;
      const rowStep = step(rowItems);
      const maxWidth = labelMaxWidth(rowItems);

      ctx.strokeStyle = textMuted;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, lineY);
      ctx.lineTo(right, lineY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      rowItems.forEach((item, i) => {
        const x = rowItems.length > 1 ? left + rowStep * i : size / 2;

        if (item.year) {
          ctx.font = `600 ${size * 0.0125}px ${monoFont}`;
          ctx.fillStyle = textMain;
          ctx.fillText(truncate(item.year, maxWidth), x, lineY - size * 0.016);
        }

        ctx.fillStyle = textMain;
        ctx.beginPath();
        ctx.arc(x, lineY, size * 0.006, 0, Math.PI * 2);
        ctx.fill();

        if (item.event) {
          ctx.font = `500 ${size * 0.0115}px ${titleFont}`;
          ctx.fillStyle = textMuted;
          const eventLines = wrapText(ctx, item.event, maxWidth).slice(0, 2);
          maxEventLines = Math.max(maxEventLines, eventLines.length);
          eventLines.forEach((line, li) => {
            ctx.fillText(line, x, lineY + size * 0.026 + li * eventLineHeight);
          });
        }
      });
    });

    cursorY =
      firstRowY +
      (rows.length - 1) * rowSpacing +
      size * 0.026 +
      (maxEventLines - 1) * eventLineHeight +
      size * 0.045;
  } else {
    cursorY += size * 0.02;
  }

  // 하트 + 하단 카피 — 위 내용과 무관하게 캔버스 맨 아래 고정
  const footerTextY = size - size * 0.045;
  const heartY = footerTextY - size * 0.04;
  drawHeartIcon(ctx, size / 2, heartY, size * 0.012, textMain);
  ctx.font = `italic 400 ${size * 0.0145}px ${titleFont}`;
  ctx.fillStyle = textMuted;
  ctx.fillText("Every moment is a precious gift.", size / 2, footerTextY);

  ctx.textAlign = "left";
}

// ─── User-placed stickers (from the back theme editor) ───
// stickers: [{ src, x, y, rotation, scale }] with x/y normalized to 0..1
// stickerImages: { [src]: HTMLImageElement }
export function drawUserStickers(ctx, size, stickers, stickerImages) {
  if (!stickers || stickers.length === 0) return;
  for (const sticker of stickers) {
    const img = stickerImages?.[sticker.src];
    if (!img) continue;
    const baseW = size * 0.16;
    const baseH = baseW * (img.height / img.width);
    ctx.save();
    ctx.translate(sticker.x * size, sticker.y * size);
    ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180);
    const scale = sticker.scale || 1;
    ctx.drawImage(
      img,
      (-baseW / 2) * scale,
      (-baseH / 2) * scale,
      baseW * scale,
      baseH * scale,
    );
    ctx.restore();
  }
}

export function generateBackCoverDataUrl(
  themeKey,
  bio,
  timeline,
  backCoverImg,
  albumTitle,
  albumSubTitle,
  extractedColors,
  themeBgImg,
  themeStickerImg,
  stickers,
  stickerImages,
) {
  const size = 1024; // 드로잉 좌표계 (변경 불필요)
  const resolution = 2048; // 실제 캔버스 픽셀 — 2x로 Retina 화질 확보
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d");
  ctx.scale(resolution / size, resolution / size); // = scale(2, 2)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const theme = UNIFIED_THEMES[themeKey] || UNIFIED_THEMES.minimalist;

  switch (themeKey) {
    case "fullimage":
      drawFullImageLayout(ctx, size, backCoverImg);
      break;
    case "kitsch":
      drawKitschLayout(
        ctx,
        size,
        theme,
        bio,
        timeline,
        albumTitle,
        albumSubTitle,
        themeBgImg,
        backCoverImg,
        themeStickerImg,
      );
      break;
    case "illustration":
      drawIllustrationLayout(
        ctx,
        size,
        theme,
        bio,
        timeline,
        albumTitle,
        albumSubTitle,
        themeBgImg,
      );
      break;
    case "travel":
      // themeBgImg = travel1_back.svg 프레임
      drawTravelLayout(ctx, size, theme, timeline, themeBgImg);
      break;
    case "couple_1":
    case "couple_2":
      drawCoupleLayout(ctx, size, bio, timeline, backCoverImg);
      break;
    case "children_1":
    case "children_2":
      drawChildrenLayout(
        ctx,
        size,
        bio,
        timeline,
        backCoverImg,
        themeKey === "children_1",
      );
      break;
    case "memorial_light":
      drawMemorialLightLayout(
        ctx,
        size,
        bio,
        timeline,
        albumTitle,
        albumSubTitle,
      );
      break;
    case "memorial_dark":
      drawMemorialDarkLayout(
        ctx,
        size,
        bio,
        timeline,
        albumTitle,
        albumSubTitle,
      );
      break;
    case "minimalist":
    default:
      drawMinimalistLayout(
        ctx,
        size,
        theme,
        bio,
        timeline,
        backCoverImg,
        albumTitle,
        albumSubTitle,
      );
      break;
  }

  drawUserStickers(ctx, size, stickers, stickerImages);

  return canvas.toDataURL("image/jpeg", 0.95);
}
