import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProxiedUrl, FOCUS_FADE_SPEED } from "../lib/constants";

const BOX_DEPTH = 10;
const FRAME_COLOR = "#1a1a2e";
const BACK_COLOR = "#0a0a15";
const SCREEN_OFF_COLOR = "#050510";

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

export default function WallPlane({
  id,
  imageUrl,
  position,
  rotation,
  baseHeight,
  sign,
  focusMode, // 'none' | 'auto' | 'manual-fly' | 'manual-display'
  cameraPosition,
  onClick,
  onTextureLoaded,
  displayOffsetZ,
  displayScale,
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

  // Manual focus fade state
  const manualFade = useRef({
    opacity: 1,
    target: 1,
    prevFocusMode: "none",
  });

  // Original rotation: face toward corridor center
  const originalRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    dummy.rotateX(rotation[0]);
    dummy.rotateY(rotation[1]);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [rotation, sign]);

  // Load texture — entirely imperative, no setState
  useEffect(() => {
    if (!imageUrl) return;
    let disposed = false;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (disposed) return;
      try {
        // ── 원본 미디어 크기 (3D scene 단위) ──────────────────────────────────
        const mediaAspect = img.width / img.height;
        const mediaH = baseHeight;
        const mediaW = mediaH * mediaAspect;

        // ── 패딩 포함 박스 크기 ───────────────────────────────────────────────
        const boxH = mediaH + 2 * MEDIA_PADDING;
        const boxW = mediaW + 2 * MEDIA_PADDING;
        const boxAspect = boxW / boxH;

        aspectRef.current = boxAspect;
        wallScaleRef.current = [boxW, boxH, 1];
        animState.current.currentScale = [boxW, boxH, 1];
        animState.current.targetScale = [boxW, boxH, 1];

        // ── 패딩을 포함한 캔버스 합성 텍스처 생성 ────────────────────────────
        // 패딩 크기를 픽셀로 환산: (MEDIA_PADDING / mediaH) 비율을 img.height에 적용
        const paddingPx = Math.round(img.height * (MEDIA_PADDING / mediaH));
        const cW = img.width + 2 * paddingPx;
        const cH = img.height + 2 * paddingPx;

        const canvas = document.createElement("canvas");
        canvas.width = cW;
        canvas.height = cH;
        const ctx = canvas.getContext("2d");

        // 배경(여백) 색상 채우기
        ctx.fillStyle = FRAME_COLOR;
        ctx.fillRect(0, 0, cW, cH);

        // 미디어를 정중앙에 그리기
        ctx.drawImage(img, paddingPx, paddingPx, img.width, img.height);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        // Apply texture to front material imperatively
        const mat = frontMatRef.current;
        if (mat) {
          mat.map = tex;
          mat.needsUpdate = true;
        }

        // Start flicker animation
        flickerState.current = { active: true, elapsed: 0, done: false };

        // boxAspect를 전달해야 FocusClone이 동일한 비율로 렌더링됨
        onTextureLoaded?.(id, tex, boxAspect);
      } catch (err) {
        console.error("Texture creation error:", err);
      }
    };

    img.onerror = (err) => {
      console.error("Image load failed:", imageUrl.substring(0, 80), err);
    };

    img.src = getProxiedUrl(imageUrl);

    return () => {
      disposed = true;
      const mat = frontMatRef.current;
      if (mat && mat.map) {
        mat.map.dispose();
        mat.map = null;
        mat.needsUpdate = true;
      }
    };
  }, [imageUrl, baseHeight]);

  // Update targets based on focusMode
  useEffect(() => {
    const state = animState.current;
    const aspect = aspectRef.current;

    if (focusMode === "manual-fly" && cameraPosition) {
      state.targetPos = [
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2] - displayOffsetZ,
      ];
      state.targetRot = [0, 0, 0];
      const displayH = baseHeight * displayScale;
      const displayW = displayH * aspect;
      state.targetScale = [displayW, displayH, 1];
    } else if (focusMode === "manual-display" && cameraPosition) {
      state.targetPos = [
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2] - displayOffsetZ,
      ];
      state.targetRot = [0, 0, 0];
      const displayH = baseHeight * displayScale;
      const displayW = displayH * aspect;
      state.targetScale = [displayW, displayH, 1];
    } else {
      state.targetPos = [...position];
      state.targetRot = [...originalRotation];
      state.targetScale = [...wallScaleRef.current];
    }

    // Fade in/out for manual focus (same behaviour as FocusClone for auto)
    const fade = manualFade.current;
    const isManual =
      focusMode === "manual-fly" || focusMode === "manual-display";
    const wasManual =
      fade.prevFocusMode === "manual-fly" ||
      fade.prevFocusMode === "manual-display";

    if (isManual && !wasManual) {
      // Entering manual: snap to 0 and fade in
      fade.opacity = 0;
      fade.target = 0.8;
      // Immediately apply so there is no one-frame flash
      if (meshRef.current) {
        const mats = meshRef.current.material;
        if (Array.isArray(mats)) {
          mats.forEach((mat) => {
            mat.transparent = true;
            mat.opacity = 0;
            mat.needsUpdate = true;
          });
        }
      }
    } else if (!isManual && wasManual) {
      // Leaving manual: fade back to fully opaque
      fade.target = 1;
    }
    fade.prevFocusMode = focusMode;
  }, [
    focusMode,
    cameraPosition,
    position,
    originalRotation,
    baseHeight,
    displayOffsetZ,
    displayScale,
  ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
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

    // Manual focus fade animation (all faces)
    const fade = manualFade.current;
    if (Math.abs(fade.opacity - fade.target) > 0.001) {
      const dir = fade.target > fade.opacity ? 1 : -1;
      fade.opacity += dir * FOCUS_FADE_SPEED * delta;
      if (dir > 0) fade.opacity = Math.min(fade.target, fade.opacity);
      else fade.opacity = Math.max(fade.target, fade.opacity);

      const mats = meshRef.current.material;
      if (Array.isArray(mats)) {
        const needsTransparent = fade.opacity < 0.999;
        mats.forEach((mat) => {
          if (mat.transparent !== needsTransparent) {
            mat.transparent = needsTransparent;
            mat.needsUpdate = true;
          }
          mat.opacity = fade.opacity;
        });
      }
    }

    // TV flicker animation on front material
    const mat = frontMatRef.current;
    if (!mat) return;

    const flicker = flickerState.current;
    if (flicker.active && !flicker.done) {
      flicker.elapsed += delta;
      const t = Math.min(1, flicker.elapsed / FLICKER_DURATION);
      const brightness = flickerBrightness(t);

      // color multiplies with texture: 0=black, 1=full texture
      mat.color.setScalar(brightness);
      mat.emissive.setScalar(brightness * 0.15);

      if (t >= 1) {
        flicker.done = true;
        flicker.active = false;
        mat.color.setScalar(1);
        mat.emissive.setScalar(0);
        mat.emissiveIntensity = 0;
      }
    }
  });

  // Box faces: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z(front/corridor-facing), 5=-Z(back/wall-facing)
  return (
    <mesh
      ref={meshRef}
      castShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id);
      }}
    >
      <boxGeometry args={[1, 1, BOX_DEPTH]} />
      <meshStandardMaterial attach="material-0" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-1" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-2" color={FRAME_COLOR} />
      <meshStandardMaterial attach="material-3" color={FRAME_COLOR} />
      <meshStandardMaterial
        ref={frontMatRef}
        attach="material-4"
        color={SCREEN_OFF_COLOR}
        emissive={SCREEN_OFF_COLOR}
        emissiveIntensity={0.5}
      />
      <meshStandardMaterial attach="material-5" color={BACK_COLOR} />
    </mesh>
  );
}
