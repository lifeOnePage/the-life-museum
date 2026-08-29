"use client";

import { useMemo } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  TONE_STYLES,
  getFrameWrapperStyle,
  getFrameInnerProps,
} from "@/app/memorial/[id]/components/introPosterStyles";
import { getMediaType } from "@/app/library/utils/mediaType";

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
  coverImageUrl = null,
  viewUrl = null,
}) {
  const imageList = useMemo(
    () => (photoMedia ?? []).filter((m) => m.type === "image" && !m.is_cover),
    [photoMedia],
  );
  const photo = imageList[0] || null;
  // 포스터 인물 사진은 커버 이미지와 동기화 — 커버가 이미지일 때 우선 사용
  // (감상 화면 MemorialExhibition의 profileItem 선정과 동일 기준)
  const coverIsImage =
    coverImageUrl && getMediaType(coverImageUrl) === "image";
  const photoSrc = coverIsImage
    ? coverImageUrl
    : photo?.original_url || photo?.thumbnail_url || "";
  const yearRange = useMemo(() => yearRangeFromTimeline(timeline), [timeline]);

  const toneStyle = TONE_STYLES[posterTone] || TONE_STYLES.dark;
  const frameWrapperStyle = getFrameWrapperStyle(posterStyle);
  const frameInner = getFrameInnerProps(posterStyle, posterTone);
  const isPortrait = aspectRatio !== "16:9";

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      {/* 미리보기는 정적 포스터 — 실제 상호작용(탭 전환·링·방명록)은 감상 화면에서 */}
      {viewUrl && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          감상 화면에서 보기
          <ExternalLink size={11} />
        </a>
      )}
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
