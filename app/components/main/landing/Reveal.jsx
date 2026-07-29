"use client";

import useReveal from "./useReveal";

/**
 * 스크롤 진입 시 fade + slide-up 되는 래퍼.
 * <Reveal delay={120} as="h2" className="...">텍스트</Reveal>
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 24,
  className = "",
  style = {},
  ...rest
}) {
  const [ref, inView] = useReveal();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.8s ease ${delay}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
