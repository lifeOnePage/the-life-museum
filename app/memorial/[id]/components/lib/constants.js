// ─── Gravestone cycle timing (ms) ───
// 1. profile 이미지가 중앙에 머무는 시간
export const PROFILE_HOLD_MS = 3500;
// 2. profile → 상단좌측 슬롯으로 모핑되는 시간
export const MORPH_DURATION_MS = 2200;
// 3. 슬라이드쇼: 각 랜덤 미디어 노출 시간
export const SLIDE_HOLD_MS = 5500;
// 슬라이드 간 크로스페이드 시간 (느린 페이드)
export const SLIDE_CROSSFADE_MS = 2200;
// 3 → 1: 슬라이드쇼 전체 지속 후 다시 프로필로 (쿨타임)
export const SLIDESHOW_DURATION_MS = 30000;
// 일반 페이드 인/아웃 (느리게)
export const FADE_MS = 2000;

// ─── Background media flow ───
// 배경 미디어 행 개수
export const BG_ROW_COUNT = 5;
// 한 행이 한 바퀴 흐르는 기본 시간(초) — 클수록 느림
export const BG_ROW_DURATION_S = 90;
// 행마다 속도 편차(초)
export const BG_ROW_DURATION_STEP_S = 12;
// 배경 미디어 디밍(밝기/투명도)
export const BG_BRIGHTNESS = 0.55;
export const BG_OPACITY = 0.95;

// ─── 오목한 곡면(원통) 스크린 ───
// 미디어를 원통 안쪽 면에 배치하고 원통을 천천히 회전시켜 곡면을 따라 좌→우로 흐르게 한다.
export const BG_PERSPECTIVE_PX = 1500; // 원근 거리(클수록 곡률 완만)
export const BG_CYL_RADIUS_PX = 1150; // 원통 반지름(px)
export const BG_CYL_COLUMNS = 16; // 원통 둘레 열(column) 개수
export const BG_CYL_TILES_PER_COL = 9; // 한 열의 세로 타일 수
export const BG_CYL_SPIN_S = 150; // 한 바퀴 회전 시간(초) — 클수록 느림

// ─── 에셋 ───
// 하단 흰 국화 (없으면 graceful하게 생략)
export const CHRYSANTHEMUM_SRC = "/memorial/chrysanthemum.png";
