"use client";

import { useRef } from "react";
import Reveal from "./Reveal";

const THEMES = [
  {
    n: "THEME 01",
    img: "/images/landing/theme-timetravel.png",
    title: "타임트래블",
    desc: "추억이 3D 공간에 펼쳐지는 몰입형 감상",
  },
  {
    n: "THEME 02",
    img: "/images/landing/theme-retrotv.png",
    title: "레트로TV",
    desc: "빈티지 TV 화면으로 온 가족이 함께 보는 추억",
  },
];

export default function SectionThemes() {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1240px] px-6 py-[clamp(90px,13vh,160px)]">
        <div className="text-center">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            Point 03
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
          >
            다양한 테마로, 앨범을 감상하세요
          </Reveal>
          <Reveal
            as="p"
            delay={200}
            className="mx-auto mt-4 max-w-[600px] text-[clamp(14px,1.15vw,17px)] leading-[1.6] text-white-100"
          >
            추억에 맞는 분위기로 가족, 여행, 연인, 아이 성장 등 다양한 스타일의 앨범을 감상하세요.
          </Reveal>
        </div>

        {/* 캐러셀 헤더 */}
        <div className="mt-12 flex items-center justify-between">
          <span className="text-[13px] text-white-200">2가지 감상 테마 · 옆으로 넘겨보세요</span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="이전"
              onClick={() => scrollBy(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-paper transition-colors hover:bg-white/10"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음"
              onClick={() => scrollBy(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-paper transition-colors hover:bg-white/10"
            >
              ›
            </button>
          </div>
        </div>

        {/* 트랙 */}
        <div
          ref={trackRef}
          className="scrollbar-hide mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {THEMES.map((t) => (
            <article
              key={t.n}
              className="relative w-[min(78vw,420px)] shrink-0 snap-start overflow-clip rounded-2xl border border-white/10"
            >
              <img loading="lazy" decoding="async" src={t.img} alt={t.title} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-paper backdrop-blur-sm">
                {t.n}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-5 pt-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-bold text-paper">{t.title}</h3>
                  <span className="rounded-full border border-white/25 px-2.5 py-1 text-[11px] text-white-100">
                    감상 테마
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-white-100">{t.desc}</p>
              </div>
            </article>
          ))}

          {/* Coming soon */}
          <article className="flex w-[min(78vw,420px)] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-2xl text-white-100">
              +
            </div>
            <h3 className="text-[17px] font-bold text-paper">다양한 테마 추가 예정</h3>
            <p className="max-w-[240px] text-[12px] leading-[1.6] text-white-200">
              더 특별한 감상 경험을 위해 새로운 테마를 준비하고 있어요.
            </p>
            <span className="mt-1 rounded-full bg-white/10 px-3 py-1 text-[11px] tracking-[0.08em] text-white-100">
              COMING SOON
            </span>
          </article>
        </div>
      </div>
    </section>
  );
}
