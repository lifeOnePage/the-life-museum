"use client";

import * as THREE from "three";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";
import { nextRingIndex } from "./ringMedia";

// ▶︎ 링 파라미터 (ExhibitionRingFront의 검증된 비율 기반)
const PLANE_W = 1.2;
const PLANE_H = 1.5; // 4:5 세로 — 목업의 사진 비율
const GAP_ARC = -0.15; // 플레인 사이 호 길이 — 음수: 목업처럼 살짝 겹침
const MIN_RADIUS = 1.6; // 소형 앨범도 링 형태를 유지하는 최소 반지름
const CAM_Y = 2;
const CAM_Z = 22;
const FOV = 35;
const IDLE_SPEED = 0.05; // rad/s — 유휴 자동 회전
const TAP_MAX_TRAVEL = 6; // px — 이 이상 움직이면 클릭이 아니라 드래그
// 링에 올리는 최대 플레인 수 — 대형 앨범(수백 장)은 균등 샘플링.
// 목업 기준 링 전체가 한 화면에 들어오는 밀도(+타임트래블 200장 성능 문제 재발 방지).
// MemoryTab의 좌우 넘김 버튼이 순환 인덱스 계산에 같이 쓴다.
// 영속 미디어 상한(MEMORIAL_MAX_MEDIA)과 동일 — 새 추모 앨범은 고른 모든
// 미디어가 링에 그대로 올라간다 (레거시 스크랩 앨범만 샘플링됨).
export const MAX_PLANES = MEMORIAL_MAX_MEDIA;
// 링 디스크의 기울기 (rad) — 0이면 완전히 누운 원판, 클수록 정면을 향해 섬.
// 목업처럼 누운 원판을 비스듬히 내려다보는 구도
const RING_TILT = 0.33;
// 링 디스크의 좌우 롤 (rad) — 목업처럼 오른쪽이 살짝 들리는 대각선 구도
const RING_ROLL = 0.14;
// 포커스 시 화면을 채우는 비율 (프레임 기준) — 가장자리에 약간의 여백
const FOCUS_FILL_W = 0.86;
const FOCUS_FILL_H = 0.92;
// 오버뷰에서 링 전체 폭이 차지하는 화면 너비 비율 — 링이 좌우로 잘리지 않고
// 온전히 보이도록 카메라 거리를 여기서 유도한다
const RING_FIT_FRAC = 0.9;
// 깊이별 크기 과장 — 링 전체가 보이는 원거리 구도에서는 실제 원근만으로는
// 앞/뒤 크기 차가 약해서, 목업의 납작한 3D 타원 느낌을 위해 보정
const DEPTH_SCALE = 0.25;
// 살짝 기울임 (rad) — 오버뷰는 카드가 뒤로 눕는 느낌, 포커스는 목업처럼
// 미묘한 3D 카드 기울기
const OVERVIEW_TILT_X = -0.09;
const FOCUS_TILT_X = -0.04;
const FOCUS_TILT_Y = -0.09;

// ── 관성/스프링 파라미터 ──
// 포커스 스냅은 릴리즈 속도를 그대로 이어받는 임계감쇠 스프링으로 움직인다
// (플릭 방향으로 계속 미끄러지다 목표 플레인에 부드럽게 안착).
const SPRING_K = 64; // 강성 — 클수록 빨리 안착
const SPRING_C = 2 * Math.sqrt(SPRING_K); // 임계감쇠
const SPRING_MAX_DT = 1 / 30; // s — 스프링 적분 서브스텝 상한 (안정성)
const MAX_FRAME_DT = 0.25; // s — 한 프레임에 적분하는 최대 경과 시간
const SPRING_EPS = 1e-3;
// 플릭 관성: 릴리즈 속도가 지수감쇠(τ)로 줄어든다고 보고 이동량을 투영
const FLING_TAU = 0.45; // s
const FLING_MAX_PLANES = 3; // 한 번의 플릭으로 넘어갈 수 있는 최대 플레인 수
const VELOCITY_STALE_MS = 100; // 이보다 오래된 속도 샘플은 릴리즈 시 무시
const VELOCITY_EMA = 0.35; // 각속도 EMA 가중치 (최신 샘플 비중)
// 릴리즈 후 인덱스 반영을 기다리는 최대 시간 — 초과 시 보류 타깃 폐기
const PENDING_TARGET_TTL_MS = 250;
// 자동 넘김(autoAdvanceMs) 유휴 판정 폴링 간격
const AUTO_ADVANCE_TICK_MS = 200;

