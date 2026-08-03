import { drawUserStickers } from "./generateBackCover";

// Load fonts for canvas rendering via FontFace API
let fontsReady = false;
const fontMap = {};

if (typeof document !== "undefined") {
  const fonts = [
    {
      family: "Pretendard Variable",
      url: "/PretendardVariable.ttf",
      format: "truetype",
      weight: "400",
    },
    {
      family: "MonoplexKR",
      url: "/fonts/MonoplexKR-Light.woff2",
      format: "woff2",
      weight: "300",
    },
    {
      family: "Yde street",
      url: "/YdestreetL.otf",
      format: "opentype",
      weight: "300",
    },
    {
      family: "Bookk Gothic",
      url: "/fonts/BookkGothic_Light.woff2",
      format: "woff2",
      weight: "300",
    },
  ];

  Promise.all(
    fonts.map((f) => {
      const face = new FontFace(
        f.family,
        `url(${f.url}) format("${f.format}")`,
        { weight: f.weight },
      );
      return face
        .load()
        .then((loaded) => {
          document.fonts.add(loaded);
          fontMap[f.family] = true;
        })
        .catch(() => {});
    }),
  ).then(() => {
    fontsReady = true;
  });

  // Escoredream — used by the memorial front-cover layout (매칭: generateBackCover.js)
  const escoredreamWeights = [
    ["400", "S-CoreDream-4Regular"],
    ["700", "S-CoreDream-7ExtraBold"],
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
      fontMap["Escoredream"] = true;
    })
    .catch(() => {});
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    let line = "";
    for (const char of paragraph) {
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

const MEMORIAL_TEXT = {
  ko: { headline: "사랑과 존경을 기억합니다.", label: "MEMORY ALBUM" },
  en: { headline: "In loving memory and respect.", label: "MEMORY ALBUM" },
};

// ─── Travel Diary front cover: kraft-paper frame + photo window ───
// 프레임 원본 에셋(travel1_front.svg)이 1080×1080 기준으로 제작되어 있어,
// size(보통 1024)에 맞춰 scale = size / 1080 배율로 좌표를 환산한다.
// 프레임 안의 "사진 창"은 투명 처리되어 있어 사진을 먼저 그린 뒤 프레임을
// 그 위에 겹쳐 그리면 창 안으로 사진이 비쳐 보인다.
function drawTravelFrontLayout(ctx, size, sourceImg, albumTitle, frameImg) {
  const scale = size / 1080;
  const s = (v) => v * scale;
  const bg = "#c2ab8c";
  const textMain = "#3a3226";
  const textMuted = "#8a7a63";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 사진 창(투명 컷아웃) 좌표 — travel1_front.svg 실측값
  const hole = { x: s(62), y: s(226), w: s(944), h: s(625) };
  if (sourceImg) {
    const imgRatio = sourceImg.width / sourceImg.height;
    const boxRatio = hole.w / hole.h;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = sourceImg.height;
      sw = sh * boxRatio;
      sx = (sourceImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = sourceImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (sourceImg.height - sh) / 2;
    }
    ctx.drawImage(sourceImg, sx, sy, sw, sh, hole.x, hole.y, hole.w, hole.h);
  }

  // 프레임(크래프트지 + 탑승권 스티커 + 스탬프) — 사진 창은 투명이라 위에서
  // 그린 사진이 그대로 비쳐 보인다.
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, size, size);
  }

  const titleFont = fontMap["Pretendard Variable"]
    ? '"Pretendard Variable"'
    : "sans-serif";

  // 타이틀 — 사진 창 위쪽 여백
  ctx.textAlign = "left";
  ctx.fillStyle = textMain;
  ctx.font = `800 ${s(46)}px ${titleFont}`;
  ctx.fillText(albumTitle || "A new adventure", s(58), s(88));

  // 서브 캡션
  ctx.font = `600 ${s(16)}px ${titleFont}`;
  ctx.fillStyle = textMuted;
  ctx.letterSpacing = `${s(2.5)}px`;
  ctx.fillText("TRAVEL · RECORD · REMEMBER", s(58), s(124));
  ctx.letterSpacing = "0px";

  // 하단 — VOL.1 + 캡션 문구
  ctx.font = `700 ${s(17)}px ${titleFont}`;
  ctx.fillStyle = textMain;
  ctx.fillText("VOL. 1", s(58), s(905));

  ctx.font = `italic 400 ${s(15)}px ${titleFont}`;
  ctx.fillStyle = textMuted;
  ctx.fillText("Every journey leaves a mark.", s(58), s(940));
  ctx.fillText("Let's collect the moments that matter.", s(58), s(963));

  ctx.textAlign = "left";
}

