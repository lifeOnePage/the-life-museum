"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, RefreshCw, Upload, ChevronLeft, Trash2 } from "lucide-react";
import { authedFetch } from "@/app/utils/authedFetch";
import { getProxiedUrl } from "@/app/lib/proxy";
import { useChunkedGrid } from "@/app/lib/useChunkedGrid";
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
    deviceUpload: "직접 업로드",
    imageLimit: "JPG, PNG 최대 10MB",
    photodrive: "드라이브 업로드",
    photodriveDesc: "레코드 드라이브에서 선택",
    photodriveHeader: "드라이브 업로드",
    photodriveSelectDesc: "레코드의 사진 중 뒷면 이미지로 사용할 사진을 선택하세요.",
    selectPhoto: "사진을 선택하세요",
    noPhotos: "사용 가능한 사진이 없습니다.",
    scrollTop: "맨 위로",
    reset: "초기화",
  },
  en: {
    deviceUpload: "Device Upload",
    imageLimit: "JPG, PNG up to 10MB",
    photodrive: "Photo Drive",
    photodriveDesc: "Choose from record photos",
    photodriveHeader: "Photo Drive",
    photodriveSelectDesc: "Select a photo from your record photos to use as the back image.",
    selectPhoto: "Select a photo",
    noPhotos: "No photos available.",
    scrollTop: "Scroll to top",
    reset: "Reset",
  },
};

const BackCoverUpload = forwardRef(function BackCoverUpload(
  {
    record_id,
    backCoverImageUrl,
    onUrlChange,
    frontCover,
    photoMedia,
    onRefreshPhotos,
    isRefreshing,
    isLoading,
    locale,
  },
  ref,
) {
  const t = T[locale] || T.ko;
  const [view, setView] = useState("menu"); // "menu" | "photodrive"
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
  const [error, setError] = useState("");
  // 포토드라이브 그리드 청크 마운트 — 수천 장 앨범에서 DOM 전량 마운트 방지
  const {
    visibleCount: gridCount,
    sentinelRef: gridSentinelRef,
    hasMore: gridHasMore,
  } = useChunkedGrid(photoMedia?.length ?? 0);
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
    if (file) {
      setLocalFile(file);
      setSaveUrl(null);
      setSelectedPhotoIndex(-1);
      onUrlChange(URL.createObjectURL(file));
    }
    // 같은 파일을 다시 선택해도 change 이벤트가 재발생하도록 값 초기화
    e.target.value = "";
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
      const blob = await (
        await fetch(getProxiedUrl(media.original_url || media.thumbnail_url))
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
    onUrlChange(null);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Preview + 항상 떠 있는 업로드/초기화 아이콘 */}
            {/* 뒷면 이미지를 초기화(비움)하면 저장 시 백엔드가 앞면 이미지로 대체하므로,
                여기서도 같은 결과를 미리 보여준다. */}
            <div className="relative h-36 w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {(backCoverImageUrl || frontCover) && (
                <img
                  src={backCoverImageUrl || frontCover}
                  alt="뒷면 커버"
                  className="h-full w-full object-cover"
                />
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
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClear}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 업로드 아이콘을 누르면 나타나는 직접 업로드 / 드라이브 업로드 선택 */}
            <AnimatePresence initial={false}>
              {uploadMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 pt-1">
                    <label className="hover:border-[#c4b49a] flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/15 py-5 transition-all hover:bg-white/5">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      <Upload className="h-4 w-4 text-[#9b8b7a]" />
                      <span className="text-xs font-medium text-[#e8d5b7]">{t.deviceUpload}</span>
                      <p className="text-[10px] text-[#9b8b7a]">{t.imageLimit}</p>
                    </label>

                    <button
                      onClick={() => {
                        // 사진은 선택 시 해당 1장만 온디맨드로 가져온다 (전량 프리로드 금지)
                        setView("photodrive");
                        setSelectedPhotoIndex(-1);
                      }}
                      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-white/15 py-5 transition-all hover:border-[#c4b49a] hover:bg-white/5"
                    >
                      <img src="/cloud_download.svg" alt="" className="h-4 w-4" />
                      <span className="text-xs font-medium text-[#e8d5b7]">{t.photodrive}</span>
                      <p className="text-[10px] text-[#9b8b7a]">{t.photodriveDesc}</p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-xs text-red-500">{error}</p>}
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
                  <span className="text-base font-bold">{t.photodriveHeader}</span>
                </button>
                <button
                  onClick={onRefreshPhotos}
                  disabled={isRefreshing}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/10 hover:text-[#e8d5b7] disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-[#9b8b7a]">{t.photodriveSelectDesc}</p>
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
              <div className="grid grid-cols-3 gap-3">
                {photoMedia.slice(0, gridCount).map((media, i) => (
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
            )}

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <ScrollToTopButton
              enabled={photoMedia.length >= SCROLL_TOP_FAB_MIN_PHOTOS}
              label={t.scrollTop}
              targetRef={photodriveTopRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default BackCoverUpload;
