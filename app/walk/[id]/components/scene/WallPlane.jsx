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
  displayScale,
  stateRef,
  corridorSpan,
  activeLoadsRef,
  maxConcurrentLoads,
  maxTextureSize,
  anisotropy,
  mediaType,
  videoElementMap,
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

  // Lazy loading state: 'idle' | 'loading' | 'loaded'
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

    img.onload = () => {
      if (activeLoadsRef) activeLoadsRef.current--;
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
        const DARK_THRESHOLD = 15;
        const SAMPLE_GRID = 10;
        const imageData = ctx.getImageData(paddingPx, paddingPx, drawW, drawH);
        const px = imageData.data;
        let total = 0, count = 0;
        const stepX = Math.max(1, Math.floor(drawW / SAMPLE_GRID));
        const stepY = Math.max(1, Math.floor(drawH / SAMPLE_GRID));
        for (let y = 0; y < drawH; y += stepY)
          for (let x = 0; x < drawW; x += stepX) {
            const i = (y * drawW + x) * 4;
            total += (px[i] + px[i + 1] + px[i + 2]) / 3;
            count++;
          }
        if (count > 0 && total / count < DARK_THRESHOLD) {
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

  // Load video imperatively — triggered by useFrame proximity check (lazy loading)
  // Loads thumbnail image and video element in parallel:
  //   - Thumbnail → canvas poster with play icon → shown on wall immediately
  //   - Video → VideoTexture → finalized when both are ready
  const startVideoLoad = useCallback(() => {
    if (!imageUrl || loadStateRef.current !== "idle") return;
    if (activeLoadsRef && activeLoadsRef.current >= maxConcurrentLoads) return;

    loadStateRef.current = "loading";
    if (activeLoadsRef) activeLoadsRef.current++;

    let concurrencyReleased = false;
    const releaseConcurrency = () => {
      if (!concurrencyReleased) {
        concurrencyReleased = true;
        if (activeLoadsRef) activeLoadsRef.current--;
      }
    };

    // Shared state between the two parallel paths
    let posterTex = null;
    let boxAspect = 1;
    let videoTex = null;
    let videoElement = null;
    let posterCreated = false;
    let videoLoaded = false;

    // Called when both poster and video are ready
    const finalize = () => {
      if (!posterCreated || !videoLoaded) return;
      if (disposedRef.current) return;

      videoRef.current = videoElement;
      videoTextureRef.current = videoTex;
      posterTextureRef.current = posterTex;

      // Register video element for Scene-level play/pause control
      if (videoElementMap) {
        videoElementMap.current.set(id, videoElement);
      }

      flickerState.current = { active: false, elapsed: 0, done: true };
      loadStateRef.current = "loaded";

      onTextureLoaded?.(id, posterTex, boxAspect, {
        isVideo: true,
        videoTexture: videoTex,
        videoElement: videoElement,
      });
    };

    // Helper: create poster canvas from an image source (img or video element)
    const createPoster = (source, srcW, srcH) => {
      const mediaAspect = srcW / srcH;
      const mediaH = baseHeight;
      const mediaW = mediaH * mediaAspect;

      const boxH = mediaH + 2 * MEDIA_PADDING;
      const boxW = mediaW + 2 * MEDIA_PADDING;
      boxAspect = boxW / boxH;

      aspectRef.current = boxAspect;
      wallScaleRef.current = [boxW, boxH, 1];
      animState.current.currentScale = [boxW, boxH, 1];
      animState.current.targetScale = [boxW, boxH, 1];

      let drawW = srcW;
      let drawH = srcH;
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
      ctx.drawImage(source, 0, 0, srcW, srcH, paddingPx, paddingPx, drawW, drawH);
      drawPlayIcon(ctx, paddingPx, paddingPx, drawW, drawH);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      tex.needsUpdate = true;

      return tex;
    };

    // Helper: show poster on wall material
    const showPosterOnWall = (tex) => {
      const mat = frontMatRef.current;
      if (mat) {
        mat.map = tex;
        mat.color.setScalar(1);
        mat.needsUpdate = true;
      }
    };

    // ── Path 1: Thumbnail image ──
    let thumbnailFailed = false;
    const thumbUrl = thumbnailUrl;
    if (thumbUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (disposedRef.current) return;
        try {
          posterTex = createPoster(img, img.width, img.height);
          showPosterOnWall(posterTex);
          posterCreated = true;
          releaseConcurrency();
          if (videoLoaded) finalize();
        } catch (err) {
          console.error("[WallPlane] Thumbnail poster error:", err);
          thumbnailFailed = true;
          // If video already loaded, create poster from video first frame
          if (videoLoaded && videoElement) {
            try {
              posterTex = createPoster(videoElement, videoElement.videoWidth, videoElement.videoHeight);
              showPosterOnWall(posterTex);
              posterCreated = true;
              releaseConcurrency();
              finalize();
            } catch (err2) {
              console.error("[WallPlane] Video fallback poster error:", err2);
              releaseConcurrency();
              loadStateRef.current = "idle";
            }
          }
        }
      };
      img.onerror = () => {
        console.warn("[WallPlane] Thumbnail load failed, will use video first frame:", thumbUrl.substring(0, 80));
        thumbnailFailed = true;
        // If video already loaded, create poster from video first frame
        if (videoLoaded && videoElement) {
          try {
            posterTex = createPoster(videoElement, videoElement.videoWidth, videoElement.videoHeight);
            showPosterOnWall(posterTex);
            posterCreated = true;
            releaseConcurrency();
            finalize();
          } catch (err) {
            console.error("[WallPlane] Video fallback poster error:", err);
            releaseConcurrency();
            loadStateRef.current = "idle";
          }
        }
      };
      img.src = getProxiedUrl(thumbUrl);
    } else {
      // No thumbnail URL — will use video first frame
      thumbnailFailed = true;
    }

    // ── Path 2: Video element ──
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.preload = "auto";

    video.addEventListener("loadeddata", () => {
      if (disposedRef.current) {
        video.src = "";
        releaseConcurrency();
        return;
      }
      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // Create video texture for playback
        videoTex = new THREE.VideoTexture(video);
        videoTex.colorSpace = THREE.SRGBColorSpace;
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.generateMipmaps = false;

        videoElement = video;
        videoLoaded = true;

        console.log(`[WallPlane] Video loaded: id=${id} ${vw}x${vh}`, imageUrl.substring(0, 80));

        // If thumbnail failed or wasn't available, create poster from video first frame
        if (thumbnailFailed && !posterCreated) {
          posterTex = createPoster(video, vw, vh);
          showPosterOnWall(posterTex);
          posterCreated = true;
          releaseConcurrency();
        }

        if (posterCreated) finalize();
      } catch (err) {
        console.error("[WallPlane] Video texture creation error:", err);
        releaseConcurrency();
        loadStateRef.current = "idle";
      }
    }, { once: true });

    video.addEventListener("error", () => {
      const code = video.error?.code;
      const msg = video.error?.message || "unknown";
      // CORS fallback: if direct URL fails, retry through proxy
      const currentSrc = video.src;
      if (!currentSrc.includes("/proxy/image")) {
        console.warn(`[WallPlane] Video direct load failed (code=${code} msg=${msg}), retrying via proxy:`, imageUrl.substring(0, 80));
        video.src = getProxiedUrl(imageUrl);
        video.load();
        return;
      }
      // Both direct and proxy failed — fall back to image loading
      console.error(`[WallPlane] Video load failed completely (code=${code} msg=${msg}), falling back to image:`, imageUrl.substring(0, 80));
      video.src = "";
      releaseConcurrency();
      loadStateRef.current = "idle";
      // Fall back to loading as image (using thumbnailUrl if available)
      startLoad(thumbnailUrl || imageUrl);
    });

    // Use direct URL for video — the image proxy doesn't support HTTP Range
    // requests which <video> elements require for playback. Falls back to proxy on error.
    video.src = imageUrl;
    video.load();
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
    videoElementMap,
    startLoad,
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

    // Lazy load: start loading when camera approaches
    if ((loadStateRef.current === "idle") && distToCamera <= FOG_FAR + 800) {
      if (isVideoType) startVideoLoad(); else startLoad();
    }

    // Far-distance dispose: release texture to reclaim GPU memory (large corridors only)
    if (loadStateRef.current === "loaded" && distToCamera > FOG_FAR + 1500) {
      if (mat) {
        if (mat.map) {
          mat.map.dispose();
          mat.map = null;
        }
        mat.color.set(SCREEN_OFF_COLOR);
        mat.needsUpdate = true;
      }
      // Video far-distance cleanup
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (videoElementMap) {
        videoElementMap.current.delete(id);
      }
      loadStateRef.current = "idle";
      flickerState.current = { active: false, elapsed: 0, done: false };
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
