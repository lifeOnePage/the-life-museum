"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ImagePlus,
  RefreshCw,
  ChevronLeft,
  Upload,
  FolderOpen,
} from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";
import CoverImageGenerator from "./CoverImageGenerator";

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
    generate: "이미지 생성하기",
    upload: "직접 업로드",
    uploadHeader: "직접 업로드",
    uploadDesc:
      "디바이스에서 직접 업로드하거나, 포토드라이브에서 선택할 수 있습니다.",
    deviceUpload: "디바이스 업로드",
    photodrive: "포토드라이브",
    photodriveDesc: "레코드 사진에서 선택",
    photodriveHeader: "포토드라이브",
    photodriveSelectDesc: "레코드의 사진 중 표지로 사용할 이미지를 선택하세요.",
    noPhotos: "사용 가능한 사진이 없습니다.",
    saving: "저장 중...",
    imageLimit: "JPG, PNG 최대 10MB",
  },
  en: {
    generate: "Generate Image",
    upload: "Upload",
    uploadHeader: "Upload",
    uploadDesc: "Upload from your device or choose from Photo Drive.",
    deviceUpload: "Device Upload",
    photodrive: "Photo Drive",
    photodriveDesc: "Choose from record photos",
    photodriveHeader: "Photo Drive",
    photodriveSelectDesc:
      "Select an image from your record photos to use as the cover.",
    noPhotos: "No photos available.",
    saving: "Saving...",
    imageLimit: "JPG, PNG up to 10MB",
  },
};

const CoverImageEditor = forwardRef(
  (
    {
      onImageGenerated,
      frontCover,
      initialFrontCover,
      record_id,
      photoMedia,
      photoBlobUrls,
      onRefreshPhotos,
      isRefreshing,
      isLoading,
      preloadBlobs,
      locale,
    },
    ref,
  ) => {
    const t = T[locale] || T.ko;
    const [view, setView] = useState("menu");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!selectedFile && !selectedImageUrl) return;
        setIsSaving(true);
        setError("");

        try {
          if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await authedFetch(
              `${API_URL}/api/v1/record/${record_id}/cover/temp`,
              { method: "POST", body: formData },
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "저장에 실패했습니다");
            }
            return data;
          }

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
              throw new Error(
                data.error || data.detail || "저장에 실패했습니다",
              );
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

    const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setSelectedImageUrl(null);
        const url = URL.createObjectURL(file);
        onImageGenerated(url);
      }
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
        const file = new File([blob], `photo-drive.${ext}`, {
          type: blob.type,
        });
        setSelectedFile(file);
        setSelectedImageUrl(null);
      } catch (e) {
        console.error("Photo drive file conversion failed:", e);
        setSelectedImageUrl(rawUrl);
        setSelectedFile(null);
      }
    };

    const handleGeneratorApply = (imageUrl) => {
      setSelectedImageUrl(imageUrl);
      setSelectedFile(null);
      onImageGenerated(imageUrl);
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
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-white/15 px-4 py-8 transition-all hover:border-[#c4b49a] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Sparkles className="h-4 w-4 text-[#9b8b7a]" />
                  </div>
                  <span className="text-sm font-medium text-[#e8d5b7]">
                    {t.generate}
                  </span>
                  <div className="h-5" />
                </button>

                {/* Upload card */}
                <button
                  onClick={() => setView("upload")}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-white/15 px-4 py-8 transition-all hover:border-[#c4b49a] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <ImagePlus className="h-[18px] w-[18px] text-[#9b8b7a]" />
                  </div>
                  <span className="text-sm font-medium text-[#e8d5b7]">
                    {t.upload}
                  </span>
                  <p className="mt-1 text-xs text-[#9b8b7a]">{t.imageLimit}</p>
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
                  className="mb-2 flex items-center gap-2 text-[#9b8b7a] transition-colors hover:text-[#e8d5b7]"
                >
                  <ChevronLeft className="h-[18px] w-[20px]" />
                  <span className="text-base font-bold">{t.uploadHeader}</span>
                </button>
                <p className="text-xs text-[#9b8b7a]">{t.uploadDesc}</p>
              </div>

              {/* Two option cards */}
              <div className="flex gap-4">
                {/* Device upload card */}
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-8 transition-all hover:border-[#c4b49a] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Upload className="h-[18px] w-[18px] text-[#9b8b7a]" />
                  </div>
                  <span className="text-sm font-medium text-[#e8d5b7]">
                    {t.deviceUpload}
                  </span>
                  <p className="mt-1 text-xs text-[#9b8b7a]">{t.imageLimit}</p>
                </label>

                {/* Photo drive card */}
                <button
                  onClick={() => {
                    setView("photodrive");
                    setSelectedPhotoIndex(-1);
                    preloadBlobs();
                  }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-white/15 px-4 py-8 transition-all hover:border-[#c4b49a] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <FolderOpen className="h-[18px] w-[18px] text-[#9b8b7a]" />
                  </div>
                  <span className="text-sm font-medium text-[#e8d5b7]">
                    {t.photodrive}
                  </span>
                  <p className="mt-1 text-xs text-[#9b8b7a]">
                    {t.photodriveDesc}
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
              {/* Header with back arrow + refresh button */}
              <div className="sticky top-0 z-10 mb-4 bg-[#241f18] pb-2">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={() => setView("upload")}
                    className="flex items-center gap-2 text-[#9b8b7a] transition-colors hover:text-[#e8d5b7]"
                  >
                    <ChevronLeft className="h-[18px] w-[20px]" />
                    <span className="text-base font-bold">
                      {t.photodriveHeader}
                    </span>
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
                  {t.photodriveSelectDesc}
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
                  <p className="text-sm text-[#9b8b7a]">{t.noPhotos}</p>
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
              <CoverImageGenerator
                record_id={record_id}
                onApply={handleGeneratorApply}
                onBack={() => setView("menu")}
                initialFrontCover={initialFrontCover}
                photoMedia={photoMedia}
                photoBlobUrls={photoBlobUrls}
                onRefreshPhotos={onRefreshPhotos}
                isRefreshing={isRefreshing}
                isLoading={isLoading}
                preloadBlobs={preloadBlobs}
                locale={locale}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-[#9b8b7a]">
            <RefreshCw className="h-4 w-4 animate-spin" /> {t.saving}
          </div>
        )}
      </div>
    );
  },
);

CoverImageEditor.displayName = "CoverImageEditor";

export default CoverImageEditor;
