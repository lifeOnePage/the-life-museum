"use client";

import { useState } from "react";

// 로드 전 펄스 플레이스홀더 + 페이드인 이미지.
// (CoverImageEditor/BackCoverUpload/CoverImageGenerator에 중복 정의돼 있던 것을 추출)
export default function LazyImage({
  src,
  alt,
  className,
  placeholderClassName = "bg-[#d5d5d7]",
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div
          className={`absolute inset-0 animate-pulse rounded-md ${placeholderClassName}`}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
