"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ImagePlus,
  RefreshCw,
  ChevronLeft,
  X,
  Upload,
  FolderOpen,
} from "lucide-react";

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
    const [generatedVideos, setGeneratedVideos] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
    const [imageStrength, setImageStrength] = useState(0.5); // 0.0~1.0
    const [photoMedia, setPhotoMedia] = useState([]);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
    const [photoBlobUrls, setPhotoBlobUrls] = useState([]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!selectedFile && !selectedVideoUrl && !frontCover) return;
        setIsSaving(true);
        setError("");

        try {
          const apiUrl =
            "https://the-life-museum-backend-production.up.railway.app";

          // AI-generated video or photo drive: use PUT /cover/url
          if (selectedVideoUrl) {
            console.log("cover/url save:", selectedVideoUrl);
            const response = await fetch(
              `${apiUrl}/api/v1/record/${record_id}/cover/url`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("app_token")}`,
                },
                body: JSON.stringify({ url: selectedVideoUrl }),
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

            const response = await fetch(
              `${apiUrl}/api/v1/record/${record_id}/cover/temp`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("app_token")}`,
                },
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
    console.log("..");

    const handleResetVideos = () => {
      setGeneratedVideos([]);
      setSelectedImageIndex(-1);
    };

    const handleApply = () => {
      if (selectedImageIndex < 0 || !generatedVideos[selectedImageIndex])
        return;
      const videoUrl = generatedVideos[selectedImageIndex];
      setSelectedVideoUrl(videoUrl);
      setSelectedFile(null);
      onImageGenerated(videoUrl);
    };

    const handleGenerate = async () => {
      if (!prompt.trim()) return;
      setIsGenerating(true);
      setSelectedImageIndex(-1);
      setError("");

      try {
        const apiUrl =
          "https://the-life-museum-backend-production.up.railway.app";
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("image_strength", String(imageStrength));
        if (imageRefFile) {
          formData.append("reference_image", imageRefFile);
        }

        const response = await fetch(
          `${apiUrl}/api/v1/record/${record_id}/cover/generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("app_token")}`,
            },
            body: formData,
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || "생성에 실패했습니다");
        }

        // 기존 결과에 누적 (최대 3개) — Replicate 동시 한도로 1개씩 생성
        const newVideos = data.data?.videos ?? [];
        setGeneratedVideos((prev) => [...prev, ...newVideos].slice(0, 3));
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
      }
    };

    const removeImageRef = () => {
      setImageRefFile(null);
      setImageRefPreview(null);
      setImageStrength(0.5);
    };

    const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setSelectedVideoUrl(null);
        const url = URL.createObjectURL(file);
        onImageGenerated(url);
      }
    };

    const fetchPhotoMedia = async (forceRefresh = false) => {
      if (!forceRefresh && photoMedia.length > 0) {
        setSelectedPhotoIndex(-1);
        return;
      }
      setIsLoadingPhotos(true);
      setSelectedPhotoIndex(-1);
      try {
        const apiUrl =
          "https://the-life-museum-backend-production.up.railway.app";
        const response = await fetch(`${apiUrl}/api/v1/record/${record_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("app_token")}`,
          },
        });
        const data = await response.json();
        const images = (data?.data?.mediaList ?? []).filter(
          (m) => m.type === "image",
        );
        setPhotoMedia(images);

        // Preload proxy images as blob URLs in background
        setPhotoBlobUrls(new Array(images.length).fill(null));
        images.forEach(async (media, i) => {
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
      } catch (err) {
        console.error(err);
        setPhotoMedia([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    const handleSelectPhoto = async (index) => {
      setSelectedPhotoIndex(index);
      const media = photoMedia[index];
      if (!media) return;
      const rawUrl = media.original_url || media.thumbnail_url;
      const apiUrl =
        "https://the-life-museum-backend-production.up.railway.app";
      const proxyUrl = `${apiUrl}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;

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
        setSelectedVideoUrl(null);
      } catch (e) {
        console.error("Photo drive file conversion failed:", e);
        setSelectedVideoUrl(rawUrl);
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
                    fetchPhotoMedia();
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

              {isLoadingPhotos ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-md bg-[#d5d5d7]"
                    />
                  ))}
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

                  {/* Image strength slider — only visible when reference image is set */}
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
              ) : (
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
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating || !prompt.trim() || generatedVideos.length >= 3
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#67ADD1] py-[10px] text-sm font-medium text-white transition-opacity hover:bg-[#334a6d] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    생성 중... (최대 5분 소요)
                  </>
                ) : generatedVideos.length > 0 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    추가 생성하기 ({generatedVideos.length}/3)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    생성하기
                  </>
                )}
              </button>
              {generatedVideos.length >= 3 && (
                <p className="mt-2 text-center text-xs text-[#94a3b8]">
                  최대 3개까지 생성할 수 있습니다.
                </p>
              )}

              {/* Results section - only shows after generation */}
              {generatedVideos.length > 0 && (
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
                      onClick={handleResetVideos}
                      className="text-xs text-[#94a3b8] transition-colors hover:text-[#475569]"
                    >
                      초기화
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {generatedVideos.map((videoUrl, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectImage(i)}
                        className={`aspect-square overflow-hidden rounded-md transition-all ${
                          selectedImageIndex === i
                            ? "ring-2 ring-[#3E5A81] ring-offset-2"
                            : "hover:opacity-80"
                        }`}
                      >
                        <video
                          src={videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
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
