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

// ▶︎ 링 파라미터 (ExhibitionRingFront의 검증된 비율 기반)
const PLANE_W = 0.8;
const PLANE_H = 1.0; // 4:5 세로 — 목업의 사진 비율
const GAP_ARC = 0.25; // 플레인 사이 호 길이 여유
const MIN_RADIUS = 1.6; // 소형 앨범도 링 형태를 유지하는 최소 반지름
const CAM_Y = 2;
const CAM_Z = 22;
const FOV = 35;
const IDLE_SPEED = 0.05; // rad/s — 유휴 자동 회전
const TAP_MAX_TRAVEL = 6; // px — 이 이상 움직이면 클릭이 아니라 드래그
// 링에 올리는 최대 플레인 수 — 대형 앨범(수백 장)은 균등 샘플링.
// 목업 기준 링 전체가 한 화면에 들어오는 밀도(+타임트래블 200장 성능 문제 재발 방지).
const MAX_PLANES = 18;
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

function wrapPi(a) {
  let t = (a + Math.PI) % (Math.PI * 2);
  if (t < 0) t += Math.PI * 2;
  return t - Math.PI;
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

function ImageMat({ url }) {
  const effUrl = useMemo(() => proxify(url), [url]);
  const tex = useLoader(THREE.TextureLoader, effUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

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
  draggingRef,
  onPlaneTap,
}) {
  const { camera, size } = useThree();
  const N = Math.max(1, items.length);
  const step = (Math.PI * 2) / N;
  const radius = ringRadius(N);

  const planeRefs = useRef([]);
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));
  const goalRef = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    // ── 스크린 반응형 프레이밍 ──
    const halfFovY = THREE.MathUtils.degToRad(FOV / 2);
    const tanY = Math.tan(halfFovY);
    const tanX = tanY * (size.width / size.height);
    // 가로: 링 전체(지름 + 프레임 폭)가 화면 너비의 RING_FIT_FRAC에 들어오는 거리
    // — 링의 최좌/최우 지점(x=±R)은 링 중심(z=0)과 같은 깊이에 있다
    let overviewTz = (radius + PLANE_W) / (RING_FIT_FRAC * tanX);
    // 세로: 정면 사진 중심이 화면 하단부(하프FOV의 64% 아래)에 오도록
    // 링의 기울기(frontDrop)를 카메라 거리에서 역산
    const pitch = Math.atan(CAM_Y / overviewTz);
    const targetAngle = 0.64 * halfFovY;
    // 상한을 반지름에 묶어 목업처럼 납작한 타원을 유지
    const frontDrop = THREE.MathUtils.clamp(
      Math.tan(targetAngle + pitch) * (overviewTz - radius) - CAM_Y,
      0.6,
      radius * 0.45,
    );
    // 와이드 화면 안전장치: 정면 사진이 세로로 잘리지 않는 최소 거리 보장
    overviewTz = Math.max(
      overviewTz,
      radius + (CAM_Y + frontDrop + PLANE_H / 2) / tanY,
    );
    const focusY = -frontDrop; // 정면 플레인 중심

    // ── 회전 갱신 ──
    if (draggingRef.current) {
      // 드래그 중에는 포인터 핸들러가 ringAngleRef를 직접 움직인다
    } else if (focusedIndex != null) {
      // 포커스 대상이 정면(π/2)에 오도록 스냅
      const target = Math.PI / 2 - focusedIndex * step;
      const diff = wrapPi(target - ringAngleRef.current);
      ringAngleRef.current += diff * Math.min(1, 8 * dt);
    } else {
      // 유휴 자동 회전
      ringAngleRef.current -= IDLE_SPEED * dt;
    }

    // ── 플레인 배치 ──
    const rotRate = Math.min(1, 8 * dt);
    for (let i = 0; i < N; i++) {
      const m = planeRefs.current[i];
      if (!m) continue;
      const a = i * step + ringAngleRef.current;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      // 기울어진 링 연출: 앞(z=+R)은 내려가고 뒤는 올라감
      const y = -(z / radius) * frontDrop;
      m.position.set(x, y, z + i * 0.001); // 인덱스 오프셋으로 z-fighting 방지
      // 살짝 기울임: 오버뷰는 뒤로 눕는 카드, 포커스는 미묘한 3D 카드 기울기
      const isFoc = focusedIndex === i;
      const rx = isFoc ? FOCUS_TILT_X : OVERVIEW_TILT_X;
      const ry = isFoc ? FOCUS_TILT_Y : 0;
      m.rotation.x += (rx - m.rotation.x) * rotRate;
      m.rotation.y += (ry - m.rotation.y) * rotRate;
      m.rotation.z = 0;
      m.scale.setScalar(1 + (z / radius) * DEPTH_SCALE); // 앞쪽 크게, 뒤쪽 작게
      m.renderOrder = Math.round((z + radius) * 100);
    }

    // ── 카메라 ──
    const focused = focusedIndex != null;
    let tx = 0;
    let ty = CAM_Y;
    let tz = overviewTz;
    if (focused) {
      // 정면 플레인(x=0, z=R)의 프레임이 화면 너비 FOCUS_FILL_W를 채우는 거리
      const dWidth = PLANE_W / (2 * FOCUS_FILL_W * tanX);
      const dHeight = PLANE_H / (2 * FOCUS_FILL_H * tanY);
      // 정면 플레인은 깊이 스케일로 (1+DEPTH_SCALE)배 커져 있으므로 그만큼 물러남
      const d = Math.max(dWidth, dHeight) * (1 + DEPTH_SCALE);
      tx = 0;
      ty = focusY;
      tz = radius + d;
    }

    const rate = Math.min(1, 5 * dt);
    camera.position.x += (tx - camera.position.x) * rate;
    camera.position.y += (ty - camera.position.y) * rate;
    camera.position.z += (tz - camera.position.z) * rate;

    // 시선: overview는 원점(초기 프레이밍과 동일), focused는 플레인 중심
    goalRef.current.set(0, focused ? focusY : 0, focused ? radius : 0);
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
 * Memorial 메모리 탭의 3D 미디어 링.
 * - 앨범 미디어를 원형 배치, 유휴 상태에서 천천히 자동 회전
 * - 드래그: ringAngle 직결 회전, 놓으면(포커스 모드) 가장 가까운 플레인으로 스냅
 * - 플레인 탭: 카메라 dolly-in으로 화면 너비 ~86% 확대, 포커스 중 재탭/닫기로 복귀
 */
