"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

/**
 * 랜딩 공통 CTA 버튼.
 * - 로그인 상태면 /library(앨범 만들기 모달), 아니면 /login 으로 이동
 * - variant: "solid"(밝은 배경) | "outline"(테두리) | "ghost"(인트로용, 반투명)
 */
export default function CtaButton({
  children,
  variant = "solid",
  className = "",
  arrow = false,
  onClick,
}) {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    router.push(user ? "/library" : "/login");
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.02em] transition-all duration-300 cursor-pointer select-none whitespace-nowrap";

  const variants = {
    solid:
      "bg-paper text-black-100 hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(255,255,255,0.35)]",
    outline:
      "border border-white/30 text-paper hover:border-white/70 hover:bg-white/5 hover:-translate-y-0.5",
    ghost:
      "border border-white/40 text-paper backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/80 hover:-translate-y-0.5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${base} ${variants[variant] ?? variants.solid} px-7 py-3.5 text-[15px] ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <span aria-hidden className="translate-y-[0.5px] transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      )}
    </button>
  );
}
