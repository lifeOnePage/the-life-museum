"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import * as THREE from "three";

// API 요청 설정
const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";
const PROXY_URL = `${API_BASE}/scraper/proxy/image`;
const USE_PROXY = true;

function getProxiedUrl(originalUrl) {
  if (!USE_PROXY) return originalUrl;
  return `${PROXY_URL}?url=${encodeURIComponent(originalUrl)}`;
}

const SEED = 1337;
const BASE_HEIGHT = 120;

// 카메라 앞 표시 위치 (카메라 기준 상대 위치)
const DISPLAY_OFFSET_Z = 100; // 카메라 앞 200 단위
const DISPLAY_SCALE = 0.8; // 표시 시 스케일 비율
const CAMERA_SPEED = 15; // 카메라 이동 속도
const PLANE_DETECT_THRESHOLD = 300; // 플레인 감지 거리

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rand(rng, min, max) {
  return min + (max - min) * rng();
}

function deg(v) {
  return THREE.MathUtils.degToRad(v);
}

function checkOverlap(box1, box2, margin = 5) {
  return !(
    box1.maxY + margin < box2.minY ||
    box1.minY - margin > box2.maxY ||
    box1.maxZ + margin < box2.minZ ||
    box1.minZ - margin > box2.maxZ
  );
}

// 이미지 plane 컴포넌트
function ImagePlane({
  imageUrl,
  position,
  rotation,
  baseHeight,
  sign,
  isDisplayed,
  cameraPosition,
  originalScale,
}) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [scale, setScale] = useState([1, 1, 1]);
  const [aspectRatio, setAspectRatio] = useState(1);

  // 애니메이션 상태
  const animState = useRef({
    currentPos: [...position],
    currentRot: [0, 0, 0],
    currentScale: [1, 1, 1],
    targetPos: [...position],
    targetRot: [0, 0, 0],
    targetScale: [1, 1, 1],
  });

  // 텍스처 로드
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexture(tex);

        const aspect = img.width / img.height;
        setAspectRatio(aspect);
        const h = baseHeight;
        const w = h * aspect;
        setScale([w, h, 1]);

        // 초기 스케일 설정
        animState.current.currentScale = [w, h, 1];
        animState.current.targetScale = [w, h, 1];
      } catch (err) {
        console.error("Texture creation error:", err);
      }
    };

    img.onerror = (err) => {
      console.error("Image load failed:", imageUrl.substring(0, 80), err);
    };

    const finalUrl = getProxiedUrl(imageUrl);
    img.src = finalUrl;

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl, baseHeight]);

  // 원래 회전 계산
  const originalRotation = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, sign > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    dummy.rotateX(rotation[0]);
    dummy.rotateY(rotation[1]);
    return [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z];
  }, [rotation, sign]);

  // 표시 상태에 따른 타겟 업데이트
  useEffect(() => {
    const state = animState.current;

    if (isDisplayed && cameraPosition) {
      // 카메라 앞 중앙으로 이동
      state.targetPos = [
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2] - DISPLAY_OFFSET_Z,
      ];
      // 카메라를 향하도록 회전 (정면)
      state.targetRot = [0, 0, 0];
      // 표시용 스케일
      const displayH = baseHeight * DISPLAY_SCALE;
      const displayW = displayH * aspectRatio;
      state.targetScale = [displayW, displayH, 1];
    } else {
      // 원래 위치로 복귀
      state.targetPos = [...position];
      state.targetRot = [...originalRotation];
      state.targetScale = [...scale];
    }
  }, [
    isDisplayed,
    cameraPosition,
    position,
    originalRotation,
    scale,
    baseHeight,
    aspectRatio,
  ]);

  // 프레임 루프 - 부드러운 애니메이션
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
    const lerpFactor = 1 - Math.pow(0.01, delta);

    // 위치 보간
    state.currentPos[0] +=
      (state.targetPos[0] - state.currentPos[0]) * lerpFactor;
    state.currentPos[1] +=
      (state.targetPos[1] - state.currentPos[1]) * lerpFactor;
    state.currentPos[2] +=
      (state.targetPos[2] - state.currentPos[2]) * lerpFactor;

    // 회전 보간
    state.currentRot[0] +=
      (state.targetRot[0] - state.currentRot[0]) * lerpFactor;
    state.currentRot[1] +=
      (state.targetRot[1] - state.currentRot[1]) * lerpFactor;
    state.currentRot[2] +=
      (state.targetRot[2] - state.currentRot[2]) * lerpFactor;

    // 스케일 보간
    state.currentScale[0] +=
      (state.targetScale[0] - state.currentScale[0]) * lerpFactor;
    state.currentScale[1] +=
      (state.targetScale[1] - state.currentScale[1]) * lerpFactor;
    state.currentScale[2] +=
      (state.targetScale[2] - state.currentScale[2]) * lerpFactor;

    // 적용
    meshRef.current.position.set(...state.currentPos);
    meshRef.current.rotation.set(...state.currentRot);
    meshRef.current.scale.set(...state.currentScale);
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

