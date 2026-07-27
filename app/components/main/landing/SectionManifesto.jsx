"use client";

import Reveal from "./Reveal";

export default function SectionManifesto() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      {/* 매우 어둡게 깔린 사진 배경 */}
      <img loading="lazy" decoding="async"
        src="/images/landing/photos-backdrop.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25"
      />
      {/* 중앙 집중 비네트 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,18,18,0.55)_0%,rgba(18,18,18,0.9)_70%)]" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-[900px] flex-col items-center justify-center px-6 py-[clamp(90px,14vh,180px)] text-center">
        <Reveal
          as="p"
          className="text-[clamp(22px,2.6vw,34px)] font-medium leading-[1.7] tracking-[-0.01em] text-paper"
        >
          모든 삶에는
          <br />
          사랑의 기억이 있습니다.
        </Reveal>

        <Reveal delay={200} className="my-9 h-px w-10 bg-white/30" />

        <Reveal
          as="p"
          delay={320}
          className="text-[clamp(22px,2.6vw,34px)] font-medium leading-[1.7] tracking-[-0.01em] text-paper"
        >
          모든 사랑의 기억은
          <br />
          기록될 가치가 있습니다.
        </Reveal>
      </div>
    </section>
  );
}
