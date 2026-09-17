"use client";

import { getFlowerAsset } from "./guestbookAssets";

/**
 * 꽃이 심긴 화분 (국화/백합/카네이션).
 * 부모가 absolute로 잡은 앵커 지점(0×0)에 "화분 바닥 중앙"이 오도록 이미지를
 * 자기 크기 비율만큼 밀어 배치한다 — 꽃 종류마다 이미지 비율이 달라도 화분
 * 폭(potWidth)과 접지선이 일치한다.
 */
export default function FlowerPot({ type, potWidth, className = "", style = {} }) {
  const a = getFlowerAsset(type);
  return (
    <img
      src={a.pot}
      alt=""
      draggable={false}
      className={`pointer-events-none absolute top-0 left-0 max-w-none select-none ${className}`}
      style={{
        width: potWidth / a.potWidth,
        aspectRatio: `${a.w} / ${a.h}`,
        transform: `translate(-${a.potCx * 100}%, -${a.potBottom * 100}%)`,
        ...style,
      }}
    />
  );
}
