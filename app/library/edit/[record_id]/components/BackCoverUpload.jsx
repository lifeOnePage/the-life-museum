"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, RefreshCw, Upload, FolderOpen, X } from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";
import ScrollToTopButton from "./ScrollToTopButton";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

// 사진이 이 수 이상이면 스크롤 부담이 커져 "맨 위로" 플로팅 버튼을 노출한다.
const SCROLL_TOP_FAB_MIN_PHOTOS = 15;

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
    scrollTop: "맨 위로",
  },
  en: {
    deviceUpload: "Device Upload",
    photodrive: "Photo Drive",
    selectPhoto: "Select a photo",
    noPhotos: "No photos available.",
    scrollTop: "Scroll to top",
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
    isLoading,
    preloadBlobs,
    locale,
  },
  ref,
) {
  const t = T[locale] || T.ko;
  const [showPhotodrive, setShowPhotodrive] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
  const [error, setError] = useState("");
  // 포토드라이브 사진 목록 시작점 (맨 위로 버튼 스크롤 타겟)
  const photodriveTopRef = useRef(null);

  // 저장용: 포토드라이브 → proxy URL, 디바이스 → File 객체
  const [saveUrl, setSaveUrl] = useState(null);
  const [localFile, setLocalFile] = useState(null);

  useImperativeHandle(ref, () => ({
    // 저장 성공 후 page.jsx에서 호출 — localFile 초기화, saveUrl을 R2 URL로 교체
    markSaved: (url) => {
      setLocalFile(null);
      setSaveUrl(url);
    },
    save: async () => {
      let finalUrl = null;

      if (localFile) {
        // 1단계: R2 업로드
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("prefix", "back-cover");
        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.ok || !data.publicUrl) throw new Error("뒷면 이미지 업로드 실패");
        finalUrl = data.publicUrl;
      } else if (saveUrl) {
        finalUrl = saveUrl;
      }

      if (!finalUrl) return null;

      // 2단계: 백엔드 DB에 backCoverImageUrl 저장 (프론트 커버와 동일하게 authedFetch 사용)
      const patchRes = await authedFetch(
        `${API_URL}/api/v1/record/${record_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backCoverImageUrl: finalUrl }),
        },
      );
      if (!patchRes.ok) {
        const errData = await patchRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || "뒷면 이미지 저장 실패");
      }

      return finalUrl;
    },
  }), [localFile, saveUrl, record_id]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFile(file);
    setSaveUrl(null);
    setSelectedPhotoIndex(-1);
    setShowPhotodrive(false);
    onUrlChange(URL.createObjectURL(file));
  };

  const handleSelectPhoto = async (index) => {
    setSelectedPhotoIndex(index);
    const media = photoMedia[index];
    if (!media) return;
    setSaveUrl(null);
    setError("");

    // 포토드라이브(iCloud/Google 등) 원본 URL은 서명·세션 기반이라 시간이
    // 지나면 만료된다. proxy URL을 그대로 저장하면 나중에(다른 세션·공유
    // 페이지에서) 이미지가 깨지므로, 선택 즉시 blob으로 받아 File로 만들어
    // 디바이스 업로드와 동일하게 R2에 영구 업로드한다.
    try {
      const existingBlob = photoBlobUrls[index];
      const blob = existingBlob
        ? await (await fetch(existingBlob)).blob()
        : await (
            await fetch(
              `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(
                media.original_url || media.thumbnail_url,
              )}`,
            )
          ).blob();
      const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const file = new File([blob], `photodrive-${index}.${ext}`, {
        type: blob.type || "image/jpeg",
      });
      setLocalFile(file);
      onUrlChange(URL.createObjectURL(blob));
    } catch {
      setLocalFile(null);
      setError("사진을 불러오지 못했습니다.");
    }
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
            // preloadBlobs() 제거: 앨범 전체 원본을 프록시로 일괄 다운로드하면
            // 그 대기열에 선택한 사진의 로드까지 갇혀 프리뷰 반영이 수십 초
            // 지연된다. 선택 시 해당 사진만 온디맨드로 가져온다(아래 handleSelectPhoto).
            setShowPhotodrive(!showPhotodrive);
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
            <div className="pt-1" ref={photodriveTopRef}>
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
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-md bg-[#3a3028]"
                    />
                  ))}
                </div>
              ) : photoMedia.length === 0 ? (
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

            <ScrollToTopButton
              enabled={photoMedia.length >= SCROLL_TOP_FAB_MIN_PHOTOS}
              label={t.scrollTop}
              targetRef={photodriveTopRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default BackCoverUpload;
