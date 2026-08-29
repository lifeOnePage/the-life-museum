"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ImagePlus,
  RefreshCw,
  ChevronLeft,
  Upload,
  Film,
  Image as ImageIcon,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { getProxiedUrl } from "@/app/lib/proxy";
import { useChunkedGrid } from "@/app/lib/useChunkedGrid";
import { authedFetch } from "@/app/utils/authedFetch";
import LazyImage from "@/app/lib/LazyImage";
import ScrollToTopButton from "./ScrollToTopButton";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

// 사진이 이 수 이상이면 스크롤 부담이 커져 "맨 위로" 플로팅 버튼을 노출한다.
const SCROLL_TOP_FAB_MIN_PHOTOS = 15;


const T = {
  ko: {
    refPhotoHeader: "참고 이미지 선택",
    refPhotoDesc: "사진을 탭하면 바로 참고 이미지로 추가됩니다.",
    noPhotos: "사용 가능한 사진이 없습니다.",
    scrollTop: "맨 위로",
    coverHeader: "표지 디자인",
    coverDesc: "참고 이미지와 스타일을 선택하면 AI가 표지를 생성합니다.",
    genCount: "사용한 생성 횟수",
    genExhausted: "생성 횟수를 모두 사용했습니다.",
    refImage: "참고 이미지",
    currentCover: "현재 표지",
    device: "디바이스 업로드",
    photodrive: "드라이브 업로드",
    style: "스타일",
    generating: "생성 중...",
    generateMore: "추가 생성하기",
    generate: "생성하기",
    maxReached: "최대 3개까지 생성할 수 있습니다.",
    results: "생성 결과",
    revert: "기존 커버로 되돌리기",
    animationTitle: "애니메이션 만들기",
    animationBadge: "추후 제공 예정",
    animationDesc: "선택한 이미지를 기반으로 짧은 애니메이션 영상을 생성합니다.",
  },
  en: {
    refPhotoHeader: "Select Reference Image",
    refPhotoDesc: "Tap a photo to add it as a reference image.",
    noPhotos: "No photos available.",
    scrollTop: "Scroll to top",
    coverHeader: "Cover Design",
    coverDesc: "Select a reference image and style, then AI will generate your cover.",
    genCount: "Generations used",
    genExhausted: "You've used all your generations.",
    refImage: "Reference Image",
    currentCover: "Current Cover",
    device: "Device Upload",
    photodrive: "Photo Drive",
    style: "Style",
    generating: "Generating...",
    generateMore: "Generate More",
    generate: "Generate",
    maxReached: "Maximum 3 images can be generated.",
    results: "Results",
    revert: "Revert to Original Cover",
    animationTitle: "Create Animation",
    animationBadge: "Coming soon",
    animationDesc: "Generate a short animation based on the selected image.",
  },
};

const STYLES_KO = [
  { key: "minimal", label: "잉크 드로잉", desc: "흑백 손그림 느낌", sample: "/images/styleSample/minimal.png" },
  { key: "abstract", label: "팝 아트", desc: "화려한 컬러 패턴", sample: "/images/styleSample/abstract.png" },
  { key: "animation", label: "수채 일러스트", desc: "따뜻한 애니 감성", sample: "/images/styleSample/animation.png" },
];

const STYLES_EN = [
  { key: "minimal", label: "Ink Drawing", desc: "B&W hand-drawn style", sample: "/images/styleSample/minimal.png" },
  { key: "abstract", label: "Pop Art", desc: "Vivid color pattern", sample: "/images/styleSample/abstract.png" },
  { key: "animation", label: "Watercolor", desc: "Warm animation style", sample: "/images/styleSample/animation.png" },
];

