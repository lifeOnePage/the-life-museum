"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ImagePlus,
  RefreshCw,
  ChevronLeft,
  X,
  Upload,
  FolderOpen,
  Film,
} from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-md bg-[#d5d5d7]" />
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

const T = {
  ko: {
    refPhotoHeader: "참고 이미지 선택",
    refPhotoDesc: "사진을 탭하면 바로 참고 이미지로 추가됩니다.",
    noPhotos: "사용 가능한 사진이 없습니다.",
    coverHeader: "표지 디자인",
    coverDesc: "참고 이미지와 스타일을 선택하면 AI가 표지를 생성합니다.",
    genCount: "사용한 생성 횟수",
    genExhausted: "생성 횟수를 모두 사용했습니다.",
    refImage: "참고 이미지",
    device: "디바이스",
    photodrive: "포토드라이브",
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
    coverHeader: "Cover Design",
    coverDesc: "Select a reference image and style, then AI will generate your cover.",
    genCount: "Generations used",
    genExhausted: "You've used all your generations.",
    refImage: "Reference Image",
    device: "Device",
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
  initialFrontCover,
  photoMedia,
  photoBlobUrls,
  onRefreshPhotos,
  isRefreshing,
  preloadBlobs,
  locale,
}) {
  const t = T[locale] || T.ko;
  const STYLES = locale === "en" ? STYLES_EN : STYLES_KO;
  const [view, setView] = useState("generate"); // "generate" | "ref-photodrive"
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [imageRefPreviews, setImageRefPreviews] = useState([]);
  const [imageRefFiles, setImageRefFiles] = useState([]);
  const [isAddingRefPhoto, setIsAddingRefPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  // Generation count tracking
  const [genCount, setGenCount] = useState(0);
  const remainingGens = 3 - genCount;

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

  const handleSelectImage = (index) => {
    setSelectedImageIndex(index);
    const imageUrl = generatedImages[index];
    if (imageUrl) onApply(imageUrl);
  };

  const handleRevertCover = () => {
    if (initialFrontCover) onApply(initialFrontCover);
    setSelectedImageIndex(-1);
  };

  const handleGenerate = async () => {
    if (imageRefFiles.length === 0 || remainingGens <= 0) return;
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
    e.target.value = "";
  };

  const removeImageRef = () => {
    imageRefPreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageRefFiles([]);
    setImageRefPreviews([]);
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
    const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
    try {
      let blob;
      if (photoBlobUrls[index]) {
        blob = await fetch(photoBlobUrls[index]).then((r) => r.blob());
      } else {
        blob = await fetch(proxyUrl).then((r) => r.blob());
      }
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const file = new File([blob], `ref-photo-${index}.${ext}`, {
        type: blob.type,
      });
      // Revoke old previews
      imageRefPreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageRefFiles([file]);
      setImageRefPreviews([URL.createObjectURL(blob)]);
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

          {photoMedia.length === 0 ? (
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
                {photoMedia.map((media, i) => (
                  <button
                    key={i}
                    onClick={() => handleRefPhotoSelect(i)}
                    disabled={isAddingRefPhoto}
                    className="aspect-square overflow-hidden rounded-md transition-all hover:opacity-80 disabled:opacity-50"
                  >
                    <LazyImage
                      src={media.original_url || media.thumbnail_url}
                      alt={`사진 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
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
          <div className="mb-4 flex items-center justify-between rounded-lg border-[1.5px] border-[#c4b49a] px-3 py-2">
            <span className="text-xs text-[#c4b49a]">{t.genCount}</span>
            <span
              className={`text-xs font-medium ${remainingGens <= 0 ? "text-red-500" : "text-[#c4b49a]"}`}
            >
              {3 - remainingGens}/3
            </span>
          </div>

          {remainingGens <= 0 && (
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

          {imageRefPreviews.length > 0 ? (
            <div className="mb-4">
              <div className="relative inline-block">
                <img
                  src={imageRefPreviews[0]}
                  alt="참고 이미지"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  onClick={removeImageRef}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-[#2e2720] text-[#e8d5b7] transition-colors hover:bg-[#3a3025]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex gap-3">
              <label className="hover:border-[#c4b49a] flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 py-4 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageRef}
                />
                <Upload className="mb-1 h-4 w-4 text-[#9b8b7a]" />
                <span className="text-[11px] text-[#9b8b7a]">{t.device}</span>
              </label>
              <button
                onClick={() => {
                  preloadBlobs();
                  setView("ref-photodrive");
                }}
                className="hover:border-[#c4b49a] flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 py-4 transition-colors"
              >
                <FolderOpen className="mb-1 h-4 w-4 text-[#9b8b7a]" />
                <span className="text-[11px] text-[#9b8b7a]">{t.photodrive}</span>
              </button>
            </div>
          )}

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
