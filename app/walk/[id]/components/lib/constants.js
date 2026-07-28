import * as THREE from "three";

// API — 프록시 URL 생성은 공용 유틸로 위임 (R2 URL은 프록시 우회)
export { API_BASE, getProxiedUrl } from "@/app/lib/proxy";

// Layout
export const SEED = 1337;
export const BASE_HEIGHT = 80;
export const CORRIDOR_HALF = 300;

// Camera
export const CAMERA_SPEED = 110;
export const CAMERA_START_Z = 0;

// Focus system
export const DISPLAY_OFFSET_Z = 500;
export const DISPLAY_OFFSET_PAUSED = 120; // closer distance for manual click while paused (hold zone 80~130 내 착지)
export const DISPLAY_SCALE = 0.8;
export const FOCUS_SEARCH_RANGE = 800;
export const FOCUS_DISMISS_DISTANCE = 10;
export const FOCUS_FADE_SPEED = 0.2; // 0→1 in ~0.67s
export const OPACITY_APPEAR_DIST = 200; // 이 거리부터 클론이 보이기 시작
export const OPACITY_PEAK_DIST = 130; // 이 거리에서 fade-in 완료 (opacity = 1.0)
export const OPACITY_HOLD_DIST = 30; // 이 거리에서 hold 종료, fade-out 시작

// ── 중앙 독립 슬라이드쇼 (타임트래블 중앙 포커스) ────────────────────────────
// 중앙 포커스를 복도(카메라)와 완전히 분리한 자체 슬라이드쇼. 자체 타이머로
// 앨범 이미지를 0→끝 순서대로(건너뛰기 없이) 재생하고, 자체 텍스처를 로딩·해제한다.
// 카메라 속도(cameraSpeed=복도 속도)와 무관하게 아래 값으로만 페이스/거리를 정한다.
//  · 한 장당 시간(느리게) → SLIDE_DWELL_SEC ↑
//  · 더 멀리서 등장 → SLIDE_START_DIST ↑ (독립이므로 멀리 둬도 건너뛰지 않음)
//  · 통과(가까이) 거리 → SLIDE_END_DIST
export const SLIDE_DWELL_SEC = 3.5;  // 한 사진이 멀리→가까이 지나가는 데 걸리는 시간(초)
export const SLIDE_START_DIST = 420; // 등장(먼) 거리
export const SLIDE_END_DIST = -80;   // 통과(끝) 거리 — 음수 = 카메라 뒤까지 실제로 지나침
export const SLIDE_FADE_IN = 0.3;    // 0~0.5: 앞쪽 이 비율만큼 opacity 0→100 (진행도 기반)
export const SLIDE_FADE_OUT = 0.07;  // (FocusClone 전용 잔존) 뒤쪽 이 비율만큼 opacity 100→0
export const SLIDE_APPROACH_EASE = 2.5; // 접근 ease-out 강도(≥1, 1=선형). 클수록 초반 감속이 큼
export const SLIDE_TERMINAL_SPEED_RATIO = 0.55; // 종단 속도 = 평균 접근 속도 × 이 비율(0이면 끝에서 정지)
// 중앙 슬라이드쇼 페이드아웃(거리 기반): 카메라를 반투명 상태로 지나치는 느낌.
// END_DIST는 0 권장 — 음수로 두면 dist<0.1에서 근평면 클리핑으로 통째로 잘려
// 잔존 opacity(END/(START-END))가 1프레임 하드컷되는 팝이 생긴다.
export const SLIDE_FADE_OUT_START_DIST = 80; // 이 거리부터 opacity 감소 시작
export const SLIDE_FADE_OUT_END_DIST = 0;    // 이 거리에서 opacity 0(통과 순간 소멸)

// 강한 휠 플링(수동 스크롤 속도가 이 값 초과, 유닛/초) 동안 신규 텍스처 로드 시작을
// 보류 — 이미지 디코드/다운스케일/GPU 업로드가 프레임 예산이 가장 빠듯한 타이밍에
// 몰려 잔렉을 만드는 것을 방지. 플링 감쇠(수 백 ms) 후 자동 재개된다.
export const FLING_LOAD_PAUSE_SPEED = 500;

// Camera speed modulation during auto-focus
// 오토포커싱 사이클 시작 시 speed = cameraSpeed (x),
// clone에 가장 가까워지는 시점에 speed = cameraSpeed * FOCUS_MIN_SPEED_RATIO (x/2)
// 포커싱 전환 시 즉시 cameraSpeed로 복귀 후 다시 감속
export const FOCUS_MIN_SPEED_RATIO = 0.2;
export const VIDEO_FOCUS_MIN_SPEED_RATIO = 0; // 비디오 auto-focus 시 카메라 완전 정지
export const VIDEO_CAMERA_STOP_DIST = 50; // 비디오 재생 시 카메라가 이 거리에서 완전 정지 (HOLD 구간 내)

export const AUTO_RESPAWN_OFFSET = 205;
// auto→auto 전환 시 클론 스폰 거리.
// OPACITY_APPEAR_DIST(200) 바로 밖에서 스폰 → dead time ≈ 0
// dist=205에서 속도 공식 → 47% (100% 점프 대신)

// Floor
export const FLOOR_Y = -0;
export const FLOOR_COLOR = "#000000";

// Fog
export const FOG_COLOR = "#000000";
export const FOG_NEAR = 300;
export const FOG_FAR = 2000;

// Glow
export const GLOW_COLOR = "#ffffff";
export const GLOW_POINTS_PER_EDGE = 40;

// Texture quality — device-adaptive.
// planePoolSize: 복도에 상주하는 고정 plane(슬롯) 개수. 앨범 사진 수와 무관하게
// 이 개수로 고정되고, 슬롯이 복도 끝으로 래핑될 때 다음 사진으로 순환 재할당된다
// (Scene의 순환 로딩). 메모리/메시 수는 이 값으로 고정되므로 저사양 안전의 핵심 상한.
// 현재(고정 200)와 동일하게 두어 모바일 회귀가 없도록 하고, 데스크톱만 소폭 확대.
export function getTextureConfig() {
  if (typeof window === "undefined") {
    return { maxTextureSize: 512, anisotropy: 1, planePoolSize: 200 };
  }
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && window.innerWidth < 1024);
  if (isMobile) {
    return { maxTextureSize: 768, anisotropy: 2, planePoolSize: 200 };
  }
  return { maxTextureSize: 1024, anisotropy: 4, planePoolSize: 260 };
}
