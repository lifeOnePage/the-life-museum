// app/scenes/[id]/components/ExhibitionRingFront.jsx
// 선택된 이미지가 사용자 기준 맨 앞쪽 플레인에 위치하는 버전
"use client";

import * as THREE from "three";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import { motion } from "framer-motion";
import SceneDescBlock from "./SceneDescBlock";

// ▶︎ 고정 파라미터
const RADIUS = 7.2;
const PLANE_W = 0.8;
const PLANE_H = 0.6;
const CAM_Y = 2;
const CAM_Z = 22;

// 프록시 함수
function proxify(u) {
  try {
    if (!u) return u;
    const abs = new URL(
      u,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    if (typeof window !== "undefined" && abs.origin === window.location.origin)
      return u;
    if (abs.protocol === "http:" || abs.protocol === "https:") {
      return `/api/proxy?url=${encodeURIComponent(abs.href)}`;
    }
    return u;
  } catch {
    return u;
  }
}

// ===== 유틸 =====
function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
}

function lerpExp(prev, next, rate) {
  return prev + (next - prev) * rate;
}

// 2D 공간에서 두 점 사이의 거리 계산
function distance2D(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

// ===== 머티리얼들 =====
// (1) 흑백 주입을 함수로 빼서 Image/Video에 동일 적용
function injectGrayscaleOnBeforeCompile(mat) {
  mat.onBeforeCompile = (shader) => {
    const token = "#include <dithering_fragment>";
    if (shader.fragmentShader.includes(token)) {
      shader.fragmentShader = shader.fragmentShader.replace(
        token,
        `
        // --- grayscale (final stage) ---
        float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = vec3(gray);
        ${token}
        `,
      );
    } else {
      // 혹시 토큰이 없는 빌드/버전이면 끝에라도 붙여서 강제
      shader.fragmentShader += `
        float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = vec3(gray);
      `;
    }
  };
}
function ImageMat({ url, category, animationOpacity = 1, isDarkMode = true }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
  }, [tex, url]);

  // 카테고리별 스타일 설정
  let baseOpacity, color;

  switch (category) {
    case "selected": // 선택중인 이미지
      baseOpacity = 1.0;
      color = 0xffffff;
      break;
    case "sameItem": // 같은 이벤트의 다른 이미지
      baseOpacity = 0.5;
      color = 0xffffff;
      break;
    case "otherItem": // 다른 이벤트의 이미지 (흑백)
      baseOpacity = 0.6;
      color = 0x777777; // 회색톤으로 채도 낮춤 (약 47% 밝기)
      break;
    default:
      baseOpacity = 0.2;
      color = 0xffffff;
  }

  const opacity = baseOpacity * animationOpacity;
  // const materialRef = useRef();

  // Apply grayscale shader when material is created
  // const handleMaterialCreation = useCallback((material) => {
  //   if (!material) return;
  //   materialRef.current = material;

  //   if (category === 'otherItem') {
  //     injectGrayscaleOnBeforeCompile(mat);
  //     material.customProgramCacheKey = () => 'grayscale-image-v2';
  //   } else {
  //     material.customProgramCacheKey = () => 'normal-image-v2';
  //   }
  //   material.needsUpdate = true;
  // }, [category]);

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color,
      toneMapped: false,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false, // ✅ 투명 + 오버레이 구조에서 안정적
    });

    if (category === "otherItem") {
      injectGrayscaleOnBeforeCompile(mat); // ✅ 주입 위치 변경
      mat.customProgramCacheKey = () => "grayscale-image-v2";
    } else {
      mat.customProgramCacheKey = () => "normal-image-v2";
    }

    mat.needsUpdate = true;
    return mat;
  }, [tex, category, color, opacity]);
  useEffect(() => {
    if (!material) return;
    material.opacity = opacity;
    material.color.setHex(color);
    // opacity/color만 바뀌면 사실 needsUpdate(재컴파일)까지는 불필요.
    // material.needsUpdate = true;  // ← 가능하면 여기서는 빼는 걸 추천
  }, [material, opacity, color]);

  return <primitive object={material} attach="material" />;
}

