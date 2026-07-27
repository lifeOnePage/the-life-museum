"use client";

import Reveal from "./Reveal";

function FeatureText({ eyebrow, title, children, align = "left" }) {
  return (
    <div className={align === "right" ? "md:text-left" : ""}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white-200">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-[clamp(20px,2.2vw,28px)] font-bold tracking-[-0.02em] text-paper">
        {title}
      </h3>
      <p className="mt-4 max-w-[440px] text-[clamp(13px,1.05vw,15px)] leading-[1.75] text-white-100">
        {children}
      </p>
    </div>
  );
}

/* --- AI 커버 목업 (원본 → AI 표지) --- */
function AiCoverMock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black-200/70 p-6 md:p-8">
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <figure className="w-[40%] max-w-[190px]">
          <img loading="lazy" decoding="async"
            src="/images/landing/point2-before.png"
            alt="원본 사진"
            className="aspect-square w-full rounded-xl object-cover"
          />
          <figcaption className="mt-2 text-center text-[11px] text-white-200">원본 사진</figcaption>
        </figure>
        <span className="text-2xl text-white-200">→</span>
        <figure className="w-[40%] max-w-[190px]">
          <img loading="lazy" decoding="async"
            src="/images/landing/point2-after.png"
            alt="AI가 만든 앨범 표지"
            className="aspect-square w-full rounded-xl object-cover"
          />
          <figcaption className="mt-2 text-center text-[11px] text-white-200">AI 표지</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* --- AI 스토리 작성 카드 --- */
function AiStoryMock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black-200/70 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm">🏷️</div>
        <div>
          <p className="text-[14px] font-semibold text-paper">AI 스토리 작성</p>
          <p className="text-[11px] text-white-200">앨범의 의미를 한 편의 이야기로</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {[
          { t: "+ 가족", on: false },
          { t: "+ 여행", on: true },
          { t: "+ 추억", on: false },
        ].map((c) => (
          <span
            key={c.t}
            className={`rounded-full px-3 py-1.5 text-[12px] ${
              c.on
                ? "bg-white/90 font-medium text-black-100"
                : "border border-white/15 text-white-100"
            }`}
          >
            {c.t}
          </span>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-black/40 p-4 text-[13px] leading-[1.7] text-white-100">
        사랑과 일상 속에서 두 사람은 천천히 함께 걸어왔다. 서로의 약속을 지키며
        담담한 하루들을 쌓아왔고, 그 시간들이 조용히 따뜻하게 남아 있었다.
      </p>
      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium text-paper">
          ✨ AI 스토리 다시 생성
        </span>
      </div>
    </div>
  );
}

/* --- 타임라인 --- */
function TimelineMock() {
  const items = [
    { y: "2018", t: "첫 만남" },
    { y: "2019", t: "여행의 시작" },
    { y: "2021", t: "새로운 시작" },
    { y: "2023", t: "우리의 일상" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-black-200/70 px-6 py-10">
      <div className="relative">
        <div className="absolute left-0 right-0 top-[6px] h-px bg-white/15" />
        <div className="relative flex justify-between">
          {items.map((it) => (
            <div key={it.y} className="flex flex-col items-center text-center">
              <span className="h-3 w-3 rounded-full border-2 border-white/60 bg-black-200" />
              <span className="mt-3 text-[13px] font-semibold text-paper">{it.y}</span>
              <span className="mt-1 text-[11px] text-white-200">{it.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SectionMakeAlbum() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(90px,13vh,160px)]">
        {/* 헤더 */}
        <div className="text-center">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            Point 02
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
          >
            나만의 앨범을 만들어 보세요
          </Reveal>
          <Reveal
            as="p"
            delay={200}
            className="mx-auto mt-4 max-w-[560px] text-[clamp(14px,1.15vw,17px)] leading-[1.6] text-white-100"
          >
            표지부터 스토리, 타임라인까지 — AI의 도움을 받아 세상에 하나뿐인 앨범을 완성합니다.
          </Reveal>
        </div>

        {/* Row 1: AI COVER */}
        <div className="mt-20 grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Reveal delay={80}>
            <FeatureText eyebrow="AI Cover" title="AI 커버 디자인">
              사진 한 장만 선택하면, AI로 앨범 표지를 다양한 스타일로 디자인할 수
              있습니다. 완성된 앨범은 180°로 뒤집어 앞면과 뒷면을 모두 감상할 수
              있어요.
            </FeatureText>
          </Reveal>
          <Reveal delay={200} y={30}>
            <AiCoverMock />
          </Reveal>
        </div>

        {/* Row 2: AI STORY (카드 좌 · 텍스트 우) */}
        <div className="mt-20 grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Reveal delay={200} y={30} className="md:order-1 order-2">
            <AiStoryMock />
          </Reveal>
          <Reveal delay={80} className="md:order-2 order-1">
            <FeatureText eyebrow="AI Story" title="AI 스토리 작성">
              AI의 도움을 받아, 앨범에 담긴 이야기를 쉽게 작성해 보세요. AI가 앨범
              소개글이 근사하게 만들어지도록 도와줍니다.
            </FeatureText>
          </Reveal>
        </div>

        {/* Row 3: TIMELINE */}
        <div className="mt-20 grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Reveal delay={80}>
            <FeatureText eyebrow="Timeline" title="타임라인 추가">
              앨범 속 추억의 흐름을, 타임라인으로 정리하세요. 앨범 이야기의
              처음부터 오늘까지 한눈에 보여줍니다.
            </FeatureText>
          </Reveal>
          <Reveal delay={200} y={30}>
            <TimelineMock />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
