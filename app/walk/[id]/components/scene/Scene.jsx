import {
  Suspense,
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import WallPlane from "./WallPlane";
import FocusClone from "./FocusClone";
import MirrorReflection from "./MirrorReflection";
import GlowBorder from "./GlowBorder";
import {
  CAMERA_START_Z,
  DISPLAY_OFFSET_Z,
  DISPLAY_SCALE,
  FOCUS_DISMISS_DISTANCE,
  FOCUS_FADE_SPEED,
  FOCUS_MIN_SPEED_RATIO,
  VIDEO_FOCUS_MIN_SPEED_RATIO,
  VIDEO_CAMERA_STOP_DIST,
  AUTO_RESPAWN_OFFSET,
  OPACITY_PEAK_DIST,
  FLOOR_Y,
  FLOOR_COLOR,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  BASE_HEIGHT,
  CORRIDOR_HALF,
  OPACITY_APPEAR_DIST,
} from "../lib/constants";

// ─── 동시 텍스처 로딩 제한 ───────────────────────────────────────────────
// 50개 동시 HTTP 요청 → 4개로 제한하여 네트워크/CPU 부하 분산
const MAX_CONCURRENT_LOADS = 30;

export default function Scene({
  planes,
  mediaListLength,
  isPlaying,
  cameraSpeed,
  textureConfig,
  onAutoPlay,
  onTogglePlay,
  onToggleFullscreen,
  onVideoBgmControl,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const dirLightRef = useRef();
  const floorRef = useRef();
  const pLight1Ref = useRef();
  const pLight2Ref = useRef();

  // Texture cache: { [planeId]: { texture, aspectRatio } }
  const textureMap = useRef(new Map());

  // Shared counter for concurrent texture loads (passed to all WallPlanes)
  const activeLoadsRef = useRef(0);

  // Video element registry (populated by WallPlane, used for play/pause control)
  const videoElementMap = useRef(new Map());
  // Video playback state
  const videoPlayState = useRef({
    activePlaneId: null,
    isPlaying: false,
    endedHandler: null,
  });

  // React state for focus mode - drives conditional rendering (mount/unmount)
  const [focusRender, setFocusRender] = useState({
    mode: "idle",
    targetId: null,
  });

  // Previous focus clone: keeps one prior focused image visible after transition
  const [prevFocusRender, setPrevFocusRender] = useState({
    targetId: null,
    cloneZ: 0,
  });

  // Camera & focus state (all in one ref to avoid re-renders)
  const state = useRef({
    cameraZ: CAMERA_START_Z,
    // Focus state machine
    focusMode: "idle", // 'idle' | 'auto' | 'manual'
    targetPlaneId: null,
    fadeProgress: 0,
    // Fixed Z position where clone was spawned (does NOT move with camera)
    focusCloneZ: 0,
    // For manual: the plane flies to camera, so we track its original position
    manualPlaneOriginalPos: null,
    // Display offset used for current manual focus (differs when paused vs playing)
    manualDisplayOffset: DISPLAY_OFFSET_Z,
    // Sequential auto-focus: next mediaIndex to show
    nextAutoMediaIndex: 0,
    // Track if playing was just started
    initialized: false,
    // Asymmetric lerp speed to smooth out velocity jumps on focus transitions
    smoothSpeed: cameraSpeed,
    // Video: prevent duplicate play triggers per focus cycle
    videoTriggered: false,
    // Track if clone was ever within visible range (for backward-scroll dismiss)
    cloneReachedView: false,
  });

  // Fast planeId → mediaType lookup (independent of texture load state)
  const planeMediaTypeMap = useMemo(() => {
    const map = new Map();
    planes.forEach((p) => map.set(p.id, p.mediaType));
    return map;
  }, [planes]);

  // Corridor span for wrapping
  const deepestZ = useMemo(() => {
    if (planes.length === 0) return -1000;
    return Math.min(...planes.map((p) => p.position[2]));
  }, [planes]);

  const shallowestZ = useMemo(() => {
    if (planes.length === 0) return 0;
    return Math.max(...planes.map((p) => p.position[2]));
  }, [planes]);

  const corridorSpan = useMemo(() => {
    if (planes.length === 0) return 1;
    return shallowestZ - deepestZ + 60;
  }, [shallowestZ, deepestZ]);

  // Wrap a Z position so it falls within [cameraZ + buffer, cameraZ + buffer - span]
  // This places each plane at the nearest repeating copy around the camera
  function wrapZ(originalZ, cameraZ) {
    const behindBuffer = 200;
    let delta = cameraZ + behindBuffer - originalZ;
    delta = ((delta % corridorSpan) + corridorSpan) % corridorSpan;
    return cameraZ + behindBuffer - delta;
  }

  // Auto-play trigger: fire once when enough textures are loaded
  const autoPlayFiredRef = useRef(false);

  // Handle texture loaded from WallPlane (4th arg: videoMeta for video planes)
  const handleTextureLoaded = useCallback(
    (planeId, texture, aspectRatio, videoMeta) => {
      textureMap.current.set(planeId, {
        texture,
        aspectRatio,
        isVideo: videoMeta?.isVideo || false,
        videoTexture: videoMeta?.videoTexture || null,
        videoElement: videoMeta?.videoElement || null,
      });

      // 전체 plane의 30% 이상 또는 최소 3개 로딩 완료 시 자동 재생
      if (!autoPlayFiredRef.current && planes.length > 0) {
        const loadedCount = textureMap.current.size;
        const threshold = Math.ceil(planes.length * 0.8);
        if (loadedCount >= threshold) {
          autoPlayFiredRef.current = true;
          onAutoPlay?.();
        }
      }
    },
    [planes.length, onAutoPlay],
  );

  // ─── Video playback control ─────────────────────────────────────────────

  const startVideoPlayback = useCallback((planeId) => {
    console.log(`[Scene] startVideoPlayback called: plane=${planeId}`);
    const texInfo = textureMap.current.get(planeId);
    if (!texInfo?.isVideo || !texInfo.videoElement) {
      console.warn(`[Scene] startVideoPlayback BAIL: no video for plane ${planeId}`, {
        hasTexInfo: !!texInfo,
        isVideo: texInfo?.isVideo,
        hasElement: !!texInfo?.videoElement,
      });
      return;
    }

    const video = texInfo.videoElement;

    // Guard: video element may have been disposed (far-distance cleanup)
    if (!video.src || video.readyState === 0) {
      console.warn(`[Scene] startVideoPlayback BAIL: disposed/unready plane=${planeId}`, {
        src: video.src?.substring(0, 60),
        readyState: video.readyState,
      });
      return;
    }

    console.log(`[Scene] startVideoPlayback: video OK plane=${planeId}`, {
      src: video.src.substring(0, 80),
      readyState: video.readyState,
      duration: video.duration,
      paused: video.paused,
    });

    const vps = videoPlayState.current;

    // Stop any currently playing video first
    if (vps.activePlaneId != null && vps.activePlaneId !== planeId) {
      stopVideoPlayback(vps.activePlaneId);
    }

    video.currentTime = 0;
    vps.activePlaneId = planeId;
    vps.isPlaying = true;

    // Default ended handler: cleans up vps state for manual/prev videos.
    // Auto-focus code will replace this with its own dismiss+advance handler.
    const defaultOnEnded = () => {
      console.log(`[Scene] Video ended (defaultOnEnded): plane=${planeId}`);
      video.removeEventListener("ended", defaultOnEnded);
      if (vps.endedHandler === defaultOnEnded) {
        vps.endedHandler = null;
      }
      vps.activePlaneId = null;
      vps.isPlaying = false;
      onVideoBgmControl?.(false);
    };

    // Remove any existing handler before registering new one
    if (vps.endedHandler) {
      video.removeEventListener("ended", vps.endedHandler);
    }
    video.addEventListener("ended", defaultOnEnded);
    vps.endedHandler = defaultOnEnded;

    // Try unmuted first; if browser blocks (autoplay policy), fall back to muted
    video.muted = false;
    const p = video.play();
    if (p) {
      p.then(() => {
        console.log(`[Scene] ✓ Video playing (unmuted) plane=${planeId}`);
        onVideoBgmControl?.(true);
      }).catch((err) => {
        console.warn(`[Scene] Unmuted play rejected (plane=${planeId}):`, err.message);
        // Autoplay with audio rejected — retry muted (visual-only)
        video.muted = true;
        video.play().then(() => {
          console.log(`[Scene] ✓ Video playing (muted) plane=${planeId}`);
          onVideoBgmControl?.(true);
        }).catch((err2) => {
          console.error(`[Scene] ✗ Muted play ALSO failed (plane=${planeId}):`, err2.message);
          // Both attempts failed — clean up
          video.removeEventListener("ended", defaultOnEnded);
          if (vps.endedHandler === defaultOnEnded) {
            vps.endedHandler = null;
          }
          vps.activePlaneId = null;
          vps.isPlaying = false;
        });
      });
    }
  }, [onVideoBgmControl]);

  const stopVideoPlayback = useCallback((planeId) => {
    const texInfo = textureMap.current.get(planeId);
    if (!texInfo?.isVideo || !texInfo.videoElement) return;

    const video = texInfo.videoElement;
    video.pause();
    video.muted = true;
    onVideoBgmControl?.(false);

    const vps = videoPlayState.current;
    if (vps.activePlaneId === planeId) {
      // Remove ended listener if any
      if (vps.endedHandler) {
        video.removeEventListener("ended", vps.endedHandler);
        vps.endedHandler = null;
      }
      vps.activePlaneId = null;
      vps.isPlaying = false;
    }
  }, [onVideoBgmControl]);

  // Pause video but keep activePlaneId so texture still shows the paused frame
  const pauseVideoPlayback = useCallback((planeId) => {
    const texInfo = textureMap.current.get(planeId);
    if (!texInfo?.isVideo || !texInfo.videoElement) return;

    texInfo.videoElement.pause();
    onVideoBgmControl?.(false);

    const vps = videoPlayState.current;
    if (vps.activePlaneId === planeId) {
      vps.isPlaying = false;
      // Keep activePlaneId and endedHandler intact so texture stays on video frame
    }
  }, [onVideoBgmControl]);

  // Resume video from current position (no currentTime reset)
  const resumeVideoPlayback = useCallback((planeId) => {
    const texInfo = textureMap.current.get(planeId);
    if (!texInfo?.isVideo || !texInfo.videoElement) return;

    const video = texInfo.videoElement;
    if (!video.src || video.readyState === 0) return;

    const vps = videoPlayState.current;
    vps.activePlaneId = planeId;
    vps.isPlaying = true;

    video.muted = false;
    const p = video.play();
    if (p) {
      p.then(() => {
        onVideoBgmControl?.(true);
      }).catch(() => {
        video.muted = true;
        video.play().then(() => {
          onVideoBgmControl?.(true);
        }).catch(() => {
          vps.isPlaying = false;
        });
      });
    }
  }, [onVideoBgmControl]);

  // Handle plane click for manual focus (works both playing and paused)
  const handlePlaneClick = useCallback(
    (planeId) => {
      const s = state.current;
      const plane = planes.find((p) => p.id === planeId);
      if (!plane) return;

      // Already focused on this plane — toggle video or do nothing (never re-focus)
      if (s.focusMode === "manual" && s.targetPlaneId === planeId) {
        const texInfo = textureMap.current.get(planeId);
        console.log(`[Scene] Manual toggle click: plane=${planeId}`, {
          isVideo: texInfo?.isVideo,
          hasElement: !!texInfo?.videoElement,
          paused: texInfo?.videoElement?.paused,
          ended: texInfo?.videoElement?.ended,
        });
        if (texInfo?.isVideo && texInfo.videoElement) {
          const vid = texInfo.videoElement;
          if (!vid.paused) {
            // Playing → pause (keep showing current frame)
            pauseVideoPlayback(planeId);
          } else if (vid.ended || vid.currentTime === 0) {
            // Never played or ended → start from beginning
            startVideoPlayback(planeId);
          } else {
            // Paused mid-play → resume from current position
            resumeVideoPlayback(planeId);
          }
        }
        // Always return — don't re-focus the same plane
        return;
      }

      // Only allow clicking planes ahead of camera (use wrapped position)
      const wrappedPZ = wrapZ(plane.position[2], s.cameraZ);
      if (wrappedPZ >= s.cameraZ) return;

      // Land at OPACITY_PEAK_DIST so the plane arrives fully visible (opacity=1.0)
      const offset = OPACITY_PEAK_DIST;

      // Stop any playing video before switching focus
      if (videoPlayState.current.isPlaying) {
        stopVideoPlayback(videoPlayState.current.activePlaneId);
      }

      // Switch to manual mode
      s.focusMode = "manual";
      s.targetPlaneId = planeId;
      s.fadeProgress = 0;
      s.focusCloneZ = s.cameraZ - offset;
      s.manualDisplayOffset = offset;
      s.manualPlaneOriginalPos = [
        plane.position[0],
        plane.position[1],
        wrappedPZ,
      ];
      s.videoTriggered = false;
      s.cloneReachedView = false;
      setFocusRender({ mode: "manual", targetId: planeId });
    },
    [planes, corridorSpan, startVideoPlayback, stopVideoPlayback, pauseVideoPlayback, resumeVideoPlayback],
  );

  // Pick the next plane in album order for auto focus (sequential, wraps around)
  function pickAutoTarget(s) {
    if (!mediaListLength) return null;

    // Try each mediaIndex starting from nextAutoMediaIndex (full cycle)
    for (let attempt = 0; attempt < mediaListLength; attempt++) {
      const targetIdx = (s.nextAutoMediaIndex + attempt) % mediaListLength;

      // Find the closest loaded plane ahead of camera with this mediaIndex
      let best = null;
      let bestDz = Infinity;
      for (const p of planes) {
        if (p.mediaIndex !== targetIdx) continue;
        if (!textureMap.current.has(p.id)) continue;
        const wrappedPZ = wrapZ(p.position[2], s.cameraZ);
        const dz = s.cameraZ - wrappedPZ;
        if (dz > 0 && dz < bestDz) {
          best = p;
          bestDz = dz;
        }
      }

      if (best) {
        s.nextAutoMediaIndex = (targetIdx + 1) % mediaListLength;
        return best;
      }
    }

    return null; // All textures still loading
  }

  // Reset when play starts
  if (isPlaying && !state.current.initialized) {
    state.current = {
      cameraZ: CAMERA_START_Z,
      focusMode: "idle",
      targetPlaneId: null,
      fadeProgress: 0,
      focusCloneZ: 0,
      manualPlaneOriginalPos: null,
      manualDisplayOffset: DISPLAY_OFFSET_Z,
      nextAutoMediaIndex: 0,
      initialized: true,
      smoothSpeed: cameraSpeed,
      videoTriggered: false,
      cloneReachedView: false,
    };
    camera.position.set(0, 0, CAMERA_START_Z);
  }

  // Note: focus state is intentionally preserved when paused so the focused
  // plane stays visible. The camera simply stops moving.

  // Manual movement refs (used when paused and playing)
  const manualVelocityRef = useRef(0);
  const keysRef = useRef({ fwd: false, back: false });
  const touchRef = useRef({ active: false, lastY: 0, startY: 0, scrolling: false });

  // Pinch zoom refs
  const pinchRef = useRef({ active: false, initialDist: 0, initialFov: 80 });
  const targetFovRef = useRef(80);
  const fovRecoveryTimerRef = useRef(null);

  // Event listeners for manual movement (always active — works both playing and paused)
  useEffect(() => {
    const getTouchDistance = (t1, t2) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const clampFov = (v) => Math.max(30, Math.min(120, v));

    const onWheel = (e) => {
      // Desktop trackpad pinch: ctrlKey + wheel
      if (e.ctrlKey) {
        e.preventDefault();
        pinchRef.current.active = true;
        targetFovRef.current = clampFov(camera.fov + e.deltaY * 1.2);
        // Recovery: after 500ms of no pinch input, restore FOV + resume camera
        if (fovRecoveryTimerRef.current) clearTimeout(fovRecoveryTimerRef.current);
        fovRecoveryTimerRef.current = setTimeout(() => {
          targetFovRef.current = 80;
          pinchRef.current.active = false;
        }, 500);
        return;
      }
      manualVelocityRef.current += e.deltaY * 0.8;
    };
    const onKeyDown = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) keysRef.current.fwd = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) keysRef.current.back = true;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        onTogglePlay?.();
      }
      if (e.key === "f" || e.key === "F") {
        onToggleFullscreen?.();
      }
      // Any key press recovers FOV if not pinching
      if (!pinchRef.current.active && targetFovRef.current !== 80) {
        targetFovRef.current = 80;
      }
    };
    const onKeyUp = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) keysRef.current.fwd = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) keysRef.current.back = false;
    };
    const TOUCH_DEAD_ZONE = 8; // px — ignore movement below this threshold (prevents taps from scrolling)
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          active: true,
          initialDist: getTouchDistance(e.touches[0], e.touches[1]),
          initialFov: camera.fov,
        };
        touchRef.current.active = false;
        touchRef.current.scrolling = false;
      } else if (e.touches.length === 1) {
        const y = e.touches[0].clientY;
        touchRef.current = { active: true, lastY: y, startY: y, scrolling: false };
      }
    };
    const onTouchMove = (e) => {
      if (pinchRef.current.active && e.touches.length === 2) {
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = currentDist / pinchRef.current.initialDist;
        targetFovRef.current = clampFov(pinchRef.current.initialFov / scale);
        return;
      }
      if (!touchRef.current.active || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      // Dead zone: only start scrolling after finger moves beyond threshold
      if (!touchRef.current.scrolling) {
        if (Math.abs(currentY - touchRef.current.startY) < TOUCH_DEAD_ZONE) return;
        touchRef.current.scrolling = true;
        touchRef.current.lastY = currentY; // reset baseline to current position
      }
      const deltaY = touchRef.current.lastY - currentY;
      manualVelocityRef.current += deltaY * 3;
      touchRef.current.lastY = currentY;
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchRef.current.active = false;
        targetFovRef.current = 80;
      }
      if (e.touches.length === 0) {
        touchRef.current.active = false;
        touchRef.current.scrolling = false;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (fovRecoveryTimerRef.current) clearTimeout(fovRecoveryTimerRef.current);
    };
  }, [onTogglePlay, onToggleFullscreen, camera]);

  // Stop video playback when paused or unmounted
  useEffect(() => {
    if (!isPlaying) {
      const vps = videoPlayState.current;
      if (vps.isPlaying && vps.activePlaneId != null) {
        stopVideoPlayback(vps.activePlaneId);
      }
    }
  }, [isPlaying, stopVideoPlayback]);

  // OrbitControls always disabled — play/pause only controls camera movement
  if (controlsRef.current) {
    controlsRef.current.enabled = false;
  }

  useFrame((_, delta) => {
    const s = state.current;

    // FOV animation (pinch zoom smooth interpolation)
    if (Math.abs(camera.fov - targetFovRef.current) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFovRef.current, 0.1);
      camera.updateProjectionMatrix();
    }

    if (!isPlaying) {
      // Manual movement while paused
      const MANUAL_KEY_SPEED = 200;
      if (keysRef.current.fwd) s.cameraZ -= MANUAL_KEY_SPEED * delta;
      if (keysRef.current.back) s.cameraZ += MANUAL_KEY_SPEED * delta;

      if (Math.abs(manualVelocityRef.current) > 0.5) {
        s.cameraZ -= manualVelocityRef.current * delta;
        manualVelocityRef.current *= Math.pow(0.005, delta);
      } else {
        manualVelocityRef.current = 0;
      }
      camera.position.z = s.cameraZ;

      // Update floor and lights imperatively every frame (no React re-render needed)
      if (floorRef.current) floorRef.current.position.z = s.cameraZ - 4000;
      if (pLight1Ref.current)
        pLight1Ref.current.position.set(
          -CORRIDOR_HALF - 50,
          50,
          s.cameraZ - 400,
        );
      if (pLight2Ref.current)
        pLight2Ref.current.position.set(
          CORRIDOR_HALF + 50,
          50,
          s.cameraZ - 400,
        );

      // Force-dismiss manual focus when camera scrolls past/away while paused
      if (s.focusMode === "manual" && s.focusCloneZ !== 0) {
        const distToClone = Math.abs(s.cameraZ - s.focusCloneZ);
        if (distToClone <= OPACITY_APPEAR_DIST) {
          s.cloneReachedView = true;
        }
        const cameraPastClone = s.cameraZ < s.focusCloneZ;
        const cloneOutOfView = s.cloneReachedView && distToClone > OPACITY_APPEAR_DIST;
        if (cameraPastClone || cloneOutOfView) {
          const vps = videoPlayState.current;
          if (vps.isPlaying && vps.activePlaneId === s.targetPlaneId) {
            stopVideoPlayback(s.targetPlaneId);
          }
          s.focusMode = "idle";
          s.targetPlaneId = null;
          s.fadeProgress = 0;
          s.focusCloneZ = 0;
          s.manualPlaneOriginalPos = null;
          s.videoTriggered = false;
          setFocusRender({ mode: "idle", targetId: null });
        }
      }

      return;
    }

    // 1. Camera always advances (decelerate during focus cycles)
    // Pause auto-advance during pinch zoom
    if (!pinchRef.current.active) {
      let targetEffectiveSpeed = cameraSpeed;
      if (s.focusMode === "auto" || s.focusMode === "manual") {
        const distToClone = Math.abs(s.cameraZ - s.focusCloneZ);
        const focusRange = DISPLAY_OFFSET_Z - FOCUS_DISMISS_DISTANCE;
        const t =
          1 -
          Math.max(
            0,
            Math.min(1, (distToClone - FOCUS_DISMISS_DISTANCE) / focusRange),
          );
        // Only fully stop camera when a video is actively playing on the focused plane.
        // If video finished, paused, or failed to load, use normal deceleration.
        const vpsRef = videoPlayState.current;
        const isActiveVideoPlaying =
          s.focusMode === "auto"
          && planeMediaTypeMap.get(s.targetPlaneId) === "video"
          && vpsRef.isPlaying
          && vpsRef.activePlaneId === s.targetPlaneId;
        if (isActiveVideoPlaying) {
          // Video playing → creep toward VIDEO_CAMERA_STOP_DIST, then full stop
          if (distToClone > VIDEO_CAMERA_STOP_DIST) {
            const remainRatio = (distToClone - VIDEO_CAMERA_STOP_DIST)
                              / (OPACITY_PEAK_DIST - VIDEO_CAMERA_STOP_DIST);
            targetEffectiveSpeed = cameraSpeed * 0.1 * remainRatio;
          } else {
            targetEffectiveSpeed = 0;
          }
        } else {
          targetEffectiveSpeed =
            cameraSpeed * (1.0 - (1.0 - FOCUS_MIN_SPEED_RATIO) * t);
        }
      }
      // 비대칭 스무딩: 감속은 빠르게(k=6), 가속은 천천히(k=2)
      const k = targetEffectiveSpeed < s.smoothSpeed ? 6 : 2;
      s.smoothSpeed +=
        (targetEffectiveSpeed - s.smoothSpeed) *
        (1 - Math.pow(0.01, delta * k));
      s.cameraZ -= s.smoothSpeed * delta;
    }

    // Manual input while playing (additive to auto-advance)
    if (keysRef.current.fwd) s.cameraZ -= 150 * delta;
    if (keysRef.current.back) s.cameraZ += 150 * delta;
    if (Math.abs(manualVelocityRef.current) > 0.5) {
      s.cameraZ -= manualVelocityRef.current * delta;
      manualVelocityRef.current *= Math.pow(0.005, delta);
    } else {
      manualVelocityRef.current = 0;
    }

    camera.position.z = s.cameraZ;

    // Update floor and lights imperatively every frame (no React re-render needed)
    if (floorRef.current) floorRef.current.position.z = s.cameraZ - 4000;
    if (pLight1Ref.current)
      pLight1Ref.current.position.set(-CORRIDOR_HALF, 50, s.cameraZ - 400);
    if (pLight2Ref.current)
      pLight2Ref.current.position.set(CORRIDOR_HALF, 50, s.cameraZ - 400);

    // 2a. Auto-stop prev focus video when it's out of view range
    if (prevFocusRender.targetId != null) {
      const prevDist = Math.abs(s.cameraZ - prevFocusRender.cloneZ);
      if (prevDist >= OPACITY_APPEAR_DIST) {
        const vps = videoPlayState.current;
        if (vps.isPlaying && vps.activePlaneId === prevFocusRender.targetId) {
          stopVideoPlayback(prevFocusRender.targetId);
        }
      }
    }

    // 2. Focus state machine
    if (s.focusMode === "idle") {
      // Pick new auto target
      const target = pickAutoTarget(s);
      if (target) {
        s.focusMode = "auto";
        s.targetPlaneId = target.id;
        s.fadeProgress = 0;
        s.focusCloneZ = s.cameraZ - DISPLAY_OFFSET_Z;
        s.videoTriggered = false;
        s.cloneReachedView = false;
        setFocusRender({ mode: "auto", targetId: target.id });
      }
    } else if (s.focusMode === "auto" || s.focusMode === "manual") {
      // Update fade progress
      s.fadeProgress = Math.min(1, s.fadeProgress + FOCUS_FADE_SPEED * delta);

      // Dismiss when camera approaches the clone's fixed position
      const distToClone = Math.abs(s.cameraZ - s.focusCloneZ);

      // Track whether the clone ever entered visible range
      if (distToClone <= OPACITY_APPEAR_DIST) {
        s.cloneReachedView = true;
      }

      // Video trigger: start playback when close enough (auto-focus only)
      if (!s.videoTriggered && distToClone <= OPACITY_PEAK_DIST) {
        const currentTexInfo = s.targetPlaneId != null ? textureMap.current.get(s.targetPlaneId) : null;
        if (currentTexInfo?.isVideo) {
          s.videoTriggered = true;
          console.log(`[Scene] Video trigger: mode=${s.focusMode} plane=${s.targetPlaneId} dist=${distToClone.toFixed(1)}`);
          if (s.focusMode === "auto") {
            // Capture planeId at registration time (s.targetPlaneId may change later)
            const capturedPlaneId = s.targetPlaneId;
            const capturedCloneZ = s.focusCloneZ;
            // Auto-focus video: start playback + register ended handler
            startVideoPlayback(capturedPlaneId);
            const video = currentTexInfo.videoElement;
            if (video) {
              // Replace the default ended handler (from startVideoPlayback)
              // with auto-focus specific dismiss+advance handler
              const vpsInner = videoPlayState.current;
              if (vpsInner.endedHandler) {
                video.removeEventListener("ended", vpsInner.endedHandler);
              }
              const onEnded = () => {
                console.log(`[Scene] Auto-focus video ended: plane=${capturedPlaneId}`);
                video.removeEventListener("ended", onEnded);
                vpsInner.endedHandler = null;
                stopVideoPlayback(capturedPlaneId);
                // Only dismiss if still focused on this plane
                if (s.targetPlaneId !== capturedPlaneId) return;
                // Dismiss: save as prev and pick next
                setPrevFocusRender({
                  targetId: capturedPlaneId,
                  cloneZ: capturedCloneZ,
                });
                s.focusMode = "idle";
                s.targetPlaneId = null;
                s.fadeProgress = 0;
                s.focusCloneZ = 0;
                s.manualPlaneOriginalPos = null;
                s.videoTriggered = false;

                const next = pickAutoTarget(s);
                if (next) {
                  s.focusMode = "auto";
                  s.targetPlaneId = next.id;
                  s.fadeProgress = 0;
                  s.focusCloneZ = s.cameraZ - AUTO_RESPAWN_OFFSET;
                  s.videoTriggered = false;
                  s.cloneReachedView = false;
                  setFocusRender({ mode: "auto", targetId: next.id });
                } else {
                  setFocusRender({ mode: "idle", targetId: null });
                }
              };
              video.addEventListener("ended", onEnded);
              vpsInner.endedHandler = onEnded;
            }
          }
          // Manual focus: don't auto-play, wait for click toggle
        }
      }

      // Force-dismiss: camera passed clone or clone scrolled out of view
      const vps = videoPlayState.current;
      const cameraPastClone = s.cameraZ < s.focusCloneZ;
      const cloneOutOfView = s.cloneReachedView && distToClone > OPACITY_APPEAR_DIST;

      if (cameraPastClone || cloneOutOfView) {
        // Stop video if playing
        if (vps.isPlaying && vps.activePlaneId === s.targetPlaneId) {
          stopVideoPlayback(s.targetPlaneId);
        }

        // Save current focus as previous (only for auto mode with valid target)
        if (s.focusMode === "auto" && s.targetPlaneId != null) {
          setPrevFocusRender({
            targetId: s.targetPlaneId,
            cloneZ: s.focusCloneZ,
          });
        }

        const wasAuto = s.focusMode === "auto";

        // Dismiss
        s.focusMode = "idle";
        s.targetPlaneId = null;
        s.fadeProgress = 0;
        s.focusCloneZ = 0;
        s.manualPlaneOriginalPos = null;
        s.videoTriggered = false;

        if (wasAuto) {
          // Auto: pick next target to maintain sequence
          const next = pickAutoTarget(s);
          if (next) {
            s.focusMode = "auto";
            s.targetPlaneId = next.id;
            s.fadeProgress = 0;
            s.focusCloneZ = s.cameraZ - AUTO_RESPAWN_OFFSET;
            s.videoTriggered = false;
            s.cloneReachedView = false;
            setFocusRender({ mode: "auto", targetId: next.id });
          } else {
            setFocusRender({ mode: "idle", targetId: null });
          }
        } else {
          // Manual: just go idle
          setFocusRender({ mode: "idle", targetId: null });
        }
      } else if (distToClone < FOCUS_DISMISS_DISTANCE) {
        // Normal distance-based dismiss (not during auto video playback)
        const isAutoVideoPlaying = s.focusMode === "auto" && vps.isPlaying && vps.activePlaneId === s.targetPlaneId;
        if (isAutoVideoPlaying) {
          // Skip — ended event handles dismiss
        } else {
          // Stop video if playing during dismiss
          if (vps.isPlaying && vps.activePlaneId === s.targetPlaneId) {
            stopVideoPlayback(s.targetPlaneId);
          }

          // Save current focus as previous (only for auto mode with valid target)
          if (s.focusMode === "auto" && s.targetPlaneId != null) {
            setPrevFocusRender({
              targetId: s.targetPlaneId,
              cloneZ: s.focusCloneZ,
            });
          }

          // Dismiss
          s.focusMode = "idle";
          s.targetPlaneId = null;
          s.fadeProgress = 0;
          s.focusCloneZ = 0;
          s.manualPlaneOriginalPos = null;
          s.videoTriggered = false;

          // Immediately pick next auto
          const next = pickAutoTarget(s);
          if (next) {
            s.focusMode = "auto";
            s.targetPlaneId = next.id;
            s.fadeProgress = 0;
            s.focusCloneZ = s.cameraZ - AUTO_RESPAWN_OFFSET;
            s.videoTriggered = false;
            s.cloneReachedView = false;
            setFocusRender({ mode: "auto", targetId: next.id });
          } else {
            setFocusRender({ mode: "idle", targetId: null });
          }
        }
      }
    }
  });

  // Get current focus info for rendering (use focusRender React state)
  const camZ = state.current.cameraZ;
  // focusCloneZ: snapshot at render time so that the OUTGOING FocusClone/MirrorReflection
  // keep their original spawn position instead of reading the newly mutated stateRef value.
  const focusCloneZ = state.current.focusCloneZ;

  const focusPlane =
    focusRender.targetId !== null
      ? planes.find((p) => p.id === focusRender.targetId)
      : null;
  const focusTexInfo =
    focusRender.targetId !== null
      ? textureMap.current.get(focusRender.targetId)
      : null;

  // Compute wrapped position for focused plane's GlowBorder
  const focusPlaneWrappedPos = focusPlane
    ? [
        focusPlane.position[0],
        focusPlane.position[1],
        wrapZ(focusPlane.position[2], camZ),
      ]
    : null;

  // Previous focus clone data
  const prevFocusPlane =
    prevFocusRender.targetId !== null
      ? planes.find((p) => p.id === prevFocusRender.targetId)
      : null;
  const prevFocusTexInfo =
    prevFocusRender.targetId !== null
      ? textureMap.current.get(prevFocusRender.targetId)
      : null;

  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight ref={dirLightRef} intensity={0.4} />
      {/* Point lights: follow camera ahead+sides — decay=1 (linear) for visible Phong specular */}
      {/* <pointLight
        ref={pLight1Ref}
        position={[-200, 100, -400]}
        intensity={100}
        distance={1500}
        decay={0.5}
        color="#ffdfcb"
      />
      <pointLight
        ref={pLight2Ref}
        position={[200, 100, -400]}
        intensity={100}
        distance={1500}
        decay={0.5}
        color="#ffdfcb"
      /> */}

      {/* Floor - follows camera via useFrame (initial Z is a placeholder) */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, CAMERA_START_Z - 4000]}
      >
        <planeGeometry args={[400, 10000]} />
        <meshBasicMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* Wall Planes - Z-wrapping is handled imperatively inside each WallPlane.useFrame */}
      {planes.map((p) => {
        // "auto" → wall stays, FocusClone shows; "manual" → plane flies to camera
        const focusMode =
          focusRender.targetId === p.id
            ? focusRender.mode // "auto" or "manual"
            : "none";

        return (
          <Suspense key={p.id} fallback={null}>
            <WallPlane
              id={p.id}
              imageUrl={p.imageUrl}
              thumbnailUrl={p.thumbnailUrl}
              position={p.position}
              rotation={p.rotation}
              baseHeight={p.baseHeight}
              sign={p.sign}
              focusMode={focusMode}
              onClick={handlePlaneClick}
              onTextureLoaded={handleTextureLoaded}
              displayScale={DISPLAY_SCALE}
              stateRef={state}
              corridorSpan={corridorSpan}
              activeLoadsRef={activeLoadsRef}
              maxConcurrentLoads={MAX_CONCURRENT_LOADS}
              maxTextureSize={textureConfig.maxTextureSize}
              anisotropy={textureConfig.anisotropy}
              mediaType={p.mediaType}
              videoElementMap={videoElementMap}
            />
          </Suspense>
        );
      })}

      {/* Auto Focus: Clone + Mirror + GlowBorder */}
      {focusRender.mode === "auto" && focusTexInfo && focusPlane && (
        <>
          <FocusClone
            texture={focusTexInfo.texture}
            aspectRatio={focusTexInfo.aspectRatio}
            baseHeight={focusPlane.baseHeight}
            cameraY={camera.position.y}
            stateRef={state}
            displayScale={DISPLAY_SCALE}
            cloneZ={focusCloneZ}
            isVideo={focusTexInfo.isVideo}
            videoTexture={focusTexInfo.videoTexture}
            videoPlayStateRef={videoPlayState}
            planeId={focusRender.targetId}
            onClick={focusTexInfo.isVideo ? () => {
              const texInfo = textureMap.current.get(focusRender.targetId);
              if (!texInfo?.isVideo || !texInfo.videoElement) return;
              const vid = texInfo.videoElement;
              const pid = focusRender.targetId;
              if (!vid.paused) {
                pauseVideoPlayback(pid);
              } else if (vid.ended || vid.currentTime === 0) {
                startVideoPlayback(pid);
              } else {
                resumeVideoPlayback(pid);
              }
            } : undefined}
          />
          <MirrorReflection
            texture={focusTexInfo.texture}
            aspectRatio={focusTexInfo.aspectRatio}
            baseHeight={focusPlane.baseHeight}
            stateRef={state}
            displayScale={DISPLAY_SCALE}
            cloneZ={focusCloneZ}
          />
          {/* <GlowBorder
            position={focusPlaneWrappedPos}
            rotation={focusPlane.rotation}
            sign={focusPlane.sign}
            width={focusPlane.baseHeight * (focusTexInfo.aspectRatio || 1)}
            height={focusPlane.baseHeight}
            stateRef={state}
          /> */}
        </>
      )}

      {/* Previous focus clone (stays at its original position, distance-based opacity handles visibility) */}
      {prevFocusRender.targetId != null && prevFocusTexInfo && prevFocusPlane && (
        <FocusClone
          texture={prevFocusTexInfo.texture}
          aspectRatio={prevFocusTexInfo.aspectRatio}
          baseHeight={prevFocusPlane.baseHeight}
          cameraY={camera.position.y}
          stateRef={state}
          displayScale={DISPLAY_SCALE}
          cloneZ={prevFocusRender.cloneZ}
          isVideo={prevFocusTexInfo.isVideo}
          videoTexture={prevFocusTexInfo.videoTexture}
          videoPlayStateRef={videoPlayState}
          planeId={prevFocusRender.targetId}
          onClick={prevFocusTexInfo.isVideo ? () => {
            const texInfo = textureMap.current.get(prevFocusRender.targetId);
            if (!texInfo?.isVideo || !texInfo.videoElement) return;
            if (texInfo.videoElement.paused) {
              startVideoPlayback(prevFocusRender.targetId);
            } else {
              stopVideoPlayback(prevFocusRender.targetId);
            }
          } : undefined}
        />
      )}

      {/* Manual Focus: WallPlane itself flies to camera (no FocusClone needed) */}
      {/* Mirror reflection for manual focus */}
      {focusRender.mode === "manual" && focusTexInfo && focusPlane && (
        <MirrorReflection
          texture={focusTexInfo.texture}
          aspectRatio={focusTexInfo.aspectRatio}
          baseHeight={focusPlane.baseHeight}
          stateRef={state}
          displayScale={DISPLAY_SCALE}
          cloneZ={focusCloneZ}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        target={[0, 0, -200]}
        minDistance={10}
        maxDistance={14000}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}