function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function ringRadius(n) {
  return Math.max(MIN_RADIUS, (n * (PLANE_W + GAP_ARC)) / (Math.PI * 2));
}

// 외부 도메인 미디어는 CORS 프록시를 경유 (ExhibitionRingFront와 동일)
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

// 구글포토(lh3) URL은 사이즈 지시자로 다운스케일 — 링은 512px, 포커스는 2048px
function sizeGooglePhoto(url, w) {
  if (!url || !url.includes("googleusercontent.com")) return url;
  return `${url.split("=")[0]}=w${w}`;
}

// 텍스처 로드 실패(404 등)가 Canvas 전체를 죽이지 않도록 플레인 단위로 격리.
// 사용처에서 URL을 key로 넘겨 URL이 바뀌면 에러 상태가 리셋되게 한다.
class MaterialErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function PlaceholderMat({ isDark }) {
  return (
    <meshBasicMaterial
      color={isDark ? "#222222" : "#d9d2c5"}
      transparent
      opacity={0.9}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

// 원본 비율 유지 cover 크롭 — 플레인 비율(PLANE_W/H) 대비 넘치는 축을
// repeat/offset으로 잘라낸다 (CSS object-fit: cover와 동일).
function applyCoverFit(tex, mediaRatio) {
  if (!mediaRatio || !Number.isFinite(mediaRatio)) return;
  const planeRatio = PLANE_W / PLANE_H;
  let repeatX = 1;
  let repeatY = 1;
  if (mediaRatio > planeRatio) {
    repeatX = planeRatio / mediaRatio; // 원본이 더 가로로 김 → 좌우 크롭
  } else {
    repeatY = mediaRatio / planeRatio; // 원본이 더 세로로 김 → 상하 크롭
  }
  tex.repeat.set(repeatX, repeatY);
  tex.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
}

function ImageMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

  // cover 크롭은 첫 렌더 전에(useMemo) 적용 — 일그러진 프레임이 한 순간도
  // 화면에 보이지 않도록. 캐시된 텍스처에 대해 멱등이라 재실행도 무해.
  useMemo(() => {
    const img = tex?.image;
    if (img?.width && img?.height) {
      applyCoverFit(tex, img.width / img.height);
    }
  }, [tex]);

  useEffect(() => {
    // useLoader 캐시가 같은 텍스처를 재사용하므로 최초 1회만 설정 (재업로드 방지)
    if (!tex || tex.userData.__ringConfigured) return;
    tex.userData.__ringConfigured = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
  }, [tex]);

  return (
    <meshBasicMaterial
      map={tex}
      toneMapped={false}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

// 바닥 반사용 그라데이션 알파맵 (모듈 싱글톤) — 바닥과 맞닿는 쪽이 진하고
// 아래로 갈수록 투명해진다
let reflectionAlphaMap = null;
function getReflectionAlphaMap() {
  if (reflectionAlphaMap) return reflectionAlphaMap;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 64);
  // 반사 메시는 scale.y=-1이라 캔버스 아래쪽(stop 1)이 사진 바닥 쪽에 온다
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 64);
  reflectionAlphaMap = new THREE.CanvasTexture(canvas);
  return reflectionAlphaMap;
}

// 바닥 반사 재질 — 링 썸네일과 같은 텍스처(useLoader 캐시 공유)에
// 그라데이션 알파를 곱해 아래로 사라지는 반사를 만든다
function ReflectionMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });
  const alphaMap = useMemo(() => getReflectionAlphaMap(), []);

  return (
    <meshBasicMaterial
      map={tex}
      alphaMap={alphaMap}
      toneMapped={false}
      transparent
      opacity={0.25}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

// 비디오 텍스처 서스펜스 캐시 — drei useVideoTexture는 로드 실패 시 영원히
// 서스펜드되고(에러 리스너 없음) 언마운트 후에도 재생이 계속되므로 직접 구현.
const videoTexCache = new Map();
function loadVideoTexture(url) {
  let entry = videoTexCache.get(url);
  if (!entry) {
    entry = { status: "pending" };
    entry.promise = new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;
      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;
      video.addEventListener(
        "loadedmetadata",
        () => {
          // 원본 비율 cover 크롭 — resolve 전에 적용해 조정 과정이 안 보이게
          if (video.videoWidth && video.videoHeight) {
            applyCoverFit(tex, video.videoWidth / video.videoHeight);
          }
          entry.status = "done";
          entry.texture = tex;
          resolve(tex);
        },
        { once: true },
      );
      video.addEventListener(
        "error",
        () => {
          entry.status = "error";
          entry.error = new Error(`video load failed: ${url}`);
          videoTexCache.delete(url); // 재시도 가능하도록 캐시에서 제거
          reject(entry.error);
        },
        { once: true },
      );
      video.load();
    });
    entry.promise.catch(() => {}); // unhandled rejection 방지
    videoTexCache.set(url, entry);
  }
  return entry;
}