// 작은 하트 아이콘 — 커플 테마 공용
function drawHeart(ctx, cx, cy, r, color) {
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

// ─── Couple front cover: 버건디 배경 + 사진 창(아치/사각) + 커플 이름 ───
// 프레임 원본 에셋(couple-1.svg / couple-2.svg)은 마스크 역할만 하는 단색
// 도형이라, 사진을 캔버스 전체에 먼저 채우고 그 위에 프레임을 덮어 씌우면
// 뚫린 창(아치 또는 사각형) 모양대로만 사진이 드러난다.
function drawCoupleFrontLayout(
  ctx,
  size,
  sourceImg,
  albumTitle,
  frameImg,
  variant,
) {
  const scale = size / 1024;
  const s = (v) => v * scale;
  const bg = "#6f1f1d";
  const textColor = "#f4ece2";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (sourceImg) {
    const imgRatio = sourceImg.width / sourceImg.height;
    let sx, sy, sw, sh;
    if (imgRatio > 1) {
      sh = sourceImg.height;
      sw = sh;
      sx = (sourceImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = sourceImg.width;
      sh = sw;
      sx = 0;
      sy = (sourceImg.height - sh) / 2;
    }
    ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, size, size);
  }

  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, size, size);
  }

  const titleFont = fontMap["Pretendard Variable"]
    ? '"Pretendard Variable"'
    : "sans-serif";
  const name = albumTitle || "Our Story";

  if (variant === 1) {
    // 좌상단 작은 서브 카피 2줄
    ctx.textAlign = "left";
    ctx.font = `600 ${s(20)}px ${titleFont}`;
    ctx.fillStyle = textColor;
    ctx.letterSpacing = `${s(1)}px`;
    ctx.fillText("LAST YEARS,", s(50), s(90));
    ctx.fillText("OUR STORY", s(50), s(130));
    ctx.letterSpacing = "0px";

    // 우상단 커플 이름
    ctx.textAlign = "right";
    ctx.font = `700 ${s(60)}px ${titleFont}`;
    ctx.fillText(name, size - s(50), s(120));

    // 하단 중앙 캡션
    ctx.textAlign = "center";
    ctx.font = `400 ${s(15)}px ${titleFont}`;
    ctx.letterSpacing = `${s(2)}px`;
    ctx.fillText("사진으로 기록한 10년", size / 2, size - s(60));
    ctx.letterSpacing = "0px";
  } else {
    // 사진 위 중앙 타이틀 + 서브 카피
    ctx.textAlign = "center";
    ctx.font = `700 ${s(34)}px ${titleFont}`;
    ctx.fillStyle = textColor;
    ctx.fillText(name, size / 2, s(90));

    ctx.font = `600 ${s(13)}px ${titleFont}`;
    ctx.letterSpacing = `${s(2)}px`;
    ctx.fillText("LAST YEARS, OUR STORY", size / 2, s(122));
    ctx.letterSpacing = "0px";

    // 하단 하트 + 캡션
    drawHeart(ctx, size / 2, size - s(92), s(8), textColor);
    ctx.font = `400 ${s(15)}px ${titleFont}`;
    ctx.fillText("사진으로 기록한 10년", size / 2, size - s(55));
  }

  ctx.textAlign = "left";
}

