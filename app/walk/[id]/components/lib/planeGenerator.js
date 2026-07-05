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

// 총 플레인 수 상한 — 모바일 GPU/CPU 보호
const MAX_TOTAL_PLANES = 80;

export function generatePlanes(rng, mediaList) {
  const allPlanes = [];
  if (!mediaList || mediaList.length === 0) return allPlanes;

  // Repeat media so corridor length covers FOG_FAR for seamless infinite loop
  // (wrapping makes the corridor infinite — corridorSpan ≥ FOG_FAR prevents visible pattern repeats)
  const MIN_CORRIDOR_LENGTH = FOG_FAR;
  const avgGapPerItem = 50;
  const itemsPerSide = Math.ceil(mediaList.length / 2);
  const corridorPerPass = itemsPerSide * avgGapPerItem;
  const repeats = Math.max(
    1,
    Math.ceil(MIN_CORRIDOR_LENGTH / Math.max(corridorPerPass, 1)),
  );

  let expandedMedia = [];
  for (let r = 0; r < repeats; r++) {
    for (let mi = 0; mi < mediaList.length; mi++) {
      expandedMedia.push({ media: mediaList[mi], mediaIndex: mi });
    }
  }

  // Cap total planes to protect mobile devices
  if (expandedMedia.length > MAX_TOTAL_PLANES) {
    expandedMedia = expandedMedia.slice(0, MAX_TOTAL_PLANES);
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
      imageUrl: media.original_url || media.thumbnail_url,
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