export default function CoverImageGenerator({
  record_id,
  onApply,
  onBack,
  frontCover,
  initialFrontCover,
  photoMedia,
  onRefreshPhotos,
  isRefreshing,
  isLoading,
  locale,
  onRequestAIConsent,
  isAdmin = false,
}) {
  const t = T[locale] || T.ko;
  const STYLES = locale === "en" ? STYLES_EN : STYLES_KO;
  const [view, setView] = useState("generate"); // "generate" | "ref-photodrive"
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  // 포토드라이브 그리드 청크 마운트 — 수천 장 앨범에서 DOM 전량 마운트 방지
  const {
    visibleCount: gridCount,
    sentinelRef: gridSentinelRef,
    hasMore: gridHasMore,
  } = useChunkedGrid(photoMedia?.length ?? 0);
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [imageRefPreviews, setImageRefPreviews] = useState([]);
  const [imageRefFiles, setImageRefFiles] = useState([]);
  const [isAddingRefPhoto, setIsAddingRefPhoto] = useState(false);
  // 현재 참고 이미지가 "현재 앨범 표지"인지 여부 (배지 표시용)
  const [refIsCurrentCover, setRefIsCurrentCover] = useState(false);
  const [isLoadingCoverRef, setIsLoadingCoverRef] = useState(false);
  // 참고-이미지 포토드라이브 사진 목록 시작점 (맨 위로 버튼 스크롤 타겟)
  const refPhotodriveTopRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  // Generation count tracking
  const [genCount, setGenCount] = useState(0);
  const remainingGens = isAdmin ? Infinity : 3 - genCount;

  // Fetch coverGenCount on mount
  useEffect(() => {
    const fetchGenCount = async () => {
      try {
        const response = await authedFetch(
          `${API_URL}/api/v1/record/${record_id}`,
        );
        const data = await response.json();
        if (data?.data?.coverGenCount != null) {
          setGenCount(data.data.coverGenCount);
        }
      } catch (err) {
        console.error("Failed to fetch gen count:", err);
      }
    };
    fetchGenCount();
  }, [record_id]);

  // 지금 실제로 적용되어 있는 표지 — AI로 새로 생성해 적용한 직후에도
  // (initialFrontCover는 세션 시작 시점 값이라 갱신되지 않음) 항상 최신 상태를 가리킨다
  const liveFrontCover = frontCover || initialFrontCover;

  // 현재 표지가 이미지인지(영상/움짤이면 참고 이미지로 부적합) 판별
  const coverIsImage = (() => {
    if (!liveFrontCover) return false;
    const clean = liveFrontCover.split("?")[0].toLowerCase();
    return !/\.(mp4|webm|mov|gif)$/.test(clean);
  })();

  // 현재 앨범 표지를 참고 이미지(File)로 로드
  const loadCoverAsRef = async () => {
    if (!liveFrontCover || !coverIsImage) return;
    setIsLoadingCoverRef(true);
    try {
      const isLocal =
        liveFrontCover.startsWith("blob:") ||
        liveFrontCover.startsWith("data:");
      let blob;
      if (isLocal) {
        blob = await fetch(liveFrontCover).then((r) => r.blob());
      } else {
        try {
          const res = await fetch(getProxiedUrl(liveFrontCover));
          if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
          blob = await res.blob();
        } catch {
          // 직접 로드 실패(CORS 등) — 프록시 강제 경유로 재시도
          blob = await fetch(
            getProxiedUrl(liveFrontCover, { force: true }),
          ).then((r) => r.blob());
        }
      }
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const file = new File([blob], `current-cover.${ext}`, {
        type: blob.type,
      });
      imageRefPreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageRefFiles([file]);
      setImageRefPreviews([URL.createObjectURL(blob)]);
      setRefIsCurrentCover(true);
    } catch (e) {
      console.error("Failed to load current cover as reference:", e);
    } finally {
      setIsLoadingCoverRef(false);
    }
  };

  // 진입 시 현재 표지를 기본 참고 이미지로 미리 선택 (바로 생성 가능)
  useEffect(() => {
    if (coverIsImage && imageRefFiles.length === 0) {
      loadCoverAsRef();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveFrontCover]);

  const handleSelectImage = (index) => {
    setSelectedImageIndex(index);
    const imageUrl = generatedImages[index];
    if (imageUrl) onApply(imageUrl);
  };

  // 참고 이미지 박스에 지금 실제로 적용된 표지를 보여준다 —
  // 생성 결과를 선택했다면 그 결과, 아니면 로드해둔 참고 이미지.
  const displayedRefImage =
    selectedImageIndex >= 0
      ? generatedImages[selectedImageIndex]
      : imageRefPreviews[0];

  const handleRevertCover = () => {
    if (initialFrontCover) onApply(initialFrontCover);
    setSelectedImageIndex(-1);
  };

  const handleGenerate = async () => {
    if (imageRefFiles.length === 0 || remainingGens <= 0) return;
    if (onRequestAIConsent) {
      const allowed = await onRequestAIConsent("cover");
      if (!allowed) return;
    }
    setIsGenerating(true);
    setSelectedImageIndex(-1);
    setError("");

    try {
      const formData = new FormData();
      formData.append("style", selectedStyle);
      formData.append("reference_image", imageRefFiles[0]);

      const response = await authedFetch(
        `${API_URL}/api/v1/record/${record_id}/cover/generate`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || "생성에 실패했습니다");
      }

      const newImages = data.data?.images ?? [];
      setGeneratedImages((prev) => [...prev, ...newImages].slice(0, 3));

      // Update generation count from response
      if (data.data?.remainingGenerations != null) {
        setGenCount(3 - data.data.remainingGenerations);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageRef = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke old previews
    imageRefPreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageRefFiles([file]);
    setImageRefPreviews([URL.createObjectURL(file)]);
    setRefIsCurrentCover(false);
    e.target.value = "";
  };

  const handleRefPhotoSelect = async (index) => {
    if (isAddingRefPhoto) return;
    setIsAddingRefPhoto(true);

    const media = photoMedia[index];
    if (!media) {
      setIsAddingRefPhoto(false);
      return;
    }

    const rawUrl = media.original_url || media.thumbnail_url;
    const proxyUrl = getProxiedUrl(rawUrl);
    try {
      const blob = await fetch(proxyUrl).then((r) => r.blob());
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const file = new File([blob], `ref-photo-${index}.${ext}`, {
        type: blob.type,
      });
      // Revoke old previews
      imageRefPreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageRefFiles([file]);
      setImageRefPreviews([URL.createObjectURL(blob)]);
      setRefIsCurrentCover(false);
      setView("generate");
    } catch (e) {
      console.error("Ref photo conversion failed:", e);
    } finally {
      setIsAddingRefPhoto(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {view === "ref-photodrive" && (
        <motion.div
          key="ref-photodrive"
          ref={refPhotodriveTopRef}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="sticky top-0 z-10 mb-4 bg-[#241f18] pb-2">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setView("generate")}
                className="flex items-center gap-2 text-[#9b8b7a] transition-colors hover:text-[#e8d5b7]"
              >
                <ChevronLeft className="h-[18px] w-[20px]" />
                <span className="text-base font-bold">{t.refPhotoHeader}</span>
              </button>
              <button
                onClick={onRefreshPhotos}
                disabled={isRefreshing}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/10 hover:text-[#e8d5b7] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <p className="text-xs text-[#9b8b7a]">
              {t.refPhotoDesc}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-md bg-[#3a3028]"
                />
              ))}
            </div>
          ) : photoMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImagePlus className="mb-2 h-8 w-8 text-[#9b8b7a]/40" />
              <p className="text-sm text-[#9b8b7a]">
                {t.noPhotos}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-3 gap-3">
                {photoMedia.slice(0, gridCount).map((media, i) => (
                  <button
                    key={i}
                    onClick={() => handleRefPhotoSelect(i)}
                    disabled={isAddingRefPhoto}
                    className="aspect-square overflow-hidden rounded-md transition-all hover:opacity-80 disabled:opacity-50"
                  >
                    <LazyImage
                      // 그리드는 썸네일(400px)로 — 원본(2000px) 대비 대역폭 절감
                      src={media.thumbnail_url || media.original_url}
                      alt={`사진 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                {gridHasMore && (
                  <div ref={gridSentinelRef} className="col-span-full h-6" />
                )}
              </div>
            </motion.div>
          )}

          <ScrollToTopButton
            enabled={photoMedia.length >= SCROLL_TOP_FAB_MIN_PHOTOS}
            label={t.scrollTop}
            targetRef={refPhotodriveTopRef}
          />
        </motion.div>
      )}

      {view === "generate" && (
        <motion.div
          key="generate"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with back arrow */}
          <div className="mb-4">
            <button
              onClick={onBack}
              className="mb-2 flex items-center gap-2 text-[#9b8b7a] transition-colors hover:text-[#e8d5b7]"
            >
              <ChevronLeft className="h-[18px] w-5" />
              <span className="text-base font-bold">{t.coverHeader}</span>
            </button>
            <p className="text-xs text-[#9b8b7a]">
              {t.coverDesc}
            </p>
          </div>

          {/* Remaining generations indicator */}
          {!isAdmin && (
            <div className="mb-4 flex items-center justify-between rounded-lg border-[1.5px] border-[#c4b49a] px-3 py-2">
              <span className="text-xs text-[#c4b49a]">{t.genCount}</span>
              <span
                className={`text-xs font-medium ${remainingGens <= 0 ? "text-red-500" : "text-[#c4b49a]"}`}
              >
                {3 - remainingGens}/3
              </span>
            </div>
          )}

          {!isAdmin && remainingGens <= 0 && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-500">
                {t.genExhausted}
              </p>
            </div>
          )}

          {/* 1. Reference image */}
          <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
            {t.refImage}
          </label>

          {/* 현재 선택된 참고 이미지 미리보기 (기본값: 현재 앨범 표지) — 앞면 선택 UI와 동일한 패턴 */}
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
            {isLoadingCoverRef && !displayedRefImage ? (
              <div className="absolute inset-0 animate-pulse bg-[#3a3028]" />
            ) : (
              displayedRefImage && (
                <img
                  src={displayedRefImage}
                  alt="참고 이미지"
                  className="h-full w-full object-cover"
                />
              )
            )}
            {refIsCurrentCover && selectedImageIndex < 0 && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border border-[#c4b49a]/40 bg-[#1a1510]/70 px-2 py-1 text-[11px] font-medium text-[#c4b49a] backdrop-blur-sm">
                <ImageIcon className="h-3 w-3" />
                {t.currentCover}
              </span>
            )}
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button
                onClick={() => setUploadMenuOpen((o) => !o)}
                className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition ${
                  uploadMenuOpen
                    ? "bg-[#c4b49a] text-[#1a1510]"
                    : "bg-black/60 text-white hover:bg-black/80"
                }`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              {coverIsImage && (
                <button
                  onClick={() => {
                    setSelectedImageIndex(-1);
                    loadCoverAsRef();
                  }}
                  disabled={isLoadingCoverRef}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 연필 아이콘을 누르면 나타나는 직접 업로드 / 드라이브 업로드 선택 */}
          <AnimatePresence initial={false}>
            {uploadMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-4 flex gap-3 pt-1">
                  <label className="hover:border-[#c4b49a] flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 py-4 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleImageRef(e);
                        setUploadMenuOpen(false);
                      }}
                    />
                    <Upload className="mb-1 h-4 w-4 text-[#9b8b7a]" />
                    <span className="text-[11px] text-[#9b8b7a]">
                      {t.device}
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      // 사진은 선택 시 해당 1장만 온디맨드로 가져온다 (전량 프리로드 금지)
                      setView("ref-photodrive");
                      setUploadMenuOpen(false);
                    }}
                    className="hover:border-[#c4b49a] flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 py-4 transition-colors"
                  >
                    <img
                      src="/cloud_download.svg"
                      alt=""
                      className="mb-1 h-4 w-4"
                    />
                    <span className="text-[11px] text-[#9b8b7a]">
                      {t.photodrive}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Style selector */}
          <label className="mb-1.5 block text-xs font-medium text-[#9b8b7a]">
            {t.style}
          </label>
          <div className="mb-4 flex gap-2">
            {STYLES.map((opt) => {
              const disabled = false;
              return (
                <button
                  key={opt.key}
                  onClick={() => !disabled && setSelectedStyle(opt.key)}
                  disabled={disabled}
                  className={`flex flex-1 flex-col items-center overflow-hidden rounded-lg border px-2 py-2 text-center transition-all ${
                    selectedStyle === opt.key
                      ? "border-[#c4b49a] bg-[#c4b49a]/10"
                      : disabled
                        ? "border-white/10 opacity-40"
                        : "hover:border-[#c4b49a] border-white/15"
                  }`}
                >
                  <img
                    src={opt.sample}
                    alt={opt.label}
                    className="mb-1.5 h-16 w-16 rounded object-cover"
                  />
                  <span
                    className={`text-xs font-medium ${
                      selectedStyle === opt.key
                        ? "text-[#c4b49a]"
                        : "text-[#e8d5b7]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-[#9b8b7a]">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating || imageRefFiles.length === 0 || remainingGens <= 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#c4b49a] py-2.5 text-sm font-medium text-[#1a1510] transition-opacity hover:bg-[#e8d5b7] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t.generating}
              </>
            ) : generatedImages.length > 0 ? (
              <>
                <Sparkles className="h-4 w-4" />
                {t.generateMore}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t.generate}
              </>
            )}
          </button>
          {generatedImages.length >= 3 && (
            <p className="mt-2 text-center text-xs text-[#9b8b7a]">
              {t.maxReached}
            </p>
          )}

          {/* Results section - only shows after generation */}
          {generatedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="mb-2 text-xs font-medium text-[#9b8b7a]">
                {t.results}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {generatedImages.map((imageUrl, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectImage(i)}
                    className={`aspect-square overflow-hidden rounded-md transition-all ${
                      selectedImageIndex === i
                        ? "ring-2 ring-[#3E5A81] ring-offset-2"
                        : "hover:opacity-80"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`생성 결과 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Revert button */}
              {initialFrontCover && selectedImageIndex >= 0 && (
                <button
                  onClick={handleRevertCover}
                  className="mt-4 flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 py-[10px] text-sm font-medium text-[#9b8b7a] transition-colors hover:bg-white/10"
                >
                  {t.revert}
                </button>
              )}

              {/* Animation skeleton (coming soon) */}
              {selectedImageIndex >= 0 && (
                <div className="mt-3 rounded-lg border border-dashed border-white/15 p-4 opacity-60">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-[#9b8b7a]" />
                    <span className="text-sm font-medium text-[#9b8b7a]">
                      {t.animationTitle}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#9b8b7a]">
                      {t.animationBadge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#9b8b7a]">
                    {t.animationDesc}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