function useSafeVideoTexture(url) {
  const entry = loadVideoTexture(url);
  if (entry.status === "pending") throw entry.promise;
  if (entry.status === "error") throw entry.error;
  const tex = entry.texture;

  // 마운트 중에만 재생 — 포커스 해제 시 확실히 정지
  useEffect(() => {
    const video = tex.image;
    video.play().catch(() => {});
    return () => video.pause();
  }, [tex]);

  return tex;
}

function VideoMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const vtex = useSafeVideoTexture(effUrl);

  return (
    <meshBasicMaterial
      map={vtex}
      toneMapped={false}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

// 개별 플레인: 흰 폴라로이드 프레임 + 썸네일. 포커스되면 원본 화질/비디오를 위에 겹쳐 승격.
const MediaPlane = React.forwardRef(function MediaPlane(
  { item, isFocused, isDark, onTap },
  ref,
) {
  const isVideo = item.type === "video";
  // 비디오는 썸네일이 없으면 링 상태에서 플레이스홀더로 표시
  const ringUrl = sizeGooglePhoto(
    isVideo
      ? item.thumbnail_url || null
      : item.thumbnail_url || item.original_url || null,
    512,
  );

  // 포커스 시 승격할 원본 소스 (썸네일과 같은 URL이면 생략)
  const rawFocusUrl = isFocused
    ? isVideo
      ? item.original_url
      : sizeGooglePhoto(item.original_url, 2048)
    : null;
  const focusUrl = rawFocusUrl && rawFocusUrl !== ringUrl ? rawFocusUrl : null;

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.delta > TAP_MAX_TRAVEL) return; // 드래그였다면 무시
      onTap?.();
    },
    [onTap],
  );

  return (
    <group ref={ref}>
      {/* 링 상태 미디어 (썸네일) */}
      <mesh renderOrder={10} onClick={handleClick}>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        {ringUrl ? (
          <MaterialErrorBoundary
            key={ringUrl}
            fallback={<PlaceholderMat isDark={isDark} />}
          >
            <Suspense fallback={<PlaceholderMat isDark={isDark} />}>
              <ImageMat url={ringUrl} />
            </Suspense>
          </MaterialErrorBoundary>
        ) : (
          <PlaceholderMat isDark={isDark} />
        )}
      </mesh>

      {/* 바닥 반사 — 사진 아래에 상하반전 미러 + 그라데이션 페이드.
          Suspense가 mesh 바깥이라 로드 전 흰 플레인이 생기지 않는다 */}
      {ringUrl && (
        <MaterialErrorBoundary key={`refl-${ringUrl}`} fallback={null}>
          <Suspense fallback={null}>
            <mesh
              renderOrder={8}
              position={[0, -PLANE_H - 0.04, 0]}
              scale={[1, -1, 1]}
            >
              <planeGeometry args={[PLANE_W, PLANE_H]} />
              <ReflectionMat url={ringUrl} />
            </mesh>
          </Suspense>
        </MaterialErrorBoundary>
      )}

      {/* 포커스 승격 레이어 — Suspense가 mesh 바깥이라 로드 전에는 mesh 자체가
          없어 흰 플레인이 번쩍이지 않고, 로드 완료 전까지 썸네일이 그대로 보임 */}
      {focusUrl && (
        <MaterialErrorBoundary key={focusUrl} fallback={null}>
          <Suspense fallback={null}>
            <mesh renderOrder={15} position={[0, 0, 0.004]}>
              <planeGeometry args={[PLANE_W, PLANE_H]} />
              {isVideo ? <VideoMat url={focusUrl} /> : <ImageMat url={focusUrl} />}
            </mesh>
          </Suspense>
        </MaterialErrorBoundary>
      )}
    </group>
  );
});

