import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FOCUS_DISMISS_DISTANCE,
  OPACITY_APPEAR_DIST,
  OPACITY_PEAK_DIST,
  OPACITY_HOLD_DIST,
  SLIDE_FADE_IN,
  SLIDE_FADE_OUT,
} from "../lib/constants";

// 진행도(0~1) → opacity 벨 커브: 앞 inFrac fade-in, 중간 hold, 뒤 outFrac fade-out
function bellOpacity(p, inFrac, outFrac) {
  if (p <= 0 || p >= 1) return 0;
  if (inFrac > 0 && p < inFrac) return p / inFrac;
  if (outFrac > 0 && p > 1 - outFrac) return (1 - p) / outFrac;
  return 1;
}

export default function FocusClone({
  texture,
  aspectRatio,
  baseHeight,
  cameraY,
  stateRef,
  displayScale,
  cloneZ,
  isVideo,
  videoTexture,
  videoPlayStateRef,
  planeId,
  onClick,
  // 순차 슬라이드쇼용 진행도 기반 페이드 범위(카메라 Z 기준). 지정 시 거리 기반
  // 대신 사용해, 클론이 가까이 생성돼도 접근하는 동안 0→100→0으로 부드럽게 페이드.
  fadeStartZ,
  fadeEndZ,
}) {
  const meshRef = useRef();

  const h = baseHeight * displayScale;
  const w = h * aspectRatio;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = stateRef.current;

    let opacity;
    if (typeof fadeStartZ === "number" && typeof fadeEndZ === "number") {
      // 순차 슬라이드쇼: 진행도 p(카메라가 spawn→해제 지점 접근 정도)에 따라
      // 클론이 멀리(SLIDE_START_DIST)에서 가까이(SLIDE_END_DIST)로 다가오며 페이드.
      const span = fadeStartZ - fadeEndZ;
      let p = span > 0 ? (fadeStartZ - s.cameraZ) / span : 1;
      p = Math.max(0, Math.min(1, p));
      // 클론을 타겟 plane의 실제 위치(cloneZ)에 고정 → 카메라가 양옆 복도 plane과
      // 동일한 속도로 접근(중앙 속도 = 복도 속도, 별도 fly-in 가속 없음).
      // opacity만 진행도 기반으로 0→100→0 부드럽게 페이드.
      meshRef.current.position.set(0, cameraY, cloneZ);
      opacity = bellOpacity(p, SLIDE_FADE_IN, SLIDE_FADE_OUT);
    } else {
      // Distance-based (prev 클론 / manual): 고정 위치 + 거리 기반 opacity
      meshRef.current.position.set(0, cameraY, cloneZ);
      const dist = Math.abs(s.cameraZ - cloneZ);
      opacity = 0;
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
    }
    meshRef.current.material.opacity = opacity;

    // Video: imperatively switch between poster and video texture based on play state
    if (isVideo && videoTexture && videoPlayStateRef) {
      const vps = videoPlayStateRef.current;
      // Show video texture when this plane is the active video (even if paused)
      // so the paused frame stays visible instead of switching to poster (black screen)
      const shouldShowVideo = vps.activePlaneId === planeId;
      const activeTexture = shouldShowVideo ? videoTexture : texture;

      if (meshRef.current.material.map !== activeTexture) {
        console.log(`[FocusClone] Texture switch: plane=${planeId} toVideo=${shouldShowVideo}`);
        meshRef.current.material.map = activeTexture;
        meshRef.current.material.needsUpdate = true;
      }

      // Only mark video texture needsUpdate each frame while actually playing
      if (shouldShowVideo && vps.isPlaying && opacity > 0) {
        videoTexture.needsUpdate = true;
      }
    }
  });

  if (!texture) return null;

  return (
    <mesh
      ref={meshRef}
      scale={[w, h, 1]}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
