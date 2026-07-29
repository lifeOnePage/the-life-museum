"use client";

import Reveal from "./Reveal";
import CtaButton from "./CtaButton";

export default function SectionFinalCTA() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      {/* 웨딩 사진 배경 */}
      <img loading="lazy" decoding="async"
        src="/images/landing/finalcta-bg.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,18,18,0.45)_0%,rgba(18,18,18,0.92)_78%)]" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[900px] flex-col items-center justify-center px-6 py-[clamp(90px,14vh,180px)] text-center">
        <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-100">
          Start Today
        </Reveal>
        <Reveal
          as="h2"
          delay={120}
          className="mt-6 text-[clamp(28px,4.2vw,56px)] font-bold leading-[1.3] tracking-[-0.02em] text-paper"
        >
          오늘부터, 저장만 하지 말고
          <br />
          아름답게 정리해서
          <br className="sm:hidden" /> 함께 보세요
        </Reveal>
        <Reveal
          as="p"
          delay={240}
          className="mt-6 max-w-[560px] text-[clamp(14px,1.2vw,18px)] leading-[1.6] text-white-100"
        >
          버려지는 사진이 아닌, 계속 열어보고 싶은 나만의 디지털 앨범.
        </Reveal>
        <Reveal delay={360} className="mt-10">
          <CtaButton variant="solid" className="px-9 py-4 text-[16px]">
            첫 번째 앨범 만들기
          </CtaButton>
        </Reveal>
      </div>
    </section>
  );
}