// 링 씬: 배치·회전·카메라를 모두 ref 기반으로 useFrame에서 갱신 (리렌더 없음).
// fiber v9은 기본 카메라를 최초 1회 lookAt(0,0,0)으로 고정하므로,
// 매 프레임 시선 목표를 lerp하며 lookAt을 직접 갱신한다.
function RingScene({
  items,
  focusedIndex,
  isDark,
  ringAngleRef,
  motionRef,
  draggingRef,
  onPlaneTap,
  startFocused = false,
}) {
  const { camera, size } = useThree();
  const N = Math.max(1, items.length);
  const step = (Math.PI * 2) / N;
  const radius = ringRadius(N);

  const planeRefs = useRef([]);
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));
  const goalRef = useRef(new THREE.Vector3());
  const snapRef = useRef(null); // { index, to } — 스프링 목표 각도
  const framedRef = useRef(false); // 첫 프레임 즉시 프레이밍 완료 여부

  useFrame((_, dt) => {
    const motion = motionRef.current;
    // 관성 적분에 쓰는 프레임 시간 — 백그라운드 복귀 등 극단적 공백은 잘라낸다
    const frameDt = Math.min(dt, MAX_FRAME_DT);
    // ── 스크린 반응형 프레이밍 ──
    const halfFovY = THREE.MathUtils.degToRad(FOV / 2);
    const tanY = Math.tan(halfFovY);
    const tanX = tanY * (size.width / size.height);
    // 가로: 링 전체(지름 + 프레임 폭)가 화면 너비의 RING_FIT_FRAC에 들어오는 거리
    // — 링의 최좌/최우 지점(x=±R)은 링 중심(z=0)과 같은 깊이에 있다
    let overviewTz = (radius + PLANE_W) / (RING_FIT_FRAC * tanX);
    // 기울어진 디스크에서 정면 플레인의 하강량·실제 깊이
    const dropY = Math.sin(RING_TILT) * radius;
    const frontZ = Math.cos(RING_TILT) * radius;
    // 와이드 화면 안전장치: 링의 최하단(롤 포함)이 세로로 잘리지 않는 최소 거리
    const lowestY = Math.hypot(
      radius * Math.sin(RING_ROLL),
      dropY * Math.cos(RING_ROLL),
    );
    overviewTz = Math.max(
      overviewTz,
      frontZ + (CAM_Y + lowestY + PLANE_H / 2) / tanY,
    );
    // 정면 플레인 중심 (롤 적용 후 위치)
    const focusX = Math.sin(RING_ROLL) * dropY;
    const focusY = -Math.cos(RING_ROLL) * dropY;

    // ── 회전 갱신 ──
    if (draggingRef.current) {
      // 드래그 중에는 포인터 핸들러가 ringAngleRef를 직접 움직인다
      // (릴리즈 속도는 endDrag가 motion.vel에 넘겨준다)
      snapRef.current = null;
    } else if (focusedIndex != null) {
      // 포커스: 현재 각속도를 이어받는 임계감쇠 스프링으로 목표 플레인에 안착.
      // 드래그 릴리즈는 endDrag가 플릭 방향을 반영한 목표 각도(pendingTarget)를
      // 미리 계산해 두고, 버튼/탭 전환은 최단 경로(wrapPi)로 목표를 잡는다.
      const pend = motion.pendingTarget;
      if (pend && performance.now() - pend.at > PENDING_TARGET_TTL_MS) {
        motion.pendingTarget = null; // 인덱스가 반영되지 않음 — 폐기
      }
      if (motion.pendingTarget && motion.pendingTarget.index === focusedIndex) {
        snapRef.current = { index: focusedIndex, to: motion.pendingTarget.angle };
        motion.pendingTarget = null;
      } else if (motion.pendingTarget) {
        // 릴리즈 직후 React가 새 인덱스를 아직 반영하기 전 — 관성만 유지
        snapRef.current = null;
      } else if (!snapRef.current || snapRef.current.index !== focusedIndex) {
        const target = Math.PI / 2 - focusedIndex * step;
        snapRef.current = {
          index: focusedIndex,
          to: ringAngleRef.current + wrapPi(target - ringAngleRef.current),
        };
      }

      if (snapRef.current) {
        const { to } = snapRef.current;
        // 실제 경과 시간을 ≤ SPRING_MAX_DT 서브스텝으로 나눠 적분 — 프레임이
        // 떨어져도(탭 전환·저사양) 슬로모션이 되지 않고, 반음시적 오일러가
        // √K ≈ 8, h ≤ 1/30 이라 안정적으로 유지된다
        let remaining = frameDt;
        while (remaining > 0) {
          const h = Math.min(remaining, SPRING_MAX_DT);
          remaining -= h;
          const x = ringAngleRef.current - to;
          if (Math.abs(x) < SPRING_EPS && Math.abs(motion.vel) < SPRING_EPS) {
            ringAngleRef.current = to;
            motion.vel = 0;
            break;
          }
          const accel = -SPRING_K * x - SPRING_C * motion.vel;
          motion.vel += accel * h;
          ringAngleRef.current += motion.vel * h;
        }
      } else {
        ringAngleRef.current += motion.vel * frameDt;
      }
    } else {
      snapRef.current = null;
      motion.pendingTarget = null;
      // 오버뷰: 릴리즈 속도가 지수감쇠로 잦아들며 미끄러지고, 그 위에 유휴 자동 회전
      if (motion.vel !== 0) {
        // 감쇠 구간의 평균 속도로 이동 (해석해) — 프레임 길이와 무관하게 정확
        const decay = Math.exp(-frameDt / FLING_TAU);
        ringAngleRef.current += motion.vel * FLING_TAU * (1 - decay);
        motion.vel *= decay;
        if (Math.abs(motion.vel) < SPRING_EPS) motion.vel = 0;
      }
      ringAngleRef.current -= IDLE_SPEED * frameDt; // 백그라운드 복귀 시 점프 방지
    }

    // ── 플레인 배치 ──
    const rotRate = Math.min(1, 8 * dt);
    for (let i = 0; i < N; i++) {
      const m = planeRefs.current[i];
      if (!m) continue;
      const a = i * step + ringAngleRef.current;
      const x0 = Math.cos(a) * radius;
      const zc = Math.sin(a) * radius; // 기울기 전 디스크 평면상의 깊이
      // 디스크를 X축(앞뒤 기울기) + Z축(좌우 롤)으로 실제 회전시킨 위치
      const y0 = -Math.sin(RING_TILT) * zc;
      const x = x0 * Math.cos(RING_ROLL) - y0 * Math.sin(RING_ROLL);
      const y = x0 * Math.sin(RING_ROLL) + y0 * Math.cos(RING_ROLL);
      const z = Math.cos(RING_TILT) * zc;
      m.position.set(x, y, z + i * 0.001); // 인덱스 오프셋으로 z-fighting 방지
      // 살짝 기울임: 오버뷰는 뒤로 눕는 카드, 포커스는 미묘한 3D 카드 기울기
      const isFoc = focusedIndex === i;
      const rx = isFoc ? FOCUS_TILT_X : OVERVIEW_TILT_X;
      const ry = isFoc ? FOCUS_TILT_Y : 0;
      m.rotation.x += (rx - m.rotation.x) * rotRate;
      m.rotation.y += (ry - m.rotation.y) * rotRate;
      m.rotation.z = 0;
      m.scale.setScalar(1 + (zc / radius) * DEPTH_SCALE); // 앞쪽 크게, 뒤쪽 작게
      m.renderOrder = Math.round((zc + radius) * 100);
    }

    // ── 카메라 ──
    const focused = focusedIndex != null;
    let tx = 0;
    let ty = CAM_Y;
    let tz = overviewTz;
    if (focused) {
      // 정면 플레인의 사진이 화면 너비 FOCUS_FILL_W를 채우는 거리
      const dWidth = PLANE_W / (2 * FOCUS_FILL_W * tanX);
      const dHeight = PLANE_H / (2 * FOCUS_FILL_H * tanY);
      // 정면 플레인은 깊이 스케일로 (1+DEPTH_SCALE)배 커져 있으므로 그만큼 물러남
      const d = Math.max(dWidth, dHeight) * (1 + DEPTH_SCALE);
      tx = focusX;
      ty = focusY;
      tz = frontZ + d;
    }

    // 시선: overview는 원점(초기 프레이밍과 동일), focused는 플레인 중심
    goalRef.current.set(
      focused ? focusX : 0,
      focused ? focusY : 0,
      focused ? frontZ : 0,
    );

    // 항상 포커스 모드(lockFocus)로 시작하면 첫 프레임에 바로 포커스 구도로 —
    // 원거리 오버뷰에서 dolly-in 하는 모습이 보이지 않게 한다
    let rate = Math.min(1, 5 * dt);
    if (!framedRef.current) {
      framedRef.current = true;
      if (startFocused && focused) rate = 1;
    }
    camera.position.x += (tx - camera.position.x) * rate;
    camera.position.y += (ty - camera.position.y) * rate;
    camera.position.z += (tz - camera.position.z) * rate;
    lookRef.current.lerp(goalRef.current, rate);
    camera.lookAt(lookRef.current);
  });

  return (
    <group>
      {items.map((item, i) => (
        <MediaPlane
          key={i}
          ref={(el) => (planeRefs.current[i] = el)}
          item={item}
          isFocused={focusedIndex === i}
          isDark={isDark}
          onTap={() => onPlaneTap(i)}
        />
      ))}
    </group>
  );
}

