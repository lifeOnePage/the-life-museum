"use client";

import Reveal from "./Reveal";

export default function SectionShare() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto grid max-w-[1160px] items-center gap-10 px-6 py-[clamp(90px,13vh,160px)] md:grid-cols-2">
        <div className="max-w-[480px]">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            Point 04
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.25] tracking-[-0.02em]"
          >
            추억은 함께 볼 때
            <br />더 특별합니다
          </Reveal>
          <Reveal
            as="p"
            delay={200}
            className="mt-5 text-[clamp(14px,1.15vw,17px)] leading-[1.7] text-white-100"
          >
            카카오톡으로 링크 하나만 보내면, 누구나 당신이 만든 앨범을 쉽게
            감상할 수 있습니다.
          </Reveal>
        </div>

        <Reveal delay={200} y={30} className="flex justify-center md:justify-end">
          <img loading="lazy" decoding="async"
            src="/images/landing/kakao-phone.png"
            alt="카카오톡으로 공유된 앨범을 감상하는 모습"
            className="w-full max-w-[520px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
