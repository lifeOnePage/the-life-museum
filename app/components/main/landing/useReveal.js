"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 스크롤 진입 시 1회 리빌되는 IntersectionObserver 훅.
 * 랜딩 섹션들이 공통으로 사용한다.
 *
 * const [ref, inView] = useReveal();
 * <div ref={ref} className={`... ${inView ? "is-in" : "is-out"}`} />
 */
export default function useReveal({ threshold = 0.2, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 모션 축소 선호 시 즉시 노출
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
