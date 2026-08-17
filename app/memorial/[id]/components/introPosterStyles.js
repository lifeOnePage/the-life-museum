// 인트로 포스터 스타일 정의 — IntroPoster(감상 화면)와 MemorialPreview(편집 화면 미리보기)가 공유한다.

export const TONE_STYLES = {
  dark: {
    bg: "bg-black text-white",
    frameBorder: "border-white/25",
    glow: "shadow-[0_0_60px_20px_rgba(255,255,255,0.18)]",
    subText: "text-white/55",
    hintText: "text-white/40",
  },
  white: {
    bg: "bg-[#f7f4ef] text-[#1a1510]",
    frameBorder: "border-black/15",
    glow: "shadow-[0_0_60px_20px_rgba(0,0,0,0.12)]",
    subText: "text-black/50",
    hintText: "text-black/40",
  },
};

// 프레임리스: 경계가 완전히 흐려지도록 사진 가장자리를 마스크로 페더링
const FEATHER_MASK =
  "radial-gradient(ellipse 85% 88% at 50% 50%, black 55%, transparent 100%)";

// 사진을 담는 바깥 래퍼(aspect-ratio 박스)에 적용할 style — 글로우는 Y축 회전을 위한 perspective 필요
export function getFrameWrapperStyle(style) {
  if (style === "glow") return { perspective: "1000px" };
  return {};
}

// 실제 사진(overflow-hidden 컨테이너)에 적용할 className + style
export function getFrameInnerProps(style, tone) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.dark;

  if (style === "glow") {
    return {
      className: `h-full w-full overflow-hidden rounded-3xl border-0 ${toneStyle.glow}`,
      style: {
        transform: "rotateY(20deg)",
        transformStyle: "preserve-3d",
      },
    };
  }

  if (style === "frameless") {
    return {
      className: "h-full w-full overflow-hidden rounded-none border-0",
      style: {
        WebkitMaskImage: FEATHER_MASK,
        maskImage: FEATHER_MASK,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      },
    };
  }

  // classic
  return {
    className: `h-full w-full overflow-hidden rounded-sm border ${toneStyle.frameBorder}`,
    style: {},
  };
}
