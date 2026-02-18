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
export const CAMERA_SPEED = 15;
export const CAMERA_START_Z = 0;

// Focus system
export const DISPLAY_OFFSET_Z = 200;
export const DISPLAY_SCALE = 0.8;
export const FOCUS_SEARCH_RANGE = 800;
export const FOCUS_DISMISS_DISTANCE = 100;
export const FOCUS_FADE_SPEED = 1.5; // 0→1 in ~0.67s

// Floor
export const FLOOR_Y = -0;
export const FLOOR_COLOR = "#000000";

// Fog
export const FOG_COLOR = "#000000";
export const FOG_NEAR = 500;
export const FOG_FAR = 10000;

// Glow
export const GLOW_COLOR = "#ffffff";
export const GLOW_POINTS_PER_EDGE = 40;
