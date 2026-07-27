// Asset paths
export const VHS_BACKGROUND = "/vhs/vhs-gallery-background-desktop.png";
export const VHS_TAPE_IMAGE = "/vhs/vhs-tape-detail-no-title-desktop.png";
export const VHS_TAPE_IMAGE_MOBILE =
  "/vhs/vhs-tape-detail-no-title-mobile-portrait.png";
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
  left: 0.155,
  top: 0.08,
  width: 0.56,
  height: 0.8,
  borderRadius: "0%",
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
// Desktop tape (1920×1081): text-safe zone strictly inside the label paper's
// blank area — paper spans x≈755–1180, y≈447–695; writable band sits below
// the top ornament line (~y500) and above the middle ruled line (~y617),
// which reads as an underline beneath the text.
export const TAPE_LABEL = {
  left: 0.405,
  top: 0.46,
  width: 0.2,
  height: 0.11,
};

// Mobile portrait tape (941×1672): label text-safe zone (% of image).
// Strictly inside the paper's blank area — below the top ornament (~y790),
// above the printed "THE LIFE GALLERY" (~y922); the thin ruled line at ~y885
// reads as an underline beneath the text.
export const TAPE_LABEL_MOBILE = {
  left: 0.329,
  top: 0.476,
  width: 0.351,
  height: 0.072,
};

// Intro overlay layout (% of rendered tape image) per orientation.
// Mobile portrait: lifestory sits in the empty space above the tape
// (tape top ≈ 0.353), play button below it (tape bottom ≈ 0.643).
export const TAPE_INTRO_LAYOUT = {
  desktop: {
    storyLeft: 0.25,
    storyTop: 0.05,
    storyWidth: 0.5,
    // Tape shell top edge ≈ y0.26 of the image — cap the story block so a
    // max-length lifestory (250자) can never reach the tape body.
    storyMaxHeight: 0.195,
    btnTop: 0.88,
  },
  mobile: {
    storyLeft: 0.14,
    storyTop: 0.11,
    storyWidth: 0.72,
    storyMaxHeight: 0.22,
    btnTop: 0.72,
  },
};

// Image display duration options
export const IMAGE_DURATION_OPTIONS = [
  { label: "1초", value: 1 },
  { label: "3초", value: 3 },
  { label: "5초", value: 5 },
  { label: "10초", value: 10 },
];
export const DEFAULT_IMAGE_DURATION = 3;

// Video playback mode options (0 = full playback)
export const VIDEO_MODE_OPTIONS = [
  { label: "전체 재생", value: 0 },
  { label: "짧게 3초", value: 3 },
  { label: "짧게 5초", value: 5 },
  { label: "짧게 10초", value: 10 },
];
export const DEFAULT_VIDEO_MODE = 10;

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
export const DEFAULT_TRANSITION = "kenburns";
