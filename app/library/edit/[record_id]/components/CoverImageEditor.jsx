"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ImagePlus, RefreshCw, ChevronLeft } from "lucide-react";

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
    // "menu" = initial two-card view, "generate" = AI generation form
    const [view, setView] = useState("menu");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [generatedImages, setGeneratedImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!selectedFile && !frontCover) return;
        setIsSaving(true);
        setError("");

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;

          const formData = new FormData();
          if (selectedFile) {
            formData.append("file", selectedFile);
          }

          const response = await fetch(
            `${apiUrl}/api/v1/record/${record_id}/cover/temp`,
            {
              method: "POST",
              headers: {
                "X-Dev-Key": "tlm2026",
              },
              body: formData,
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "저장에 실패했습니다");
          }

          return data;
        } catch (err) {
          setError(err.message);
          console.error(err);
          throw err;
        } finally {
          setIsSaving(false);
        }
      },
    }));

    const urlToFile = async (url, filename) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      return file;
    };

    const handleSelectImage = (index) => {
      setSelectedImageIndex(index);
    };

    const handleApply = async () => {
      if (selectedImageIndex < 0 || !generatedImages[selectedImageIndex]) return;
      const imgUrl = generatedImages[selectedImageIndex];
      try {
        const filename = imgUrl.split("/").pop();
        const file = await urlToFile(imgUrl, filename);
        setSelectedFile(file);
        onImageGenerated(imgUrl);
      } catch (err) {
        setError("이미지 로드에 실패했습니다");
      }
    };

    const handleGenerate = () => {
      if (!prompt.trim()) return;
      setIsGenerating(true);
      setSelectedImageIndex(-1);
      setTimeout(() => {
        const placeholders = [
          "/images/gif/1.gif",
          "/images/gif/2.gif",
          "/images/gif/3.gif",
        ];
        setGeneratedImages(placeholders);
        setIsGenerating(false);
      }, 2000);
    };

    const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        onImageGenerated(url);
      }
    };

    return (
      <div className="space-y-7">
        <AnimatePresence mode="wait">
          {view === "menu" ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-600">
                  표지 디자인
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  AI로 만들거나, 업로드 할수 있어요~(안내 문구)
                </p>
              </div>

              {/* Two option cards */}
              <div className="flex gap-4">
                {/* AI Generate card */}
                <button
                  onClick={() => setView("generate")}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-300 bg-[rgba(231,6,160,0.1)] px-4 py-8 transition-all hover:border-[#833f6e] hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Sparkles className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    이미지 생성하기
                  </span>
                  <div className="h-5" />
                </button>

                {/* Upload card */}
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-8 transition-all hover:border-slate-400 hover:shadow-sm">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <ImagePlus className="h-[18px] w-[18px] text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    직접 업로드
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG 최대 10MB
                  </p>
                </label>
              </div>

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </motion.div>
          ) : (
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
                  className="mb-2 flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
                >
                  <ChevronLeft className="h-[18px] w-[9px]" />
                  <span className="text-base font-bold">표지 디자인</span>
                </button>
                <p className="text-xs text-slate-500">
                  AI로 만들거나, 업로드 할수 있어요~(안내 문구)
                </p>
              </div>

              {/* Prompt textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 따뜻한 햇살이 비치는 고요한 숲속, 수채화 일러스트 느낌으로 그려줘"
                className="w-full resize-none rounded-lg bg-[#f1f1f3] px-4 pb-14 pt-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                rows={3}
              />

              {/* Generate button - gradient */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ed02a4] to-[#833f6e] py-[10px] text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    이미지 생성하기
                  </>
                )}
              </button>

              {/* Generated images - 3 thumbnails */}
              {generatedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex gap-[15px]"
                >
                  {generatedImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectImage(i)}
                      className={`h-[100px] flex-1 overflow-hidden rounded-md transition-all ${
                        selectedImageIndex === i
                          ? "ring-2 ring-[#833f6e] ring-offset-2"
                          : "hover:opacity-80"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`생성 ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Placeholder slots when no images generated yet */}
              {generatedImages.length === 0 && !isGenerating && (
                <div className="mt-4 flex gap-[15px]">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[100px] flex-1 rounded-md bg-[#f1f1f3]"
                    />
                  ))}
                </div>
              )}

              {/* Apply button - gradient */}
              <button
                onClick={handleApply}
                disabled={selectedImageIndex < 0}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#ed02a4] to-[#833f6e] py-[10px] text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                적용하기
              </button>

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" /> 저장 중...
          </div>
        )}
      </div>
    );
  },
);

CoverImageEditor.displayName = "CoverImageEditor";

export default CoverImageEditor;
