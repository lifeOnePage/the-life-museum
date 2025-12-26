// app/scenes/[id]/components/ExhibitionRingFront.jsx
// 선택된 이미지가 사용자 기준 맨 앞쪽 플레인에 위치하는 버전
"use client";

import * as THREE from "three";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import { motion } from "framer-motion";

// ▶︎ 고정 파라미터
const RADIUS = 7.5;
const PLANE_W = 1;
const PLANE_H = 0.8;
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
function ImageMat({ url, isSelected, isDarkMode, animationOpacity = 1 }) {
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

  // 다크모드: 비선택 시 어둡게
  // 라이트모드: 비선택 시 매우 연하게
  const baseOpacity = isSelected ? 0.9 : isDarkMode ? 0.2 : 0.15;
  const opacity = baseOpacity * animationOpacity;
  const color = isDarkMode ? (isSelected ? 0xffffff : 0x666666) : 0xffffff;

  return (
    <meshBasicMaterial
      map={tex}
      color={color}
      toneMapped={false}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function VideoMat({ url, isSelected, isDarkMode, animationOpacity = 1 }) {
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

  // 다크모드: 비선택 시 어둡게
  // 라이트모드: 비선택 시 매우 연하게
  const baseOpacity = isSelected ? 0.8 : isDarkMode ? 0.2 : 0.15;
  const opacity = baseOpacity * animationOpacity;
  const color = isDarkMode ? (isSelected ? 0xffffff : 0x666666) : 0xffffff;

  return (
    <meshBasicMaterial
      map={vtex}
      color={color}
      toneMapped={false}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function EmptyMat({ opacity = 0.06, animationOpacity = 1 }) {
  return (
    <meshBasicMaterial
      color="white"
      transparent
      opacity={opacity * animationOpacity}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

// ===== 개별 플레인 =====
const MediaPlane = React.forwardRef(function MediaPlane(
  { slot, isSelected, isDarkMode, animationOpacity = 1 },
  ref,
) {
  const kind = slot?.kind ?? slot?.type ?? "empty";
  const url = slot?.url ?? null;

  return (
    <mesh ref={ref}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      {kind === "image" && url ? (
        <Suspense
          fallback={
            <EmptyMat opacity={0.18} animationOpacity={animationOpacity} />
          }
        >
          <ImageMat
            url={url}
            isSelected={isSelected}
            isDarkMode={isDarkMode}
            animationOpacity={animationOpacity}
          />
        </Suspense>
      ) : kind === "video" && url ? (
        <Suspense
          fallback={
            <EmptyMat opacity={0.18} animationOpacity={animationOpacity} />
          }
        >
          <VideoMat
            url={url}
            isSelected={isSelected}
            isDarkMode={isDarkMode}
            animationOpacity={animationOpacity}
          />
        </Suspense>
      ) : (
        <EmptyMat animationOpacity={animationOpacity} />
      )}
    </mesh>
  );
});

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
  const bulge = 0.3; // 위로 튀어나오는 최대 높이

  // 텍스트 고정 위치 저장
  const fixedPositionsRef = useRef({});
  const prevSelectedItemIdRef = useRef(null);
  const animatingPositionsRef = useRef({}); // 애니메이션 중인 위치

  useFrame((_, dt) => {
    // 자동 회전: interval마다 다음 컨텐츠 슬롯으로 이동 (빈 슬롯 건너뛰기)
    // isPaused가 true일 때는 회전 중지 (편집 패널이 열렸을 때)
    // isSlowRotation이 true일 때는 선택 변경 중지 (한 바퀴 완료 후 처음으로 돌아갈 때)
    // interval이 0일 때는 회전 중지 (OFF 선택 시)
    if (exhibitionScreen === "ring" && !isPaused && !isSlowRotation && interval > 0) {
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
      // const z = Math.sin(a) * adjustedRadius;
      const z = Math.sin(a) * adjustedRadius + bulge * w;

      // 원근감: z 좌표에 따라 y 좌표 조정
      const depthOffset = -z * 0.5;
      // const y = bulge * w + depthOffset;
      const y = depthOffset;
      // const y = 0;

      const m = planeRefs.current[i];
      if (!m) continue;
      m.position.set(x, y, z);

      // 모든 플레인이 사용자(카메라)를 향하도록 회전 (같은 방향)
      m.rotation.set(0, 0, 0);

      // Z-fighting 방지
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
        const startIndex = range.start;
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
        const isSelected = slot?.itemId === selectedItemId;
        const animationOpacity = 1; // 애니메이션 비활성화로 항상 1
        return (
          <MediaPlane
            key={i}
            ref={(el) => (planeRefs.current[i] = el)}
            slot={slot}
            isSelected={isSelected}
            isDarkMode={isDarkMode}
            animationOpacity={animationOpacity}
          />
        );
      })}
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
  const findNearestValidIndex = useCallback((targetIndex) => {
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
  }, [validIndices]);

  // 드래그 핸들러 (OFF 모드일 때만 작동)
  const handlePointerDown = useCallback((e) => {
    // if (interval !== 0) return; // OFF 모드가 아니면 무시

    setIsDragging(true);
    dragStateRef.current = {
      startX: e.clientX,
      startIndex: currentIndex,
    };
  }, [interval, currentIndex]);

  const handlePointerMove = useCallback((e) => {
    // if (!isDragging || interval !== 0) return;
    if (!isDragging) return;

    const deltaX = e.clientX - dragStateRef.current.startX;
    const sensitivity = 0.05; // 드래그 민감도
    const indexDelta = - Math.round(deltaX * sensitivity);

    // 새 인덱스 계산 (유효한 인덱스 범위 내에서)
    const targetIndex = dragStateRef.current.startIndex - indexDelta;
    const clampedIndex = Math.max(0, Math.min(slots.length - 1, targetIndex));
    const nearestValidIndex = findNearestValidIndex(clampedIndex);

    if (nearestValidIndex !== currentIndex && onCurrentIndexChange) {
      onCurrentIndexChange(nearestValidIndex);
    }
  }, [isDragging, interval, currentIndex, onCurrentIndexChange, slots.length, findNearestValidIndex]);

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

  return (
    <div
      className="abolute h-[88vh] w-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{
        // cursor: interval === 0 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
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

      {/* 화면 중앙에 선택된 이미지와 아이템 정보 표시 */}
      {selectedSlot && selectedItem && (
        <div
          className="pointer-events-none absolute inset-0 z-10000 flex items-start justify-center pt-[4vh] transition-opacity duration-300"
          style={{ opacity: textOpacity }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* 선택된 이미지/비디오 - 고정 크기 영역 */}
            {selectedSlot.url && (
              <div className="flex aspect-[25/17] h-[50vh] items-center justify-center">
                {selectedSlot.kind === "image" ||
                selectedSlot.type === "image" ? (
                  <img
                    src={proxify(selectedSlot.url)}
                    alt={selectedItem.title || ""}
                    className="h-full w-full object-contain"
                    crossOrigin="anonymous"
                    style={{
                      filter: "drop-shadow(0px 40px 40px rgba(0, 0, 0, 0.2))",
                    }}
                  />
                ) : selectedSlot.kind === "video" ||
                  selectedSlot.type === "video" ? (
                  <video
                    src={proxify(selectedSlot.url)}
                    className="h-full w-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    style={{
                      filter: "drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6))",
                    }}
                  />
                ) : null}
              </div>
            )}

            {/* 아이템 상세 정보 - 항상 같은 높이에 표시 */}
            <div
              className={`mt-3 w-[calc(50vh*25/17)] rounded-xl px-8 text-center transition-colors duration-300 ${
                isDarkMode ? " text-white" : " text-black"
              }`}
            >
              {/* 제목 */}
              {selectedItem.title && (
                <div className="relative inline-block px-4">
                  {/* 기본 텍스트 */}
                  <h2
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                    style={{
                      letterSpacing: "-0.05rem",
                      fontSize: "clamp(1.25rem, 2.8vh, 4rem)",
                    }}
                  >
                    {selectedItem.title}
                  </h2>

                  {/* 애니메이션 레이어 (배경 확장 + 텍스트 색상 반전) */}
                  <motion.div
                    key={selectedItem.id}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 overflow-hidden ${
                      isDarkMode ? "bg-white" : "bg-black"
                    }`}
                  >
                    <h2
                      className={`font-medium whitespace-nowrap ${
                        isDarkMode ? "text-black" : "text-white"
                      }`}
                      style={{
                        letterSpacing: "-0.05rem",
                        fontSize: "clamp(1.25rem, 2.8vh, 4rem)",
                      }}
                    >
                      {selectedItem.title}
                    </h2>
                  </motion.div>
                </div>
              )}

              {/* 날짜 */}
              {selectedItem.date && (
                <p
                  className={`mt-2 ${
                    isDarkMode ? "text-white/70" : "text-black/70"
                  }`}
                  style={{
                    letterSpacing: "-0.05rem",
                    fontSize: "clamp(0.875rem, 1.8vh, 2rem)",
                  }}
                >
                  {selectedItem.date}
                </p>
              )}

              {/* 설명 */}
              {selectedItem.desc && (
                <p
                  className={`mt-2 leading-relaxed ${
                    isDarkMode ? "text-white/80" : "text-black/80"
                  }`}
                  style={{
                    letterSpacing: "-0.05rem",
                    fontSize: "clamp(0.875rem, 1.8vh, 2rem)",
                  }}
                >
                  {selectedItem.desc}
                </p>
              )}
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
                pointerEvents: z > 1 ? 'none' : 'auto', // 카메라 뒤에 있으면 클릭 불가
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
                    !isSelected ? "cursor-pointer hover:bg-opacity-40" : ""
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

      {/* 하단 프로필 정보 바 */}
      <div
        className={`absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-start px-8 py-3 transition-colors duration-500 ${
          isDarkMode ? "bg-white/10 text-black" : "bg-black/5 text-white"
        } backdrop-blur-md`}
        style={{ height: "calc(100vh / 8)" }}
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
  );
}
