import { useRef, useMemo, useEffect, useCallback, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  getProxiedUrl,
  FOG_FAR,
  FOCUS_DISMISS_DISTANCE,
  OPACITY_APPEAR_DIST,
  OPACITY_PEAK_DIST,
  OPACITY_HOLD_DIST,
  FLING_LOAD_PAUSE_SPEED,
} from "../lib/constants";

// Compute the nearest wrapped Z position for a plane given the current camera Z
function computeWrappedZ(originalZ, cameraZ, corridorSpan) {
  const behindBuffer = 200;
  let delta = cameraZ + behindBuffer - originalZ;
  delta = ((delta % corridorSpan) + corridorSpan) % corridorSpan;
  return cameraZ + behindBuffer - delta;
}

const FRAME_COLOR = "#000000";
const SCREEN_OFF_COLOR = "#050505";

// ─── 미디어 패딩 ──────────────────────────────────────────────────────────────
// 박스 face 기준 상하좌우 여백 크기 (3D scene 단위)
// 이 값을 변경하면 미디어와 박스 테두리 사이의 여백이 조정됩니다.
const MEDIA_PADDING = 6;
// ──────────────────────────────────────────────────────────────────────────────

// Flicker duration in seconds
const FLICKER_DURATION = 1.2;

// TV power-on flicker pattern: normalized time (0-1) -> brightness (0-1)
function flickerBrightness(t) {
  if (t < 0.05) return 0;
  if (t < 0.08) return 0.6;
  if (t < 0.12) return 0;
  if (t < 0.18) return 0.3;
  if (t < 0.22) return 0;
  if (t < 0.3) return 0.7;
  if (t < 0.35) return 0.1;
  if (t < 0.45) return 0.8;
  if (t < 0.48) return 0.2;
  if (t < 0.55) return 0.9;
  if (t < 0.58) return 0.4;
  if (t < 0.65) return 0.95;
  if (t < 0.68) return 0.6;
  if (t < 0.78) return 1.0;
  if (t < 0.8) return 0.7;
  // Final settle
  const settle = (t - 0.8) / 0.2;
  return 0.7 + 0.3 * Math.min(1, settle);
}

function drawPlayIcon(ctx, mediaX, mediaY, mediaW, mediaH) {
  const cx = mediaX + mediaW / 2;
  const cy = mediaY + mediaH / 2;
  const r = Math.min(mediaW, mediaH) * 0.15;

  // 반투명 원
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fill();

  // 삼각형 (오른쪽 재생 화살표, 시각적 중심 보정)
  const s = r * 0.55;
  const ox = s * 0.15;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5 + ox, cy - s);
  ctx.lineTo(cx - s * 0.5 + ox, cy + s);
  ctx.lineTo(cx + s + ox, cy);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
  ctx.fill();
}

