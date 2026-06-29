"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import GravestoneStage from "./GravestoneStage";
import { useGravestoneCycle } from "./lib/useGravestoneCycle";
import { MORPH_DURATION_MS, CHRYSANTHEMUM_SRC } from "./lib/constants";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

/**
 * 중앙 gravestone 패널.
 * - 상단: 좌상단 프로필 슬롯(모핑 도착점) + 이름/생몰년
 * - 중앙: GravestoneStage (프로필 ↔ 랜덤 슬라이드쇼)
 * - 하단: 추모글 + 흰 국화
 */
export default function Gravestone({ name, years, memorialText, profileItem, mediaList = [] }) {
  const slideCount = mediaList.length;
  const { phase, slideIndex } = useGravestoneCycle({ slideCount, active: slideCount > 0 });
  const slideItem = slideCount > 0 ? mediaList[slideIndex % slideCount] : null;
  const [flowerOk, setFlowerOk] = useState(true);

  return (
    <LayoutGroup>
      <div
        className="relative flex h-full flex-col items-center rounded-md px-[2.5%] pt-[2.5vh] pb-[2vh]"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(6,6,8,0.7) 18%, rgba(4,4,6,0.9) 60%, rgba(2,2,4,0.96) 100%)",
        }}
      >
        {/* ── 헤더: 프로필 슬롯 + 이름/생몰년 ── */}
        <div className="flex w-full items-center justify-center gap-4 pt-[1vh] pb-[3vh]">
          {/* 좌상단 프로필 슬롯 — slideshow 단계에서 모핑되어 들어온다 */}
          {phase === "slideshow" && profileItem && (
            <motion.img
              layoutId="mem-profile"
              src={mediaSrc(profileItem)}
              alt=""
              draggable={false}
              className="h-[7vh] w-[7vh] shrink-0 rounded-md object-cover shadow-lg"
              transition={{ duration: MORPH_DURATION_MS / 1000, ease: "easeInOut" }}
            />
          )}

          <div className="flex flex-col items-center text-center">
            <h1 className="font-serif text-[3.2vh] leading-tight font-medium tracking-wide text-white/95">
              故 {name}
            </h1>
            {years && (
              <p className="mt-[0.8vh] text-[1.7vh] tracking-[0.3em] text-white/55">
                {years}
              </p>
            )}
          </div>
        </div>

        {/* ── 중앙 스테이지 ── */}
        <div className="w-full max-w-[34vh]">
          <GravestoneStage
            phase={phase}
            profileItem={profileItem}
            slideItem={slideItem}
            slideIndex={slideIndex}
          />
        </div>

        {/* ── 추모글 ── */}
        {memorialText && (
          <p className="mt-[3.5vh] max-w-[90%] text-center text-[1.7vh] leading-[2] font-light tracking-wide text-white/70">
            {memorialText}
          </p>
        )}

        {/* ── 흰 국화 (에셋 없으면 graceful 생략) ── */}
        {flowerOk && (
          <img
            src={CHRYSANTHEMUM_SRC}
            alt=""
            draggable={false}
            onError={() => setFlowerOk(false)}
            className="pointer-events-none absolute bottom-[2vh] left-[6%] h-[16vh] w-auto object-contain opacity-90"
          />
        )}
      </div>
    </LayoutGroup>
  );
}
