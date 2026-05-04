"use client";

import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { parseGIF, decompressFrames } from "gifuct-js";
import { getMediaType } from "../utils/mediaType";
import { staticTextureCache, gifFrameCache } from "../utils/textureCache";

// 카메라 앞 고정 위치 (카메라 위치 [0, 1.5, 6] 기준)
const CAMERA_FRONT_POSITION = {
  x: 0,
  y: 1.6,
  z: 2.5,
};

// 마우스 tilt 효과 설정
const TILT_CONFIG = {
  maxAngle: 0.5, // 최대 기울기 각도 (라디안, 약 8.5도)
  smoothing: 0.08, // 보간 속도 (낮을수록 부드러움)
};

// GIF 애니메이션 텍스처 훅
function useGifTexture(imageUrl, isPlayable) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const framesRef = useRef([]);
  const frameIndexRef = useRef(0);
  const elapsedRef = useRef(0);
  const textureRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setReady(false);
      return;
    }

    let cancelled = false;

    function setupFromFrames(frames, width, height) {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      canvasRef.current = canvas;
      ctxRef.current = ctx;
      framesRef.current = frames;
      frameIndexRef.current = 0;
      elapsedRef.current = 0;

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = texture;

      drawFrame(ctx, frames[0], width, height);
      texture.needsUpdate = true;
      setReady(true);
    }

    const cached = gifFrameCache.get(imageUrl);
    if (cached) {
      // 프레임 데이터 캐시 히트: 네트워크 fetch 스킵, canvas/texture만 재생성
      setupFromFrames(cached.frames, cached.width, cached.height);
    } else {
      (async () => {
        try {
          const resp = await fetch(imageUrl);
          const buff = await resp.arrayBuffer();
          const parsed = parseGIF(buff);
          const frames = decompressFrames(parsed, true);
          if (cancelled || frames.length === 0) return;

          const { width, height } = parsed.lsd;
          gifFrameCache.set(imageUrl, { frames, width, height });
          setupFromFrames(frames, width, height);
        } catch {
          if (!cancelled) setReady(false);
        }
      })();
    }

    return () => {
      cancelled = true;
      textureRef.current?.dispose();
      textureRef.current = null;
      setReady(false);
    };
  }, [imageUrl]);

  // GIF 프레임 갱신
  useFrame((_, delta) => {
    if (!isPlayable || !ready || framesRef.current.length === 0) return;
    const frames = framesRef.current;
    elapsedRef.current += delta * 1000;
    const delay = frames[frameIndexRef.current]?.delay || 100;
    if (elapsedRef.current >= delay) {
      elapsedRef.current -= delay;
      frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
      const canvas = canvasRef.current;
      drawFrame(
        ctxRef.current,
        frames[frameIndexRef.current],
        canvas.width,
        canvas.height,
      );
      if (textureRef.current) textureRef.current.needsUpdate = true;
    }
  });

  return ready ? textureRef.current : null;
}

// GIF 프레임을 canvas에 그리는 헬퍼
function drawFrame(ctx, frame, canvasW, canvasH) {
  const { dims, patch } = frame;
  // patch(디코딩된 RGBA)를 ImageData로 변환
  const imageData = ctx.createImageData(dims.width, dims.height);
  imageData.data.set(patch);
  // 전체 클리어 후 프레임 위치에 그리기
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.putImageData(imageData, dims.left, dims.top);
}

// 정적 이미지 텍스처 훅 (모듈-레벨 캐시 사용 — 라우트 전환 후에도 재로드 없음)
function useStaticTexture(imageUrl) {
  const [texture, setTexture] = useState(() =>
    imageUrl ? (staticTextureCache.get(imageUrl) ?? null) : null,
  );

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }

    // 캐시 히트: 즉시 반환, 네트워크 요청 없음
    const cached = staticTextureCache.get(imageUrl);
    if (cached) {
      setTexture(cached);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        staticTextureCache.set(imageUrl, loadedTexture);
        setTexture(loadedTexture);
      },
      undefined,
      () => setTexture(null),
    );
    // cleanup에서 dispose 하지 않음 — 캐시가 수명 관리
  }, [imageUrl]);

  return texture;
}

