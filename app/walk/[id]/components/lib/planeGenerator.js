import * as THREE from "three";
import {
  BASE_HEIGHT,
  CORRIDOR_HALF,
  CAMERA_START_Z,
  FOG_FAR,
} from "./constants";

export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rand(rng, min, max) {
  return min + (max - min) * rng();
}

export function deg(v) {
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

// 총 플레인(슬롯) 수 기본 상한 — 모바일 GPU/CPU 보호. 실제 값은 디바이스별
// getTextureConfig().planePoolSize로 전달되며, 이 개수의 슬롯이 복도에 고정 상주한다.
const MAX_TOTAL_PLANES = 200;

/**
 * 고정된 poolSize개의 슬롯을 복도에 배치한다.
 *
 * 앨범 사진 수와 무관하게 슬롯 수는 poolSize로 고정된다(메모리/메시 상한).
 * 각 슬롯은 초기 mediaIndex = slot % len 을 갖고, 슬롯이 복도 끝으로 래핑되면
 * Scene이 다음 사진으로 재할당한다(순환 로딩) — 그래서 poolSize보다 큰 앨범도
 * 걸어가는 동안 전체 사진이 순서대로 등장한다.
 *
 * @param {number} poolSize 복도에 상주할 슬롯 수 (device-tiered)
 */
export function generatePlanes(rng, mediaList, poolSize = MAX_TOTAL_PLANES) {
  const allPlanes = [];
  if (!mediaList || mediaList.length === 0) return allPlanes;

  const len = mediaList.length;
  // 항상 poolSize개의 슬롯을 만들어 복도를 채운다(무한 복도 유지). 앨범이 작으면
  // 사진이 복도에서 반복되지만, 순환 재할당은 언제나 앞으로 진행한다.
  const expandedMedia = [];
  for (let i = 0; i < poolSize; i++) {
    const mi = i % len;
    expandedMedia.push({ media: mediaList[mi], mediaIndex: mi });
  }

  // Order preservation: place every item along a SINGLE shared Z cursor in source
  // order, alternating walls per item. Because global Z decreases monotonically with
  // the source index, photos read in exact album order down the corridor (both the
  // passive wall sequence and the sequential auto-focus travel). Each wall still gets
  // ~50u spacing (the shared cursor advances a half-gap per item) so the two-wall
  // zigzag look is preserved; Y-lane / X-wave / rotation stay randomized for variety.
  const lanes = [0, 100, 200];
  const leftPlanes = [];
  const rightPlanes = [];
  let z = CAMERA_START_Z;

  for (let i = 0; i < expandedMedia.length; i++) {
    const sign = i % 2 === 0 ? -1 : 1;
    const sidePlanes = sign === -1 ? leftPlanes : rightPlanes;

    // Half-gap per item on the shared cursor: consecutive items sit on opposite
    // walls, so each wall keeps ~50u spacing while global Z stays monotonic.
    const gap = 25 + rand(rng, -5, 5);
    z -= gap;

    const { media, mediaIndex } = expandedMedia[i];
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

    const wave = Math.sin(z * 0.02 + 1.7) * 40;
    const x = sign * CORRIDOR_HALF + sign * wave + rand(rng, -6, 6);

    const rotX = deg(rand(rng, -16, 16));
    const rotY = x > 0 ? deg(rand(rng, 0, 16)) : deg(rand(rng, -16, 0));

    const planeData = {
      id: allPlanes.length,
      mediaIndex,
      position: [x, y, z],
      rotation: [rotX, rotY],
      // 이미지 벽면은 썸네일 우선(원본은 메인 스레드 동기 디코드 비용 — Scene.livePlanes
      // 주석 참고). 비디오는 imageUrl이 video.src로도 쓰이므로 원본(스트림 URL) 유지.
      imageUrl:
        media.type === "video"
          ? media.original_url || media.thumbnail_url
          : media.thumbnail_url || media.original_url,
      thumbnailUrl: media.thumbnail_url,
      mediaType: media.type,
      baseHeight: estimatedHeight,
      estimatedHeight,
      estimatedWidth,
      sign,
    };

    sidePlanes.push(planeData);
    allPlanes.push(planeData);
  }

  // Already monotonic in Z, but keep the explicit sort so downstream code (wrapping,
  // corridorSpan) can rely on descending-Z ordering regardless of placement details.
  allPlanes.sort((a, b) => b.position[2] - a.position[2]);
  return allPlanes;
}