/**
 * Memorial 3D 미디어 링 — 메모리 탭(오버뷰↔포커스)과 스토리 탭(항상 포커스)이 공유.
 * - 앨범 미디어를 원형 배치, 유휴 상태에서 천천히 자동 회전
 * - 드래그: ringAngle 직결 회전. 놓으면(포커스 모드) 릴리즈 속도로 관성 투영 →
 *   가장 가까운 플레인으로 스프링 스냅 (플릭 방향으로 미끄러지며 안착)
 * - 플레인 탭: 카메라 dolly-in으로 화면 너비 ~86% 확대, 포커스 중 재탭/닫기로 복귀
 *
 * props
 * - lockFocus: 항상 포커스 모드. focusedIndex가 null이면 0으로 간주하고, 빈 공간/
 *   포커스 플레인 탭으로 해제되지 않으며, 다른 보이는 플레인을 탭하면 그쪽으로 이동
 * - autoAdvanceMs: 마지막 상호작용/넘김 후 이 시간(ms) 동안 유휴면 다음 사진으로
 *   ("다음 사진" 버튼과 같은 방향). 드래그·관성 중에는 넘기지 않는다
 * - touchAction: 래퍼의 CSS touch-action ('none' 기본; 세로 스크롤 페이지 안에서는 'pan-y')
 */