export default function MediaRing({
  mediaList,
  focusedIndex,
  onFocusChange,
  isDark = true,
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

  const ringAngleRef = useRef(Math.PI / 2); // 인덱스 0이 정면에서 시작
  const draggingRef = useRef(false);
  const dragStateRef = useRef({ lastX: 0, travel: 0 });
  const activePointerRef = useRef(null); // 멀티터치: 첫 포인터만 추적

  const focusedRef = useRef(focusedIndex);
  focusedRef.current = focusedIndex;

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
      ringAngleRef.current -= dx * sens;
    },
    [effStep],
  );

  const endDrag = useCallback(
    (e) => {
      if (e && e.pointerId !== activePointerRef.current) return;
      activePointerRef.current = null;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (focusedRef.current != null) {
        // 포커스 모드: 가장 가까운 플레인으로 스냅
        const nearest =
          ((Math.round((Math.PI / 2 - ringAngleRef.current) / step) % N) + N) %
          N;
        onFocusChange(nearest);
      }
    },
    [N, step, onFocusChange],
  );

  const handlePlaneTap = useCallback(
    (i) => {
      // R3F의 e.delta는 순변위 기준이라, 제자리로 돌아온 드래그를 탭으로 오인할
      // 수 있음 — 래퍼에서 누적한 이동 경로(travel)로 한 번 더 거른다
      if (dragStateRef.current.travel > TAP_MAX_TRAVEL) return;
      if (focusedRef.current == null) {
        onFocusChange(i);
      } else {
        onFocusChange(null); // 포커스 중 재탭 → 복귀
      }
    },
    [onFocusChange],
  );

  return (
    <div
      className="h-full w-full touch-none select-none"
      style={{ cursor: "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas
        camera={{ position: [0, CAM_Y, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <RingScene
            items={sampledList}
            focusedIndex={focusedIndex}
            isDark={isDark}
            ringAngleRef={ringAngleRef}
            draggingRef={draggingRef}
            onPlaneTap={handlePlaneTap}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