function WallPlane({
  id,
  imageUrl,
  thumbnailUrl,
  position,
  rotation,
  baseHeight,
  sign,
  focusMode, // 'none' | 'auto' | 'manual'
  onClick,
  onTextureLoaded,
  onTextureUnloaded,
  displayScale,
  stateRef,
  corridorSpan,
  activeLoadsRef,
  maxConcurrentLoads,
  maxTextureSize,
  anisotropy,
  mediaType,
  videoElementMap,
  activeVideoLoadsRef,
  maxConcurrentVideoLoads,
}) {
  const meshRef = useRef();
  const frontMatRef = useRef();

  // All mutable state in refs (no React re-renders needed for visuals)
  // aspectRef: 패딩 포함 박스 전체의 가로세로 비율 (boxW / boxH)
  const aspectRef = useRef(1);
  const wallScaleRef = useRef([
    baseHeight * 1.2 + 2 * MEDIA_PADDING,
    baseHeight + 2 * MEDIA_PADDING,
    1,
  ]);

  const animState = useRef({
    currentPos: [...position],
    currentRot: [0, 0, 0],
    currentScale: [
      baseHeight * 1.2 + 2 * MEDIA_PADDING,
      baseHeight + 2 * MEDIA_PADDING,
      1,
    ],
    targetPos: [...position],
    targetRot: [0, 0, 0],
    targetScale: [
      baseHeight * 1.2 + 2 * MEDIA_PADDING,
      baseHeight + 2 * MEDIA_PADDING,
      1,
    ],
  });

  // Flicker state
  const flickerState = useRef({
    active: false,
    elapsed: 0,
    done: false,
  });

  // Lazy loading state:
  // Image: 'idle' → 'loading' → 'loaded'
  // Video: 'idle' → 'loading' → 'poster_loaded' → 'video_loading' → 'loaded'
  const loadStateRef = useRef("idle");
  const disposedRef = useRef(false);

  // Video refs
  const videoRef = useRef(null);
  const videoTextureRef = useRef(null);
  const posterTextureRef = useRef(null);
  const isVideoType = mediaType === 'video';

  // Manual focus fly state
  const manualActiveRef = useRef(false);
  const returningRef = useRef(false);

  // Original rotation: face toward corridor center
  const originalRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    dummy.rotateX(rotation[0]);
    dummy.rotateY(rotation[1]);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [rotation, sign]);

  // Load texture imperatively — triggered by useFrame proximity check (lazy loading)
  // urlOverride: optional URL to load instead of imageUrl (used for video→image fallback)
  const startLoad = useCallback((urlOverride) => {
    const url = urlOverride || imageUrl;
    if (!url || loadStateRef.current !== "idle") return;

    // Concurrency gate: skip if too many loads active (will retry next frame)
    if (activeLoadsRef && activeLoadsRef.current >= maxConcurrentLoads) return;

    loadStateRef.current = "loading";
    if (activeLoadsRef) activeLoadsRef.current++;

    const img = new Image();
    img.crossOrigin = "anonymous";

    const onLoaded = () => {
      if (disposedRef.current) return;
      try {
        const mediaAspect = img.width / img.height;
        const mediaH = baseHeight;
        const mediaW = mediaH * mediaAspect;

        const boxH = mediaH + 2 * MEDIA_PADDING;
        const boxW = mediaW + 2 * MEDIA_PADDING;
        const boxAspect = boxW / boxH;

        aspectRef.current = boxAspect;
        wallScaleRef.current = [boxW, boxH, 1];
        animState.current.currentScale = [boxW, boxH, 1];
        animState.current.targetScale = [boxW, boxH, 1];

        // Downscale to maxTextureSize to limit GPU memory
        let drawW = img.width;
        let drawH = img.height;
        const maxDim = Math.max(drawW, drawH);
        if (maxDim > maxTextureSize) {
          const ratio = maxTextureSize / maxDim;
          drawW = Math.round(drawW * ratio);
          drawH = Math.round(drawH * ratio);
        }

        const paddingPx = Math.round(drawH * (MEDIA_PADDING / mediaH));
        const cW = drawW + 2 * paddingPx;
        const cH = drawH + 2 * paddingPx;

        const canvas = document.createElement("canvas");
        canvas.width = cW;
        canvas.height = cH;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = FRAME_COLOR;
        ctx.fillRect(0, 0, cW, cH);
        ctx.drawImage(img, paddingPx, paddingPx, drawW, drawH);

        // ── 어두운 이미지 필터 ──
        // 10×10 축소 캔버스에서 평균 밝기 측정. (기존: 전체 해상도 getImageData로
        // 최대 4MB 픽셀 리드백 후 100픽셀만 샘플링 — 로드마다 메인 스레드 잔렉 유발)
        const DARK_THRESHOLD = 15;
        const S = 10;
        const sc = document.createElement("canvas");
        sc.width = S;
        sc.height = S;
        const sctx = sc.getContext("2d", { willReadFrequently: true });
        sctx.drawImage(img, 0, 0, S, S);
        const px = sctx.getImageData(0, 0, S, S).data;
        let total = 0;
        for (let i = 0; i < px.length; i += 4) {
          total += (px[i] + px[i + 1] + px[i + 2]) / 3;
        }
        if (total / (S * S) < DARK_THRESHOLD) {
          loadStateRef.current = "loaded"; // 재시도 방지
          return; // 텍스처 미생성 → 벽면 어두운 상태 유지
        }
        // ────────────────────────

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = anisotropy;
        tex.needsUpdate = true;

        const mat = frontMatRef.current;
        if (mat) {
          mat.map = tex;
          mat.color.setScalar(1);
          mat.needsUpdate = true;
        }

        flickerState.current = { active: false, elapsed: 0, done: true };
        loadStateRef.current = "loaded";

        onTextureLoaded?.(id, tex, boxAspect);
      } catch (err) {
        console.error("Texture creation error:", err);
        loadStateRef.current = "idle";
      }
    };

    img.onload = () => {
      if (activeLoadsRef) activeLoadsRef.current--;
      // 디코드를 비동기로 강제(img.decode) — drawImage의 메인 스레드 동기
      // 디코드(프레임 블로킹) 방지. 미지원/실패 시 동기 경로 폴백.
      if (img.decode) img.decode().then(onLoaded).catch(onLoaded);
      else onLoaded();
    };

    img.onerror = (err) => {
      if (activeLoadsRef) activeLoadsRef.current--;
      console.error("Image load failed:", url.substring(0, 80), err);
      loadStateRef.current = "idle";
    };

    img.src = getProxiedUrl(url);
  }, [
    imageUrl,
    baseHeight,
    id,
    onTextureLoaded,
    activeLoadsRef,
    maxConcurrentLoads,
    maxTextureSize,
    anisotropy,
  ]);

  // ── Tier 1: Load poster thumbnail only (2800 units) ──────────────────────
  // Shows thumbnail with play icon on wall. Video element created later at Tier 2.
  const startPosterLoad = useCallback(() => {
    if (!imageUrl || loadStateRef.current !== "idle") return;
    if (activeLoadsRef && activeLoadsRef.current >= maxConcurrentLoads) return;

    const thumbUrl = thumbnailUrl || imageUrl;

    loadStateRef.current = "loading";
    if (activeLoadsRef) activeLoadsRef.current++;

    const img = new Image();
    img.crossOrigin = "anonymous";

    const onPosterLoaded = () => {
      if (disposedRef.current || loadStateRef.current === "idle") return;

      try {
        const mediaAspect = img.width / img.height;
        const mediaH = baseHeight;
        const mediaW = mediaH * mediaAspect;

        const boxH = mediaH + 2 * MEDIA_PADDING;
        const boxW = mediaW + 2 * MEDIA_PADDING;
        const boxAspect = boxW / boxH;

        aspectRef.current = boxAspect;
        wallScaleRef.current = [boxW, boxH, 1];
        animState.current.currentScale = [boxW, boxH, 1];
        animState.current.targetScale = [boxW, boxH, 1];

        let drawW = img.width;
        let drawH = img.height;
        const maxDim = Math.max(drawW, drawH);
        if (maxDim > maxTextureSize) {
          const ratio = maxTextureSize / maxDim;
          drawW = Math.round(drawW * ratio);
          drawH = Math.round(drawH * ratio);
        }

        const paddingPx = Math.round(drawH * (MEDIA_PADDING / mediaH));
        const cW = drawW + 2 * paddingPx;
        const cH = drawH + 2 * paddingPx;

        const canvas = document.createElement("canvas");
        canvas.width = cW;
        canvas.height = cH;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = FRAME_COLOR;
        ctx.fillRect(0, 0, cW, cH);
        ctx.drawImage(img, 0, 0, img.width, img.height, paddingPx, paddingPx, drawW, drawH);
        drawPlayIcon(ctx, paddingPx, paddingPx, drawW, drawH);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = anisotropy;
        tex.needsUpdate = true;

        posterTextureRef.current = tex;

        const mat = frontMatRef.current;
        if (mat) {
          mat.map = tex;
          mat.color.setScalar(1);
          mat.needsUpdate = true;
        }

        flickerState.current = { active: false, elapsed: 0, done: true };
        loadStateRef.current = "poster_loaded";

        // Register with Scene — poster ready, video not yet available
        onTextureLoaded?.(id, tex, boxAspect, { isVideo: true });
      } catch (err) {
        console.error("[WallPlane] Poster creation error:", err);
        loadStateRef.current = "idle";
      }
    };

    img.onload = () => {
      if (activeLoadsRef) activeLoadsRef.current--;
      // 디코드 비동기화 — startLoad와 동일한 이유
      if (img.decode) img.decode().then(onPosterLoaded).catch(onPosterLoaded);
      else onPosterLoaded();
    };

    img.onerror = () => {
      if (activeLoadsRef) activeLoadsRef.current--;
      console.error("[WallPlane] Poster load failed:", thumbUrl?.substring(0, 80));
      loadStateRef.current = "idle";
    };

    img.src = getProxiedUrl(thumbUrl);
  }, [
    imageUrl,
    thumbnailUrl,
    baseHeight,
    id,
    onTextureLoaded,
    activeLoadsRef,
    maxConcurrentLoads,
    maxTextureSize,
    anisotropy,
  ]);

  // ── Tier 2: Create video element (250 units, deferred) ─────────────────
  // Creates video element with preload="none" → metadata fetch only.
  // Actual streaming starts when play() is called by the focus system.
  const startDeferredVideoLoad = useCallback(() => {
    if (!imageUrl || loadStateRef.current !== "poster_loaded") return;
    if (activeVideoLoadsRef && activeVideoLoadsRef.current >= maxConcurrentVideoLoads) return;

    loadStateRef.current = "video_loading";
    if (activeVideoLoadsRef) activeVideoLoadsRef.current++;

    let released = false;
    const releaseVideoConcurrency = () => {
      if (!released) {
        released = true;
        if (activeVideoLoadsRef) activeVideoLoadsRef.current--;
      }
    };
    // iOS 등에서 preload="none" 비디오가 loadeddata/error를 영영 안 쏘면 동시성
    // 게이트(2)가 영구 점유될 수 있어 타임아웃으로 강제 해제(성공 시 무해 — 중복 해제 가드됨)
    setTimeout(releaseVideoConcurrency, 10000);

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.preload = "none"; // No eager buffering — streams on play()

    video.addEventListener("loadeddata", () => {
      releaseVideoConcurrency();
      if (disposedRef.current || loadStateRef.current === "idle") {
        video.src = "";
        return;
      }

      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        const videoTex = new THREE.VideoTexture(video);
        videoTex.colorSpace = THREE.SRGBColorSpace;
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.generateMipmaps = false;

        videoRef.current = video;
        videoTextureRef.current = videoTex;

        if (videoElementMap) {
          videoElementMap.current.set(id, video);
        }

        loadStateRef.current = "loaded";

        console.log(`[WallPlane] Video ready: id=${id} ${vw}x${vh}`, imageUrl.substring(0, 80));

        // Update Scene's textureMap with video info
        onTextureLoaded?.(id, posterTextureRef.current, aspectRef.current, {
          isVideo: true,
          videoTexture: videoTex,
          videoElement: video,
        });
      } catch (err) {
        console.error("[WallPlane] Video texture creation error:", err);
        loadStateRef.current = "poster_loaded";
      }
    }, { once: true });

    video.addEventListener("error", () => {
      const code = video.error?.code;
      const msg = video.error?.message || "unknown";
      console.error(`[WallPlane] Video proxy load failed (code=${code} msg=${msg}):`, imageUrl.substring(0, 80));
      releaseVideoConcurrency();
      video.src = "";
      loadStateRef.current = "poster_loaded";
    });

    // Google Photos =dv URL은 <video>에서 항상 CORS 실패하므로 프록시 직접 사용
    video.src = getProxiedUrl(imageUrl);
    video.load();
  }, [
    imageUrl,
    id,
    onTextureLoaded,
    activeVideoLoadsRef,
    maxConcurrentVideoLoads,
    videoElementMap,
  ]);

  // Cleanup on unmount or imageUrl change
  useEffect(() => {
    disposedRef.current = false;
    loadStateRef.current = "idle";
    return () => {
      disposedRef.current = true;
      const mat = frontMatRef.current;
      if (mat && mat.map) {
        mat.map.dispose();
        mat.map = null;
        mat.needsUpdate = true;
      }
      // Video cleanup
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (posterTextureRef.current) {
        posterTextureRef.current.dispose();
        posterTextureRef.current = null;
      }
      if (videoElementMap) {
        videoElementMap.current.delete(id);
      }
      loadStateRef.current = "idle";
    };
  }, [imageUrl, id, videoElementMap]);

  // Update targets based on focusMode
  useEffect(() => {
    const state = animState.current;

    if (focusMode === "manual") {
      // Flying to camera front — position targets updated in useFrame
      manualActiveRef.current = true;
      returningRef.current = false;
      // Face camera: no rotation means +Z face (front) points toward camera
      state.targetRot = [0, 0, 0];
      state.targetScale = [...wallScaleRef.current];
    } else if (manualActiveRef.current) {
      // Was manual, now dismissed — fly back to wall
      manualActiveRef.current = false;
      returningRef.current = true;
      state.targetPos[0] = position[0];
      state.targetPos[1] = position[1];
      state.targetRot = [...originalRotation];
      state.targetScale = [...wallScaleRef.current];
    } else {
      // Normal wall mode (covers "none" and "auto")
      state.targetPos[0] = position[0];
      state.targetPos[1] = position[1];
      state.targetRot = [...originalRotation];
      state.targetScale = [...wallScaleRef.current];
    }
  }, [focusMode, position, originalRotation]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const cameraZ = stateRef.current.cameraZ;
    const state = animState.current;
    const mat = frontMatRef.current;

    // ── Manual focus: fly to camera front ──────────────────────────────────
    if (focusMode === "manual") {
      meshRef.current.visible = true;

      // Trigger deferred video load when manually focused
      if (isVideoType && loadStateRef.current === "poster_loaded") {
        startDeferredVideoLoad();
      }

      state.targetPos[0] = 0;
      state.targetPos[1] = 0;
      state.targetPos[2] = stateRef.current.focusCloneZ;

      // Faster lerp for snappy fly animation (~0.5s)
      const lerpFactor = 1 - Math.pow(0.0001, delta);
      for (let i = 0; i < 3; i++) {
        state.currentPos[i] +=
          (state.targetPos[i] - state.currentPos[i]) * lerpFactor;
        state.currentRot[i] +=
          (state.targetRot[i] - state.currentRot[i]) * lerpFactor;
        state.currentScale[i] +=
          (state.targetScale[i] - state.currentScale[i]) * lerpFactor;
      }

      meshRef.current.position.set(...state.currentPos);
      meshRef.current.rotation.set(...state.currentRot);
      meshRef.current.scale.set(...state.currentScale);

      // Share current animated position & scale so MirrorReflection can track the flying plane
      stateRef.current.manualCurrentZ = state.currentPos[2];
      stateRef.current.manualCurrentScale = [
        state.currentScale[0],
        state.currentScale[1],
      ];

      // Distance-based opacity (same 4-zone curve as FocusClone)
      // Use the plane's actual animated position so opacity tracks proximity
      // during the fly-in animation, not just the target position.
      const dist = Math.abs(cameraZ - state.currentPos[2]);
      let opacity = 0;
      if (dist < OPACITY_APPEAR_DIST && dist > FOCUS_DISMISS_DISTANCE) {
        if (dist >= OPACITY_PEAK_DIST) {
          opacity =
            (OPACITY_APPEAR_DIST - dist) /
            (OPACITY_APPEAR_DIST - OPACITY_PEAK_DIST);
        } else if (dist >= OPACITY_HOLD_DIST) {
          opacity = 1.0;
        } else {
          opacity =
            (dist - FOCUS_DISMISS_DISTANCE) /
            (OPACITY_HOLD_DIST - FOCUS_DISMISS_DISTANCE);
        }
      }

      if (mat) {
        if (!mat.transparent) {
          mat.transparent = true;
          mat.needsUpdate = true;
        }
        mat.opacity = opacity;
        mat.color.setScalar(1);

        // Video texture switching for manual focus
        // Show video texture whenever video has been played (even if paused)
        // so the paused frame stays visible instead of switching to poster (black screen)
        if (isVideoType && videoRef.current && videoTextureRef.current && posterTextureRef.current) {
          const hasBeenPlayed = videoRef.current.currentTime > 0 || !videoRef.current.paused;
          const targetMap = hasBeenPlayed ? videoTextureRef.current : posterTextureRef.current;
          if (mat.map !== targetMap) {
            mat.map = targetMap;
            mat.needsUpdate = true;
          }
          // Only update video texture each frame while actually playing
          if (!videoRef.current.paused) {
            videoTextureRef.current.needsUpdate = true;
          }
        }
      }
      return;
    }

    // ── Returning from manual: fly back to wall ────────────────────────────
    if (returningRef.current) {
      meshRef.current.visible = true;

      // Target: wrapped wall position (updates each frame)
      const wrappedZ = computeWrappedZ(position[2], cameraZ, corridorSpan);
      state.targetPos[2] = wrappedZ;

      const lerpFactor = 1 - Math.pow(0.0001, delta);
      for (let i = 0; i < 3; i++) {
        state.currentPos[i] +=
          (state.targetPos[i] - state.currentPos[i]) * lerpFactor;
        state.currentRot[i] +=
          (state.targetRot[i] - state.currentRot[i]) * lerpFactor;
        state.currentScale[i] +=
          (state.targetScale[i] - state.currentScale[i]) * lerpFactor;
      }

      // Check if close enough to wall target → resume normal behavior
      const dx = Math.abs(state.currentPos[0] - state.targetPos[0]);
      const dy = Math.abs(state.currentPos[1] - state.targetPos[1]);
      const dz = Math.abs(state.currentPos[2] - state.targetPos[2]);
      if (dx + dy + dz < 10) {
        returningRef.current = false;
      }

      meshRef.current.position.set(...state.currentPos);
      meshRef.current.rotation.set(...state.currentRot);
      meshRef.current.scale.set(...state.currentScale);

      // Reset transparency from manual focus
      if (mat && mat.transparent) {
        mat.transparent = false;
        mat.needsUpdate = true;
        mat.opacity = 1;
      }
      // Restore poster texture when returning from manual focus
      if (isVideoType && mat && posterTextureRef.current && mat.map !== posterTextureRef.current) {
        mat.map = posterTextureRef.current;
        mat.needsUpdate = true;
      }
      return;
    }

    // ── Normal wall behavior ───────────────────────────────────────────────
    const wrappedZ = computeWrappedZ(position[2], cameraZ, corridorSpan);
    const distToCamera = Math.abs(cameraZ - wrappedZ);

    // ── Lazy loading: 2-tier for video, single-tier for image ──────────────
    // Tier 1 (2800 units): poster/image load.
    // 강한 휠 플링 중에는 신규 로드 시작을 보류 — 디코드/캔버스/GPU 업로드가
    // 프레임 예산이 가장 빠듯한 순간에 몰리는 잔렉 방지(플링 감쇠 후 자동 재개).
    const flinging =
      (stateRef.current.manualSpeed || 0) > FLING_LOAD_PAUSE_SPEED;
    if (!flinging && loadStateRef.current === "idle" && distToCamera <= FOG_FAR + 800) {
      if (isVideoType) startPosterLoad(); else startLoad();
    }
    // Tier 2: 포스터 로드 완료 + '근접 시'에만 비디오 엘리먼트 생성.
    // 거리 무관 생성 시 풀 내 모든 비디오 슬롯이 라이브 <video>+디코더를 보유해
    // 모바일 디코더 한계(~16개)/메모리를 압박한다(시스템성 잔렉의 원인).
    // 플링 중에도 보류 — 엘리먼트 생성/디코더 초기화도 메인 스레드 비용.
    if (
      !flinging &&
      isVideoType &&
      loadStateRef.current === "poster_loaded" &&
      distToCamera <= 400
    ) {
      startDeferredVideoLoad();
    }

    // 멀어진 비디오의 엘리먼트/디코더만 조기 회수(포스터 텍스처는 유지).
    // 기존 far-dispose(FOG_FAR+200=2200)는 풀 축소 후 corridorSpan(~2000)보다 커서
    // 도달 불가(데드 코드) — span 기준 임계로 실제 회수되게 한다. 재진입 시
    // 400 이내에서 재생성(임계 간 히스테리시스로 스래싱 없음).
    if (
      isVideoType &&
      loadStateRef.current === "loaded" &&
      videoRef.current &&
      distToCamera > Math.min(FOG_FAR + 200, corridorSpan * 0.4)
    ) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current = null;
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (videoElementMap) {
        videoElementMap.current.delete(id);
      }
      if (mat && posterTextureRef.current && mat.map !== posterTextureRef.current) {
        mat.map = posterTextureRef.current;
        mat.needsUpdate = true;
      }
      loadStateRef.current = "poster_loaded";
    }

    // ── Far-distance dispose ────────────────────────────────────────────────
    // Video: earlier disposal at FOG_FAR + 200 (2200 units)
    if (isVideoType && loadStateRef.current !== "idle" && distToCamera > FOG_FAR + 200) {
      if (mat) {
        if (mat.map) { mat.map.dispose(); mat.map = null; }
        mat.color.set(SCREEN_OFF_COLOR);
        mat.needsUpdate = true;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (posterTextureRef.current) {
        posterTextureRef.current.dispose();
        posterTextureRef.current = null;
      }
      if (videoElementMap) {
        videoElementMap.current.delete(id);
      }
      loadStateRef.current = "idle";
      flickerState.current = { active: false, elapsed: 0, done: false };
      onTextureUnloaded?.(id);
    }
    // Image: standard disposal at FOG_FAR + 1500 (3500 units)
    if (!isVideoType && loadStateRef.current === "loaded" && distToCamera > FOG_FAR + 1500) {
      if (mat) {
        if (mat.map) { mat.map.dispose(); mat.map = null; }
        mat.color.set(SCREEN_OFF_COLOR);
        mat.needsUpdate = true;
      }
      loadStateRef.current = "idle";
      flickerState.current = { active: false, elapsed: 0, done: false };
      onTextureUnloaded?.(id);
    }
    // Force cleanup: video stuck in loading states beyond safe distance
    if (isVideoType && loadStateRef.current !== "idle" && distToCamera > FOG_FAR + 1500) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (posterTextureRef.current) {
        posterTextureRef.current.dispose();
        posterTextureRef.current = null;
      }
      if (videoElementMap) {
        videoElementMap.current.delete(id);
      }
      if (mat) {
        if (mat.map) { mat.map.dispose(); mat.map = null; }
        mat.color.set(SCREEN_OFF_COLOR);
        mat.needsUpdate = true;
      }
      loadStateRef.current = "idle";
      flickerState.current = { active: false, elapsed: 0, done: false };
      onTextureUnloaded?.(id);
    }

    // Imperative visibility culling: hide planes beyond fog range
    meshRef.current.visible = distToCamera <= FOG_FAR + 500;
    if (!meshRef.current.visible) return;

    // Keep Z in sync with wrapped position (override lerp — no slide during wrap)
    state.currentPos[2] = wrappedZ;
    state.targetPos[2] = wrappedZ;

    const lerpFactor = 1 - Math.pow(0.01, delta);

    for (let i = 0; i < 3; i++) {
      state.currentPos[i] +=
        (state.targetPos[i] - state.currentPos[i]) * lerpFactor;
      state.currentRot[i] +=
        (state.targetRot[i] - state.currentRot[i]) * lerpFactor;
      state.currentScale[i] +=
        (state.targetScale[i] - state.currentScale[i]) * lerpFactor;
    }

    meshRef.current.position.set(...state.currentPos);
    meshRef.current.rotation.set(...state.currentRot);
    meshRef.current.scale.set(...state.currentScale);

    // Video texture update: mark needsUpdate each frame while playing
    if (isVideoType && videoTextureRef.current && videoRef.current && !videoRef.current.paused) {
      videoTextureRef.current.needsUpdate = true;
    }

    // TV flicker animation on front material
    if (!mat) return;

    const flicker = flickerState.current;
    if (flicker.active && !flicker.done) {
      flicker.elapsed += delta;
      const t = Math.min(1, flicker.elapsed / FLICKER_DURATION);
      const brightness = 1.0;

      mat.color.setScalar(brightness);

      if (t >= 1) {
        flicker.done = true;
        flicker.active = false;
        mat.color.setScalar(1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id);
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={frontMatRef}
        color={SCREEN_OFF_COLOR}
        generateMipmaps={true}
      />
    </mesh>
  );
}

export default memo(WallPlane);
