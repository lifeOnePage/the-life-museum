"use client";
import { useState, useRef, useEffect } from "react";

// BGM 리스트 ... 근데 이거 개발로 할당한 거라 이후에 유지보수 할 때에는 경로지정해줘야 할 듯
const BGM_LIST = [
  {
    id: "bgm1",
    name: "설레고 부드러운 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/01.mp3",
  },
  {
    id: "bgm2",
    name: "그루브하고 차분한 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/02.mp3",
  },
  {
    id: "bgm3",
    name: "애틋하고 따뜻한 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/03.mp3",
  },
  {
    id: "bgm4",
    name: "활기차고 밝은 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/04.mp3",
  },
  {
    id: "bgm5",
    name: "꿈결 같고 느릿한 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/05.mp3",
  },
  {
    id: "bgm6",
    name: "몽환적이고 아련한 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/06.mp3",
  },
  {
    id: "bgm7",
    name: "맑고 희망찬 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/07.mp3",
  },
  {
    id: "bgm8",
    name: "도시적이고 쿨한 음악",
    url: "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/records/bgm/08.mp3",
  },
];

export default function BgmSelector({ selectedBgm, onSelect }) {
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const audioRefs = useRef({});

  // 오디오 엘리먼트 생성 및 관리
  useEffect(() => {
    // 컴포넌트 언마운트 시 모든 오디오 정리
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
          audio.removeEventListener("ended", () => {});
          audio.removeEventListener("error", () => {});
        }
      });
      audioRefs.current = {};
    };
  }, []);

  const handlePlayPause = async (bgmId) => {
    // 현재 재생 중인 오디오 정지
    if (playingId && playingId !== bgmId) {
      const prevAudio = audioRefs.current[playingId];
      if (prevAudio) {
        prevAudio.pause();
        prevAudio.currentTime = 0;
      }
      setPlayingId(null);
    }

    // 이미 재생 중이면 일시정지
    if (playingId === bgmId) {
      const audio = audioRefs.current[bgmId];
      if (audio) {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }

    // 오디오 객체가 없거나 오류가 있었으면 새로 생성
    const bgm = BGM_LIST.find((b) => b.id === bgmId);
    if (!bgm) return;

    let audio = audioRefs.current[bgmId];

    // 오디오가 없거나 오류 상태면 새로 생성
    if (!audio || audio.error) {
      setLoadingId(bgmId);
      audio = new Audio(bgm.url);
      audio.preload = "auto";
      audio.volume = 0.5;

      let errorHandled = false;

      const errorHandler = (e) => {
        if (errorHandled) return;
        errorHandled = true;
        setLoadingId(null);
        setPlayingId(null);
      };

      // 로드 완료 핸들링
      const canPlayHandler = () => {
        setLoadingId(null);
      };

      // 재생 종료 핸들링
      const endedHandler = () => {
        setPlayingId(null);
      };

      audio.addEventListener("error", errorHandler);
      audio.addEventListener("canplaythrough", canPlayHandler);
      audio.addEventListener("ended", endedHandler);

      audioRefs.current[bgmId] = audio;

      try {
        audio.load();
      } catch (err) {
        console.error(`BGM ${bgmId} 로드 실패:`, err);
        setLoadingId(null);
      }
    }

    // 재생 시도 전에 오디오 에러 확인
    if (audio.error && audio.error.code !== 0) {
      const errorCode = audio.error.code;
      const errorMessage = audio.error.message || "알 수 없는 오류";
      const bgm = BGM_LIST.find((b) => b.id === bgmId);
      console.error(`BGM ${bgmId} 로드 실패:`, {
        code: errorCode,
        message: errorMessage,
        url: bgm?.url,
      });
      alert(
        `오디오 파일을 로드할 수 없습니다: ${bgm?.name || bgmId}\n에러 코드: ${errorCode}`,
      );
      setLoadingId(null);
      return;
    }

    // 재생 시도 (오디오가 준비될 때까지 대기)
    if (audio.readyState >= 2) {
      try {
        await audio.play();
        setPlayingId(bgmId);
        setLoadingId(null);
      } catch (err) {
        console.error(`BGM 재생 실패:`, err);
        setLoadingId(null);
        setPlayingId(null);
        if (err.name === "NotAllowedError") {
          alert("오디오 재생을 위해 페이지를 클릭해주세요.");
        } else {
          alert(`오디오 재생에 실패했습니다: ${err.message}`);
        }
      }
    } else {
      const playWhenReady = () => {
        audio.removeEventListener("canplay", playWhenReady);

        if (audio.error && audio.error.code !== 0) {
          const errorCode = audio.error.code;
          const errorMessage = audio.error.message || "알 수 없는 오류";
          const bgm = BGM_LIST.find((b) => b.id === bgmId);
          console.error(`BGM ${bgmId} 로드 실패:`, {
            code: errorCode,
            message: errorMessage,
            url: bgm?.url,
          });
          alert(
            `오디오 파일을 로드할 수 없습니다: ${bgm?.name || bgmId}\n에러 코드: ${errorCode}`,
          );
          setLoadingId(null);
          return;
        }
        audio
          .play()
          .then(() => {
            setPlayingId(bgmId);
            setLoadingId(null);
          })
          .catch((err) => {
            console.error(`BGM 재생 실패:`, err);
            setLoadingId(null);
            setPlayingId(null);
            if (err.name === "NotAllowedError") {
              alert("오디오 재생을 위해 페이지를 클릭해주세요.");
            } else {
              alert(`오디오 재생에 실패했습니다: ${err.message}`);
            }
          });
      };
      audio.addEventListener("canplay", playWhenReady);
    }
  };

  const handleSelect = (bgm) => {
    if (playingId) {
      const audio = audioRefs.current[playingId];
      if (audio && !audio.error) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (err) {
          console.error("오디오 정지 중 오류:", err);
        }
      }
      setPlayingId(null);
    }

    onSelect(bgm.url);
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-white">배경음악</label>
        <button
          type="button"
          onClick={() => onSelect("")}
          className="text-xs text-white/60 hover:text-white/80"
        >
          선택 해제
        </button>
      </div>
      <div className="space-y-2">
        {BGM_LIST.map((bgm) => {
          const isPlaying = playingId === bgm.id;
          const isSelected = selectedBgm === bgm.url;

          return (
            <div
              key={bgm.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                isSelected
                  ? "border-white bg-white/10"
                  : "bg-black-200 border-white/20 hover:border-white/40"
              }`}
            >
              <button
                type="button"
                onClick={() => handlePlayPause(bgm.id)}
                disabled={loadingId === bgm.id}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  isPlaying
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                } ${loadingId === bgm.id ? "cursor-wait opacity-50" : ""}`}
                title={
                  loadingId === bgm.id
                    ? "로딩 중..."
                    : isPlaying
                      ? "일시정지"
                      : "재생"
                }
              >
                {loadingId === bgm.id ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : isPlaying ? (
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="ml-0.5 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {bgm.name}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(bgm)}
                className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isSelected ? "선택됨" : "선택"}
              </button>
            </div>
          );
        })}
      </div>

      {selectedBgm && (
        <div className="mt-2 text-xs text-white/60">
          선택된 배경음악이 저장됩니다.
        </div>
      )}
    </div>
  );
}
