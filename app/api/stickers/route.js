import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp"]);

// public/stickers/<packId>/ 아래 폴더 이름과 표시용 라벨이 다른 경우 여기에 추가.
// 등록 안 된 packId는 폴더명을 그대로 Title Case로 보여준다.
const PACK_LABELS = {
  kitsch: { name: "기본", nameEn: "Basic" },
  retro: { name: "레트로", nameEn: "Retro" },
  memorial: { name: "추모", nameEn: "Memorial" },
};

function toTitleCase(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function toStickerLabel(fileBaseName) {
  return fileBaseName.replace(/[-_]/g, " ");
}

// public/stickers/<packId>/*.{svg,png,jpg,jpeg,webp} 구조를 그대로 스캔해서
// 스티커 팩 목록을 만든다. 새 팩을 추가하려면 폴더만 만들고 이미지를 넣으면 된다.
export async function GET() {
  const stickersDir = path.join(process.cwd(), "public", "stickers");

  let packDirs = [];
  try {
    packDirs = fs
      .readdirSync(stickersDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return NextResponse.json({ packs: [] });
  }

  const packs = packDirs
    .map((packId) => {
      const packDir = path.join(stickersDir, packId);
      const files = fs
        .readdirSync(packDir)
        .filter((file) =>
          IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()),
        )
        .sort();

      const stickers = files.map((file) => {
        const baseName = path.parse(file).name;
        return {
          id: `${packId}-${baseName}`,
          src: `/stickers/${packId}/${file}`,
          label: toStickerLabel(baseName),
        };
      });

      const label = PACK_LABELS[packId] || {
        name: toTitleCase(packId),
        nameEn: toTitleCase(packId),
      };

      return {
        id: packId,
        name: label.name,
        nameEn: label.nameEn,
        stickers,
      };
    })
    .filter((pack) => pack.stickers.length > 0);

  return NextResponse.json({ packs });
}
