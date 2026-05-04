"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Loader2, X } from "lucide-react";

export const BGM_LIST = [
  { id: "bgm1", nameKo: "설레고 부드러운", nameEn: "Exciting & Smooth", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/01.mp3" },
  { id: "bgm2", nameKo: "그루브하고 차분한", nameEn: "Groovy & Calm", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/02.mp3" },
  { id: "bgm3", nameKo: "애틋하고 따뜻한", nameEn: "Tender & Warm", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/03.mp3" },
  { id: "bgm4", nameKo: "활기차고 밝은", nameEn: "Lively & Bright", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/04.mp3" },
  { id: "bgm5", nameKo: "꿈결 같고 느릿한", nameEn: "Dreamy & Slow", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/05.mp3" },
  { id: "bgm6", nameKo: "몽환적이고 아련한", nameEn: "Mystic & Nostalgic", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/06.mp3" },
  { id: "bgm7", nameKo: "맑고 희망찬", nameEn: "Clear & Hopeful", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/07.mp3" },
  { id: "bgm8", nameKo: "도시적이고 쿨한", nameEn: "Urban & Cool", url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/08.mp3" },
];

const T = {
  ko: { select: "선택", selected: "선택됨" },
  en: { select: "Select", selected: "Selected" },
};

export default function BgmEditor({ selectedBgmUrl, onBgmChange, locale }) {
  const t = T[locale] || T.ko;
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePlayPause = async (bgm) => {
    // 같은 트랙 → 토글
    if (playingId === bgm.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // 다른 트랙 → 기존 정지 후 새로 재생
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setLoadingId(bgm.id);
    setPlayingId(null);

    const audio = new Audio(bgm.url);
    audio.volume = 0.5;
    audioRef.current = audio;

    audio.addEventListener("ended", () => setPlayingId(null));

    try {
      await audio.play();
      setPlayingId(bgm.id);
    } catch (e) {
      console.error("BGM 재생 실패:", e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSelect = (bgm) => {
    // 재생 중이면 정지
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    onBgmChange(bgm.url === selectedBgmUrl ? null : bgm.url);
  };

  return (
    <div className="space-y-2">
      {BGM_LIST.map((bgm) => {
        const isPlaying = playingId === bgm.id;
        const isLoading = loadingId === bgm.id;
        const isSelected = selectedBgmUrl === bgm.url;

        return (
          <div
            key={bgm.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
              isSelected
                ? "border-[#c4b49a] bg-[#c4b49a]/8"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {/* Play/Pause preview */}
            <button
              type="button"
              onClick={() => handlePlayPause(bgm)}
              disabled={isLoading}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                isPlaying
                  ? "bg-[#c4b49a] text-[#1a1510]"
                  : "bg-white/8 text-[#9b8b7a] hover:bg-white/15 hover:text-[#e8d5b7]"
              } disabled:opacity-40`}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="ml-0.5 h-3.5 w-3.5" />
              )}
            </button>

            {/* Name */}
            <span className={`flex-1 text-sm ${isSelected ? "text-[#c4b49a]" : "text-[#e8d5b7]"}`}>
              {locale === "en" ? bgm.nameEn : bgm.nameKo}
            </span>

            {/* Select toggle */}
            <button
              type="button"
              onClick={() => handleSelect(bgm)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-[#c4b49a] text-[#1a1510]"
                  : "bg-white/8 text-[#9b8b7a] hover:bg-white/15 hover:text-[#e8d5b7]"
              }`}
            >
              {isSelected ? t.selected : t.select}
            </button>
          </div>
        );
      })}
    </div>
  );
}