// plane 위치 생성
function generatePlanes(rng, mediaList) {
  const allPlanes = [];
  console.log("mediaList.length", mediaList.length);

  if (!mediaList || mediaList.length === 0) return allPlanes;

  const leftMedia = mediaList.filter((_, idx) => idx % 2 === 0);
  const rightMedia = mediaList.filter((_, idx) => idx % 2 === 1);

  const wallData = [
    { sign: -1, media: leftMedia },
    { sign: 1, media: rightMedia },
  ];

  wallData.forEach(({ sign, media: sideMedia }) => {
    const sidePlanes = [];
    const lanes = [180, -80, -200];
    let z = 10;

    for (let i = 0; i < sideMedia.length; i++) {
      let gap = 50 + rand(rng, -10, 10);
      z -= gap;

      const media = sideMedia[i];
      const estimatedHeight = BASE_HEIGHT + rand(rng, -10, 10);
      const estimatedWidth = estimatedHeight * 1.2;

      let y;
      let attempts = 0;
      const maxAttempts = 20;

      do {
        const lane = lanes[Math.floor(rand(rng, 0, lanes.length))];
        const flow = Math.sin(z * 0.03 + rand(rng, 0, 10)) * 6;
        y = lane + rand(rng, -60, 60) + flow;

        const currentBox = {
          minY: y - estimatedHeight / 2,
          maxY: y + estimatedHeight / 2,
          minZ: z - estimatedWidth / 2,
          maxZ: z + estimatedWidth / 2,
        };

        const hasOverlap = sidePlanes.slice(-15).some((p) => {
          const otherBox = {
            minY: p.position[1] - p.estimatedHeight / 2,
            maxY: p.position[1] + p.estimatedHeight / 2,
            minZ: p.position[2] - p.estimatedWidth / 2,
            maxZ: p.position[2] + p.estimatedWidth / 2,
          };
          return checkOverlap(currentBox, otherBox, 10);
        });

        if (!hasOverlap) break;
        attempts++;
      } while (attempts < maxAttempts);

      const corridorHalf = 400;
      const wave = Math.sin(z * 0.02 + 1.7) * 40;
      const x = sign * corridorHalf + sign * wave + rand(rng, -6, 6);

      const rotX = deg(rand(rng, -16, 16));
      const rotY = x > 0 ? deg(rand(rng, 0, 16)) : deg(rand(rng, -16, 0));

      const planeData = {
        id: allPlanes.length,
        position: [x, y, z],
        rotation: [rotX, rotY],
        imageUrl: media.original_url || media.thumbnail_url,
        mediaType: media.type,
        baseHeight: estimatedHeight,
        estimatedHeight,
        estimatedWidth,
        sign,
      };

      sidePlanes.push(planeData);
      allPlanes.push(planeData);
    }
  });

  // z 값 기준으로 정렬 (카메라에 가까운 순서대로)
  allPlanes.sort((a, b) => b.position[2] - a.position[2]);

  return allPlanes;
}

