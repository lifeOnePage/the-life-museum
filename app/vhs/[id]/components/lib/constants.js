// Asset paths
export const VHS_BACKGROUND = "/vhs/vhs-gallery-background-desktop.png";
export const VHS_TAPE_IMAGE = "/vhs/vhs-tape-detail-no-title-desktop.png";
export const INSERT_VIDEO_SRC = "/vhs/tv-vhs-insert-animation.mp4";
export const TV_OFF_IMAGE = "/vhs/tv-off-desktop.png";
export const TV_PLAYBACK_FRAME = "/vhs/tv-room-desktop.png";
export const PHOTO_FRAME_CLOSEUP = "/vhs/empty-frame-desktop.png";
export const STATIC_VIDEO_SRC = "/vhs/tv-static-loop.mp4";
export const TV_CLOSEUP_IMAGE =
  "/vhs/tv-closeup-transparent-screen-desktop.png";

// Scene transition timing (ms)
export const TV_OFF_DURATION_MS = 1000;
export const STATIC_DURATION_MS = 2000;
export const CROSSFADE_DURATION_MS = 600;
export const CONTROLS_IDLE_TIMEOUT_MS = 3000;

// TV screen viewport coordinates (% of tv-playback frame image)
export const TV_SCREEN = {
  left: 0.3,
  top: 0.18,
  width: 0.35,
  height: 0.46,
  borderRadius: "2.5%",
};

// Photo frame clickable area in tv-room-desktop.png (% of frame image)
export const PHOTO_FRAME = {
  left: 0.763,
  top: 0.285,
  width: 0.101,
  height: 0.162,
};

// Photo frame inner image area in tv-room-desktop.png (% of frame image)
// DEBUG: red border is active in TVScene.jsx — remove after tuning
export const PHOTO_FRAME_INNER = {
  left: 0.783,
  top: 0.54,
  width: 0.11,
  height: 0.12,
};

// Photo display area inside empty-frame-desktop.png (% of closeup image)
export const PHOTO_FRAME_CLOSEUP_VIEWPORT = {
  left: 0.275,
  top: 0.065,
  width: 0.45,
  height: 0.635,
  borderRadius: "1%",
};

// TV closeup screen viewport coordinates (% of tv-closeup image, 1920x1280)
export const TV_CLOSEUP_SCREEN = {
  left: 0.13,
  top: 0.08,
  width: 0.6,
  height: 0.66,
  borderRadius: "2%",
};

// TV closeup knob positions (% of tv-closeup image)
export const TV_KNOB_UPPER = {
  centerX: 0.81,
  centerY: 0.19,
  radius: 0.04,
};

export const TV_KNOB_LOWER = {
  centerX: 0.81,
  centerY: 0.34,
  radius: 0.04,
};

// VHS tape label coordinates (% of tape image)
export const TAPE_LABEL = {
  left: 0.33,
  top: 0.3,
  width: 0.34,
  height: 0.35,
};

// Image display duration options
export const IMAGE_DURATION_OPTIONS = [
  { label: "1초", value: 1 },
  { label: "3초", value: 3 },
  { label: "5초", value: 5 },
  { label: "10초", value: 10 },
];
export const DEFAULT_IMAGE_DURATION = 5;

// Video playback mode options (0 = full playback)
export const VIDEO_MODE_OPTIONS = [
  { label: "전체 재생", value: 0 },
  { label: "짧게 3초", value: 3 },
  { label: "짧게 5초", value: 5 },
  { label: "짧게 10초", value: 10 },
];
export const DEFAULT_VIDEO_MODE = 0;

// Color filter options
export const FILTER_OPTIONS = [
  { label: "없음", value: "none" },
  { label: "세피아", value: "sepia" },
];
export const DEFAULT_FILTER = "none";

export const FILTER_OVERLAYS = {
  none: null,
  sepia: "rgba(140, 66, 20, 0.6)",
};

// Transition style options
export const TRANSITION_OPTIONS = [
  { label: "페이드", value: "fade" },
  { label: "켄번", value: "kenburns" },
];
export const DEFAULT_TRANSITION = "fade";
