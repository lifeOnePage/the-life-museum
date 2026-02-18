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

export function generatePlanes(rng, mediaList) {
  const allPlanes = [];
  if (!mediaList || mediaList.length === 0) return allPlanes;

  // Repeat media so corridor length exceeds FOG_FAR for seamless infinite loop
  const MIN_CORRIDOR_LENGTH = FOG_FAR + 2000;
  const avgGapPerItem = 50;
  const itemsPerSide = Math.ceil(mediaList.length / 2);
  const corridorPerPass = itemsPerSide * avgGapPerItem;
  const repeats = Math.max(
    1,
    Math.ceil(MIN_CORRIDOR_LENGTH / Math.max(corridorPerPass, 1)),
  );

  const expandedMedia = [];
  for (let r = 0; r < repeats; r++) {
    expandedMedia.push(...mediaList);
  }

  const leftMedia = expandedMedia.filter((_, idx) => idx % 2 === 0);
  const rightMedia = expandedMedia.filter((_, idx) => idx % 2 === 1);

  const wallData = [
    { sign: -1, media: leftMedia },
    { sign: 1, media: rightMedia },
  ];

  wallData.forEach(({ sign, media: sideMedia }) => {
    const sidePlanes = [];
    const lanes = [0, 100, 200];
    let z = CAMERA_START_Z;

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

      const wave = Math.sin(z * 0.02 + 1.7) * 40;
      const x = sign * CORRIDOR_HALF + sign * wave + rand(rng, -6, 6);

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

  allPlanes.sort((a, b) => b.position[2] - a.position[2]);
  return allPlanes;
}
