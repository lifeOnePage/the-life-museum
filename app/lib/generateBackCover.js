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

  const margin = 70;
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
    ctx.font = `76px ${kitschTitleFont}`;
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
    const maxItems = 6;
    const items = timeline.slice(0, maxItems);
    cursorY += 60;

    for (const item of items) {
      if (cursorY > size - 200) break;
      ctx.letterSpacing = "-0.5px";

      // Year
      ctx.font = `bold 24px ${bookkFont}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = "center";
      ctx.fillText(item.year, size / 2 - 270, cursorY);

      // Event
      ctx.font = `32px ${bookkFont}`;
      ctx.fillStyle = theme.text + "cc";
      ctx.textAlign = "left";
      const eventX = size / 2 - 200;
      const eventMaxW = (backCoverImg ? contentRight : size - margin) - eventX;
      const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 2);
      for (let li = 0; li < eventLines.length; li++) {
        ctx.fillText(eventLines[li], eventX, cursorY + li * 42);
      }

      cursorY += 72 + (eventLines.length - 1) * 42;
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

    ctx.font = `500 21px ${escoredreamFont}`;
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

  const margin = 80;
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  const yangjinFont = yangjinFontLoaded ? '"yangjin"' : bookkFont;
  // Title — top center, white bold with drop shadow
  let cursorY = margin + 100;
  if (albumTitle) {
    ctx.font = `64px ${yangjinFont}`;
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

  // Timeline — horizontal line in middle area with filled circle dots
  if (timeline.length > 0) {
    const tlY = size * 0.52;
    const maxItems = Math.min(timeline.length, 6);
    const items = timeline.slice(0, maxItems);
    const tlLeft = margin + 40;
    const tlRight = size - margin - 40;
    const tlWidth = tlRight - tlLeft;

    // Horizontal line
    ctx.strokeStyle = "#406E78";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tlLeft, tlY);
    ctx.lineTo(tlRight, tlY);
    ctx.stroke();

    // Dots and labels
    for (let i = 0; i < maxItems; i++) {
      const x =
        maxItems === 1
          ? (tlLeft + tlRight) / 2
          : tlLeft + (i / (maxItems - 1)) * tlWidth;
      const item = items[i];

      // Filled circle dot
      ctx.beginPath();
      ctx.arc(x, tlY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();

      // Year above
      ctx.font = `bold 24px ${bookkFont}`;
      ctx.fillStyle = "#406E78";
      ctx.textAlign = "center";
      ctx.fillText(item.year, x, tlY - 25);

      // Event below
      ctx.font = `600 19px ${bookkFont}`;
      ctx.textAlign = "center";
      const itemSpacing = maxItems > 1 ? tlWidth / (maxItems - 1) : tlWidth;
      const eventMaxW = Math.max(itemSpacing * 0.95, 100);
      const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 2);
      ctx.fill();
      ctx.fillStyle = "#406E78";
      for (let li = 0; li < eventLines.length; li++) {
        ctx.fillText(eventLines[li], x, tlY + 40 + li * 22);
      }
    }
    ctx.textAlign = "left";
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

  const margin = 70;
  const bookkFont = bookkFontLoaded ? '"Bookk Gothic"' : "sans-serif";
  let cursorY = margin;

  // Title — top center, black bold text (Escoredream)
  const escoredreamFont = escoredreamFontLoaded ? '"Escoredream"' : bookkFont;
  if (albumTitle) {
    ctx.font = `700 54px ${escoredreamFont}`;
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
  const photoH = size * 0.4;
  const photoX = (size - photoW) / 2;
  const photoY = cursorY + 10;

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

  cursorY = photoY + photoH + 60;

  // Timeline — horizontal line below photo, open circle dots
  if (timeline.length > 0) {
    const tlY = cursorY + 20;
    const maxItems = Math.min(timeline.length, 6);
    const items = timeline.slice(0, maxItems);
    const tlLeft = margin + 30;
    const tlRight = size - margin - 30;
    const tlWidth = tlRight - tlLeft;

    // Horizontal line
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tlLeft, tlY);
    ctx.lineTo(tlRight, tlY);
    ctx.stroke();

    // Open circle dots and labels
    for (let i = 0; i < maxItems; i++) {
      const x =
        maxItems === 1
          ? (tlLeft + tlRight) / 2
          : tlLeft + (i / (maxItems - 1)) * tlWidth;
      const item = items[i];

      // Open circle dot
      ctx.beginPath();
      ctx.arc(x, tlY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Year above
      ctx.font = `bold 24px ${escoredreamFont}`;
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "center";
      ctx.fillText(item.year, x, tlY - 16);

      // Event below
      ctx.font = `600 17px ${escoredreamFont}`;
      ctx.letterSpacing = "-0.7px";
      ctx.fillStyle = theme.text;
      const itemSpacing = maxItems > 1 ? tlWidth / (maxItems - 1) : tlWidth;
      const eventMaxW = Math.max(itemSpacing * 0.85, 100);
      const eventLines = wrapText(ctx, item.event, eventMaxW).slice(0, 3);
      for (let li = 0; li < eventLines.length; li++) {
        ctx.fillText(eventLines[li], x, tlY + 28 + li * 24);
      }
    }
    ctx.textAlign = "left";
    cursorY = tlY + 50;
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
) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

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

  return canvas.toDataURL("image/png");
}
