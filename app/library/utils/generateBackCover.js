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

export default function generateBackCoverDataUrl(bio, timeline, bgColor, textColor, keyColor) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = bgColor || "#ffffff";
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
    drawSectionHeader(ctx, "\uC0DD \uC560 \uBB38", topY, bioLeft, bioRight);
    let cursorY = topY + 60;

    ctx.font = "italic 24px sans-serif";
    ctx.fillStyle = textColor || "#1c1917";
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
    drawSectionHeader(ctx, "\uD0C0 \uC784 \uB77C \uC778", topY, tlLeft, tlRight);
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
      ctx.fillStyle = keyColor || "#d97706";
      ctx.fill();
      ctx.strokeStyle = (keyColor || "#d97706") + "80";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Year
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = keyColor || "#b45309";
      ctx.fillText(item.year, textX, cursorY + 7);

      // Event
      const yearWidth = ctx.measureText(item.year).width;
      ctx.font = "20px sans-serif";
      ctx.fillStyle = textColor || "#78716c";
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
      ctx.fillText(`+${timeline.length - maxItems}\uAC1C \uB354`, textX, cursorY + 4);
    }
  }

  // Empty state
  if (!hasBio && !hasTimeline) {
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(168, 162, 158, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("\uBB07\uBA74 \uCF58\uD150\uCE20", size / 2, size / 2);
  }

  return canvas.toDataURL("image/png");
}