function VideoMat({ url, category, animationOpacity = 1, isDarkMode = true }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const vtex = useVideoTexture(effUrl, {
    crossOrigin: "anonymous",
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    preload: "auto",
  });

  useEffect(() => {
    if (!vtex) return;
    vtex.colorSpace = THREE.SRGBColorSpace;
    vtex.needsUpdate = true;
  }, [vtex, url]);

  // 카테고리별 스타일 설정
  let baseOpacity, color;

  switch (category) {
    case "selected": // 선택중인 이미지
      baseOpacity = 1.0;
      color = 0xffffff;
      break;
    case "sameItem": // 같은 이벤트의 다른 이미지
      baseOpacity = 0.5;
      color = 0xffffff;
      break;
    case "otherItem": // 다른 이벤트의 이미지 (흑백)
      baseOpacity = 1;
      color = 0xffffff; // 회색톤으로 채도 낮춤 (약 47% 밝기)
      break;
    default:
      baseOpacity = 0.2;
      color = 0xffffff;
  }

  const opacity = baseOpacity * animationOpacity;
  const materialRef = useRef();

  // Apply grayscale shader when material is created
  const handleMaterialCreation = useCallback(
    (material) => {
      if (!material) return;
      materialRef.current = material;

      if (category === "otherItem") {
        material.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <output_fragment>",
            `
          #include <output_fragment>
          float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
          gl_FragColor.rgb = vec3(gray);
          `,
          );
        };
        material.customProgramCacheKey = () => "grayscale-video";
      } else {
        material.customProgramCacheKey = () => "normal-video";
      }
      material.needsUpdate = true;
    },
    [category],
  );

  return (
    <meshBasicMaterial
      key={`${category}-${url}`}
      ref={handleMaterialCreation}
      map={vtex}
      color={color}
      toneMapped={false}
      transparent={true}
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

function EmptyMat({ isDarkMode = true, animationOpacity = 1 }) {
  // 빈 플레인: 다크모드 10%, 라이트모드 20%
  const opacity = (isDarkMode ? 0.03 : 0.2) * animationOpacity;

  return (
    <meshBasicMaterial
      color="white"
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
      // depthWrite={false}
    />
  );
}

// ===== Projection Texture Overlay =====
function ProjectionOverlay({ animationOpacity = 1 }) {
  const projectionTex = useLoader(
    THREE.TextureLoader,
    "/images/glow effect.png",
  );

  useEffect(() => {
    if (!projectionTex) return;
    projectionTex.colorSpace = THREE.SRGBColorSpace;
    projectionTex.wrapS = THREE.ClampToEdgeWrapping;
    projectionTex.wrapT = THREE.ClampToEdgeWrapping;
    projectionTex.needsUpdate = true;
  }, [projectionTex]);

  return (
    <meshBasicMaterial
      map={projectionTex}
      color={0xffffff}
      transparent={true}
      opacity={0.3}
      blending={THREE.AdditiveBlending}
      // depthWrite={false}
      toneMapped={false}
    />
  );
}
// ===== Projection Texture Overlay =====
function ProjectionOverlayForOtherItem({ animationOpacity = 1 }) {
  const projectionTex = useLoader(
    THREE.TextureLoader,
    "/images/glow effect_v2.png",
  );

  useEffect(() => {
    if (!projectionTex) return;
    projectionTex.colorSpace = THREE.SRGBColorSpace;
    projectionTex.wrapS = THREE.ClampToEdgeWrapping;
    projectionTex.wrapT = THREE.ClampToEdgeWrapping;
    projectionTex.needsUpdate = true;
  }, [projectionTex]);

  return (
    <meshBasicMaterial
      map={projectionTex}
      color={0xffffff}
      transparent={true}
      opacity={0.3}
      blending={THREE.AdditiveBlending}
      // depthWrite={false}
      toneMapped={false}
    />
  );
}

// ===== 개별 플레인 =====
const MediaPlane = React.forwardRef(function MediaPlane(
  { slot, isSelected, selectedItemId, isDarkMode, animationOpacity = 1 },
  ref,
) {
  const kind = slot?.kind ?? slot?.type ?? "empty";
  const url = slot?.url ?? null;
  const itemId = slot?.itemId;

  // 카테고리 판단
  let category;
  if (kind === "empty") {
    category = "empty";
  } else if (isSelected) {
    category = "selected"; // 선택중인 이미지
  } else if (itemId === selectedItemId) {
    category = "sameItem"; // 같은 이벤트의 다른 이미지
  } else {
    category = "otherItem"; // 다른 이벤트의 이미지
  }

  return (
    <group ref={ref}>
      {/* 메인 이미지/비디오 플레인 */}
      <mesh renderOrder={10}>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        {kind === "image" && url ? (
          <Suspense
            fallback={
              <EmptyMat
                isDarkMode={isDarkMode}
                animationOpacity={animationOpacity}
              />
            }
          >
            <ImageMat
              url={url}
              category={category}
              isDarkMode={isDarkMode}
              animationOpacity={animationOpacity}
            />
          </Suspense>
        ) : kind === "video" && url ? (
          <Suspense
            fallback={
              <EmptyMat
                isDarkMode={isDarkMode}
                animationOpacity={animationOpacity}
              />
            }
          >
            <VideoMat
              url={url}
              category={category}
              isDarkMode={isDarkMode}
              animationOpacity={animationOpacity}
            />
          </Suspense>
        ) : (
          <EmptyMat
            isDarkMode={isDarkMode}
            animationOpacity={animationOpacity}
          />
        )}
      </mesh>

      {/* Projection Texture 오버레이 - 빈 플레인 및 다른 이벤트 미디어 제외, 다크모드일 때만 */}
      {kind !== "empty" && category !== "otherItem" && isDarkMode && (
        <mesh renderOrder={20} position={[0, 0, 0.01]}>
          <planeGeometry args={[PLANE_W * 3, PLANE_H * 3]} />
          <Suspense fallback={null}>
            <ProjectionOverlay animationOpacity={animationOpacity} />
          </Suspense>
        </mesh>
      )}
      {kind !== "empty" && category === "otherItem" && isDarkMode && (
        <mesh renderOrder={20} position={[0, 0, 0.01]}>
          <planeGeometry args={[PLANE_W * 3, PLANE_H * 3]} />
          <Suspense fallback={null}>
            <ProjectionOverlayForOtherItem
              animationOpacity={animationOpacity}
            />
          </Suspense>
        </mesh>
      )}
    </group>
  );
});

// ===== Projection Effect Overlay (선택된 플레인 위) =====
function ProjectionEffectOverlay() {
  const effectTex = useLoader(
    THREE.TextureLoader,
    "/images/projection_effect_texture_v2.png",
  );

  useEffect(() => {
    if (!effectTex) return;
    effectTex.colorSpace = THREE.SRGBColorSpace;
    effectTex.wrapS = THREE.ClampToEdgeWrapping;
    effectTex.wrapT = THREE.ClampToEdgeWrapping;
    effectTex.needsUpdate = true;
  }, [effectTex]);

  return (
    <>
      <planeGeometry args={[PLANE_W * 6, PLANE_H*2]} />
      <meshBasicMaterial
        map={effectTex}
        color={0xffffff}
        transparent={true}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </>
  );
}

// ===== 전시 링 내부 =====
function ExhibitionRingInner({
  slots,
  items = [],
  itemRanges = {},
  interval = 5000,
  onLabelPositions,
  isDarkMode = true,
  currentIndex = 0,
  onCurrentIndexChange,
  exhibitionScreen = "ring",
  isPaused = false,
  isSlowRotation = false,
}) {
  const N = Math.max(1, slots.length);
  const step = useMemo(() => (Math.PI * 2) / N, [N]);

  // ringAngle 초기화 - currentIndex에 맞게 즉시 설정 (앞쪽 버전: 90도 기준)
  const initialAngle = useMemo(() => Math.PI / 2 - currentIndex * step, []);
  const ringAngle = useRef(initialAngle);
  const planeRefs = useRef(new Array(N).fill(null));
  if (planeRefs.current.length !== N) planeRefs.current = Array(N).fill(null);

  const weightsRef = useRef(new Array(N).fill(0));
  if (weightsRef.current.length !== N) weightsRef.current = Array(N).fill(0);

  const lastUpdateTime = useRef(Date.now());

  const planeOpacitiesRef = useRef(new Array(N).fill(1));
  if (planeOpacitiesRef.current.length !== N)
    planeOpacitiesRef.current = Array(N).fill(1);

  // 선택된 플레인의 위치 추적 - ref로 변경하여 매 프레임 업데이트
  const effectOverlayRef = useRef();

  // 다음 컨텐츠가 있는 슬롯 찾기 (빈 슬롯 건너뛰기) - 역방향 회전
  const findNextContentSlot = (currentIdx) => {
    for (let offset = 1; offset < N; offset++) {
      const nextIdx = (currentIdx - offset + N) % N; // 역방향으로 변경
      const nextSlot = slots[nextIdx];

      // 컨텐츠가 있는 슬롯인지 확인
      const hasContent =
        (nextSlot?.kind === "image" || nextSlot?.kind === "video") &&
        nextSlot?.url;

      if (hasContent) {
        return nextIdx;
      }
    }

    // 컨텐츠가 하나도 없으면 현재 인덱스 유지
    return currentIdx;
  };

  const { camera, gl } = useThree();

  // 애니메이션 파라미터
  const bulge = 1; // 위로 튀어나오는 최대 높이

  // 텍스트 고정 위치 저장
  const fixedPositionsRef = useRef({});
  const prevSelectedItemIdRef = useRef(null);
  const animatingPositionsRef = useRef({}); // 애니메이션 중인 위치

  useFrame((_, dt) => {
    // 자동 회전: interval마다 다음 컨텐츠 슬롯으로 이동 (빈 슬롯 건너뛰기)
    // isPaused가 true일 때는 회전 중지 (편집 패널이 열렸을 때)
    // isSlowRotation이 true일 때는 선택 변경 중지 (한 바퀴 완료 후 처음으로 돌아갈 때)
    // interval이 0일 때는 회전 중지 (OFF 선택 시)
    if (
      exhibitionScreen === "ring" &&
      !isPaused &&
      !isSlowRotation &&
      interval > 0
    ) {
      const now = Date.now();
      if (now - lastUpdateTime.current >= interval) {
        const nextIndex = findNextContentSlot(currentIndex);
        if (onCurrentIndexChange) {
          onCurrentIndexChange(nextIndex);
        }
        lastUpdateTime.current = now;
      }
    }

    // 목표 각도: currentIndex를 90도 위치(정면, 앞쪽)로 - 변경된 부분
    const targetAngle = Math.PI / 2 - currentIndex * step;
    const diff = wrapPi(targetAngle - ringAngle.current);
    // 회전 속도: 느린 회전일 때는 6초 동안, 일반일 때는 빠르게
    const rotationSpeed = isSlowRotation ? 2 : 12;
    ringAngle.current += diff * Math.min(1, rotationSpeed * dt);

    // 현재 선택된 슬롯의 itemId
    const selectedItemId = slots[currentIndex]?.itemId;

    // 파도타기 애니메이션: 현재 슬롯 주변의 플레인들이 순차적으로 튀어나옴
    const waveRange = 1.5; // 범위를 줄여서 더 집중된 파도 효과
    const waveSpeed = 16; // 속도를 높여서 더 빠른 반응

    for (let i = 0; i < N; i++) {
      // 현재 슬롯으로부터의 거리 계산 (순환 고려)
      const dist = Math.min(
        Math.abs(i - currentIndex),
        N - Math.abs(i - currentIndex),
      );

      // 파도 효과: 현재 슬롯에 가까울수록 높게
      let targetWeight = 0;
      if (dist <= waveRange) {
        const t = 1 - dist / waveRange;
        targetWeight = Math.pow(t, 3); // 더 급격한 감쇠
      }

      const prevWeight = weightsRef.current[i] ?? 0;
      weightsRef.current[i] = lerpExp(
        prevWeight,
        targetWeight,
        Math.min(1, waveSpeed * dt),
      );
    }

    // 플레인 위치 업데이트
    const radiusMultiplier = 1;
    const opacityMultiplier = 1;
    const angleOffset = 0;

    for (let i = 0; i < N; i++) {
      const baseAngle = i * step + ringAngle.current;
      const w = weightsRef.current[i] ?? 0;

      // opacity 업데이트
      planeOpacitiesRef.current[i] = opacityMultiplier;

      const a = baseAngle + angleOffset;
      const adjustedRadius = RADIUS * radiusMultiplier;
      const x = Math.cos(a) * adjustedRadius;
      const baseZ = Math.sin(a) * adjustedRadius;

      // Z-fighting 방지: 위로 올라간 플레인을 Z축으로도 약간 앞으로 이동
      // + 인덱스 기반 미세 오프셋으로 인접 플레인들도 고유한 Z값 보장
      const zOffset = w * 2 + i * 0.01; // bulge 가중치 + 인덱스별 간격
      const z = baseZ + zOffset;

      // 원근감: z 좌표에 따라 y 좌표 조정
      const depthOffset = -baseZ * 0.4;
      const y = bulge * w + depthOffset;

      const m = planeRefs.current[i];
      if (!m) continue;
      m.position.set(x, y, z);

      // 선택된 플레인의 위치 추적 - 매 프레임 직접 업데이트
      if (i === currentIndex && effectOverlayRef.current) {
        // effect box 위치 계산 (bulge 애니메이션 포함하여 따라다님)
        const effectY = y + PLANE_H * 1.5;
        effectOverlayRef.current.position.set(x, effectY, z);
      }

      // 모든 플레인이 사용자(카메라)를 향하도록 회전 (같은 방향)
      m.rotation.set(0, 0, 0);

      // Z-fighting 방지: z 값 기반 renderOrder
      m.renderOrder = Math.round((z + RADIUS) * 100);
    }

    // 아이템 레이블 위치 업데이트 (2D 스크린 좌표로 변환)
    if (items && itemRanges && onLabelPositions) {
      // 현재 선택된 아이템 ID (이미 위에서 계산됨)
      const currentItemId = selectedItemId;

      // 레이블 위치 생성
      const newLabelPositions = [];
      items.forEach((item) => {
        if (item.isProfile) return;

        const range = itemRanges[item.id];
        if (!range) return;

        const isSelected = item.id === currentItemId;

        let labelX, labelY, normalizedX, normalizedY;

        // 모든 아이템이 매 프레임 현재 위치 계산 (회전)
        // 텍스처 배열이 reverse되어 있어서 range.end가 실제 맨 앞 이미지
        console.log(range)
        const startIndex = range.end;
        const baseAngle = startIndex * step + ringAngle.current;

        const planeX = Math.cos(baseAngle) * RADIUS;
        const planeZ = Math.sin(baseAngle) * RADIUS;
        const depthOffset = -planeZ * 0.4;
        const labelY3D = depthOffset;

        // 3D 공간에서 radial 방향으로 오프셋
        const radialDirX = Math.cos(baseAngle);
        const radialDirZ = Math.sin(baseAngle);

        // Z 위치에 따라 오프셋 조정
        const baseOffset = 1.0 - (planeZ / RADIUS) * 0.3; // 뒤: 0.7, 앞: 1.3
        const textOffset3D = baseOffset * 1.2;

        const text3DX = planeX + radialDirX * textOffset3D;
        const text3DZ = planeZ + radialDirZ * textOffset3D;

        // Z 깊이에 따라 약간의 Y 변화 (자연스러운 분산)
        const depthFactor = planeZ / RADIUS; // -1 ~ +1
        const yVariation = -depthFactor * 0.3; // 3D 공간에서 약간만 조정
        const text3DY = labelY3D + 0.4 + yVariation;

        // 텍스트 3D 위치를 2D로 투영
        const textWorldPos = new THREE.Vector3(text3DX, text3DY, text3DZ);
        const textScreenPos = textWorldPos.project(camera);

        labelX = (textScreenPos.x * 0.5 + 0.5) * gl.domElement.clientWidth;
        labelY = (-(textScreenPos.y * 0.5) + 0.5) * gl.domElement.clientHeight;

        // 정렬용 normalizedX/Y 계산
        const planeWorldPos = new THREE.Vector3(planeX, labelY3D, planeZ);
        const planeScreenPos = planeWorldPos.project(camera);
        const planePixelX =
          (planeScreenPos.x * 0.5 + 0.5) * gl.domElement.clientWidth;
        const planePixelY =
          (-(planeScreenPos.y * 0.5) + 0.5) * gl.domElement.clientHeight;

        const centerX = gl.domElement.clientWidth / 2;
        const centerY = gl.domElement.clientHeight / 2;
        const dirX = planePixelX - centerX;
        const dirY = planePixelY - centerY;
        normalizedX = dirX >= 0 ? 1 : -1;
        normalizedY = dirY >= 0 ? 1 : -1;

        // z-depth는 이미 위에서 계산됨 (화면 앞뒤 순서용)
        newLabelPositions.push({
          itemId: item.id,
          title: item.title || "",
          date: item.date || "",
          x: labelX,
          y: labelY,
          z: planeScreenPos.z,
          normalizedX,
          normalizedY,
          isSelected,
        });
      });

      onLabelPositions(newLabelPositions);
    }
  });

  // 현재 선택된 슬롯의 itemId (렌더링용)
  const selectedItemId = slots[currentIndex]?.itemId;

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {slots.map((slot, i) => {
        const isSelected = i === currentIndex; // 현재 인덱스와 비교
        const animationOpacity = 1; // 애니메이션 비활성화로 항상 1
        return (
          <MediaPlane
            key={i}
            ref={(el) => (planeRefs.current[i] = el)}
            slot={slot}
            isSelected={isSelected}
            selectedItemId={selectedItemId}
            isDarkMode={isDarkMode}
            animationOpacity={animationOpacity}
          />
        );
      })}

      {/* Projection Effect - 선택된 플레인 위에 붙어다니는 효과, 다크모드일 때만 */}
      {isDarkMode && (
        <Suspense fallback={null}>
          <mesh ref={effectOverlayRef} position={[0, 0, 0]}>
            <ProjectionEffectOverlay />
          </mesh>
        </Suspense>
      )}
    </group>
  );
}

