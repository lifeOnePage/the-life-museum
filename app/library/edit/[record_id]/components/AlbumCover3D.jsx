"use client";

import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

// 카메라 앞 고정 위치 (카메라 위치 [0, 0, 6] 기준)
const CAMERA_FRONT_POSITION = {
  x: 0,
  y: 0,
  z: 1.5,
};

// 이미지 텍스처 로딩 컴포넌트
function useAlbumTexture(imageUrl, fallbackColor) {
  const [texture, setTexture] = useState(null);

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
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      () => {
        setTexture(null);
      },
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl]);

  return texture;
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
  ctx.fillText(isFront ? "FRONT" : "BACK", 256, 450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
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
  const frontTexture = useAlbumTexture(frontImage, null);
  const backTexture = useAlbumTexture(backImage, null);

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
      state.targetRotY = isFlipped ? Math.PI : 0;
    } else {
      // original 위치로 복귀
      state.targetX = originalPosition.x;
      state.targetY = originalPosition.y;
      state.targetZ = originalPosition.z;
      state.targetRotX = tiltAngle; // 기울기 복원
      state.targetRotY = 0;
    }
  }, [isSelected, isFlipped, originalPosition, tiltAngle]);

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
    state.currentRotY += (state.targetRotY - state.currentRotY) * lerpFactor;

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
