"use client";

/**
 * 아직 구현되지 않은 탭(메모리/방명록)의 임시 화면.
 */
export default function PlaceholderTab({ label }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black px-[6%] pb-[10vh] text-center text-white">
      <p className="font-serif text-[2.2vh] tracking-wide text-white/70">
        {label}
      </p>
      <p className="mt-[1.5vh] text-[1.5vh] text-white/40">
        준비 중입니다
      </p>
    </div>
  );
}