// ─── Memorial front cover: oval-framed photo + flower + name ───
// (뒷면 memorial_light/memorial_dark와 동일한 팔레트를 사용)
function drawMemorialFrontLayout(
  ctx,
  size,
  isDark,
  sourceImg,
  albumTitle,
  locale,
) {
  const bg = isDark ? "#141414" : "#ece7df";
  const textMain = isDark ? "#e8d5b7" : "#3a352e";
  const textMuted = isDark ? "#a89d89" : "#8a8478";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const font = resolveFont("Escoredream");
  const copy = MEMORIAL_TEXT[locale] || MEMORIAL_TEXT.ko;

  // Headline
  ctx.font = `500 26px ${font}`;
  ctx.fillStyle = textMain;
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText(copy.headline, size / 2, 95);
  ctx.letterSpacing = "0px";

  // Oval photo frame
  const ovalCx = size / 2;
  const ovalCy = size * 0.41;
  const ovalRx = size * 0.26;
  const ovalRy = size * 0.273;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = isDark ? "#2a2a2a" : "#d8d2c4";
  ctx.fillRect(ovalCx - ovalRx, ovalCy - ovalRy, ovalRx * 2, ovalRy * 2);
  if (sourceImg) {
    const imgRatio = sourceImg.width / sourceImg.height;
    const boxRatio = ovalRx / ovalRy;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = sourceImg.height;
      sw = sh * boxRatio;
      sx = (sourceImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = sourceImg.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (sourceImg.height - sh) / 2;
    }
    ctx.drawImage(
      sourceImg,
      sx,
      sy,
      sw,
      sh,
      ovalCx - ovalRx,
      ovalCy - ovalRy,
      ovalRx * 2,
      ovalRy * 2,
    );
  }
  ctx.restore();

  // Oval border
  ctx.strokeStyle = textMuted;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  let cursorY = ovalCy + ovalRy + 20 + 35;

  // Divider lines flanking the "MEMORY ALBUM" label
  const lineY = cursorY;
  const gap = 70;
  ctx.strokeStyle = textMuted;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(size * 0.22, lineY);
  ctx.lineTo(size / 2 - gap, lineY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size / 2 + gap, lineY);
  ctx.lineTo(size * 0.78, lineY);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // "MEMORY ALBUM" label
  ctx.font = `600 15px ${font}`;
  ctx.fillStyle = textMuted;
  ctx.letterSpacing = "4px";
  ctx.fillText(copy.label, size / 2, lineY + 6);
  ctx.letterSpacing = "0px";

  // Name
  if (albumTitle) {
    ctx.font = `700 32px ${font}`;
    ctx.fillStyle = textMain;
    const lines = wrapText(ctx, albumTitle, size * 0.7).slice(0, 2);
    let ny = lineY + 55;
    for (const line of lines) {
      ctx.fillText(line, size / 2, ny);
      ny += 40;
    }
  }

  ctx.textAlign = "left";
}

function resolveFont(family) {
  if (fontMap[family]) return `"${family}"`;
  return "sans-serif";
}

// Position map: 9-direction grid
// Returns { textAlign, x, titleY, subtitleY } for a given position key
function getTextLayout(position, size) {
  const margin = 60;
  const positions = {
    "top-left": { textAlign: "left", x: margin, anchorY: margin + 50 },
    "top-center": { textAlign: "center", x: size / 2, anchorY: margin + 50 },
    "top-right": {
      textAlign: "right",
      x: size - margin,
      anchorY: margin + 50,
    },
    "middle-left": { textAlign: "left", x: margin, anchorY: size / 2 - 20 },
    "middle-center": {
      textAlign: "center",
      x: size / 2,
      anchorY: size / 2 - 20,
    },
    "middle-right": {
      textAlign: "right",
      x: size - margin,
      anchorY: size / 2 - 20,
    },
    "bottom-left": {
      textAlign: "left",
      x: margin,
      anchorY: size - margin - 70,
    },
    "bottom-center": {
      textAlign: "center",
      x: size / 2,
      anchorY: size - margin - 70,
    },
    "bottom-right": {
      textAlign: "right",
      x: size - margin,
      anchorY: size - margin - 70,
    },
  };

  return positions[position] || positions["bottom-center"];
}

/**
 *
 * Generate a composited front cover data URL with title/subtitle overlay.
 * @param {HTMLImageElement|null} frontCoverImg - loaded image element
 * @param {Object} config
 * @param {string} config.title
 * @param {string} config.subtitle
 * @param {string} config.position - one of 9 positions e.g. "bottom-center"
 * @param {string} config.font - font family name
 * @param {string} config.color - text color hex
 * @param {"none"|"white"|"black"|string} [config.stroke] - stroke color, or "none" for no stroke
 * @param {number} [config.strokeOpacity] - background opacity 0-100 (default 100)
 * @returns {string|null} data URL or null if no text to render
 */
