"use client";

import Reveal from "./Reveal";

export default function SectionGallery() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      {/* 흩어진 사진 배경 */}
      <img loading="lazy" decoding="async"
        src="/images/landing/photos-backdrop.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,18,18,0.35)_0%,rgba(18,18,18,0.85)_75%)]" />

      <div className="relative mx-auto max-w-[1180px] px-6 py-[clamp(90px,13vh,160px)] text-center">
        <Reveal
          as="p"
          className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200"
        >
          Point 1
        </Reveal>
        <Reveal
          as="h2"
          delay={100}
          className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.25] tracking-[-0.02em]"
        >
          추억을 수집하는 즐거움을 만드세요
        </Reveal>
        <Reveal
          as="p"
          delay={200}
          className="mx-auto mt-4 max-w-[620px] text-[clamp(14px,1.15vw,17px)] leading-[1.6] text-white-100"
        >
          앨범 하나가 완성되면, 나만의 추억 갤러리에 차곡차곡 보관됩니다.
        </Reveal>

        <Reveal
          delay={320}
          y={40}
          className="mt-12 overflow-clip rounded-[14px] border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
        >
          <img loading="lazy" decoding="async"
            src="/images/landing/album-shelf.png"
            alt="한 권씩 쌓여가는 나만의 추억 갤러리 화면"
            className="block w-full"
          />
        </Reveal>

        <Reveal
          as="p"
          delay={420}
          className="mt-6 text-[13px] text-white-200"
        >
          한 권씩 쌓여가는 나만의 추억 갤러리
        </Reveal>
      </div>
    </section>
  );
}
