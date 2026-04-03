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

function WallPlane({
  id,
  imageUrl,
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
  const startLoad = useCallback(() => {
    if (!imageUrl || loadStateRef.current !== "idle") return;
    loadStateRef.current = "loading";

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
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

        const paddingPx = Math.round(img.height * (MEDIA_PADDING / mediaH));
        const cW = img.width + 2 * paddingPx;
        const cH = img.height + 2 * paddingPx;

        const canvas = document.createElement("canvas");
        canvas.width = cW;
        canvas.height = cH;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = FRAME_COLOR;
        ctx.fillRect(0, 0, cW, cH);
        ctx.drawImage(img, paddingPx, paddingPx, img.width, img.height);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        const mat = frontMatRef.current;
        if (mat) {
          mat.map = tex;
          mat.needsUpdate = true;
        }

        flickerState.current = { active: true, elapsed: 0, done: false };
        loadStateRef.current = "loaded";

        onTextureLoaded?.(id, tex, boxAspect);
      } catch (err) {
        console.error("Texture creation error:", err);
        loadStateRef.current = "idle";
      }
    };

    img.onerror = (err) => {
      console.error("Image load failed:", imageUrl.substring(0, 80), err);
      loadStateRef.current = "idle";
    };

    img.src = getProxiedUrl(imageUrl);
  }, [imageUrl, baseHeight, id, onTextureLoaded]);

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
      loadStateRef.current = "idle";
    };
  }, [imageUrl]);

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
      const focusZ = stateRef.current.focusCloneZ;
      const dist = Math.abs(cameraZ - focusZ);
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
        mat.transparent = true;
        mat.opacity = opacity;
        mat.color.setScalar(1);
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
        mat.opacity = 1;
      }
      return;
    }

    // ── Normal wall behavior ───────────────────────────────────────────────
    const wrappedZ = computeWrappedZ(position[2], cameraZ, corridorSpan);
    const distToCamera = Math.abs(cameraZ - wrappedZ);

    // Lazy load: start loading when camera approaches
    // Use min(absolute, proportional) so threshold scales with corridor size
    const loadDist = Math.min(FOG_FAR + 800, corridorSpan * 0.5);
    if (loadStateRef.current === "idle" && distToCamera <= loadDist) {
      startLoad();
    }

    // Far-distance dispose: release texture to reclaim GPU memory
    const disposeDist = Math.min(FOG_FAR + 1500, corridorSpan * 0.8);
    if (loadStateRef.current === "loaded" && distToCamera > disposeDist) {
      if (mat) {
        if (mat.map) {
          mat.map.dispose();
          mat.map = null;
        }
        mat.color.set(SCREEN_OFF_COLOR);
        mat.needsUpdate = true;
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

    // TV flicker animation on front material
    if (!mat) return;

    const flicker = flickerState.current;
    if (flicker.active && !flicker.done) {
      flicker.elapsed += delta;
      const t = Math.min(1, flicker.elapsed / FLICKER_DURATION);
      const brightness = flickerBrightness(t);

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