export default function MediaRing({
  mediaList,
  focusedIndex,
  onFocusChange,
  isDark = true,
  lockFocus = false,
  autoAdvanceMs = null,
  touchAction = "none",
}) {
  // 대형 앨범은 균등 샘플링으로 MAX_PLANES장까지만 링에 배치
  const sampledList = useMemo(() => {
    if (mediaList.length <= MAX_PLANES) return mediaList;
    const stride = mediaList.length / MAX_PLANES;
    return Array.from(
      { length: MAX_PLANES },
      (_, i) => mediaList[Math.floor(i * stride)],
    );
  }, [mediaList]);

  const N = Math.max(1, sampledList.length);
  const step = (Math.PI * 2) / N;
  // 소형 앨범(N<8)에서 감도가 폭주하지 않도록 유효 스텝을 클램프
  const effStep = (Math.PI * 2) / Math.max(N, 8);

  // lockFocus면 포커스가 절대 비지 않는다 (null → 0). 목록이 줄어 인덱스가
  // 범위를 벗어나면(편집 미리보기 등) 마지막 플레인으로 클램프
  let effFocused = lockFocus && focusedIndex == null ? 0 : focusedIndex ?? null;
  if (effFocused != null) effFocused = Math.min(Math.max(0, effFocused), N - 1);

  // 시작 각도: 초기 포커스 플레인이 정면(π/2)에 오도록 (오버뷰 시작이면 인덱스 0)
  const ringAngleRef = useRef(Math.PI / 2 - (effFocused ?? 0) * step);
  // 링 관성 상태 — vel: 각속도(rad/s), pendingTarget: 릴리즈 시 미리 계산한
  // 스냅 목표 { index, angle, at } (RingScene이 인덱스 반영 후 소비)
  const motionRef = useRef({ vel: 0, pendingTarget: null });
  const draggingRef = useRef(false);
  const dragStateRef = useRef({ lastX: 0, travel: 0 });
  // 드래그 중 각속도 추정 (EMA, rad/s) — t: 마지막 샘플 시각(performance.now)
  const velRef = useRef({ v: 0, t: 0 });
  const activePointerRef = useRef(null); // 멀티터치: 첫 포인터만 추적
  // 자동 넘김 유휴 기준 시각 — 마지막 사용자 상호작용 또는 마지막 넘김
  const lastActivityRef = useRef(performance.now());

  const focusedRef = useRef(effFocused);
  focusedRef.current = effFocused;

  const handlePointerDown = useCallback((e) => {
    if (activePointerRef.current != null) return; // 두 번째 손가락 무시
    activePointerRef.current = e.pointerId;
    // 오버레이 위를 지나가도 드래그가 끊기지 않도록 캡처.
    // 반드시 canvas(e.target)에 걸어야 함 — 래퍼(currentTarget)에 걸면 캡처된
    // pointerup/click이 canvas를 건너뛰어 R3F onClick(사진 탭)이 죽는다.
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      // 이미 해제된 포인터 등 — 캡처 실패해도 드래그 자체는 동작
    }
    draggingRef.current = true;
    dragStateRef.current = { lastX: e.clientX, travel: 0 };
    velRef.current = { v: 0, t: performance.now() };
    motionRef.current.vel = 0; // 손가락이 잡았으니 진행 중이던 관성은 소멸
    motionRef.current.pendingTarget = null;
    lastActivityRef.current = performance.now();
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current || e.pointerId !== activePointerRef.current)
        return;
      const dx = e.clientX - dragStateRef.current.lastX;
      dragStateRef.current.lastX = e.clientX;
      dragStateRef.current.travel += Math.abs(dx);
      // 드래그 감도: 오버뷰 140px/칸, 포커스는 180px/칸 (확대 상태 과민 방지)
      const sens =
        focusedRef.current != null ? effStep / 180 : effStep / 140;
      // 컨텐츠가 손가락을 따라오는 방향
      const dAngle = -dx * sens;
      ringAngleRef.current += dAngle;

      // 각속도 EMA (rad/s) — 릴리즈 시 관성 투영에 사용
      const now = performance.now();
      const dtMs = now - velRef.current.t;
      if (dtMs > 0) {
        const inst = dAngle / (dtMs / 1000);
        velRef.current.v =
          velRef.current.v * (1 - VELOCITY_EMA) + inst * VELOCITY_EMA;
        velRef.current.t = now;
      }
    },
    [effStep],
  );

  const endDrag = useCallback(
    (e, cancelled = false) => {
      if (e && e.pointerId !== activePointerRef.current) return;
      activePointerRef.current = null;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const now = performance.now();
      lastActivityRef.current = now;

      // 릴리즈 속도 — 손가락이 멈춘 채 떼면(오래된 샘플) 0, pointercancel
      // (브라우저가 세로 스크롤로 가져감)이면 가로 관성을 주지 않는다
      let v =
        cancelled || now - velRef.current.t > VELOCITY_STALE_MS
          ? 0
          : velRef.current.v;

      if (focusedRef.current == null) {
        // 오버뷰: 감쇠 관성만 (RingScene이 지수감쇠로 잦아들게 한다)
        motionRef.current.vel = v;
        return;
      }

      // 포커스 모드: 관성으로 미끄러질 거리를 투영한 뒤(최대 ±FLING_MAX_PLANES칸)
      // 가장 가까운 플레인에 스냅. 같은 인덱스라도 호출해 제자리로 되돌린다
      const angle = ringAngleRef.current;
      const maxTravel = Math.min(FLING_MAX_PLANES, Math.max(0, N - 1)) * step;
      const travel = clamp(v * FLING_TAU, -maxTravel, maxTravel);
      if (travel !== v * FLING_TAU) v = travel / FLING_TAU; // 클램프에 맞춰 속도도 축소
      const projected = angle + travel;
      const k = Math.round((Math.PI / 2 - projected) / step); // 회전 수 포함 인덱스
      const nearest = ((k % N) + N) % N;
      motionRef.current.vel = v;
      motionRef.current.pendingTarget = {
        index: nearest,
        angle: Math.PI / 2 - k * step,
        at: now,
      };
      onFocusChange(nearest);
    },
    [N, step, onFocusChange],
  );

  const handlePointerUp = useCallback((e) => endDrag(e, false), [endDrag]);
  const handlePointerCancel = useCallback((e) => endDrag(e, true), [endDrag]);

  // 포커스 중 사진 바깥(빈 공간) 탭 → 링 전체 화면으로 복귀 (lockFocus면 무시)
  const handlePointerMissed = useCallback(() => {
    if (dragStateRef.current.travel > TAP_MAX_TRAVEL) return; // 드래그는 무시
    if (lockFocus) return;
    if (focusedRef.current != null) onFocusChange(null);
  }, [onFocusChange, lockFocus]);

  const handlePlaneTap = useCallback(
    (i) => {
      // R3F의 e.delta는 순변위 기준이라, 제자리로 돌아온 드래그를 탭으로 오인할
      // 수 있음 — 래퍼에서 누적한 이동 경로(travel)로 한 번 더 거른다
      if (dragStateRef.current.travel > TAP_MAX_TRAVEL) return;
      lastActivityRef.current = performance.now();
      if (focusedRef.current == null) {
        onFocusChange(i);
      } else if (lockFocus) {
        if (i !== focusedRef.current) onFocusChange(i); // 이웃 플레인 탭 → 이동
      } else {
        onFocusChange(null); // 포커스 중 재탭 → 복귀
      }
    },
    [onFocusChange, lockFocus],
  );

  // 인덱스가 바뀌면(버튼·자동 넘김·탭) 유휴 타이머 기준을 갱신
  useEffect(() => {
    lastActivityRef.current = performance.now();
  }, [effFocused]);

  // 자동 넘김 — 유휴(드래그·관성 없음)가 autoAdvanceMs 이상 지속되면 다음 사진으로
  useEffect(() => {
    if (!autoAdvanceMs || N <= 1) return undefined;
    const id = setInterval(() => {
      if (document.hidden) return;
      if (draggingRef.current) return;
      const m = motionRef.current;
      if (m.pendingTarget || Math.abs(m.vel) > 0.05) return; // 관성 진행 중
      const now = performance.now();
      if (now - lastActivityRef.current < autoAdvanceMs) return;
      lastActivityRef.current = now;
      onFocusChange(nextRingIndex(focusedRef.current ?? 0, N));
    }, AUTO_ADVANCE_TICK_MS);
    return () => clearInterval(id);
  }, [autoAdvanceMs, N, onFocusChange]);

  return (
    <div
      className="h-full w-full select-none"
      style={{ cursor: "grab", touchAction }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <Canvas
        camera={{ position: [0, CAM_Y, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={handlePointerMissed}
      >
        <Suspense fallback={null}>
          <RingScene
            items={sampledList}
            focusedIndex={effFocused}
            isDark={isDark}
            ringAngleRef={ringAngleRef}
            motionRef={motionRef}
            draggingRef={draggingRef}
            onPlaneTap={handlePlaneTap}
            startFocused={lockFocus}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
