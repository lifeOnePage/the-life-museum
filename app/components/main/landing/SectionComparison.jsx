"use client";

import Reveal from "./Reveal";

const ROWS = [
  { label: "서비스 유형", old: "사진 저장 위주", neo: "이야기를 담은 앨범" },
  { label: "저장 방식", old: "폴더로 관리", neo: "앨범으로 정리" },
  { label: "감상 방식", old: "슬라이드쇼 위주", neo: "다양한 감상 테마" },
  { label: "앨범 디자인", old: "—", neo: "AI 표지 · 스토리 · 타임라인" },
];

export default function SectionComparison() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1000px] px-6 py-[clamp(90px,13vh,160px)]">
        <div className="text-center">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            Comparison
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(24px,3.2vw,42px)] font-bold leading-[1.25] tracking-[-0.02em]"
          >
            저장 서비스가 아니라, 추억 앨범 서비스입니다
          </Reveal>
          <Reveal
            as="p"
            delay={200}
            className="mx-auto mt-4 max-w-[540px] text-[clamp(14px,1.15vw,17px)] leading-[1.6] text-white-100"
          >
            사진은 지금 있는 곳에 그대로 두세요. 더라이프메모리는 그 사진들로 앨범을 만듭니다.
          </Reveal>
        </div>

        {/* 디바이스 목업 */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal y={30} className="rounded-2xl border border-white/10 bg-black-200/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-white-100">기존 클라우드</span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white-200">
                폴더 관리
              </span>
            </div>
            <img loading="lazy" decoding="async" src="/images/landing/compare-before.png" alt="기존 클라우드의 사진 저장 화면" className="w-full" />
            <p className="mt-3 text-center text-[12px] text-white-300">그냥 쌓이기만 하는 파일</p>
          </Reveal>

          <Reveal delay={150} y={30} className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-paper">더라이프메모리</span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-black-100">
                앨범 정리
              </span>
            </div>
            <img loading="lazy" decoding="async" src="/images/landing/compare-after.png" alt="더라이프메모리의 앨범 정리 화면" className="w-full" />
            <p className="mt-3 text-center text-[12px] text-white-200">이야기가 담긴 앨범</p>
          </Reveal>
        </div>

        {/* 비교표 */}
        <Reveal delay={200} className="mt-8 overflow-clip rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-4" />
                <th className="px-5 py-4 text-[14px] font-semibold text-white-100">기존 클라우드</th>
                <th className="bg-white/[0.04] px-5 py-4 text-[14px] font-semibold text-paper">더라이프메모리</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} className={i < ROWS.length - 1 ? "border-b border-white/10" : ""}>
                  <th className="px-5 py-4 text-[13px] font-medium text-white-200">{r.label}</th>
                  <td className="px-5 py-4 text-[14px] text-white-100">{r.old}</td>
                  <td className="bg-white/[0.04] px-5 py-4 text-[14px] text-paper">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[11px] font-bold text-black-100">
                        ✓
                      </span>
                      {r.neo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