// 비디오 텍스처 훅
function useVideoTexture(videoUrl, isPlayable) {
  const videoRef = useRef(null);
  const textureRef = useRef(null);
  const [ready, setReady] = useState(false);

  // 비디오 요소 초기화 (URL이 바뀔 때)
  useEffect(() => {
    if (!videoUrl) return;

    const video = document.createElement("video");
    video.src = videoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const onCanPlay = () => {
      textureRef.current = new THREE.VideoTexture(video);
      textureRef.current.colorSpace = THREE.SRGBColorSpace;
      // 즉시 play는 하지 않음 — isPlayable effect에서 제어
      setReady(true);
    };
    video.addEventListener("canplay", onCanPlay);
    videoRef.current = video;
    video.load();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.pause();
      video.src = "";
      textureRef.current?.dispose();
      textureRef.current = null;
      videoRef.current = null;
      setReady(false);
    };
  }, [videoUrl]);

  // isPlayable 변화에 따른 play/pause 제어
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;

    if (isPlayable && !document.hidden) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlayable, ready]);

  // Page Visibility API: 탭 전환 시 play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onVisChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (isPlayable) {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [isPlayable]);

  // Video 텍스처 매 프레임 갱신
  useFrame(() => {
    if (textureRef.current && videoRef.current && !videoRef.current.paused) {
      textureRef.current.needsUpdate = true;
    }
  });

  return ready ? textureRef.current : null;
}

// 이미지 URL에 따라 GIF/video/정적 텍스처를 자동 선택하는 훅
function useAlbumTexture(imageUrl, isPlayable) {
  const mediaType = getMediaType(imageUrl);

  // 훅 조건부 호출 금지 — 비활성 경로에 null 전달
  const gifTexture = useGifTexture(
    mediaType === "gif" ? imageUrl : null,
    isPlayable,
  );
  const videoTexture = useVideoTexture(
    mediaType === "video" ? imageUrl : null,
    isPlayable,
  );
  const staticTexture = useStaticTexture(
    mediaType === "image" ? imageUrl : null,
  );

  if (mediaType === "gif") return gifTexture;
  if (mediaType === "video") return videoTexture;
  return staticTexture;
}

