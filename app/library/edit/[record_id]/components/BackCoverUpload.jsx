"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, RefreshCw, Upload, FolderOpen, X } from "lucide-react";
const API_URL = "https://the-life-museum-backend-production.up.railway.app";

function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-md bg-[#3a3028]" />
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
    deviceUpload: "디바이스 업로드",
    photodrive: "포토드라이브",
    selectPhoto: "사진을 선택하세요",
    noPhotos: "사용 가능한 사진이 없습니다.",
  },
  en: {
    deviceUpload: "Device Upload",
    photodrive: "Photo Drive",
    selectPhoto: "Select a photo",
    noPhotos: "No photos available.",
  },
};

const BackCoverUpload = forwardRef(function BackCoverUpload(
  {
    record_id,
    backCoverImageUrl,
    onUrlChange,
    photoMedia,
    photoBlobUrls,
    onRefreshPhotos,
    isRefreshing,
    preloadBlobs,
    locale,
  },
  ref,
) {
  const t = T[locale] || T.ko;
  const [showPhotodrive, setShowPhotodrive] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
  const [error, setError] = useState("");

  // 저장용: 포토드라이브 → proxy URL, 디바이스 → File 객체
  const [saveUrl, setSaveUrl] = useState(null);
  const [localFile, setLocalFile] = useState(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (localFile) {
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("prefix", "back-cover");
        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.ok) throw new Error("뒷면 이미지 업로드 실패");
        return data.publicUrl;
      }
      if (saveUrl) return saveUrl;
      return null;
    },
  }));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFile(file);
    setSaveUrl(null);
    setSelectedPhotoIndex(-1);
    setShowPhotodrive(false);
    onUrlChange(URL.createObjectURL(file));
  };

  const handleSelectPhoto = (index) => {
    setSelectedPhotoIndex(index);
    const media = photoMedia[index];
    if (!media) return;
    const rawUrl = media.original_url || media.thumbnail_url;
    const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
    setSaveUrl(proxyUrl);
    setLocalFile(null);
    // 미리보기: blob URL 우선 (canvas CORS 호환), 없으면 proxy URL
    const blobUrl = photoBlobUrls[index];
    onUrlChange(blobUrl || proxyUrl);
    setShowPhotodrive(false);
  };

  const handleClear = () => {
    setSelectedPhotoIndex(-1);
    setSaveUrl(null);
    setLocalFile(null);
    setShowPhotodrive(false);
    onUrlChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {backCoverImageUrl && (
        <div className="relative overflow-hidden rounded-lg">
          <img src={backCoverImageUrl} alt="뒷면 커버" className="h-36 w-full object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upload / Photodrive buttons — always visible */}
      <div className="flex gap-3">
        <label className="hover:border-[#c4b49a] flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/15 py-5 transition-all hover:bg-white/5">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <Upload className="h-4 w-4 text-[#9b8b7a]" />
          <span className="text-xs font-medium text-[#e8d5b7]">{t.deviceUpload}</span>
        </label>

        <button
          onClick={() => {
            const next = !showPhotodrive;
            setShowPhotodrive(next);
            if (next) preloadBlobs();
          }}
          className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border py-5 transition-all ${
            showPhotodrive
              ? "border-[#c4b49a] bg-[#c4b49a]/10"
              : "border-white/15 hover:border-[#c4b49a] hover:bg-white/5"
          }`}
        >
          <FolderOpen className="h-4 w-4 text-[#9b8b7a]" />
          <span className="text-xs font-medium text-[#e8d5b7]">{t.photodrive}</span>
        </button>
      </div>

      {/* Photodrive grid - inline expand */}
      <AnimatePresence initial={false}>
        {showPhotodrive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-[#9b8b7a]">{t.selectPhoto}</p>
                <button
                  onClick={onRefreshPhotos}
                  disabled={isRefreshing}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#9b8b7a] hover:bg-white/10 hover:text-[#e8d5b7] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              {photoMedia.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <ImagePlus className="mb-2 h-7 w-7 text-[#9b8b7a]/40" />
                  <p className="text-xs text-[#9b8b7a]">{t.noPhotos}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photoMedia.map((media, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPhoto(i)}
                      className={`aspect-square overflow-hidden rounded-md transition-all ${
                        selectedPhotoIndex === i
                          ? "ring-2 ring-[#c4b49a] ring-offset-1 ring-offset-[#241f18]"
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default BackCoverUpload;
