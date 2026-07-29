"use client";

import Reveal from "./Reveal";

const STEPS = [
  {
    n: "STEP 01",
    img: "/images/landing/step1.png",
    title: "사진 폴더 공유 링크 입력",
    desc: "Google Photos·Drive·iCloud의 공유 링크만 붙여 넣으세요. 업로드는 필요 없습니다.",
  },
  {
    n: "STEP 02",
    img: "/images/landing/step2.png",
    title: "AI 도움을 받아 앨범 제작",
    desc: "표지 디자인부터 스토리, 타임라인, 감상 테마까지 AI가 함께 정리합니다.",
  },
  {
    n: "STEP 03",
    img: "/images/landing/step3.png",
    title: "공유하기",
    desc: "카카오톡 링크 하나로, 소중한 사람과 함께 앨범을 감상하세요.",
  },
];

export default function SectionHowItWorks() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(90px,13vh,160px)]">
        <Reveal
          as="p"
          className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200"
        >
          How it works
        </Reveal>
        <Reveal
          as="h2"
          delay={100}
          className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.25] tracking-[-0.02em]"
        >
          디지털 앨범이 완성되기까지,
          <br />단 3단계
        </Reveal>
        <Reveal
          as="p"
          delay={200}
          className="mt-4 max-w-[560px] text-[clamp(14px,1.15vw,17px)] leading-[1.6] text-white-100"
        >
          링크 붙여넣기부터 공유까지, 복잡한 편집 없이 세 단계면 충분합니다.
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={300 + i * 120}
              y={30}
              className="overflow-clip rounded-2xl border border-white/10 bg-black-200"
            >
              <div className="relative">
                <img loading="lazy" decoding="async" src={s.img} alt="" className="block aspect-[4/3] w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-paper backdrop-blur-sm">
                  {s.n}
                </span>
              </div>
              <div className="px-6 py-7">
                <h3 className="text-[clamp(16px,1.4vw,19px)] font-bold tracking-[-0.01em] text-paper">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-white-200">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
