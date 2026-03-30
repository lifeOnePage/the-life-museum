"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
  Check,
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

const CoverImageEditor = forwardRef(
  (
    {
      onImageGenerated,
      frontCover,
      initialFrontCover,
      record_id,
      preloadedPhotoMedia,
    },
    ref,
  ) => {
    const [view, setView] = useState("menu");
    const [prompt, setPrompt] = useState("");
    const [imageRefPreviews, setImageRefPreviews] = useState([]);
    const [imageRefFiles, setImageRefFiles] = useState([]);
    const [refPhotoChecked, setRefPhotoChecked] = useState(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [generatedImages, setGeneratedImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
    const [imageStrength, setImageStrength] = useState(0.5);
    const [photoMedia, setPhotoMedia] = useState([]);
    const [isLoadingPhotos] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
    const [photoBlobUrls, setPhotoBlobUrls] = useState([]);

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

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!selectedFile && !selectedImageUrl && !frontCover) return;
        setIsSaving(true);
        setError("");

        try {
          // AI-generated image or photodrive selection: use PUT /cover/url
          if (selectedImageUrl) {
            const response = await authedFetch(
              `${API_URL}/api/v1/record/${record_id}/cover/url`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: selectedImageUrl }),
              },
            );
            const data = await response.json();
            console.log("cover/url response:", response.status, data);
            if (!response.ok) {
              throw new Error(data.error || data.detail || "저장에 실패했습니다");
            }
            return data;
          }

          // Direct file upload: use POST /cover/temp
          if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await authedFetch(
              `${API_URL}/api/v1/record/${record_id}/cover/temp`,
              {
                method: "POST",
                body: formData,
              },
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "저장에 실패했습니다");
            }
            return data;
          }
        } catch (err) {
          setError(err.message);
          console.error(err);
          throw err;
        } finally {
          setIsSaving(false);
        }
      },
    }));

    const handleSelectImage = (index) => {
      setSelectedImageIndex(index);
    };

    const handleResetImages = () => {
      setGeneratedImages([]);
      setSelectedImageIndex(-1);
    };

    const handleApply = () => {
      if (selectedImageIndex < 0 || !generatedImages[selectedImageIndex])
        return;
      const imageUrl = generatedImages[selectedImageIndex];
      setSelectedImageUrl(imageUrl);
      setSelectedFile(null);
      onImageGenerated(imageUrl);
    };

    const handleGenerate = async () => {
      if (!prompt.trim() || remainingGens <= 0) return;
      setIsGenerating(true);
      setSelectedImageIndex(-1);
      setError("");

      try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("image_strength", String(imageStrength));
        for (const file of imageRefFiles) {
          formData.append("reference_image", file);
        }

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
      if (file && imageRefFiles.length < 3) {
        setImageRefFiles((prev) => [...prev, file]);
        setImageRefPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
      e.target.value = "";
    };

    const removeImageRef = (index) => {
      setImageRefFiles((prev) => prev.filter((_, i) => i !== index));
      setImageRefPreviews((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
      if (imageRefFiles.length <= 1) {
        setImageStrength(0.5);
      }
    };

    const handleRefPhotoToggle = (index) => {
      setRefPhotoChecked((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else if (next.size < 3 - imageRefFiles.length) {
          next.add(index);
        }
        return next;
      });
    };

    const handleRefPhotoConfirm = async () => {
      const apiUrl =
        "https://the-life-museum-backend-production.up.railway.app";
      const indices = [...refPhotoChecked];
      const newPreviews = [];
      const newFiles = [];

      for (const i of indices) {
        const media = photoMedia[i];
        if (!media) continue;
        const rawUrl = media.original_url || media.thumbnail_url;
        const proxyUrl = `${apiUrl}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
        try {
          let blob;
          if (photoBlobUrls[i]) {
            blob = await fetch(photoBlobUrls[i]).then((r) => r.blob());
          } else {
            blob = await fetch(proxyUrl).then((r) => r.blob());
          }
          const ext = blob.type === "image/png" ? "png" : "jpg";
          const file = new File([blob], `ref-photo-${i}.${ext}`, {
            type: blob.type,
          });
          newFiles.push(file);
          newPreviews.push(URL.createObjectURL(blob));
        } catch (e) {
          console.error("Ref photo conversion failed:", e);
        }
      }

      setImageRefFiles((prev) => [...prev, ...newFiles].slice(0, 3));
      setImageRefPreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
      setRefPhotoChecked(new Set());
      setView("generate");
    };

    const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setSelectedImageUrl(null);
        const url = URL.createObjectURL(file);
        onImageGenerated(url);
      }
    };

    // Initialize photoMedia from parent-preloaded data
    useEffect(() => {
      if (preloadedPhotoMedia && preloadedPhotoMedia.length > 0) {
        setPhotoMedia(preloadedPhotoMedia);
      }
    }, [preloadedPhotoMedia]);

    const preloadBlobUrls = () => {
      if (photoBlobUrls.length > 0 || photoMedia.length === 0) return;
      const apiUrl =
        "https://the-life-museum-backend-production.up.railway.app";
      setPhotoBlobUrls(new Array(photoMedia.length).fill(null));
      photoMedia.forEach(async (media, i) => {
        try {
          const rawUrl = media.original_url || media.thumbnail_url;
          const proxyUrl = `${apiUrl}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
          const res = await fetch(proxyUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          setPhotoBlobUrls((prev) => {
            const next = [...prev];
            next[i] = blobUrl;
            return next;
          });
        } catch (e) {
          console.error(e);
        }
      });
    };

    const handleSelectPhoto = async (index) => {
      setSelectedPhotoIndex(index);
      const media = photoMedia[index];
      if (!media) return;
      const rawUrl = media.original_url || media.thumbnail_url;
      const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
      setSelectedImageUrl(proxyUrl);
      setSelectedFile(null);

      // Show preview immediately
      const previewUrl = photoBlobUrls[index] || proxyUrl;
      onImageGenerated(previewUrl);

      // Convert to File for upload via /cover/temp (same as device upload)
      try {
        let blob;
        if (photoBlobUrls[index]) {
          blob = await fetch(photoBlobUrls[index]).then((r) => r.blob());
        } else {
          blob = await fetch(proxyUrl).then((r) => r.blob());
        }
        const ext = blob.type === "image/png" ? "png" : "jpg";
        const file = new File([blob], `photo-drive.${ext}`, { type: blob.type });
        setSelectedFile(file);
        setSelectedImageUrl(null);
      } catch (e) {
        console.error("Photo drive file conversion failed:", e);
        setSelectedImageUrl(rawUrl);
        setSelectedFile(null);
      }
    };

    return (
      <div className="space-y-7 pb-10">
        <AnimatePresence mode="wait">
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Two option cards */}
              <div className="flex gap-4">
                {/* AI Generate card */}
                <button
                  onClick={() => setView("generate")}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:border-[#67add1] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Sparkles className="h-4 w-4 text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium text-[#334155]">
                    이미지 생성하기
                  </span>
                  <div className="h-5" />
                </button>

                {/* Upload card */}
                <button
                  onClick={() => setView("upload")}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:border-[#67add1] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <ImagePlus className="h-[18px] w-[18px] text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium text-[#334155]">
                    직접 업로드
                  </span>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    JPG, PNG 최대 10MB
                  </p>
                </button>
              </div>

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </motion.div>
          )}

          {view === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header with back arrow */}
              <div className="mb-4">
                <button
                  onClick={() => setView("menu")}
                  className="mb-2 flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
                >
                  <ChevronLeft className="h-[18px] w-[20px]" />
                  <span className="text-base font-bold">직접 업로드</span>
                </button>
                <p className="text-xs text-[#64748b]">
                  디바이스에서 직접 업로드하거나, 포토드라이브에서 선택할 수
                  있습니다.
                </p>
              </div>

              {/* Two option cards */}
              <div className="flex gap-4">
                {/* Device upload card */}
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-[#cbd5e1] bg-transparent px-4 py-8 transition-all hover:border-[#67add1] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Upload className="h-[18px] w-[18px] text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium text-[#334155]">
                    디바이스 업로드
                  </span>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    JPG, PNG 최대 10MB
                  </p>
                </label>

                {/* Photo drive card */}
                <button
                  onClick={() => {
                    setView("photodrive");
                    setSelectedPhotoIndex(-1);
                    preloadBlobUrls();
                  }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:border-[#67add1] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <FolderOpen className="h-[18px] w-[18px] text-[#475569]" />
                  </div>
                  <span className="text-sm font-medium text-[#334155]">
                    포토드라이브
                  </span>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    레코드 사진에서 선택
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {view === "photodrive" && (
            <motion.div
              key="photodrive"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header with back arrow - sticky */}
              <div className="sticky top-0 z-10 mb-4 bg-[#f0eee9] pb-2">
                <button
                  onClick={() => setView("upload")}
                  className="mb-2 flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
                >
                  <ChevronLeft className="h-[18px] w-[20px]" />
                  <span className="text-base font-bold">포토드라이브</span>
                </button>
                <p className="text-xs text-[#64748b]">
                  레코드의 사진 중 표지로 사용할 이미지를 선택하세요.
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
                        onClick={() => handleSelectPhoto(i)}
                        className={`aspect-square overflow-hidden rounded-md transition-all ${
                          selectedPhotoIndex === i
                            ? "ring-2 ring-[#3E5A81] ring-offset-2"
                            : "hover:opacity-80"
                        }`}
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

          {view === "ref-photodrive" && (
            <motion.div
              key="ref-photodrive"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 z-10 mb-4 bg-[#f0eee9] pb-2">
                <button
                  onClick={() => setView("generate")}
                  className="mb-2 flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
                >
                  <ChevronLeft className="h-[18px] w-[20px]" />
                  <span className="text-base font-bold">참고 이미지 선택</span>
                </button>
                <p className="text-xs text-[#64748b]">
                  최대 {3 - imageRefFiles.length}개 선택 가능 (
                  {refPhotoChecked.size}개 선택됨)
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
                  className="flex flex-col"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {photoMedia.map((media, i) => {
                      const isChecked = refPhotoChecked.has(i);
                      const maxReached =
                        refPhotoChecked.size >= 3 - imageRefFiles.length;
                      return (
                        <button
                          key={i}
                          onClick={() => handleRefPhotoToggle(i)}
                          disabled={!isChecked && maxReached}
                          className={`relative aspect-square overflow-hidden rounded-md transition-all ${
                            isChecked
                              ? "ring-2 ring-[#67add1] ring-offset-2"
                              : maxReached
                                ? "opacity-40"
                                : "hover:opacity-80"
                          }`}
                        >
                          <LazyImage
                            src={media.original_url || media.thumbnail_url}
                            alt={`사진 ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {/* Checkbox overlay */}
                          <div
                            className={`absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              isChecked
                                ? "border-[#67add1] bg-[#67add1]"
                                : "border-white/80 bg-black/30"
                            }`}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="sticky bottom-0 pt-4">
                    <button
                      onClick={handleRefPhotoConfirm}
                      disabled={refPhotoChecked.size === 0}
                      className="flex w-full items-center justify-center rounded-lg bg-[#3E5A81] py-2.5 text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
                    >
                      {refPhotoChecked.size > 0
                        ? `${refPhotoChecked.size}개 추가하기`
                        : "사진을 선택하세요"}
                    </button>
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
                  onClick={() => setView("menu")}
                  className="mb-2 flex items-center gap-2 text-[#475569] transition-colors hover:text-[#1e1e1e]"
                >
                  <ChevronLeft className="h-[18px] w-[20px]" />
                  <span className="text-base font-bold">표지 디자인</span>
                </button>
                <p className="text-xs text-[#64748b]">
                  원하는 분위기나 장면을 묘사하고, 참고 이미지를 추가할 수
                  있습니다.
                </p>
              </div>

              {/* Remaining generations indicator */}
              <div className="mb-4 flex items-center justify-between rounded-lg border-[1.5px] border-[#67ADD1] px-3 py-2">
                <span className="text-xs text-[#67ADD1]">남은 생성 횟수</span>
                <span
                  className={`text-xs font-medium ${remainingGens <= 0 ? "text-red-500" : "text-[#67ADD1]"}`}
                >
                  {remainingGens}/3
                </span>
              </div>

              {remainingGens <= 0 && (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-500">
                    생성 횟수를 모두 사용했습니다.
                  </p>
                </div>
              )}

              {/* Text prompt */}
              <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                텍스트 프롬프트
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 따뜻한 햇살이 비치는 고요한 숲속, 수채화 일러스트 느낌으로 그려줘"
                className="w-full resize-none rounded-lg bg-[#cfcfd1] px-4 pt-3 pb-3 text-sm text-gray-600 placeholder:text-[#6b7280] focus:outline-none"
                rows={3}
              />

              {/* Image prompt (reference images, max 3) */}
              <label className="mt-4 mb-1.5 block text-xs font-medium text-[#64748b]">
                이미지 프롬프트{" "}
                <span className="font-normal text-[#94a3b8]">
                  ({imageRefFiles.length}/3)
                </span>
              </label>

              {/* Selected reference image thumbnails */}
              {imageRefPreviews.length > 0 && (
                <div className="mb-3 space-y-3">
                  <div className="flex gap-2">
                    {imageRefPreviews.map((preview, i) => (
                      <div key={i} className="relative">
                        <img
                          src={preview}
                          alt={`참고 ${i + 1}`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => removeImageRef(i)}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Image strength slider */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-medium text-[#64748b]">
                        참고 이미지 반영 강도
                      </label>
                      <span className="text-xs text-[#64748b]">
                        {imageStrength < 0.35
                          ? "낮음"
                          : imageStrength > 0.65
                            ? "높음"
                            : "보통"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={imageStrength}
                      onChange={(e) => setImageStrength(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#cfcfd1] accent-[#67ADD1]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#94a3b8]">
                      <span>창의적</span>
                      <span>충실하게</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add reference images - 2 column */}
              {imageRefFiles.length < 3 && (
                <div className="flex gap-3">
                  <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-[#cfcfd1]/50 py-4 transition-colors hover:border-[#67add1]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageRef}
                    />
                    <Upload className="mb-1 h-4 w-4 text-[#6b7280]" />
                    <span className="text-[11px] text-[#6b7280]">
                      디바이스
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      setRefPhotoChecked(new Set());
                      preloadBlobUrls();
                      setView("ref-photodrive");
                    }}
                    className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-[#cfcfd1]/50 py-4 transition-colors hover:border-[#67add1]"
                  >
                    <FolderOpen className="mb-1 h-4 w-4 text-[#6b7280]" />
                    <span className="text-[11px] text-[#6b7280]">
                      포토드라이브
                    </span>
                  </button>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || remainingGens <= 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#67ADD1] py-[10px] text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
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
                    {/* ({generatedImages.length}/3) */}
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
                    <p className="text-xs font-medium text-[#64748b]">
                      생성 결과
                    </p>
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
                        선택한 이미지를 기반으로 짧은 애니메이션 영상을
                        생성합니다.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <RefreshCw className="h-4 w-4 animate-spin" /> 저장 중...
          </div>
        )}
      </div>
    );
  },
);

CoverImageEditor.displayName = "CoverImageEditor";

export default CoverImageEditor;