export function generateFrontCoverDataUrl(frontCoverImg, config) {
  const {
    title,
    subtitle,
    position,
    font,
    color,
    stroke,
    strokeOpacity = 100,
    themeKey,
    albumTitle,
    flowerImg,
    locale,
    stickers,
    stickerImages,
  } = config;

  // 추모 테마는 뒷면과 짝을 이루는 고정 레이아웃(오벌 프레임 + 이름)을 쓴다 —
  // 수동 타이틀 오버레이(title/position/stroke 등)는 이 레이아웃에서는 무시된다.
  if (themeKey === "memorial_light" || themeKey === "memorial_dark") {
    if (!frontCoverImg && !albumTitle && !(stickers && stickers.length))
      return null;
    const size = 1024;
    const resolution = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    ctx.scale(resolution / size, resolution / size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawMemorialFrontLayout(
      ctx,
      size,
      themeKey === "memorial_dark",
      frontCoverImg,
      albumTitle,
      locale,
    );
    drawUserStickers(ctx, size, stickers, stickerImages);
    return canvas.toDataURL("image/jpeg", 0.95);
  }

  // Travel Diary 테마도 뒷면과 짝을 이루는 고정 레이아웃(크래프트지 프레임 +
  // 탑승권 스티커)을 쓴다 — flowerImg 슬롯을 프레임 이미지로 재사용한다.
  if (themeKey === "travel") {
    if (!frontCoverImg && !albumTitle && !(stickers && stickers.length))
      return null;
    const size = 1024;
    const resolution = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    ctx.scale(resolution / size, resolution / size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawTravelFrontLayout(ctx, size, frontCoverImg, albumTitle, flowerImg);
    drawUserStickers(ctx, size, stickers, stickerImages);
    return canvas.toDataURL("image/jpeg", 0.95);
  }

  // Couple 테마도 뒷면과 짝을 이루는 고정 레이아웃(버건디 + 아치/사각 프레임)을
  // 쓴다 — flowerImg 슬롯을 프레임 이미지로 재사용한다.
  if (themeKey === "couple_1" || themeKey === "couple_2") {
    if (!frontCoverImg && !albumTitle && !(stickers && stickers.length))
      return null;
    const size = 1024;
    const resolution = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    ctx.scale(resolution / size, resolution / size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawCoupleFrontLayout(
      ctx,
      size,
      frontCoverImg,
      albumTitle,
      flowerImg,
      themeKey === "couple_1" ? 1 : 2,
    );
    drawUserStickers(ctx, size, stickers, stickerImages);
    return canvas.toDataURL("image/jpeg", 0.95);
  }

  // Need either an image, a title, or a sticker to render anything
  if (!frontCoverImg && !title && !(stickers && stickers.length)) return null;

  // Text metrics/layout below are authored against this base design size.
  const BASE_SIZE = 1024;
  const MAX_SIZE = 2048;

  // Render at the source's native square-crop resolution (capped) instead of a
  // fixed 1024 upscale. This avoids the blurry upscale of small Google Photos
  // covers and preserves detail from larger sources. Text is scaled to match the
  // render size via ctx.scale, so the overlay looks identical at any resolution.
  let size = BASE_SIZE;
  if (frontCoverImg) {
    const cropSide = Math.min(frontCoverImg.width, frontCoverImg.height);
    if (cropSide > 0) size = Math.round(Math.min(cropSide, MAX_SIZE));
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (frontCoverImg) {
    // Draw cover image with square center-crop (cover-fit)
    const imgRatio = frontCoverImg.width / frontCoverImg.height;
    const boxRatio = 1; // square
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
    ctx.drawImage(frontCoverImg, sx, sy, sw, sh, 0, 0, size, size);
  } else {
    // No cover image — draw placeholder background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
  }

  // Scale text so the fixed BASE_SIZE-based layout/metrics render proportionally
  // regardless of the actual canvas resolution chosen above.
  ctx.save();
  ctx.scale(size / BASE_SIZE, size / BASE_SIZE);

  // Text overlay
  const layout = getTextLayout(position || "bottom-center", BASE_SIZE);
  const fontFamily = resolveFont(font || "Pretendard Variable");

  ctx.textAlign = layout.textAlign;
  ctx.fillStyle = color || "#000000";

  // Title only (subtitle is not rendered on front cover)
  if (title) {
    ctx.font = `bold 50px ${fontFamily}`;
    const bgColor =
      stroke === "white"
        ? "#ffffff"
        : stroke === "black"
          ? "#000000"
          : stroke && stroke !== "none"
            ? stroke
            : null;
    if (bgColor) {
      const metrics = ctx.measureText(title);
      const textWidth = metrics.width;
      const textHeight = 50;
      const padX = 16;
      const padY = 10;
      let rectX;
      if (layout.textAlign === "left") rectX = layout.x - padX;
      else if (layout.textAlign === "right")
        rectX = layout.x - textWidth - padX;
      else rectX = layout.x - textWidth / 2 - padX;
      ctx.globalAlpha = strokeOpacity / 100;
      ctx.fillStyle = bgColor;
      ctx.fillRect(
        rectX,
        layout.anchorY - textHeight + 4,
        textWidth + padX * 2,
        textHeight + padY * 2 - 4,
      );
      ctx.globalAlpha = 1;
      ctx.fillStyle = color || "#ffffff";
    }
    ctx.fillText(title, layout.x, layout.anchorY + 8);
  }

  ctx.restore();

  drawUserStickers(ctx, size, stickers, stickerImages);

  return canvas.toDataURL("image/jpeg", 0.95);
}