function Scene({ planes, isPlaying, displayDuration, onPlaybackEnd }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  // 재생 상태
  const playbackState = useRef({
    seenPlanes: new Set(),
    currentDisplayIndex: null,
    displayStartTime: 0,
    isDisplaying: false,
    cameraZ: -40,
    finished: false,
  });

  // 카메라 위치 상태 (ImagePlane에 전달용)
  const [cameraPosition, setCameraPosition] = useState([0, 0, -40]);

  // 재생 시작 시 리셋
  useEffect(() => {
    if (isPlaying) {
      playbackState.current = {
        seenPlanes: new Set(),
        currentDisplayIndex: null,
        displayStartTime: 0,
        isDisplaying: false,
        cameraZ: 300,
        finished: false,
      };
      camera.position.set(0, 0, 300);
      setCameraPosition([0, 0, 300]);
    }
  }, [isPlaying, camera]);

  // OrbitControls 활성화/비활성화
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isPlaying;
    }
  }, [isPlaying]);

  // 가장 깊은 플레인의 z 값
  const deepestZ = useMemo(() => {
    if (planes.length === 0) return -1000;
    return Math.min(...planes.map((p) => p.position[2]));
  }, [planes]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const pb = playbackState.current;
    const currentTime = state.clock.getElapsedTime();

    // 이미 끝났으면 리턴
    if (pb.finished) return;

    // 현재 표시 중인 플레인이 있는 경우
    if (pb.isDisplaying && pb.currentDisplayIndex !== null) {
      const elapsed = currentTime - pb.displayStartTime;

      if (elapsed >= displayDuration) {
        // 표시 시간 종료 - 원래 자리로 복귀
        pb.isDisplaying = false;
        pb.currentDisplayIndex = null;
      }
      return; // 표시 중에는 카메라 이동 안함
    }

    // 카메라 전진
    const newZ = pb.cameraZ - CAMERA_SPEED * delta;

    // 가장 깊은 플레인에 도달했는지 체크
    if (newZ < deepestZ - DISPLAY_OFFSET_Z - 100) {
      pb.finished = true;
      onPlaybackEnd?.();
      return;
    }

    pb.cameraZ = newZ;
    camera.position.z = newZ;
    setCameraPosition([
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ]);

    // 가장 가까운 안 본 플레인 찾기
    let closestPlane = null;
    let closestDistance = Infinity;

    for (const plane of planes) {
      if (pb.seenPlanes.has(plane.id)) continue;

      const distance = Math.abs(plane.position[2] - newZ);

      if (distance < PLANE_DETECT_THRESHOLD && distance < closestDistance) {
        closestDistance = distance;
        closestPlane = plane;
      }
    }

    // 가까운 플레인이 있으면 표시
    if (closestPlane) {
      pb.seenPlanes.add(closestPlane.id);
      pb.currentDisplayIndex = closestPlane.id;
      pb.displayStartTime = currentTime;
      pb.isDisplaying = true;
    }
  });

  const currentDisplayId = playbackState.current.currentDisplayIndex;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 50, 100]} intensity={1.0} />
      <pointLight position={[-100, 50, 0]} intensity={0.5} />
      <pointLight position={[100, 50, 0]} intensity={0.5} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -300, 0]}
        receiveShadow
      >
        <planeGeometry args={[400, 10000]} />
        <meshStandardMaterial color="#efefef" roughness={0.8} />
      </mesh>

      {planes.map((p) => (
        <Suspense key={p.id} fallback={null}>
          <ImagePlane
            imageUrl={p.imageUrl}
            position={p.position}
            rotation={p.rotation}
            baseHeight={p.baseHeight}
            sign={p.sign}
            isDisplayed={
              currentDisplayId === p.id && playbackState.current.isDisplaying
            }
            cameraPosition={cameraPosition}
          />
        </Suspense>
      ))}

      <OrbitControls
        ref={controlsRef}
        target={[0, 0, -200]}
        minDistance={10}
        maxDistance={14000}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// 재생 컨트롤 UI
function PlaybackControls({
  isPlaying,
  onTogglePlay,
  duration,
  onDurationChange,
}) {
  const durationOptions = [3, 5, 7, 10, 15];

  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
      {/* 재생/정지 버튼 */}
      <button
        onClick={onTogglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
      >
        {isPlaying ? (
          // 정지 아이콘
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          // 재생 아이콘
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* 시간 드롭다운 */}
      <select
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="rounded bg-white/20 px-3 py-1 text-sm text-white outline-none"
        disabled={isPlaying}
      >
        {durationOptions.map((sec) => (
          <option key={sec} value={sec} className="bg-gray-800">
            {sec}s
          </option>
        ))}
      </select>
    </div>
  );
}

export default function DisplayScene({ recordId }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayDuration, setDisplayDuration] = useState(5);

  // API 호출
  useEffect(() => {
    if (!recordId) return;

    async function fetchMedia() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/record/${recordId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const mediaItems = data?.data?.mediaList;

        if (mediaItems && mediaItems.length > 0) {
          const images = mediaItems.filter((m) => m.type === "image");
          setMediaList(images);
          console.log(`Loaded ${images.length} images from API`);
        } else {
          throw new Error("No media found");
        }
      } catch (err) {
        console.error("Failed to fetch media:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [recordId]);

  const planes = useMemo(() => {
    if (mediaList.length === 0) return [];
    const rng = mulberry32(SEED);
    return generatePlanes(rng, mediaList);
  }, [mediaList]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePlaybackEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">Loading...</div>
          <div className="text-sm text-gray-400">
            Fetching media from server
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl text-red-500">Error</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (mediaList.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">No Media Found</div>
          <div className="text-sm text-gray-400">
            The album appears to be empty
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* 재생 컨트롤 UI */}
      <PlaybackControls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        duration={displayDuration}
        onDurationChange={setDisplayDuration}
      />

      <Canvas
        camera={{
          position: [0, 0, 300],
          fov: 80,
          near: 0.1,
          far: 15000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene
            planes={planes}
            isPlaying={isPlaying}
            displayDuration={displayDuration}
            onPlaybackEnd={handlePlaybackEnd}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
