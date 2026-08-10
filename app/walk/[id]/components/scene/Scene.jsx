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
import CenterSlideshow from "./CenterSlideshow";
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
  TOUCH_SCROLL_SENSITIVITY,
} from "../lib/constants";

// ─── 동시 로딩 제한 ─────────────────────────────────────────────────────
const MAX_CONCURRENT_LOADS = 30;       // 이미지 + 비디오 포스터 (Tier 1)
const MAX_CONCURRENT_VIDEO_LOADS = 2;  // 비디오 엘리먼트 생성 (Tier 2)

export default function Scene({
  planes,
  mediaList,
  mediaListLength,
  isPlaying,
  cameraSpeed,
  textureConfig,
  onAutoPlay,
  onLoadProgress,
  onTogglePlay,
  onToggleFullscreen,
  onVideoBgmControl,
  videoPreviewEnabled,
  videoMaxDuration,
  // Input listener scope:
  //  - true (default): attach to window — full-page exhibition behavior.
  //  - "scoped": attach to the canvas element only. Used by the edit-mode preview so
  //    wheel/touch/keys work over the preview without hijacking page scroll or inputs.
  //  - false: no listeners.
  interactive = true,
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const dirLightRef = useRef();
  const floorRef = useRef();
  const pLight1Ref = useRef();
  const pLight2Ref = useRef();

  // Texture cache: { [planeId]: { texture, aspectRatio } }
  const textureMap = useRef(new Map());

  // Shared counters for concurrent loads (passed to all WallPlanes)
  const activeLoadsRef = useRef(0);      // images + video posters
  const activeVideoLoadsRef = useRef(0); // video elements only (Tier 2)

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

  // ─── 순환 로딩(corridor cycling) ─────────────────────────────────────────
  // 슬롯 수는 poolSize로 고정. 각 슬롯(plane.id)이 복도 끝(카메라 뒤 → 안개 저편)
  // 으로 래핑되는 순간, 아직 안 보여준 다음 사진으로 재할당한다. 그러면 앨범이
  // 슬롯 수보다 커도 걸어가는 동안 전체 사진이 순서대로 등장하고, 메모리/메시 수는
  // poolSize로 고정된다(WallPlane이 imageUrl 변경 시 기존 텍스처를 dispose·재로딩).
  // assignments: { [plane.id]: mediaIndex }
  const [assignments, setAssignments] = useState(() => {
    const a = {};
    planes.forEach((p) => (a[p.id] = p.mediaIndex));
    return a;
  });
  const wrapCountRef = useRef(new Map());        // 슬롯별 누적 래핑 바퀴 수 k(후방 래핑 시 감소)
  const prevWrappedZRef = useRef(new Map());     // 슬롯별 직전 wrappedZ(래핑 감지용)
  const pendingAssignRef = useRef({});           // 플러시 대기 중인 재할당(배칭)
  const assignFlushAccumRef = useRef(0);         // 플러시 주기 타이머(초)

  // 앨범/풀 변경 시 초기화
  useEffect(() => {
    const a = {};
    planes.forEach((p) => (a[p.id] = p.mediaIndex));
    setAssignments(a);
    wrapCountRef.current = new Map();
    prevWrappedZRef.current = new Map();
    pendingAssignRef.current = {};
  }, [planes]);

  // 현재 할당된 사진으로 채운 plane 목록(위치는 planes 그대로, 미디어만 순환).
  const livePlanes = useMemo(() => {
    if (!mediaList || mediaList.length === 0) return planes;
    return planes.map((p) => {
      const mi = assignments[p.id] ?? p.mediaIndex;
      const m = mediaList[mi];
      if (!m) return p;
      return {
        ...p,
        mediaIndex: mi,
        // 이미지 벽면은 최종 512² 이하로 그려지므로 썸네일(=w400급)로 로드한다.
        // 원본(=w2000급, ~3MP)은 drawImage 시 메인 스레드 동기 디코드가 장당
        // 30~120ms 걸리고, 순환 재할당(~2.8장/초)마다 반복되어 모바일 상시
        // 잔렉의 지배 원인이었다. 원본 화질은 중앙 슬라이드쇼/포커스 전용.
        // 비디오는 imageUrl이 Tier-2의 video.src로도 쓰이므로 원본(스트림 URL) 유지.
        imageUrl:
          m.type === "video"
            ? m.original_url || m.thumbnail_url
            : m.thumbnail_url || m.original_url,
        thumbnailUrl: m.thumbnail_url,
        mediaType: m.type,
      };
    });
  }, [planes, assignments, mediaList]);

  // Fast planeId → mediaType lookup (independent of texture load state)
  const planeMediaTypeMap = useMemo(() => {
    const map = new Map();
    livePlanes.forEach((p) => map.set(p.id, p.mediaType));
    return map;
  }, [livePlanes]);

  // 최신 livePlanes를 ref로도 노출 — handlePlaneClick이 livePlanes에 직접 의존하면
  // 순환 재할당(assignments 갱신)마다 onClick 참조가 바뀌어 WallPlane memo가 전부
  // 깨지고 260개가 통째로 리렌더된다(빠른 이동 시 프레임 드랍의 원인).
  const livePlanesRef = useRef(livePlanes);
  livePlanesRef.current = livePlanes;

  // 중앙 독립 슬라이드쇼용 이미지 목록(앨범 순서 유지, 영상 제외 — '사진'만)
  const centerImages = useMemo(
    () => (mediaList || []).filter((m) => m.type === "image"),
    [mediaList],
  );

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

  // Handle texture unloaded (far-distance cleanup in WallPlane)
  const handleTextureUnloaded = useCallback((planeId) => {
    textureMap.current.delete(planeId);
  }, []);

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

      const loadedCount = textureMap.current.size;
      // 순환 로딩에선 로드 윈도우 밖 슬롯이 텍스처를 안 들고 있어(코리도어 span >
      // dispose 거리) 전체의 80%가 동시에 로드되지 않는다. 실제 도달 가능한 상한을
      // 둬서 대형 앨범에서도 자동 재생이 확실히 트리거되게 한다.
      const threshold = Math.min(Math.ceil(planes.length * 0.8), 60);

      // Report progress to parent for loading UI — 자동재생 이후에는 생략
      // (순환 로딩에서 로드가 상시 발생하므로, 로드마다 부모 setState로
      //  DisplayScene 전체가 리렌더되던 상시 처닝 제거)
      if (!autoPlayFiredRef.current) onLoadProgress?.(loadedCount, threshold);

      // 전체 plane의 80% 이상 로딩 완료 시 자동 재생
      if (!autoPlayFiredRef.current && planes.length > 0) {
        if (loadedCount >= threshold) {
          autoPlayFiredRef.current = true;
          onAutoPlay?.();
        }
      }
    },
    [planes.length, onAutoPlay, onLoadProgress],
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
    if (!videoElementMap.current.has(planeId)) {
      textureMap.current.delete(planeId); // stale entry 정리
      return;
    }
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
        if (vps.activePlaneId !== planeId) return;
        console.log(`[Scene] ✓ Video playing (unmuted) plane=${planeId}`);
        onVideoBgmControl?.(true);
      }).catch((err) => {
        // 의도적 중단(stopVideoPlayback or cleanup)이면 무시
        if (vps.activePlaneId !== planeId || err.name === "AbortError") return;
        console.warn(`[Scene] Unmuted play rejected (plane=${planeId}):`, err.message);
        // Autoplay policy 거부(NotAllowedError)만 muted 재시도
        video.muted = true;
        video.play().then(() => {
          if (vps.activePlaneId !== planeId) return;
          console.log(`[Scene] ✓ Video playing (muted) plane=${planeId}`);
          onVideoBgmControl?.(true);
        }).catch((err2) => {
          if (vps.activePlaneId !== planeId) return;
          console.warn(`[Scene] ✗ Muted play failed (plane=${planeId}):`, err2.message);
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
        if (vps.activePlaneId !== planeId) return;
        onVideoBgmControl?.(true);
      }).catch((err) => {
        // 의도적 중단이면 무시
        if (vps.activePlaneId !== planeId || err.name === "AbortError") return;
        video.muted = true;
        video.play().then(() => {
          if (vps.activePlaneId !== planeId) return;
          onVideoBgmControl?.(true);
        }).catch((err2) => {
          if (vps.activePlaneId !== planeId) return;
          vps.isPlaying = false;
        });
      });
    }
  }, [onVideoBgmControl]);

  // Handle plane click for manual focus (works both playing and paused)
  const handlePlaneClick = useCallback(
    (planeId) => {
      const s = state.current;
      const plane = livePlanesRef.current.find((p) => p.id === planeId);
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
    [corridorSpan, startVideoPlayback, stopVideoPlayback, pauseVideoPlayback, resumeVideoPlayback],
  );

  // Pick the next plane in album order for auto focus (sequential, wraps around)
  function pickAutoTarget(s) {
    if (!livePlanes.length) return null;

    // 앨범 순서 = 복도 공간 순서(planeGenerator가 mediaIndex 오름차순 배치, 순환
    // 재할당도 이 순서를 유지)이므로, '카메라 앞쪽에서 가장 가까운 로드된 plane'을
    // 고르면 매 사이클 바로 다음 사진이 선택돼 건너뛰기 없이 순서대로 포커싱된다.
    // (기존 mediaIndex 카운터 방식은 순환 로딩에서 복도가 모든 사진을 반복하지
    //  않아, 포커스 1회당 카메라가 여러 장을 지나가며 건너뛰는 문제가 있었다.)
    let best = null;
    let bestDz = Infinity;
    const minAhead = FOCUS_DISMISS_DISTANCE + 15; // 방금 지나친 plane 재선택 방지
    for (const p of livePlanes) {
      if (!textureMap.current.has(p.id)) continue;
      const wrappedPZ = wrapZ(p.position[2], s.cameraZ);
      const dz = s.cameraZ - wrappedPZ;
      if (dz > minAhead && dz < bestDz) {
        best = p;
        bestDz = dz;
      }
    }

    if (best) {
      s.nextAutoMediaIndex = (best.mediaIndex + 1) % (mediaListLength || 1);
      return best;
    }

    return null; // 앞쪽에 로드된 plane이 아직 없음
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
      // 플링 로드 게이트 상태 보존 — 리셋 프레임에 자식 useFrame이 undefined를
      // 읽어 게이트가 1프레임 열리는 틈새 방지
      manualSpeed: state.current.manualSpeed || 0,
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
    if (!interactive) return;
    const scoped = interactive === "scoped";
    // scoped: listen on the canvas only (pointer must be over the preview); make it
    // focusable so keyboard input works after a click without stealing page-wide keys.
    const target = scoped ? gl.domElement : window;
    if (scoped) {
      gl.domElement.tabIndex = 0;
      gl.domElement.style.outline = "none";
    }

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
      // scoped: consume the wheel so the surrounding page doesn't scroll
      if (scoped) e.preventDefault();
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
      manualVelocityRef.current += deltaY * TOUCH_SCROLL_SENSITIVITY;
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
    target.addEventListener("wheel", onWheel, { passive: false });
    target.addEventListener("keydown", onKeyDown);
    target.addEventListener("keyup", onKeyUp);
    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: true });
    target.addEventListener("touchend", onTouchEnd);
    return () => {
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
      if (fovRecoveryTimerRef.current) clearTimeout(fovRecoveryTimerRef.current);
    };
  }, [onTogglePlay, onToggleFullscreen, camera, interactive, gl]);

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

  useFrame((_, rawDelta) => {
    // delta 스파이크 클램프 — 탭 백그라운드 복귀 시 delta=숨김 시간 전체가 들어와
    // 카메라가 (플링 잔여 velocity × 숨김시간 포함) 한 번에 텔레포트하는 것을 방지.
    // CenterSlideshow의 elapsed 클램프와 동일 정책(0.25s).
    const delta = Math.min(rawDelta, 0.25);
    const s = state.current;

    // 수동 스크롤 속도 공유 — WallPlane/CenterSlideshow가 강한 플링 중 신규 텍스처
    // 로드를 보류하는 데 사용(잔렉 방지). 매 프레임 갱신.
    s.manualSpeed = Math.abs(manualVelocityRef.current);

    // ── 순환 로딩: 슬롯이 복도 끝으로 래핑되면 다음 사진으로 재할당 ──
    // (재생/일시정지 무관하게 카메라가 움직이면 항상 검사 — 모든 return보다 위)
    if (mediaList && mediaList.length > 0) {
      const prevMap = prevWrappedZRef.current;
      const pending = pendingAssignRef.current;
      for (const p of planes) {
        const wz = wrapZ(p.position[2], s.cameraZ);
        const prev = prevMap.get(p.id);
        prevMap.set(p.id, wz);
        // 래핑 감지(방향 대칭): 한 프레임에 wrappedZ가 코리도어 길이의 절반 이상
        // 급변하면 경계를 넘은 것 — 전방(급감) +1바퀴, 후방(급증) -1바퀴.
        // 슬롯별 바퀴 수 k에서 (초기 사진 + k×풀 크기)를 유도해 전역 커서 없이
        // 앨범 순서를 정확히 유지한다. (기존 전역 커서는 경계 부근에서 앞뒤로
        // 흔들면 전방 래핑만 세어 사진 1장이 영구 스킵되는 비대칭 버그가 있었고,
        // 뒤로 스크롤 시 이전 사진 복원도 안 됐음. 래핑 시점 슬롯은 dispose 거리
        // 밖이라 텍스처가 이미 내려가 있어 교체는 자연스럽다.)
        if (prev !== undefined) {
          let dk = 0;
          if (wz < prev - corridorSpan * 0.5) dk = 1;
          else if (wz > prev + corridorSpan * 0.5) dk = -1;
          if (dk !== 0) {
            const k = (wrapCountRef.current.get(p.id) || 0) + dk;
            wrapCountRef.current.set(p.id, k);
            const len = mediaList.length;
            pending[p.id] =
              (((p.mediaIndex + k * planes.length) % len) + len) % len;
          }
        }
      }
      // 플러시 스로틀(최대 5회/초): 빠른 스크롤 시 래핑이 프레임마다 발생해
      // setAssignments가 매 프레임 리렌더(livePlanes 재계산 + 260개 memo 비교)를
      // 일으키던 잔렉 원인 제거. 래핑 슬롯은 어차피 로드 범위(FOG_FAR+800) 훨씬
      // 밖의 원거리에 재배치되므로 0.2s 지연은 시각적으로 관측 불가.
      assignFlushAccumRef.current += delta;
      if (assignFlushAccumRef.current >= 0.2) {
        assignFlushAccumRef.current = 0;
        if (Object.keys(pending).length > 0) {
          pendingAssignRef.current = {};
          setAssignments((a) => ({ ...a, ...pending }));
        }
      }
    }

    // FOV animation (pinch zoom smooth interpolation)
    if (Math.abs(camera.fov - targetFovRef.current) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFovRef.current, 0.1);
      camera.updateProjectionMatrix();
    }

    // Video preview mode: enforce max duration limit
    if (videoPreviewEnabled && videoMaxDuration > 0) {
      const vps = videoPlayState.current;
      if (vps.isPlaying && vps.activePlaneId != null) {
        const texInfo = textureMap.current.get(vps.activePlaneId);
        if (texInfo?.videoElement && texInfo.videoElement.currentTime >= videoMaxDuration) {
          if (vps.endedHandler) {
            vps.endedHandler();
          } else {
            stopVideoPlayback(vps.activePlaneId);
          }
        }
      }
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
    // manualDz: 이 프레임에 수동 입력으로 실제 전진한 거리(전진 = +). CenterSlideshow가
    // 진행도에 가산해 소비한다(빠르게 다가가면 중앙 플레인도 같이 가까워지도록).
    let manualDz = 0;
    if (keysRef.current.fwd) {
      s.cameraZ -= 150 * delta;
      manualDz += 150 * delta;
    }
    if (keysRef.current.back) {
      s.cameraZ += 150 * delta;
      manualDz -= 150 * delta;
    }
    if (Math.abs(manualVelocityRef.current) > 0.5) {
      s.cameraZ -= manualVelocityRef.current * delta;
      manualDz += manualVelocityRef.current * delta;
      manualVelocityRef.current *= Math.pow(0.005, delta);
    } else {
      manualVelocityRef.current = 0;
    }
    if (manualDz !== 0) {
      s.centerManualDz = (s.centerManualDz || 0) + manualDz;
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
      // 벽면 기반 자동 포커스는 비활성 — 중앙 포커스는 CenterSlideshow(복도와 분리된
      // 독립 슬라이드쇼)가 담당한다. 수동 클릭 포커스(manual)는 그대로 동작.
      const target = null;
      if (target) {
        s.focusMode = "auto";
        s.targetPlaneId = target.id;
        s.fadeProgress = 0;
        // 클론을 타겟 plane의 실제 위치(가장 가까운 앞쪽)에 생성 → 카메라가 한 칸만
        // 전진하고 다음 사이클에 바로 다음 사진을 포커싱(건너뛰기 없음).
        s.focusCloneZ = wrapZ(target.position[2], s.cameraZ);
        // 진행도 페이드 범위: 생성 시점 → 해제 지점(타겟 - DISMISS)까지 접근하는 동안 0→100→0
        s.slideStartZ = s.cameraZ;
        s.slideTargetZ = s.focusCloneZ + FOCUS_DISMISS_DISTANCE;
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
      // Only triggers when videoElement is available (Tier 2 loaded); retries each frame otherwise.
      if (!s.videoTriggered && distToClone <= OPACITY_PEAK_DIST) {
        const currentTexInfo = s.targetPlaneId != null ? textureMap.current.get(s.targetPlaneId) : null;
        if (currentTexInfo?.isVideo && currentTexInfo.videoElement) {
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
                  s.focusCloneZ = wrapZ(next.position[2], s.cameraZ);
          s.slideStartZ = s.cameraZ;
          s.slideTargetZ = s.focusCloneZ + FOCUS_DISMISS_DISTANCE;
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
            s.focusCloneZ = wrapZ(next.position[2], s.cameraZ);
          s.slideStartZ = s.cameraZ;
          s.slideTargetZ = s.focusCloneZ + FOCUS_DISMISS_DISTANCE;
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

          // 해제 전 모드 캡처 — manual 해제 시 auto 체인을 부활시키면 안 된다.
          // (이 가드가 없어 수동 클릭 한 번이 '비활성화된 벽면 auto 포커스'를
          //  되살렸고, pickAutoTarget이 카메라 25~55유닛 앞의 plane을 골라
          //  클론을 코앞에 스폰 → 해제도 같은 분기로 돌아와 무한 체인이 됐다.
          //  중앙 연출은 CenterSlideshow가 전담하므로 manual은 idle로만 복귀.)
          const wasAutoHere = s.focusMode === "auto";

          // Dismiss
          s.focusMode = "idle";
          s.targetPlaneId = null;
          s.fadeProgress = 0;
          s.focusCloneZ = 0;
          s.manualPlaneOriginalPos = null;
          s.videoTriggered = false;

          // Immediately pick next auto (auto였을 때만 — manual은 idle 복귀)
          const next = wasAutoHere ? pickAutoTarget(s) : null;
          if (next) {
            s.focusMode = "auto";
            s.targetPlaneId = next.id;
            s.fadeProgress = 0;
            s.focusCloneZ = wrapZ(next.position[2], s.cameraZ);
          s.slideStartZ = s.cameraZ;
          s.slideTargetZ = s.focusCloneZ + FOCUS_DISMISS_DISTANCE;
            s.videoTriggered = false;
            s.cloneReachedView = false;
            setFocusRender({ mode: "auto", targetId: next.id });
          } else {
            setFocusRender({ mode: "idle", targetId: null });
          }
        }
      }
    }

    // 중앙 슬라이드쇼 Z를 이번 프레임 '최종' cameraZ로 재확정 — CenterSlideshow의
    // useFrame이 이 콜백보다 먼저 실행되면 지난 프레임 cameraZ로 배치돼 1프레임
    // 지연이 생기고, 빠르게 접근할수록(스크롤/방향키) 뚝뚝 끊겨 보인다.
    if (s.centerActive && s.centerMesh) {
      s.centerMesh.position.z = s.cameraZ - s.centerDist;
    }
  });

  // Get current focus info for rendering (use focusRender React state)
  const camZ = state.current.cameraZ;
  // focusCloneZ: snapshot at render time so that the OUTGOING FocusClone/MirrorReflection
  // keep their original spawn position instead of reading the newly mutated stateRef value.
  const focusCloneZ = state.current.focusCloneZ;

  const focusPlane =
    focusRender.targetId !== null
      ? livePlanes.find((p) => p.id === focusRender.targetId)
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
      ? livePlanes.find((p) => p.id === prevFocusRender.targetId)
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
      {livePlanes.map((p) => {
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
              onTextureUnloaded={handleTextureUnloaded}
              displayScale={DISPLAY_SCALE}
              stateRef={state}
              corridorSpan={corridorSpan}
              activeLoadsRef={activeLoadsRef}
              maxConcurrentLoads={textureConfig.maxConcurrentLoads ?? MAX_CONCURRENT_LOADS}
              maxTextureSize={textureConfig.wallTextureSize ?? textureConfig.maxTextureSize}
              anisotropy={textureConfig.anisotropy}
              mediaType={p.mediaType}
              videoElementMap={videoElementMap}
              activeVideoLoadsRef={activeVideoLoadsRef}
              maxConcurrentVideoLoads={MAX_CONCURRENT_VIDEO_LOADS}
            />
          </Suspense>
        );
      })}

      {/* 중앙 독립 슬라이드쇼(복도와 분리) — 모든 사진을 멀리서·천천히·순서대로 */}
      <CenterSlideshow
        imageList={centerImages}
        isPlaying={isPlaying}
        active={focusRender.mode !== "manual"}
        stateRef={state}
        maxTextureSize={textureConfig.maxTextureSize}
        cameraSpeed={cameraSpeed}
      />

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
            fadeStartZ={state.current.slideStartZ}
            fadeEndZ={state.current.slideTargetZ}
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
