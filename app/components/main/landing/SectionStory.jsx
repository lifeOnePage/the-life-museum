"use client";

import Reveal from "./Reveal";

export default function SectionStory() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      {/* 흩어진 사진 배경 (우측) */}
      <img loading="lazy" decoding="async"
        src="/images/landing/story-scatter.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right opacity-90"
      />
      {/* 좌측 가독성 그라디언트 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black-100 via-black-100/80 to-transparent" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-[1400px] items-center px-6 py-[clamp(80px,12vh,150px)] md:px-16">
        <div className="max-w-[600px]">
          <Reveal
            as="h2"
            className="text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em]"
          >
            EVERY PHOTO
            <br />
            HAS A STORY.
          </Reveal>

          <Reveal
            as="p"
            delay={120}
            className="mt-7 text-[clamp(14px,1.15vw,17px)] leading-[1.7] text-white-100"
          >
            여행 사진 수천 장, 아이 사진 수만 장…
            <br />
            스마트폰, PC, 외장 저장장치에 흩어져 있는 수많은 사진들.
          </Reveal>

          <Reveal
            as="blockquote"
            delay={240}
            className="mt-8 text-[clamp(16px,1.4vw,21px)] font-medium leading-[1.6] text-paper"
          >
            “사진을 저장은 했지만,
            <br />
            다시 보는 일은 거의 없습니다.”
          </Reveal>
        </div>
      </div>
    </section>
  );
}
