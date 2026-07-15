export const UNIFIED_THEMES = {
  minimalist: {
    key: "minimalist",
    name: "Minimalist",
    description: "깔끔한 화이트 미니멀 레이아웃",
    descriptionEn: "Clean white minimal layout",
    bg: "#ffffff",
    accent: "#222222",
    text: "#555555",
  },
  kitsch: {
    key: "kitsch",
    name: "Kitsch",
    description: "스티커와 종이 질감의 레트로 감성",
    descriptionEn: "Retro sticker & paper texture vibe",
    bg: "#e8e0d0",
    accent: "#d6336c",
    text: "#2c2c2c",
  },
  illustration: {
    key: "illustration",
    name: "Illustration",
    description: "풍경 일러스트 위 감성적인 타임라인",
    descriptionEn: "Scenic illustration with emotional timeline",
    bg: "#87CEEB",
    accent: "#ffffff",
    text: "#ffffff",
  },
  fullimage: {
    key: "fullimage",
    name: "Full Image",
    description: "뒷면 이미지를 전면에 꽉 채워 표시",
    descriptionEn: "Full-bleed back cover image display",
    bg: "#000000",
    accent: "#ffffff",
    text: "#ffffff",
  },
};

export const DEFAULT_THEME = "minimalist";

// 스티커는 특정 테마에 종속되지 않는다 — "스티커 팩" 단위로 잠금 해제되면
// 어떤 테마의 뒷면에도 자유롭게 붙일 수 있다.
// 팩 목록/스티커 파일은 더 이상 여기 하드코딩하지 않고, public/stickers/<packId>/
// 폴더 구조를 그대로 스캔하는 /api/stickers 에서 가져온다 (app/api/stickers/route.js 참고).
// 새 팩을 추가하려면 public/stickers/<packId>/ 에 이미지 파일만 넣으면 된다.
// packId는 향후 구매 SKU(테마 카테고리 구매 등)와 매핑된다.
// 예: 육아 테마 3종을 구매하면 packId "parenting" 팩이 잠금 해제되는 식.

// 실제 구매/소유 데이터가 백엔드에 붙기 전까지 쓰는 임시 기본값.
// (지금은 키치 팩을 무료로 제공한다고 가정)
// TODO: retro는 테스트용 임시 잠금 해제 — 실 배포 전에 제거하고 구매 데이터로 교체
export const DEFAULT_OWNED_PACK_IDS = ["kitsch", "retro"];
