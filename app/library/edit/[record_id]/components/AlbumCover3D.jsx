"use client";

import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

// 카메라 앞 고정 위치 (카메라 위치 [0, 0, 6] 기준)
const CAMERA_FRONT_POSITION = {
  x: 0,
  y: 0,
  z: 1.5,
};

function getMediaType(url) {
  if (!url) return null;
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".gif")) return "gif";
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov")
  )
    return "video";
  return "image";
}

// 정적 이미지 텍스처 훅
// cover=true 이면 정사각형 면에 object-fit:cover 방식으로 UV를 조정합니다.
function useStaticTexture(imageUrl, cover = false) {
  const [texture, setTexture] = useState(null);
  const { gl } = useThree();

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = true;
        loadedTexture.anisotropy = gl.capabilities.getMaxAnisotropy();

        if (cover) {
          const img = loadedTexture.image;
          if (img && img.width && img.height) {
            const aspect = img.width / img.height;
            if (aspect > 1) {
              // 가로가 긴 이미지: 높이 맞추고 좌우 크롭
              loadedTexture.repeat.set(1 / aspect, 1);
              loadedTexture.offset.set((1 - 1 / aspect) / 2, 0);
            } else {
              // 세로가 긴 이미지: 너비 맞추고 상하 크롭
              loadedTexture.repeat.set(1, aspect);
              loadedTexture.offset.set(0, (1 - aspect) / 2);
            }
          }
        }

        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      () => setTexture(null),
    );

    return () => {
      texture?.dispose();
    };
  }, [imageUrl, gl, cover]);

  return texture;
}

// 비디오 텍스처 훅
function useVideoTexture(videoUrl) {
  const videoRef = useRef(null);
  const textureRef = useRef(null);
  const [ready, setReady] = useState(false);

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
      video.play().catch(() => {});
      setReady(true);
    };
    video.addEventListener("canplay", onCanPlay);
    videoRef.current = video;
    video.load();

    const onVisChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
      video.removeEventListener("canplay", onCanPlay);
      video.pause();
      video.src = "";
      textureRef.current?.dispose();
      textureRef.current = null;
      videoRef.current = null;
      setReady(false);
    };
  }, [videoUrl]);

  useFrame(() => {
    if (ready && textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  });

  return ready ? textureRef.current : null;
}

// 이미지 URL에 따라 video/정적 텍스처를 자동 선택하는 훅
function useAlbumTexture(imageUrl, cover = false) {
  const type = getMediaType(imageUrl);
  // 훅 조건부 호출 금지 → null 전달로 비활성화
  const videoTexture = useVideoTexture(type === "video" ? imageUrl : null);
  const staticTexture = useStaticTexture(type !== "video" ? imageUrl : null, cover);
  return type === "video" ? videoTexture : staticTexture;
}