// 플레이스홀더 텍스처 생성
function createPlaceholderTexture(index, isFront = true) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // 그라데이션 배경
  const colors = [
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
    ["#2a2a2a", "#1e1e1e"],
  ];

  const [color1, color2] = colors[index % colors.length];
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // 전면/후면 표시
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.font = "24px sans-serif";
  ctx.fillText(isFront ? "FRONT" : "BACK", 256, 450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function AlbumCover({
  index = 0,
  position = [0, 0, 0],
  size = 0.8,
  thickness = 0.02,
  tiltAngle = -0.15,
  frontImage = null,
  backImage = null,
  edgeColor = null,
  isSelected = false,
  isFlipped = false,
  isPlayable = true,
  sceneOffset = 0,
  onClick,
  onHoverChange,
  onGroupRef,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const outerGroupRef = useRef();
  const { camera } = useThree();

  // original 위치 저장 (position prop을 기반으로)
  const originalPosition = useMemo(
    () => ({
      x: position[0],
      y: position[1],
      z: position[2],
    }),
    [position[0], position[1], position[2]],
  );

  // 애니메이션 상태: current, target, original
  const animationState = useRef({
    // current (현재 보간 중인 값)
    currentX: position[0],
    currentY: position[1],
    currentZ: position[2],
    currentRotX: tiltAngle,
    currentRotY: 0,
    // target (목표 값)
    targetX: position[0],
    targetY: position[1],
    targetZ: position[2],
    targetRotX: tiltAngle,
    targetRotY: 0,
    // original은 위에서 별도 관리
    initialized: false,
  });

  // 초기화
  useEffect(() => {
    if (!animationState.current.initialized) {
      animationState.current.currentX = originalPosition.x;
      animationState.current.currentY = originalPosition.y;
      animationState.current.currentZ = originalPosition.z;
      animationState.current.targetX = originalPosition.x;
      animationState.current.targetY = originalPosition.y;
      animationState.current.targetZ = originalPosition.z;
      animationState.current.initialized = true;
    }
  }, [originalPosition]);

  // 호버 상태
  const [hovered, setHovered] = useState(false);

  // useFrame 조기 탈출: 모든 애니메이션이 수렴하면 true
  const settledRef = useRef(false);

  // 마우스 tilt 효과용 상태
  const mouseState = useRef({
    // 마우스 위치 (정규화: -1 ~ 1)
    mouseX: 0,
    mouseY: 0,
    // 현재 tilt 값 (보간용)
    currentTiltX: 0,
    currentTiltY: 0,
  });

  // 선택된 상태에서 마우스 이벤트 리스너
  useEffect(() => {
    if (!isSelected) {
      // 선택 해제 시 tilt 초기화
      mouseState.current.mouseX = 0;
      mouseState.current.mouseY = 0;
      return;
    }

    const handleMouseMove = (e) => {
      // 화면 중앙 기준 -1 ~ 1로 정규화
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseState.current.mouseX = x;
      mouseState.current.mouseY = y;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isSelected]);

  // 텍스처
  const frontTexture = useAlbumTexture(frontImage, isPlayable);
  const backTexture = useAlbumTexture(backImage, false);

  // 플레이스홀더 텍스처 (이미지가 없을 때)
  const placeholderFront = useMemo(
    () => createPlaceholderTexture(index, true),
    [index],
  );
  const placeholderBack = useMemo(
    () => createPlaceholderTexture(index, false),
    [index],
  );

  // 선택/플립 상태에 따른 target 위치 업데이트
  useEffect(() => {
    settledRef.current = false;
    const state = animationState.current;

    if (isSelected) {
      // 화면 크기에 맞게 앨범이 항상 화면 중앙에 오도록 동적 계산
      // Y: 현재 카메라 Y (스크롤 오프셋 반영)
      // Z: FOV + aspect + 앨범 크기로 화면 점유율 65%가 되는 거리 계산
      const fovYRad = (camera.fov * Math.PI) / 180;
      const aspect = camera.aspect || 1;
      const fovXRad = 2 * Math.atan(Math.tan(fovYRad / 2) * aspect);
      // 세로/가로 중 더 좁은 방향 기준으로 거리 계산 (클리핑 방지)
      const constrainedFov = Math.min(fovYRad, fovXRad);
      const DISPLAY_FRACTION = 0.65;
      const dist = size / 2 / (Math.tan(constrainedFov / 2) * DISPLAY_FRACTION);

      state.targetX = CAMERA_FRONT_POSITION.x;
      // 로컬 좌표 보정: outerGroupRef는 sceneOffset만큼 이동된 부모 group의 자식
      // 월드 y = targetY + sceneOffset = camera.position.y 이 되도록 보정
      state.targetY = camera.position.y - sceneOffset;
      state.targetZ = camera.position.z - dist;
      state.targetRotX = 0;
      state.targetRotY = isFlipped ? Math.PI : 0;
    } else {
      // original 위치로 복귀
      state.targetX = originalPosition.x;
      state.targetY = originalPosition.y;
      state.targetZ = originalPosition.z;
      state.targetRotX = tiltAngle; // 기울기 복원
      state.targetRotY = 0;
    }
  }, [isSelected, isFlipped, originalPosition, tiltAngle, sceneOffset]);

  // 호버 시 위로 리프트
  useEffect(() => {
    settledRef.current = false;
    if (!isSelected && hovered) {
      animationState.current.targetZ = originalPosition.z + 0.3;
    } else if (!isSelected) {
      animationState.current.targetZ = originalPosition.z;
    }
  }, [hovered, isSelected, originalPosition.y]);

  // 프레임 루프 - 위치 애니메이션 + tilt + 그림자 (병합, settledRef 조기 탈출)
  useFrame((_, delta) => {
    if (settledRef.current) return;
    if (!outerGroupRef.current || !groupRef.current) return;

    const state = animationState.current;
    const EPSILON = 0.0005;

    // 위치/회전이 target에 수렴했는지 체크
    const posDiff =
      Math.abs(state.targetX - state.currentX) +
      Math.abs(state.targetY - state.currentY) +
      Math.abs(state.targetZ - state.currentZ) +
      Math.abs(state.targetRotX - state.currentRotX) +
      Math.abs(state.targetRotY - state.currentRotY);

    let posSettled = true;
    if (posDiff > EPSILON) {
      posSettled = false;
      const lerpFactor = 1 - Math.pow(0.001, delta);

      state.currentX += (state.targetX - state.currentX) * lerpFactor;
      state.currentY += (state.targetY - state.currentY) * lerpFactor;
      state.currentZ += (state.targetZ - state.currentZ) * lerpFactor;

      state.currentRotX += (state.targetRotX - state.currentRotX) * lerpFactor;
      state.currentRotY += (state.targetRotY - state.currentRotY) * lerpFactor;
    }

    outerGroupRef.current.position.x = state.currentX;
    outerGroupRef.current.position.y = state.currentY;
    outerGroupRef.current.position.z = state.currentZ;
    outerGroupRef.current.rotation.x = state.currentRotX;
    outerGroupRef.current.rotation.y = state.currentRotY;

    // 마우스 tilt 효과 (선택된 상태에서만)
    const mouse = mouseState.current;
    let tiltSettled = true;
    if (isSelected) {
      const targetTiltY = mouse.mouseX * TILT_CONFIG.maxAngle;
      const targetTiltX = -mouse.mouseY * TILT_CONFIG.maxAngle;

      mouse.currentTiltX +=
        (targetTiltX - mouse.currentTiltX) * TILT_CONFIG.smoothing;
      mouse.currentTiltY +=
        (targetTiltY - mouse.currentTiltY) * TILT_CONFIG.smoothing;

      groupRef.current.rotation.x = mouse.currentTiltX;
      groupRef.current.rotation.y = mouse.currentTiltY;
      tiltSettled = false; // always animate while selected (mouse tracking)
    } else if (
      Math.abs(mouse.currentTiltX) > 0.001 ||
      Math.abs(mouse.currentTiltY) > 0.001
    ) {
      tiltSettled = false;
      mouse.currentTiltX += (0 - mouse.currentTiltX) * TILT_CONFIG.smoothing;
      mouse.currentTiltY += (0 - mouse.currentTiltY) * TILT_CONFIG.smoothing;
      groupRef.current.rotation.x = mouse.currentTiltX;
      groupRef.current.rotation.y = mouse.currentTiltY;
    }

    // 그림자 opacity 보간 (병합)
    let shadowSettled = true;
    if (shadowRef.current) {
      const shadowTarget = isSelected ? 0 : 1;
      shadowOpacityRef.current +=
        (shadowTarget - shadowOpacityRef.current) * 0.1;
      shadowRef.current.material.opacity = shadowOpacityRef.current;
      if (Math.abs(shadowTarget - shadowOpacityRef.current) > 0.005) {
        shadowSettled = false;
      }
    }

    // 모든 애니메이션 수렴 시 settled
    if (posSettled && tiltSettled && shadowSettled) {
      settledRef.current = true;
    }
  });

  // 측면 머티리얼 (색상만 다를 때 재생성, BasicMaterial로 PBR 비용 제거)
  const sideMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: edgeColor || "#efefef" });
  }, [edgeColor]);

  // 머티리얼 생성 + 이전 머티리얼 dispose
  const prevMaterialsRef = useRef([]);
  const materials = useMemo(() => {
    // 이전 앞/뒷면 머티리얼만 dispose (측면은 별도 관리)
    prevMaterialsRef.current.forEach((m) => m.dispose());

    const actualFrontTex = frontTexture || placeholderFront;
    const actualBackTex = backTexture || placeholderBack;

    // 앞면 (+Z) - 커버 이미지
    const front = new THREE.MeshStandardMaterial({
      map: actualFrontTex,
      roughness: 0.3,
      metalness: 0.3,
      // emissive: "#ffffff",
      // emissiveIntensity: 0.1,
    });
    // 뒷면 (-Z) - 뒤 이미지
    const back = new THREE.MeshStandardMaterial({
      map: actualBackTex,
      roughness: 0.65,
      metalness: 0.1,
      // emissive: "#ffffff",
      // emissiveIntensity: 0.1,
    });

    prevMaterialsRef.current = [front, back];

    // 6면 머티리얼: [+X, -X, +Y, -Y, +Z(앞면), -Z(뒷면)]
    return [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      front,
      back,
    ];
  }, [
    frontTexture,
    backTexture,
    placeholderFront,
    placeholderBack,
    sideMaterial,
  ]);

  // 선택 시 outerGroupRef를 부모에 노출 (BlurLayer용, 현재 비활성화)
  useEffect(() => {
    if (isSelected && outerGroupRef.current) {
      onGroupRef?.(outerGroupRef.current);
      return () => onGroupRef?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  // 커서 변경
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  // 라디얼 그라데이션 그림자 텍스처
  const shadowTexture = useMemo(() => {
    const res = 64;
    const canvas = document.createElement("canvas");
    canvas.width = res;
    canvas.height = res;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(
      res / 2, res / 2, 0,
      res / 2, res / 2, res / 2,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0.22)");
    gradient.addColorStop(0.5, "rgba(0,0,0,0.10)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, res, res);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Fake shadow: 앨범 아래 타원형 그림자
  const shadowRef = useRef();
  const shadowOpacityRef = useRef(1);

  // 선택 상태에 따라 layer 변경 (블러 렌더링에서 제외하기 위함)
  return (
    // 최외곽 그룹: 절대 위치 + 회전 애니메이션 적용
    <group ref={outerGroupRef}>
      {/* Fake shadow: 선반 위 앨범 아래 부드러운 타원 그림자 */}
      <mesh
        ref={shadowRef}
        raycast={() => null}
        position={[0, -size / 2 + 0.002, thickness / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 0.5, 1]}
      >
        <planeGeometry args={[size * 0.9, size * 0.9]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* 내부 그룹: 메시 포함 */}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          material={materials}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHoverChange?.(true);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHoverChange?.(false);
          }}
        >
          {/* N x N x m 얇은 정사각판 */}
          <boxGeometry args={[size, size, thickness]} />
        </mesh>
      </group>
    </group>
  );
}
