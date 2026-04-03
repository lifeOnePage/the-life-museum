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

export default function CoverImageGenerator({
  record_id,
  onApply,
  onBack,
  photoMedia,
  photoBlobUrls,
  onRefreshPhotos,
  isRefreshing,
  preloadBlobs,
}) {
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
  };

  const handleResetImages = () => {
    setGeneratedImages([]);
    setSelectedImageIndex(-1);
  };

  const handleApply = () => {
    if (selectedImageIndex < 0 || !generatedImages[selectedImageIndex]) return;
    const imageUrl = generatedImages[selectedImageIndex];
    onApply(imageUrl);
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
          <div className="sticky top-0 z-10 mb-4 bg-[#f0eee9] pb-2">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setView("generate")}
                className="flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
              >
                <ChevronLeft className="h-[18px] w-[20px]" />
                <span className="text-base font-bold">참고 이미지 선택</span>
              </button>
              <button
                onClick={onRefreshPhotos}
                disabled={isRefreshing}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-gray-200 hover:text-[#1e1e1e] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <p className="text-xs text-[#64748b]">
              사진을 탭하면 바로 참고 이미지로 추가됩니다.
            </p>
          </div>

          {photoMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImagePlus className="mb-2 h-8 w-8 text-[#cbd5e1]" />
              <p className="text-sm text-[#94a3b8]">
                사용 가능한 사진이 없습니다.
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
              className="mb-2 flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
            >
              <ChevronLeft className="h-[18px] w-5" />
              <span className="text-base font-bold">표지 디자인</span>
            </button>
            <p className="text-xs text-[#64748b]">
              참고 이미지와 스타일을 선택하면 AI가 표지를 생성합니다.
            </p>
          </div>

          {/* Remaining generations indicator */}
          <div className="mb-4 flex items-center justify-between rounded-lg border-[1.5px] border-[#67ADD1] px-3 py-2">
            <span className="text-xs text-[#67ADD1]">사용한 생성 횟수</span>
            <span
              className={`text-xs font-medium ${remainingGens <= 0 ? "text-red-500" : "text-[#67ADD1]"}`}
            >
              {3 - remainingGens}/3
            </span>
          </div>

          {remainingGens <= 0 && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2">
              <p className="text-xs text-red-500">
                생성 횟수를 모두 사용했습니다.
              </p>
            </div>
          )}

          {/* 1. Reference image */}
          <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
            참고 이미지
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
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex gap-3">
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-[#cfcfd1]/50 py-4 transition-colors hover:border-[#67add1]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageRef}
                />
                <Upload className="mb-1 h-4 w-4 text-[#6b7280]" />
                <span className="text-[11px] text-[#6b7280]">디바이스</span>
              </label>
              <button
                onClick={() => {
                  preloadBlobs();
                  setView("ref-photodrive");
                }}
                className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-[#cfcfd1]/50 py-4 transition-colors hover:border-[#67add1]"
              >
                <FolderOpen className="mb-1 h-4 w-4 text-[#6b7280]" />
                <span className="text-[11px] text-[#6b7280]">포토드라이브</span>
              </button>
            </div>
          )}

          {/* 2. Style selector */}
          <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
            스타일
          </label>
          <div className="mb-4 flex gap-2">
            {[
              { key: "minimal", label: "미니멀", desc: "모던 & 절제된" },
              { key: "abstract", label: "추상", desc: "준비중" },
              { key: "animation", label: "애니메이션", desc: "준비중" },
            ].map((opt) => {
              const disabled = opt.key === "abstract";
              return (
                <button
                  key={opt.key}
                  onClick={() => !disabled && setSelectedStyle(opt.key)}
                  disabled={disabled}
                  className={`flex flex-1 flex-col items-center rounded-lg border px-2 py-3 text-center transition-all ${
                    selectedStyle === opt.key
                      ? "border-[#67add1] bg-[#67add1]/10"
                      : disabled
                        ? "border-gray-200 opacity-40"
                        : "border-gray-200 hover:border-[#67add1]"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      selectedStyle === opt.key
                        ? "text-[#67add1]"
                        : "text-[#334155]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-[#94a3b8]">
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#67ADD1] py-2.5 text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : generatedImages.length > 0 ? (
              <>
                <Sparkles className="h-4 w-4" />
                추가 생성하기
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                생성하기
              </>
            )}
          </button>
          {generatedImages.length >= 3 && (
            <p className="mt-2 text-center text-xs text-[#94a3b8]">
              최대 3개까지 생성할 수 있습니다.
            </p>
          )}

          {/* Results section - only shows after generation */}
          {generatedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-[#64748b]">생성 결과</p>
                <button
                  onClick={handleResetImages}
                  className="text-xs text-[#94a3b8] transition-colors hover:text-[#475569]"
                >
                  초기화
                </button>
              </div>
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

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={selectedImageIndex < 0}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#3E5A81] py-[10px] text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
              >
                적용하기
              </button>

              {/* Animation skeleton (coming soon) */}
              {selectedImageIndex >= 0 && (
                <div className="mt-3 rounded-lg border border-dashed border-[#cbd5e1] p-4 opacity-60">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-[#94a3b8]" />
                    <span className="text-sm font-medium text-[#64748b]">
                      애니메이션 만들기
                    </span>
                    <span className="rounded-full bg-[#e2e8f0] px-2 py-0.5 text-[10px] text-[#64748b]">
                      추후 제공 예정
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    선택한 이미지를 기반으로 짧은 애니메이션 영상을 생성합니다.
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