// 플레이스홀더 텍스처 생성
function createPlaceholderTexture(index, isFront = true) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // 그라데이션 배경
  const colors = [
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
    ["#dedede", "#efefef"],
  ];

  const [color1, color2] = colors[index % colors.length];
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // 앨범 번호 표시
  // ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  // ctx.font = "bold 200px sans-serif";
  // ctx.textAlign = "center";
  // ctx.textBaseline = "middle";
  // ctx.fillText(String(index + 1), 256, 256);

  // 전면/후면 표시
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(isFront ? "앨범의 앞면입니다." : "앨범의 뒷면입니다.", 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function AlbumCover3D({
  index = 0,
  position = [0, 0, 0],
  size = 0.8,
  thickness = 0.02,
  tiltAngle = 0,
  frontImage = null,
  backImage = null,
  isSelected = false,
  isFlipped = false,
  rotationY,
  edgeColor = null,
  onClick,
  onHoverChange,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const outerGroupRef = useRef();

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
    rotationSnapped: false,
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

  // 텍스처
  const frontTexture = useAlbumTexture(frontImage);
  const backTexture = useAlbumTexture(backImage, true);

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
    const state = animationState.current;

    if (isSelected) {
      // 카메라 앞 중앙으로 이동
      state.targetX = CAMERA_FRONT_POSITION.x;
      state.targetY = CAMERA_FRONT_POSITION.y;
      state.targetZ = CAMERA_FRONT_POSITION.z;
      state.targetRotX = 0; // 기울기 제거 (정면으로)

      // 플립 상태에 따라 Y축 회전
      const targetRot =
        typeof rotationY === "number"
          ? rotationY
          : isFlipped
            ? Math.PI
            : 0;

      // 첫 마운트 시 현재 회전값을 target으로 snap (lerp 없이 즉시 배치)
      if (!state.rotationSnapped) {
        state.currentRotY = targetRot;
        state.rotationSnapped = true;
      }
      state.targetRotY = targetRot;
    } else {
      // original 위치로 복귀
      state.targetX = originalPosition.x;
      state.targetY = originalPosition.y;
      state.targetZ = originalPosition.z;
      state.targetRotX = tiltAngle; // 기울기 복원
      state.targetRotY = 0;
    }
  }, [isSelected, isFlipped, rotationY, originalPosition, tiltAngle]);

  // 프레임 루프 - 부드러운 애니메이션
  useFrame((_, delta) => {
    if (!outerGroupRef.current || !groupRef.current) return;

    const state = animationState.current;
    const lerpFactor = 1 - Math.pow(0.001, delta);

    // 위치 보간
    state.currentX += (state.targetX - state.currentX) * lerpFactor;
    state.currentY += (state.targetY - state.currentY) * lerpFactor;
    state.currentZ += (state.targetZ - state.currentZ) * lerpFactor;

    // 회전 보간
    state.currentRotX += (state.targetRotX - state.currentRotX) * lerpFactor;
    // Y축은 최단 경로로 보간 (모듈러 연산으로 반 바퀴 이상 돌지 않게)
    let rotDiff = state.targetRotY - state.currentRotY;
    rotDiff = rotDiff - Math.round(rotDiff / (2 * Math.PI)) * (2 * Math.PI);
    state.currentRotY += rotDiff * lerpFactor;

    // 적용 (outerGroupRef에 절대 위치 적용)
    outerGroupRef.current.position.x = state.currentX;
    outerGroupRef.current.position.y = state.currentY;
    outerGroupRef.current.position.z = state.currentZ;
    outerGroupRef.current.rotation.x = state.currentRotX;
    outerGroupRef.current.rotation.y = state.currentRotY;
  });

  // 머티리얼 생성
  const materials = useMemo(() => {
    const actualFrontTex = frontTexture || placeholderFront;
    const actualBackTex = backTexture || placeholderBack;
    const sideColor = edgeColor || "#efefef";

    // 6면 머티리얼: [+X, -X, +Y, -Y, +Z(앞면), -Z(뒷면)]
    return [
      // 오른쪽 측면
      new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
      // 왼쪽 측면
      new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
      // 위쪽
      new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
      // 아래쪽
      new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
      // 앞면 (+Z) - 커버 이미지
      new THREE.MeshStandardMaterial({
        map: actualFrontTex,
        roughness: 0.5,
        metalness: 0.1,
      }),
      // 뒷면 (-Z) - 뒤 이미지
      new THREE.MeshStandardMaterial({
        map: actualBackTex,
        roughness: 0.5,
        metalness: 0.1,
      }),
    ];
  }, [frontTexture, backTexture, placeholderFront, placeholderBack, edgeColor]);

  // 커서 변경
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  // 선택 상태에 따라 layer 변경 (블러 렌더링에서 제외하기 위함)
  return (
    // 최외곽 그룹: 절대 위치 + 회전 애니메이션 적용
    <group ref={outerGroupRef}>
      {/* 내부 그룹: 메시 포함 */}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          material={materials}
          castShadow
          receiveShadow
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
