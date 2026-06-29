"use client";

import { useMemo } from "react";
import {
  BG_BRIGHTNESS,
  BG_OPACITY,
  BG_PERSPECTIVE_PX,
  BG_CYL_RADIUS_PX,
  BG_CYL_COLUMNS,
  BG_CYL_TILES_PER_COL,
  BG_CYL_SPIN_S,
} from "./lib/constants";

/**
 * 배경 미디어를 "원통 안쪽 면"에 붙여 오목한 곡면 스크린을 만든다.
 * 원통 전체를 천천히 회전(rotateY)시키면, 타일들이 곡면을 따라 좌→우로 흐른다.
 *  - 진짜 곡면(cylinder)이므로 가운데는 정면, 가장자리로 갈수록 자연스럽게 휘어 보인다.
 *  - 360° 회전이 완전히 동일한 상태로 돌아오므로 끊김 없이 무한 반복된다.
 */
export default function BackgroundMediaFlow({ mediaList = [] }) {
  const R = BG_CYL_RADIUS_PX;
  const N = BG_CYL_COLUMNS;
  const M = BG_CYL_TILES_PER_COL;

  // 열 너비 = 원통 둘레를 N등분한 현(chord) 길이 → 열끼리 빈틈 없이 맞물림
  const colW = 2 * R * Math.tan(Math.PI / N);
  const VGAP = 6;
  const tileH = colW * 0.64;
  const colH = M * (tileH + VGAP);

  // 각 열에 들어갈 미디어를 결정론적으로 배분
  const columns = useMemo(() => {
    if (mediaList.length === 0) return [];
    const cols = [];
    let k = 0;
    for (let c = 0; c < N; c++) {
      const tiles = [];
      for (let t = 0; t < M; t++) {
        tiles.push(mediaList[k % mediaList.length]);
        k++;
      }
      cols.push(tiles);
    }
    return cols;
  }, [mediaList, N, M]);

  if (columns.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      style={{ opacity: BG_OPACITY }}
      aria-hidden
    >
      <style>{`
        @keyframes memorialSpin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(-360deg); }
        }
      `}</style>

      {/* 원근 무대 */}
      <div
        className="absolute inset-0"
        style={{
          perspective: `${BG_PERSPECTIVE_PX}px`,
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* 회전하는 원통 */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transformStyle: "preserve-3d",
            animation: `memorialSpin ${BG_CYL_SPIN_S}s linear infinite`,
            willChange: "transform",
          }}
        >
          {columns.map((tiles, c) => {
            const angle = (c * 360) / N;
            return (
              <div
                key={c}
                className="absolute"
                style={{
                  width: `${colW}px`,
                  height: `${colH}px`,
                  left: `${-colW / 2}px`,
                  top: `${-colH / 2}px`,
                  transform: `rotateY(${angle}deg) translateZ(${-R}px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                {tiles.map((m, t) => (
                  <div
                    key={t}
                    className="absolute overflow-hidden rounded-[2px]"
                    style={{
                      left: "3px",
                      right: "3px",
                      top: `${t * (tileH + VGAP)}px`,
                      height: `${tileH}px`,
                    }}
                  >
                    <img
                      src={m?.thumbnail_url || m?.original_url}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ filter: `brightness(${BG_BRIGHTNESS})` }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 어두운 비네트 — 곡면 가장자리/상하 깊이감 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 90% at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.97) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.95) 100%)",
        }}
      />
    </div>
  );
}