export default function ExhibitionRingFront({
  slots,
  items = [],
  itemRanges = {},
  interval = 5000,
  isDarkMode = true,
  profile = {},
  currentIndex = 0,
  onCurrentIndexChange,
  exhibitionScreen = "ring",
  isPaused = false,
  isSlowRotation = false,
  isProfileOpen = true,
  onToggleProfile,
  showControls = true,
}) {
  // console.log(profile);
  const [labelPositions, setLabelPositions] = useState([]);
  const [textOpacity, setTextOpacity] = useState(1); // 텍스트 레이블 opacity

  // 수동 드래그 상태 (OFF 모드일 때)
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    startX: 0,
    startIndex: 0,
  });

  // 현재 선택된 슬롯과 아이템 정보
  const selectedSlot = slots[currentIndex];
  const selectedItemId = selectedSlot?.itemId;
  const selectedItem = items.find((item) => item.id === selectedItemId);

  // 유효한 컨텐츠 슬롯 인덱스 찾기 (empty가 아닌 것)
  const validIndices = useMemo(() => {
    return slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.kind !== "empty" && slot.url)
      .map(({ index }) => index);
  }, [slots]);

  // 드래그로 가장 가까운 유효한 인덱스 찾기
  const findNearestValidIndex = useCallback(
    (targetIndex) => {
      if (validIndices.length === 0) return 0;

      // targetIndex에 가장 가까운 유효한 인덱스 찾기
      let nearest = validIndices[0];
      let minDist = Math.abs(targetIndex - nearest);

      for (const validIdx of validIndices) {
        const dist = Math.abs(targetIndex - validIdx);
        if (dist < minDist) {
          minDist = dist;
          nearest = validIdx;
        }
      }

      return nearest;
    },
    [validIndices],
  );

  // 드래그 핸들러 (OFF 모드일 때만 작동)
  const handlePointerDown = useCallback(
    (e) => {
      // if (interval !== 0) return; // OFF 모드가 아니면 무시

      setIsDragging(true);
      dragStateRef.current = {
        startX: e.clientX,
        startIndex: currentIndex,
      };
    },
    [interval, currentIndex],
  );

  const handlePointerMove = useCallback(
    (e) => {
      // if (!isDragging || interval !== 0) return;
      if (!isDragging) return;

      const deltaX = e.clientX - dragStateRef.current.startX;
      const sensitivity = 0.05; // 드래그 민감도
      const indexDelta = -Math.round(deltaX * sensitivity);

      // 새 인덱스 계산 (유효한 인덱스 범위 내에서)
      const targetIndex = dragStateRef.current.startIndex - indexDelta;
      const clampedIndex = Math.max(0, Math.min(slots.length - 1, targetIndex));
      const nearestValidIndex = findNearestValidIndex(clampedIndex);

      if (nearestValidIndex !== currentIndex && onCurrentIndexChange) {
        onCurrentIndexChange(nearestValidIndex);
        // 인덱스가 변경되면 현재 위치를 새로운 시작점으로 업데이트 (용수철 효과 방지)
        dragStateRef.current = {
          startX: e.clientX,
          startIndex: nearestValidIndex,
        };
      }
    },
    [
      isDragging,
      interval,
      currentIndex,
      onCurrentIndexChange,
      slots.length,
      findNearestValidIndex,
    ],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // exhibitionScreen 변화에 따라 텍스트 opacity 조정
  const prevScreen = useRef(exhibitionScreen);
  useEffect(() => {
    if (
      prevScreen.current === "ring" &&
      exhibitionScreen === "profile-detail"
    ) {
      // 링 → 프로필: 텍스트 감추기
      setTextOpacity(0);
    } else if (
      prevScreen.current === "profile-detail" &&
      exhibitionScreen === "ring"
    ) {
      // 프로필 → 링: 텍스트 나타내기 (블러 사라진 후)
      setTimeout(() => setTextOpacity(1), 800);
    }
    prevScreen.current = exhibitionScreen;
  }, [exhibitionScreen]);

  useEffect(() => {
    const LM = THREE.DefaultLoadingManager;
    const _start = LM.onStart;
    const _load = LM.onLoad;
    const _err = LM.onError;
    LM.onStart = (url, itemsLoaded, itemsTotal) => {
      _start?.(url, itemsLoaded, itemsTotal);
    };
    LM.onLoad = () => {
      _load?.();
    };
    LM.onError = (url) => {
      _err?.(url);
    };
    return () => {
      LM.onStart = _start;
      LM.onLoad = _load;
      LM.onError = _err;
    };
  }, []);
  function getRenderedContainWidth(el, kind) {
    if (!el) return null;

    const W = el.clientWidth;
    const H = el.clientHeight;
    if (!W || !H) return null;

    let nw = 0,
      nh = 0;

    if (kind === "image") {
      nw = el.naturalWidth;
      nh = el.naturalHeight;
    } else if (kind === "video") {
      nw = el.videoWidth;
      nh = el.videoHeight;
    }

    // 메타데이터/이미지 로드 전이면 계산 불가
    if (!nw || !nh) return null;

    // object-contain(contain) 기준 실제 표시 스케일
    const s = Math.min(W / nw, H / nh);

    // 실제 “그려진 컨텐츠” 폭
    return Math.round(nw * s);
  }
  const mediaRef = useRef(null);

  const [renderedMediaWidth, setRenderedMediaWidth] = useState(null);

  useLayoutEffect(() => {
    let raf = 0;
    const setup = () => {
      const el = mediaRef.current;
      if (!el) return;

      const kind =
        selectedSlot?.kind === "video" || selectedSlot?.type === "video"
          ? "video"
          : "image";

      const update = () => {
        const w = getRenderedContainWidth(el, kind);
        // 계산이 안 되면 null 유지 (로드 전)
        setRenderedMediaWidth(w);
      };

      update();

      const ro = new ResizeObserver(() => update());
      ro.observe(el);

      window.addEventListener("resize", update);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", update);
      };
    };
    setup();
    return () => cancelAnimationFrame(raf);
  }, [selectedSlot?.url, selectedSlot?.kind, selectedSlot?.type]);

  // console.log(mediaWidth);

  return (
    <div
      className="abolute h-[calc(1100vh/12)] w-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{
        // cursor: interval === 0 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <Canvas
        camera={{
          position: [0, CAM_Y, CAM_Z],
          fov: 35, // FOV 줄여서 원근감 감소
        }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 10, 6]} intensity={0.7} />
        <Suspense fallback={null}>
          <ExhibitionRingInner
            slots={slots}
            items={items}
            itemRanges={itemRanges}
            interval={interval}
            onLabelPositions={setLabelPositions}
            isDarkMode={isDarkMode}
            currentIndex={currentIndex}
            onCurrentIndexChange={onCurrentIndexChange}
            exhibitionScreen={exhibitionScreen}
            isPaused={isPaused}
            isSlowRotation={isSlowRotation}
          />
        </Suspense>
      </Canvas>

      {/* 중앙에 선택된 이미지/비디오 크게 표시 + SceneDescBlock */}
      {selectedSlot && selectedItem && selectedSlot.url && (
        <div
          className="pointer-events-none absolute inset-0 z-10000 flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: textOpacity }}
        >
          {/* 이미지와 설명 블록을 같은 너비로 묶는 컨테이너 - 이미지 크기에 맞춤 */}
          <div
            className="flex min-w-0 flex-col" // inline-flex → flex 추천 (폭 계산 안정)
            style={{
              transform: "translateY(-15vh)",
              maxWidth: "calc(50vh * 25 / 17)",
              // width: renderedMediaWidth ? `${renderedMediaWidth}px` : "auto", // 컨테이너 자체를 잠금
            }}
          >
            {/* 이미지/비디오 - 원래 크기 제한 유지 */}
            {selectedSlot.kind === "image" || selectedSlot.type === "image" ? (
              <img
                ref={mediaRef}
                onLoad={() => {
                  const el = mediaRef.current;
                  const w = getRenderedContainWidth(el, "image");
                  setRenderedMediaWidth(w);
                }}
                src={proxify(selectedSlot.url)}
                alt={selectedItem.title || ""}
                className="object-contain"
                crossOrigin="anonymous"
                style={{
                  maxHeight: "50vh",
                  maxWidth: "calc(50vh * 25 / 17)",
                  filter: "drop-shadow(0px 40px 40px rgba(0, 0, 0, 0.2))",
                }}
              />
            ) : selectedSlot.kind === "video" ||
              selectedSlot.type === "video" ? (
              <video
                ref={mediaRef}
                onLoadedMetadata={() => {
                  const el = mediaRef.current;
                  const w = getRenderedContainWidth(el, "video");
                  setRenderedMediaWidth(w);
                }}
                src={proxify(selectedSlot.url)}
                className="object-contain"
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                style={{
                  maxHeight: "50vh",
                  maxWidth: "calc(50vh * 25 / 17)",
                  filter: "drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6))",
                }}
              />
            ) : null}

            {/* SceneDescBlock - 이미지 너비에 자동으로 맞춤, 높이는 내용에 따라 자동 */}
            <div
              className={`w-full min-w-0 overflow-hidden transition-colors duration-500 ${
                isDarkMode ? "bg-white/10 text-white" : "bg-black/5 text-black"
              } backdrop-blur-md`}
              style={{
                width: renderedMediaWidth
                  ? `${renderedMediaWidth}px`
                  : undefined,
                maxWidth: renderedMediaWidth
                  ? `${renderedMediaWidth}px`
                  : undefined,
                visibility: renderedMediaWidth ? "visible" : "hidden", // 측정 전 auto폭으로 튀는 것 방지
              }}
            >
              <SceneDescBlock
                selectedSlot={selectedSlot}
                selectedItem={selectedItem}
                isDarkMode={isDarkMode}
                textOpacity={1}
              />
            </div>
          </div>
        </div>
      )}

      {/* HTML 오버레이 텍스트 레이블 (2D, 가로) */}
      {labelPositions.map(
        ({
          itemId,
          title,
          date,
          x,
          y,
          z,
          normalizedX,
          normalizedY,
          isSelected,
        }) => {
          // 방향에 따라 텍스트 정렬 동적 계산
          const translateX = normalizedX > 0 ? "0%" : "-100%";
          const translateY = normalizedY > 0 ? "0%" : "-100%";

          // 다크모드/라이트모드에 따른 색상 (배경은 항상 동일, 투명도만 조정)
          const bgColor = isDarkMode ? "bg-black/100" : "bg-white/100";
          const textColor = isDarkMode
            ? isSelected
              ? "text-white"
              : "text-white/30"
            : isSelected
              ? "text-black"
              : "text-black/30";
          const dateOpacity = isSelected ? "opacity-60" : "opacity-30";

          // 클릭 핸들러: 해당 아이템의 첫 번째 이미지로 이동
          // 주의: 텍스처 배열이 reverse되어 있어서 원래 순서의 첫 이미지는 .end에 위치
          const handleLabelClick = () => {
            if (!isSelected && itemRanges[itemId] && onCurrentIndexChange) {
              const targetIndex = itemRanges[itemId].end;
              onCurrentIndexChange(targetIndex);
            }
          };

          return (
            <div
              key={itemId}
              className="absolute"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(${translateX}, ${translateY})`,
                zIndex: isSelected ? 9999 : Math.round((1 - z) * 1000),
                opacity: z > 1 ? 0 : textOpacity, // 카메라 뒤에 있으면 숨김, 애니메이션 시 페이드아웃
                pointerEvents: z > 1 ? "none" : "auto", // 카메라 뒤에 있으면 클릭 불가
              }}
            >
              <div
                className={`text-sm whitespace-nowrap ${textColor} ${
                  isSelected ? "font-bold" : "font-medium"
                }`}
              >
                <div
                  onClick={handleLabelClick}
                  className={`${bgColor} px-3 py-1 transition-all duration-300 ${
                    !isSelected ? "hover:bg-opacity-40 cursor-pointer" : ""
                  }`}
                >
                  {title}
                  {date && (
                    <span className={`ml-2 text-xs ${dateOpacity}`}>
                      {date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      )}
      <SceneDescBlock isDarkMode={isDarkMode} />

      {/* 프로필 토글 버튼 - 프로필 섹션 바로 위, 중앙 */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
        style={{
          bottom: isProfileOpen ? "calc(100vh / 8)" : "0",
        }}
      >
        <button
          onClick={onToggleProfile}
          className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm transition-colors ${
            isDarkMode
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-black/10 text-black hover:bg-black/20"
          }`}
          style={{
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform duration-300"
            style={{
              transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path
              d="M4 10l4-4 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">
            {isProfileOpen ? "닫기" : "프로필 보기"}
          </span>
        </button>
      </div>

      {/* 하단 프로필 정보 바 */}
      <div
        className={`absolute left-1/2 flex w-full -translate-x-1/2 flex-col transition-all duration-500 ${
          isDarkMode ? "text-black" : "text-white"
        } backdrop-blur-md`}
        style={{
          bottom: isProfileOpen ? "0" : "calc(-100vh / 8)",
        }}
      >
        {/* 프로필 내용 */}
        <div className="flex items-start px-8 py-3" style={{ height: "calc(100vh / 8)" }}
      >
        {/* 프로필 이미지 썸네일 - 정방형 고정 */}
        <div
          className={`flex aspect-square h-full flex-shrink-0 items-start justify-center ${
            isDarkMode ? "border-white/20" : "border-black/20"
          }`}
        >
          {profile?.photo ? (
            <img
              src={profile.photo}
              alt={profile?.name || "프로필"}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${
                isDarkMode ? "bg-white/10" : "bg-black/10"
              }`}
            >
              <span className="text-xs opacity-40">이미지</span>
            </div>
          )}
        </div>

        {/* 이름/제목 - 허그 너비 */}
        <div
          className={`flex h-full flex-shrink-0 items-start justify-center border-r px-4 pr-8 ${
            isDarkMode ? "border-white/50" : "border-black/20"
          }`}
        >
          <div className="flex flex-col gap-1">
            <div
              className={`font-bold ${isDarkMode ? "text-white/60" : "text-black/60"}`}
              style={{ fontSize: "clamp(0.75rem, 1.5vh, 1.25rem)" }}
            >
              {profile?.recordFormat === "entire-life" ? "NAME" : "TITLE"}
            </div>
            <div
              className={`leading-tight whitespace-nowrap ${
                isDarkMode ? "text-white/60" : "text-black/60"
              }`}
              style={{
                letterSpacing: "-0.05rem",
                fontSize: "clamp(0.875rem, 1.8vh, 2rem)",
              }}
            >
              {profile?.name || "-"}
            </div>
          </div>
        </div>

        {/* 출생/일자 - 허그 너비 */}
        <div
          className={`flex h-full flex-shrink-0 items-start justify-center border-r px-4 pr-8 ${
            isDarkMode ? "border-white/20" : "border-black/20"
          }`}
        >
          <div className="flex flex-col gap-1">
            <div
              className={`font-bold ${isDarkMode ? "text-white/60" : "text-black/60"}`}
              style={{ fontSize: "clamp(0.75rem, 1.5vh, 1.25rem)" }}
            >
              {profile?.recordFormat === "entire-life" ? "BIRTH" : "DATE"}
            </div>
            <div
              className={`flex flex-col whitespace-nowrap ${isDarkMode ? "text-white/60" : "text-black/60"}`}
              style={{
                letterSpacing: "-0.05rem",
                lineHeight: "1.2",
                fontSize: "clamp(0.875rem, 1.8vh, 2rem)",
              }}
            >
              {profile?.recordFormat === "entire-life" ? (
                <>
                  <div>{profile?.birthDate || "-"}</div>
                  {profile?.birthPlace && <div>{profile.birthPlace} 출생</div>}
                </>
              ) : (
                <div>{profile?.birthDate || "-"}</div>
              )}
            </div>
          </div>
        </div>

        {/* 생애문 - 나머지 공간 */}
        <div className="flex h-full flex-1 items-start justify-center pl-4">
          <div className="flex w-full flex-col gap-1">
            <div
              className={`font-bold ${isDarkMode ? "text-white/60" : "text-black/60"}`}
              style={{ fontSize: "clamp(0.75rem, 1.5vh, 1.25rem)" }}
            >
              {profile?.recordFormat === "entire-life"
                ? "BIOGRAPHY"
                : "DESCRIPTION"}
            </div>
            <div
              className={`leading-relaxed ${isDarkMode ? "text-white/60" : "text-black/60"} line-clamp-4 break-words`}
              style={{
                letterSpacing: "-0.05rem",
                fontSize: "clamp(0.875rem, 1.8vh, 2rem)",
              }}
            >
              {profile?.biography || "-"}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
