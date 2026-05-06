import * as THREE from "three";

// API
export const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";
export const PROXY_URL = `${API_BASE}/scraper/proxy/image`;
export const USE_PROXY = true;

export function getProxiedUrl(originalUrl) {
  if (!USE_PROXY) return originalUrl;
  return `${PROXY_URL}?url=${encodeURIComponent(originalUrl)}`;
}

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

// Camera speed modulation during auto-focus
// 오토포커싱 사이클 시작 시 speed = cameraSpeed (x),
// clone에 가장 가까워지는 시점에 speed = cameraSpeed * FOCUS_MIN_SPEED_RATIO (x/2)
// 포커싱 전환 시 즉시 cameraSpeed로 복귀 후 다시 감속
export const FOCUS_MIN_SPEED_RATIO = 0.2;
export const VIDEO_FOCUS_MIN_SPEED_RATIO = 0; // 비디오 auto-focus 시 카메라 완전 정지
export const VIDEO_CAMERA_STOP_DIST = 40; // 비디오 재생 시 카메라가 이 거리에서 완전 정지 (HOLD 구간 내)

export const AUTO_RESPAWN_OFFSET = 205;
// auto→auto 전환 시 클론 스폰 거리.
// OPACITY_APPEAR_DIST(200) 바로 밖에서 스폰 → dead time ≈ 0
// dist=205에서 속도 공식 → 47% (100% 점프 대신)

// Floor
export const FLOOR_Y = -0;
export const FLOOR_COLOR = "#000000";

// Fog
export const FOG_COLOR = "#ffffff";
export const FOG_NEAR = 300;
export const FOG_FAR = 2000;

// Glow
export const GLOW_COLOR = "#ffffff";
export const GLOW_POINTS_PER_EDGE = 40;

// Texture quality — device-adaptive
export function getTextureConfig() {
  if (typeof window === "undefined") {
    return { maxTextureSize: 512, anisotropy: 1 };
  }
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && window.innerWidth < 1024);
  if (isMobile) {
    return { maxTextureSize: 768, anisotropy: 2 };
  }
  return { maxTextureSize: 1024, anisotropy: 4 };
}
