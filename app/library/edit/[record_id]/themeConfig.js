// 테마 카테고리 — 뒷면 테마 팝업의 탭 구분 기준. "기본" 외 나머지는
// 카테고리별 팩 단위로 순차 추가될 예정(각 팩마다 완전히 새로운 레이아웃).
export const THEME_CATEGORIES = [
  { key: "basic", name: "기본", nameEn: "Basic" },
  // { key: "lifefourcut", name: "인생네컷", nameEn: "Photo Booth" },
  { key: "travel", name: "여행", nameEn: "Travel" },
  { key: "couple", name: "연인", nameEn: "Couple" },
  // { key: "parenting", name: "육아", nameEn: "Parenting" },
  // { key: "retro", name: "레트로", nameEn: "Retro" },
  { key: "memorial", name: "추모", nameEn: "Memorial" },
];

export const UNIFIED_THEMES = {
  minimalist: {
    key: "minimalist",
    category: "basic",
    name: "Minimalist",
    description: "깔끔한 화이트 미니멀 레이아웃",
    descriptionEn: "Clean white minimal layout",
    bg: "#ffffff",
    accent: "#222222",
    text: "#555555",
  },
  kitsch: {
    key: "kitsch",
    category: "basic",
    name: "Kitsch",
    description: "스티커와 종이 질감의 레트로 감성",
    descriptionEn: "Retro sticker & paper texture vibe",
    bg: "#e8e0d0",
    accent: "#d6336c",
    text: "#2c2c2c",
  },
  illustration: {
    key: "illustration",
    category: "basic",
    name: "Illustration",
    description: "풍경 일러스트 위 감성적인 타임라인",
    descriptionEn: "Scenic illustration with emotional timeline",
    bg: "#87CEEB",
    accent: "#ffffff",
    text: "#ffffff",
  },
  fullimage: {
    key: "fullimage",
    category: "basic",
    name: "Full Image",
    description: "뒷면 이미지를 전면에 꽉 채워 표시",
    descriptionEn: "Full-bleed back cover image display",
    bg: "#000000",
    accent: "#ffffff",
    text: "#ffffff",
  },
  travel: {
    key: "travel",
    category: "travel",
    name: "Travel Diary",
    description: "크래프트지 여행 다이어리, 탑승권 스티커",
    descriptionEn: "Kraft-paper travel diary with a boarding pass sticker",
    bg: "#c2ab8c",
    accent: "#a13d2e",
    text: "#3a3226",
  },
  couple_1: {
    key: "couple_1",
    category: "couple",
    name: "Arch Frame",
    description: "아치형 프레임의 버건디 커플 테마",
    descriptionEn: "Burgundy couple theme with an arch photo frame",
    bg: "#6f1f1d",
    accent: "#f4ece2",
    text: "#f4ece2",
  },
  couple_2: {
    key: "couple_2",
    category: "couple",
    name: "Classic Frame",
    description: "클래식 사각 프레임의 버건디 커플 테마",
    descriptionEn: "Burgundy couple theme with a classic rectangular frame",
    bg: "#6f1f1d",
    accent: "#f4ece2",
    text: "#f4ece2",
  },
  memorial_light: {
    key: "memorial_light",
    category: "memorial",
    name: "라이트",
    description: "크림 배경에 2단 연혁과 추모 문구",
    descriptionEn: "Cream background with a two-column timeline",
    bg: "#ece7df",
    accent: "#3a352e",
    text: "#8a8478",
  },
  memorial_dark: {
    key: "memorial_dark",
    category: "memorial",
    name: "다크",
    description: "블랙 배경에 2단 연혁과 추모 문구",
    descriptionEn: "Black background with a two-column timeline",
    bg: "#141414",
    accent: "#e8d5b7",
    text: "#a89d89",
  },
};

export const DEFAULT_THEME = "minimalist";

// 스티커는 특정 테마에 종속되지 않는다 — 어떤 테마의 뒷면에도 자유롭게 붙일 수 있다.
// 팩 목록/스티커 파일은 여기 하드코딩하지 않고, public/stickers/<packId>/
// 폴더 구조를 그대로 스캔하는 /api/stickers 에서 가져온다 (app/api/stickers/route.js 참고).
// 새 팩을 추가하려면 public/stickers/<packId>/ 에 이미지 파일만 넣으면 된다.
