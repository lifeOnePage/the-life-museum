"use client";

import Reveal from "./Reveal";

export default function SectionNotAlbum() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(80px,12vh,140px)]">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10 md:gap-16">
          <Reveal
            as="h2"
            className="text-center text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-right"
          >
            NOT AN
            <br />
            ALBUM.
          </Reveal>

          <Reveal
            delay={150}
            y={16}
            className="shrink-0"
          >
            <img loading="lazy" decoding="async"
              src="/images/landing/notalbum-child.png"
              alt="노을 진 들판을 뛰어가는 아이"
              className="h-[clamp(120px,14vw,180px)] w-[clamp(120px,14vw,180px)] rotate-[-4deg] rounded-[6px] object-cover shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]"
            />
          </Reveal>

          <Reveal
            as="h2"
            delay={300}
            className="text-center text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-left"
          >
            A
            <br />
            LIFE.
          </Reveal>
        </div>

        <Reveal
          as="p"
          delay={420}
          className="mx-auto mt-10 max-w-[620px] text-center text-[clamp(13px,1.1vw,16px)] leading-[1.7] text-white-100"
        >
          단순한 파일 나열 방식의 클라우드 앨범을 넘어,
          <br />한 사람의 생애와 관계의 기억을 미술관처럼 큐레이션합니다.
        </Reveal>
      </div>
    </section>
  );
}
