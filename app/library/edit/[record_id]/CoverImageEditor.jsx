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
} from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

const CoverImageEditor = forwardRef(
  (
    {
      onImageGenerated,
      onTitleChange,
      onArtistChange,
      frontCover,
      initialFrontCover,
      initialAlbumTitle,
      initialArtistName,
      record_id,
    },
    ref,
  ) => {
    const [view, setView] = useState("menu");
    const [prompt, setPrompt] = useState("");
    const [imageRefPreview, setImageRefPreview] = useState(null);
    const [imageRefFile, setImageRefFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [generatedImages, setGeneratedImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
    const [imageStrength, setImageStrength] = useState(0.5);
    const [photoMedia, setPhotoMedia] = useState([]);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);

    // Generation count tracking
    const [genCount, setGenCount] = useState(0);
    const remainingGens = 3 - genCount;

    // Reference image from photodrive
    const [refPhotoMode, setRefPhotoMode] = useState(false);
    const [refPhotos, setRefPhotos] = useState([]);
    const [isLoadingRefPhotos, setIsLoadingRefPhotos] = useState(false);

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
          // AI-generated image: use PUT /cover/url
          if (selectedImageUrl) {
            const response = await authedFetch(
              `${API_URL}/api/v1/record/${record_id}/cover/url`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: selectedImageUrl }),
              },
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "저장에 실패했습니다");
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
        if (imageRefFile) {
          formData.append("reference_image", imageRefFile);
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
      if (file) {
        setImageRefFile(file);
        setImageRefPreview(URL.createObjectURL(file));
        setRefPhotoMode(false);
      }
    };

    const removeImageRef = () => {
      setImageRefFile(null);
      setImageRefPreview(null);
      setImageStrength(0.5);
      setRefPhotoMode(false);
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

    const fetchPhotoMedia = async () => {
      setIsLoadingPhotos(true);
      setSelectedPhotoIndex(-1);
      try {
        const response = await authedFetch(
          `${API_URL}/api/v1/record/${record_id}`,
        );
        const data = await response.json();
        const images = (data?.data?.mediaList ?? []).filter(
          (m) => m.type === "image",
        );
        setPhotoMedia(images);
      } catch (err) {
        console.error(err);
        setPhotoMedia([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    const handleSelectPhoto = (index) => {
      setSelectedPhotoIndex(index);
    };

    const handleApplyPhoto = () => {
      if (selectedPhotoIndex < 0 || !photoMedia[selectedPhotoIndex]) return;
      const media = photoMedia[selectedPhotoIndex];
      const rawUrl = media.original_url || media.thumbnail_url;
      const url = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
      setSelectedImageUrl(url);
      setSelectedFile(null);
      onImageGenerated(url);
    };

    // Fetch photos for reference image selection in generate view
    const fetchRefPhotos = async () => {
      setIsLoadingRefPhotos(true);
      try {
        const response = await authedFetch(
          `${API_URL}/api/v1/record/${record_id}`,
        );
        const data = await response.json();
        const images = (data?.data?.mediaList ?? []).filter(
          (m) => m.type === "image",
        );

        // Convert each image to blob/File via proxy
        const results = await Promise.all(
          images.map(async (media) => {
            const rawUrl = media.original_url || media.thumbnail_url;
            const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
            try {
              const resp = await fetch(proxyUrl);
              const blob = await resp.blob();
              const file = new File([blob], "ref.jpg", { type: blob.type });
              return { blobUrl: URL.createObjectURL(blob), file, rawUrl };
            } catch {
              return null;
            }
          }),
        );

        setRefPhotos(results.filter(Boolean));
      } catch (err) {
        console.error(err);
        setRefPhotos([]);
      } finally {
        setIsLoadingRefPhotos(false);
      }
    };

    const handleSelectRefPhoto = (photo) => {
      setImageRefFile(photo.file);
      setImageRefPreview(photo.blobUrl);
      setRefPhotoMode(false);
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
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-[#475569]">
                  표지 디자인
                </h3>
                <p className="mt-1 text-xs text-[#64748b]">
                  앨범 표지를 AI로 생성하거나, 직접 업로드 할 수 있습니다.
                </p>
              </div>

              {/* Two option cards */}
              <div className="flex gap-4">
                {/* AI Generate card */}
                <button
                  onClick={() => setView("generate")}
                  className="hover:border-[#e8d5b7 ] flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
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
                  className="hover:border-[#e8d5b7 ] flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
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
                <label className="hover:border-[#e8d5b7 ] flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-[#cbd5e1] bg-transparent px-4 py-8 transition-all hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm">
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
                    fetchPhotoMedia();
                  }}
                  className="hover:border-[#e8d5b7 ] flex flex-1 flex-col items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-8 transition-all hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
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
              {/* Header with back arrow */}
              <div className="mb-4">
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

              {isLoadingPhotos ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-5 w-5 animate-spin text-[#94a3b8]" />
                </div>
              ) : photoMedia.length === 0 ? (
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
                  <div className="max-h-[60vh] overflow-y-auto">
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
                          <img
                            src={media.original_url || media.thumbnail_url}
                            alt={`사진 ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply button - fixed at bottom */}
                  <div className="sticky bottom-0 pt-4">
                    <button
                      onClick={handleApplyPhoto}
                      disabled={selectedPhotoIndex < 0}
                      className="flex w-full items-center justify-center rounded-lg bg-[#3E5A81] py-2.5 text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
                    >
                      적용하기
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
              <div className="mb-4 flex items-center justify-between rounded-lg bg-[#f1f5f9] px-3 py-2">
                <span className="text-xs text-[#64748b]">남은 생성 횟수</span>
                <span
                  className={`text-xs font-medium ${remainingGens <= 0 ? "text-red-500" : "text-[#475569]"}`}
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

              {/* Image prompt (reference image) */}
              <label className="mt-4 mb-1.5 block text-xs font-medium text-[#64748b]">
                이미지 프롬프트
              </label>
              {imageRefPreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={imageRefPreview}
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
                      className="accent-[#e8d5b7 ] h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#cfcfd1]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#94a3b8]">
                      <span>창의적</span>
                      <span>충실하게</span>
                    </div>
                  </div>
                </div>
              ) : refPhotoMode ? (
                <div>
                  {isLoadingRefPhotos ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin text-[#94a3b8]" />
                      <span className="ml-2 text-xs text-[#94a3b8]">
                        사진 불러오는 중...
                      </span>
                    </div>
                  ) : refPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ImagePlus className="mb-2 h-6 w-6 text-[#cbd5e1]" />
                      <p className="text-xs text-[#94a3b8]">
                        사용 가능한 사진이 없습니다.
                      </p>
                      <button
                        onClick={() => setRefPhotoMode(false)}
                        className="text-[#e8d5b7 ] mt-2 text-xs hover:underline"
                      >
                        돌아가기
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-[#94a3b8]">
                          참고할 사진을 선택하세요
                        </p>
                        <button
                          onClick={() => setRefPhotoMode(false)}
                          className="text-xs text-[#94a3b8] hover:text-[#475569]"
                        >
                          취소
                        </button>
                      </div>
                      <div className="grid max-h-[30vh] grid-cols-3 gap-2 overflow-y-auto">
                        {refPhotos.map((photo, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectRefPhoto(photo)}
                            className="aspect-square overflow-hidden rounded-md transition-all hover:opacity-80"
                          >
                            <img
                              src={photo.blobUrl}
                              alt={`사진 ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-[#cfcfd1]/50 transition-colors hover:border-gray-400">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageRef}
                    />
                    <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                      <ImagePlus className="h-4 w-4" />
                      참고 이미지 추가 (선택)
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      setRefPhotoMode(true);
                      fetchRefPhotos();
                    }}
                    className="text-[#e8d5b7 ] flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-colors hover:bg-[rgba(103,173,209,0.05)]"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    포토드라이브에서 선택
                  </button>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || remainingGens <= 0}
                className="bg-[#e8d5b7 ] mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-[10px] text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : generatedImages.length > 0 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    추가 생성하기 ({generatedImages.length}/3)
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
