"use client";
import { useEffect, useRef, useState } from "react";

export default function AboutInfo() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const appear =
    "opacity-0 translate-y-4 transition-all duration-700 will-change-transform";
  const show = inView ? "opacity-100 translate-y-0" : "";

  return (
    <section
      ref={sectionRef}
      className="bg-black-100 text-paper relative box-border flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[url('/images/bg-life-gallery.png')] bg-cover bg-center p-8 md:p-6"
    >
      {/* ✅ 모바일 세로 → md 이상 가로 */}
      <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 text-center md:flex-row md:gap-24 md:text-left">
        {/* 로고: 모바일 가운데, 데스크탑 오른쪽 정렬 */}
        <h1
          className={`m-0 text-center font-serif text-[clamp(56px,15vw,120px)] leading-[0.9] font-bold italic md:text-right ${appear} ${show} `}
          style={{ transitionDelay: "0ms" }}
        >
          The Life <br /> Museum
        </h1>

        {/* 설명: 모바일 가운데, 데스크탑 왼쪽 정렬 */}
        <div className="max-w-[640px] text-center font-sans text-[16px] leading-[1.3] md:text-left">
          <p
            className={`${appear} ${show}`}
            style={{ transitionDelay: "150ms" }}
          >
            <span className="text-paper mr-1 font-bold tracking-[-0.0625rem]">
              더라이프뮤지엄
            </span>
            <span className="text-paper/90 font-light tracking-[-0.0625rem]">
              은 인생의 순간을 하나의 사진첩과 포스터 카드로 정리하며,
              <br />
              갤러리처럼 아름답게 전시하고 공유할 수 있는 서비스입니다.
            </span>
          </p>

          <div
            className={`${appear} ${show} h-3`}
            style={{ transitionDelay: "250ms" }}
          />

          <p
            className={`${appear} ${show}`}
            style={{ transitionDelay: "300ms" }}
          >
            <span className="text-paper mr-1 font-bold tracking-[-0.0625rem]">
              더라이프뮤지엄
            </span>
            <span className="text-paper/90 font-light tracking-[-0.0625rem]">
              은 기술을 통해 모든 사람의 이야기가 기록되고 기억될 수 있도록
              합니다.
              <br />
              유명하지 않아도, 특별하지 않아도 좋습니다.
              <br />
              <br />
              당신의 이야기는 하나의 기록이 됩니다. 질문에 답하면서 자연스럽게
              삶이 정리되고, 그 과정에서 우리는 일상의 소중함을 다시 발견합니다.
            </span>
          </p>
        </div>
      </div>

      {/* <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[15vh] left-1/2 w-[min(70%,900px)] -translate-x-1/2 opacity-90 ${appear} ${show} `}
        style={{ transitionDelay: "450ms" }}
      >
        <img
          src="/images/design-line.svg"
          alt=""
          className="block h-auto w-full"
        />
      </div> */}
    </section>
  );
}
