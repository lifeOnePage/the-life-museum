"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
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
import ScrollToTopButton from "./ScrollToTopButton";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

// 사진이 이 수 이상이면 스크롤 부담이 커져 "맨 위로" 플로팅 버튼을 노출한다.
const SCROLL_TOP_FAB_MIN_PHOTOS = 15;

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
    generateDesc: "AI로 표지 만들기",
    deviceUpload: "디바이스 업로드",
    photodrive: "포토드라이브",
    photodriveDesc: "레코드 사진에서 선택",
    photodriveHeader: "포토드라이브",
    photodriveSelectDesc: "레코드의 사진 중 표지로 사용할 이미지를 선택하세요.",
    noPhotos: "사용 가능한 사진이 없습니다.",
    saving: "저장 중...",
    imageLimit: "JPG, PNG 최대 10MB",
    scrollTop: "맨 위로",
  },
  en: {
    generate: "Generate Image",
    generateDesc: "Create cover with AI",
    deviceUpload: "Device Upload",
    photodrive: "Photo Drive",
    photodriveDesc: "Choose from record photos",
    photodriveHeader: "Photo Drive",
    photodriveSelectDesc:
      "Select an image from your record photos to use as the cover.",
    noPhotos: "No photos available.",
    saving: "Saving...",
    imageLimit: "JPG, PNG up to 10MB",
    scrollTop: "Scroll to top",
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
      onRequestAIConsent,
      isAdmin = false,
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
    // 포토드라이브 사진 목록 시작점 (맨 위로 버튼의 스크롤 타겟)
    const photodriveTopRef = useRef(null);

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

    // 연속 클릭 시 늦게 끝난 이전 선택이 최신 선택을 덮어쓰지 않도록 하는 토큰
    const selectSeqRef = useRef(0);

    const handleSelectPhoto = async (index) => {
      const seq = ++selectSeqRef.current;
      setSelectedPhotoIndex(index);
      const media = photoMedia[index];
      if (!media) return;
      const rawUrl = media.original_url || media.thumbnail_url;
      const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
      setSelectedImageUrl(proxyUrl);
      setSelectedFile(null);

      // 1) 즉시 반영: 프리로드된 blob이 있으면 그것, 없으면 작은 썸네일(400px)로
      //    프리뷰부터 교체 — 원본(2000px) 프록시 다운로드를 기다리지 않는다.
      onImageGenerated(photoBlobUrls[index] || media.thumbnail_url || proxyUrl);

      // Convert to File for upload via /cover/temp (same as device upload)
      try {
        let blob;
        if (photoBlobUrls[index]) {
          blob = await fetch(photoBlobUrls[index]).then((r) => r.blob());
        } else {
          blob = await fetch(proxyUrl).then((r) => r.blob());
        }
        if (seq !== selectSeqRef.current) return; // 더 최신 선택이 있음 — 무시
        const ext = blob.type === "image/png" ? "png" : "jpg";
        const file = new File([blob], `photo-drive.${ext}`, {
          type: blob.type,
        });
        setSelectedFile(file);
        setSelectedImageUrl(null);
        // 2) 원본 화질로 업그레이드 — 방금 받은 blob을 그대로 사용해
        //    프리뷰가 같은 바이트를 다시 다운로드하지 않게 한다.
        onImageGenerated(URL.createObjectURL(blob));
      } catch (e) {
        if (seq !== selectSeqRef.current) return;
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
              {/* 주요 옵션: 이미지 생성하기 / 포토드라이브 선택 (나란히) */}
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
                  <p className="mt-1 text-xs text-[#9b8b7a]">{t.generateDesc}</p>
                </button>

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

              {/* 대체 옵션: 디바이스 업로드 (하단, 보조 스타일) */}
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 transition-all hover:border-[#c4b49a] hover:bg-[rgba(103,173,209,0.1)] hover:shadow-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="h-4 w-4 text-[#9b8b7a]" />
                <span className="text-sm font-medium text-[#9b8b7a]">
                  {t.deviceUpload}
                </span>
                <span className="text-xs text-[#9b8b7a]/70">{t.imageLimit}</span>
              </label>

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </motion.div>
          )}

          {view === "photodrive" && (
            <motion.div
              key="photodrive"
              ref={photodriveTopRef}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header with back arrow + refresh button */}
              <div className="sticky top-0 z-10 mb-4 bg-[#241f18] pb-2">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={() => setView("menu")}
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
                          // 그리드는 썸네일(400px)로 — 목록이 빨라지고, 선택 시
                          // 즉시 프리뷰에 쓰는 썸네일이 브라우저 캐시에 미리 올라감
                          src={media.thumbnail_url || media.original_url}
                          alt={`사진 ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <ScrollToTopButton
                enabled={photoMedia.length >= SCROLL_TOP_FAB_MIN_PHOTOS}
                label={t.scrollTop}
                targetRef={photodriveTopRef}
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
                onRequestAIConsent={onRequestAIConsent}
                isAdmin={isAdmin}
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
