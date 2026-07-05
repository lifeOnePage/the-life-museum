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
  const { title, subtitle, position, font, color, stroke, strokeOpacity = 100 } = config;

  // Need either an image or a title to render anything
  if (!frontCoverImg && !title) return null;

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
    ctx.font = `bold 65px ${fontFamily}`;
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
      const textHeight = 55;
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

  return canvas.toDataURL("image/jpeg", 0.95);
}
