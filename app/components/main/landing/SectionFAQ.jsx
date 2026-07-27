"use client";

import { useState } from "react";
import Reveal from "./Reveal";

// 질문은 Figma 기준. 답변은 Figma에 미작성 상태여서 제품 설명 기반으로 작성.
const FAQS = [
  {
    q: "사진은 어떻게 등록하나요?",
    a: "구글 포토·구글 드라이브·아이클라우드의 공유 링크만 붙여 넣으면 됩니다. 사진을 따로 업로드할 필요 없이, 링크 하나로 앨범 제작이 시작됩니다.",
  },
  {
    q: "구글 포토 또는 아이클라우드를 꼭 사용해야 하나요?",
    a: "현재는 구글 포토·구글 드라이브·아이클라우드의 공유 링크를 지원합니다. 세 서비스 중 하나에 사진이 있다면 바로 이용하실 수 있습니다.",
  },
  {
    q: "완성된 앨범은 어떻게 감상하나요?",
    a: "웹에서 링크 하나로 감상할 수 있으며, 타임트래블·레트로TV 등 다양한 감상 테마로 앨범을 즐길 수 있습니다.",
  },
  {
    q: "부모님도 쉽게 볼 수 있나요?",
    a: "네. 카카오톡으로 링크만 보내면 별도의 앱 설치나 로그인 없이 누구나 쉽게 앨범을 열어볼 수 있습니다.",
  },
  {
    q: "AI가 어떤 작업을 해주나요?",
    a: "AI가 앨범 표지 디자인, 스토리(소개글) 작성, 타임라인 정리까지 도와 세상에 하나뿐인 앨범을 완성합니다.",
  },
  {
    q: "구글 포토 링크 안의 사진을 AI가 자동으로 정리하나요?",
    a: "네. 공유 링크 안의 사진을 바탕으로 AI가 표지·스토리·타임라인을 구성해 앨범 형태로 정리해 드립니다.",
  },
];

export default function SectionFAQ() {
  const [open, setOpen] = useState(-1);

  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[760px] px-6 py-[clamp(90px,13vh,160px)]">
        <div className="text-center">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            FAQ
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold tracking-[-0.02em]"
          >
            자주 묻는 질문
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-12 border-t border-white/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="text-[clamp(15px,1.3vw,18px)] font-semibold text-paper">
                    {f.q}
                  </span>
                  <span
                    className="shrink-0 text-xl text-white-100 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-clip">
                    <p className="pb-6 pr-8 text-[clamp(13px,1.05vw,15px)] leading-[1.75] text-white-100">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
