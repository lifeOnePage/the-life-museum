"use client";

import Reveal from "./Reveal";

export default function SectionOneLink() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-[clamp(80px,12vh,150px)] md:grid-cols-2 md:px-12">
        {/* 좌: 카피 + 로고 */}
        <div className="max-w-[560px]">
          <Reveal
            as="h2"
            className="text-[clamp(30px,3.6vw,52px)] font-bold leading-[1.15] tracking-[-0.02em]"
          >
            링크 하나면,
            <br />
            준비 끝
          </Reveal>
          <Reveal
            as="p"
            delay={120}
            className="mt-6 text-[clamp(15px,1.35vw,20px)] font-medium leading-[1.5] text-paper"
          >
            사진을 이 서비스에 별도로 업로드할 필요 없습니다.
          </Reveal>
          <Reveal
            as="p"
            delay={200}
            className="mt-4 text-[clamp(13px,1.05vw,16px)] leading-[1.7] text-white-100"
          >
            공유 링크만 붙여 넣으세요. AI가 당신만의 디지털 앨범을
            <br className="hidden sm:block" />
            만들 수 있게 도와드립니다.
          </Reveal>

          <Reveal delay={300} className="mt-9">
            <img loading="lazy" decoding="async"
              src="/images/landing/onelink-logos.png"
              alt="Google Photos, iCloud Photos, Google Drive"
              className="h-[clamp(72px,7vw,96px)] w-auto"
            />
          </Reveal>
        </div>

        {/* 우: 사진 수렴 비주얼 */}
        <Reveal delay={200} y={30} className="relative">
          <img loading="lazy" decoding="async"
            src="/images/landing/onelink-visual.png"
            alt="여러 곳에 흩어진 사진들이 하나의 앨범으로 모이는 모습"
            className="w-full object-contain"
          />
        </Reveal>
      </div>
    </section>
  );
}
