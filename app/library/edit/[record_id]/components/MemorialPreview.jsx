"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import {
  TONE_STYLES,
  getFrameWrapperStyle,
  getFrameInnerProps,
} from "@/app/memorial/[id]/components/introPosterStyles";

function yearRangeFromTimeline(timeline) {
  const yearNums = (timeline ?? [])
    .map((item) => {
      const m = String(item.year || "").match(/\d{4}/);
      return m ? parseInt(m[0], 10) : null;
    })
    .filter((n) => n != null);
  if (yearNums.length === 0) return "";
  const min = Math.min(...yearNums);
  const max = Math.max(...yearNums);
  return min === max ? `${min}` : `${min} ~ ${max}`;
}

/**
 * 편집 화면 오른쪽 미리보기 패널용 메모리얼 인트로 포스터 프리뷰.
 * VHSPreview/WalkPreview와 같은 자리에서, 감상 화면(IntroPoster)과 동일한 스타일을 실시간 반영한다.
 */
export default function MemorialPreview({
  photoMedia,
  mediaLoading = false,
  albumTitle,
  albumSubtitle,
  timeline,
  posterStyle = "classic",
  posterTone = "dark",
  aspectRatio = "9:16",
}) {
  const imageList = useMemo(
    () => (photoMedia ?? []).filter((m) => m.type === "image" && !m.is_cover),
    [photoMedia],
  );
  const photo = imageList[0] || null;
  const photoSrc = photo?.original_url || photo?.thumbnail_url || "";
  const yearRange = useMemo(() => yearRangeFromTimeline(timeline), [timeline]);

  const toneStyle = TONE_STYLES[posterTone] || TONE_STYLES.dark;
  const frameWrapperStyle = getFrameWrapperStyle(posterStyle);
  const frameInner = getFrameInnerProps(posterStyle, posterTone);
  const isPortrait = aspectRatio !== "16:9";

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div
        className={`relative flex h-full overflow-hidden ${
          isPortrait ? "aspect-[9/16]" : "aspect-[16/9]"
        } ${toneStyle.bg}`}
      >
        <div
          className={`flex h-full w-full flex-col items-center justify-center px-[6%] py-[6%] ${toneStyle.bg}`}
        >
          <div className="flex w-full flex-col items-center">
            {/* 앞면 사진 */}
            <div
              className="aspect-[3/4] w-full max-w-[70%]"
              style={frameWrapperStyle}
            >
              <div className={frameInner.className} style={frameInner.style}>
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[1.4vh] text-white/30">
                      {mediaLoading ? "불러오는 중..." : "사진 없음"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 타이틀 */}
            <h1 className="mt-[4%] text-center font-serif text-[3.2vh] leading-tight font-medium tracking-wide">
              {albumTitle || "이름"}
            </h1>

            {/* 시작연도~끝연도 */}
            {yearRange && (
              <p
                className={`mt-[1.5%] text-center text-[1.6vh] tracking-[0.3em] ${toneStyle.subText}`}
              >
                {yearRange}
              </p>
            )}

            {/* 섭타이틀 */}
            {albumSubtitle && (
              <p
                className={`mt-[3%] max-w-[90%] text-center text-[1.5vh] leading-[1.9] font-light tracking-wide ${toneStyle.subText}`}
              >
                {albumSubtitle}
              </p>
            )}

            {/* 안내 문구 */}
            <p
              className={`mt-[5%] flex items-center justify-center gap-[0.6vh] text-center text-[1.3vh] tracking-wide ${toneStyle.hintText}`}
            >
              화면을 터치하여 고인의 삶을 만나고 방명록에 글을 남겨주세요
              <ArrowRight className="h-[1.5vh] w-[1.5vh] shrink-0" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
