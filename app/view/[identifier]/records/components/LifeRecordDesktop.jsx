"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageCropOverlay from "@/app/edit/[username]/records/components/ImageCropOverlay";
import { HiPlay, HiStop, HiStar, HiOutlineStar, HiTrash, HiHome } from "react-icons/hi";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import "../styles/cardPage.css";
import "../styles/cardPage-mobile.css";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const BG_THEME_PALETTE = [
  { name: "Coal", bg: "#121212", text: "#F2F2F2" },
  { name: "Rose", bg: "#aa747dff", text: "#ffffffff" },
  { name: "Olive", bg: "#7B7341", text: "#f2f2f2ff" },
  { name: "Warm Gray", bg: "#746F6F", text: "#F2F2F2" },
  { name: "Blue", bg: "#6C8E98", text: "#F2F2F2" },
  { name: "BlackPink", bg: "#12121268", text: "#aa747dff" },
  { name: "Parchment", bg: "#F5F1E6", text: "#111111" },
  { name: "Cloud", bg: "#ECECEC", text: "#111111" },
];

const toMonthDay = (str) => {
  if (!str) return "";
  const parts = str.split(".").map((s) => parseInt(s, 10));
  const [y, m, d] = parts;

  if (!y) return "";
  if (!m) return "";
  if (!d) return ` ${MONTHS[m - 1]}`;

  return ` ${MONTHS[m - 1]} ${String(d).padStart(2, "0")}`;
};

const getYear = (str) => {
  if (!str) return "";
  const [y] = str.split(".");
  return y ? y + " " : "";
};

const norm360 = (a) => ((a % 360) + 360) % 360;
const wrapTo180 = (d) => ((d + 540) % 360) - 180;
const angDist = (a, b) => {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d);
};

// 생년월일과 이벤트 날짜로 나이 계산
const calculateAge = (birthDate, eventDate) => {
  if (!birthDate || !eventDate) return null;

  const [birthY, birthM, birthD] = birthDate.split(".").map(Number);
  const [eventY, eventM, eventD] = eventDate.split(".").map(Number);

  if (!birthY || !eventY) return null;

  let age = eventY - birthY;

  // 월과 일이 있으면 더 정확하게 계산
  if (birthM && eventM) {
    if (
      eventM < birthM ||
      (eventM === birthM && eventD && birthD && eventD < birthD)
    ) {
      age--;
    }
  }

  return age >= 0 ? age : null;
};

function useIsMobile(bp = 768) {
  const [m, setM] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= bp : false,
  );
  useEffect(() => {
    const on = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", on);
    on();
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return m;
}

export default function LifeRecordDesktop({
  data,
  isEditing = false,
  onDataChange,
  onDeleteItem,
  onImageChange,
  onImageDelete,
  onActiveItemChange,
  isUploadingImage = false,
  onNavigateToItem,
  cropState = { isActive: false, imageFile: null, type: null, itemId: null },
  onCropComplete,
  onCropCancel,
  aspectRatio = 1,
}) {
  const router = useRouter();
  const [editingDateItemId, setEditingDateItemId] = useState(null); // 날짜 입력 중인 항목의 ID
  const [displayMode, setDisplayMode] = useState(
    data.record?.displayMode || "year",
  ); // "year" or "age"
  const [birthDate, setBirthDate] = useState(data.record?.birthDate || ""); // 생년월일 로컬 state (입력 중)
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false); // 생년월일 입력 중인지 추적

  // data가 변경될 때 displayMode와 birthDate 동기화 (입력 중이 아닐 때만)
  useEffect(() => {
    if (
      data.record?.displayMode !== undefined &&
      data.record?.displayMode !== null
    ) {
      setDisplayMode(data.record.displayMode);
    } else {
      setDisplayMode("year"); // 기본값
    }
    if (
      data.record?.birthDate !== undefined &&
      data.record?.birthDate !== null &&
      !isEditingBirthDate
    ) {
      setBirthDate(data.record.birthDate);
    } else if (data.record?.birthDate === null && !isEditingBirthDate) {
      setBirthDate(""); // null이면 빈 문자열로
    }
  }, [data.record?.displayMode, data.record?.birthDate, isEditingBirthDate]);

  // API 데이터를 timeline 형식으로 변환
  const timeline = useMemo(() => {
    const result = [];

    // 메인 아이템
    if (data.record) {
      result.push({
        id: "Home",
        kind: "main",
        label: "Home",
        title: data.record.name || "사용자의 이야기",
        subtitle: data.record.subName || "",
        date: "",
        location: "",
        desc: data.record.description || "",
        cover: data.record.coverUrl || "/images/records/No image.png",
        images: null, // main은 images 배열 사용하지 않음
        isHighlight: false,
      });
    }

    // RecordItems를 year 타입으로 변환
    const items = (data.items || []).map((item) => {
      const [y] = (item.date || "").split(".");
      const year = y ? parseInt(y, 10) : 0;

      // displayMode에 따라 label 결정 (입력 중이 아닐 때만 나이 계산)
      let label = y || item.id.toString();
      if (
        displayMode === "age" &&
        !isEditingBirthDate &&
        data.record?.birthDate &&
        item.date
      ) {
        const age = calculateAge(data.record.birthDate, item.date);
        if (age !== null) {
          label = `${age}세`;
        }
      }

      // images 배열이 있으면 사용, 없으면 coverUrl 사용 (하위 호환성)
      // 최대 5개 슬롯을 유지 (빈 슬롯은 null)
      let images = [];
      if (item.images && item.images.length > 0) {
        images = [...item.images];
        // 최대 5개까지 채우기 (빈 슬롯은 null로)
        while (images.length < 5) {
          images.push(null);
        }
        images = images.slice(0, 5);
      } else if (item.coverUrl) {
        images = [item.coverUrl];
        // 나머지 슬롯을 null로 채우기
        while (images.length < 5) {
          images.push(null);
        }
      } else {
        // 이미지가 없으면 빈 슬롯 5개
        images = Array(5).fill(null);
      }

      return {
        id: item.id,
        kind: "year",
        label: label,
        event: item.title || "",
        date: item.date || "",
        location: item.location || "",
        cover: images.find((img) => img) || "/images/records/No image.png", // 첫 번째 유효한 이미지를 기본으로
        images: images, // 전체 이미지 배열 (최대 5개, 빈 슬롯은 null)
        desc: item.description || "",
        isHighlight: item.isHighlight || false,
        color: item.color || "",
        year: year, // 정렬을 위한 연도 숫자
      };
    });

    // 날짜 입력 중이 아닐 때만 정렬
    if (!editingDateItemId) {
      // 연도 순서대로 정렬 (오름차순: 오래된 것부터)
      items.sort((a, b) => {
        // 연도가 없는 경우 뒤로
        if (!a.year && !b.year) return 0;
        if (!a.year) return 1;
        if (!b.year) return -1;
        return a.year - b.year;
      });
    }

    result.push(...items);

    return result;
  }, [data, editingDateItemId, displayMode, isEditingBirthDate]);

  const [rotation, setRotation] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 이미지 인덱스
  const [targetImageSlotIndex, setTargetImageSlotIndex] = useState(null); // 이미지를 추가할 슬롯 인덱스
  const DEFAULT_THEME = BG_THEME_PALETTE[0];
  const mainImageInputRef = useRef(null);
  const itemImageInputRef = useRef(null);
  const isNavigatingRef = useRef(false); // 외부에서 명시적으로 이동 중인지 추적
  const activeItemIdRef = useRef(null); // 현재 활성화된 항목의 ID 추적
  const editingDateItemIdRef = useRef(null); // 날짜 입력 중인 항목의 ID 추적 (useMemo에서 사용)
  const activeIdxRef = useRef(0); // 자동 슬라이드를 위한 ref
  const rotationRef = useRef(0); // 자동 슬라이드를 위한 rotation ref

  // activeIdx와 rotation이 변경될 때 ref 업데이트
  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const activeItem = timeline[activeIdx] || {};

  // activeItem이 변경될 때 이미지 인덱스 리셋
  useEffect(() => {
    if (isEditing) {
      // Edit 모드: 항상 0으로 리셋
      setCurrentImageIndex(0);
    } else {
      // View 모드: 유효한 이미지만 고려
      const validImages = (activeItem.images || []).filter((img) => img);
      setCurrentImageIndex(0);
    }
  }, [activeItem.id, isEditing]);

  // 활성화된 item의 color를 우선 사용, 없으면 record의 color 사용
  const theme = useMemo(() => {
    // 활성화된 item의 color가 있으면 우선 사용
    const colorHex = activeItem.color || data.record?.color;
    if (colorHex) {
      // BG_THEME_PALETTE에서 일치하는 것을 찾거나, 없으면 직접 생성
      const matchedTheme = BG_THEME_PALETTE.find(
        (t) => t.bg.toLowerCase() === colorHex.toLowerCase(),
      );
      if (matchedTheme) {
        return matchedTheme;
      }
      return {
        bg: colorHex,
        text: "#F2F2F2", // 기본 텍스트 색상
      };
    }
    return DEFAULT_THEME;
  }, [activeItem.color, data.record?.color]);

  const wheelTimer = useRef(null);
  const scrollSound = useRef(null);
  const bgmAudioRef = useRef(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // BGM 재생/정지 기능
  useEffect(() => {
    if (!data.record?.bgm) return;

    const audio = new Audio(data.record.bgm);
    audio.loop = true;
    audio.volume = 0.5;
    bgmAudioRef.current = audio;

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [data.record?.bgm]);

  const handleBgmToggle = () => {
    if (!bgmAudioRef.current) return;

    if (isBgmPlaying) {
      bgmAudioRef.current.pause();
      setIsBgmPlaying(false);
    } else {
      bgmAudioRef.current.play().catch((err) => {
        console.error("BGM 재생 실패:", err);
      });
      setIsBgmPlaying(true);
    }
  };

  const isMobile = useIsMobile();
  const DESKTOP = { START: 0, SWEEP: 120, RADIUS: 280, ANCHOR: 0 };
  const MOBILE = { START: 110, SWEEP: 180, RADIUS: 140, ANCHOR: 110 };
  const CFG = isMobile ? MOBILE : DESKTOP;
  const RADIUS = CFG.RADIUS;
  const getAnchor = () => CFG.ANCHOR;

  const angleForIndex = (i) => {
    const n = timeline.length;
    if (n <= 0) return CFG.START;
    const step = CFG.SWEEP / n;
    return CFG.START + step * (i + 0.5);
  };

  const getOpacityForAngle = (angle, anchor = getAnchor()) => {
    let diff = Math.abs(norm360(angle) - norm360(anchor));
    if (diff > 180) diff = 360 - diff;

    const normalizedDiff = Math.min(diff / 90, 1);
    const opacity = 1 - normalizedDiff * normalizedDiff * 1;
    return Math.max(opacity, 0);
  };

  // activeItem.id가 변경될 때 ref 업데이트
  useEffect(() => {
    if (activeItem?.id) {
      activeItemIdRef.current = activeItem.id;
    }
  }, [activeItem?.id]);

  // timeline이 변경될 때 현재 활성화된 항목의 ID를 유지
  useEffect(() => {
    // 외부에서 명시적으로 이동을 요청한 경우가 아니고, 추적 중인 항목 ID가 있는 경우
    if (!isNavigatingRef.current && activeItemIdRef.current) {
      const newIdx = timeline.findIndex(
        (item) => item.id === activeItemIdRef.current,
      );
      if (newIdx !== -1 && newIdx !== activeIdx) {
        // 같은 ID를 가진 항목의 새 인덱스로 이동
        setActiveIdx(newIdx);
        // 회전도 함께 업데이트
        const targetAngle = angleForIndex(newIdx);
        setRotation(targetAngle - getAnchor());
      }
    }
  }, [timeline]);

  // 활성화된 item 변경 시 부모에게 알림
  const prevActiveIdxRef = useRef(activeIdx);
  const prevActiveItemIdRef = useRef(activeItem?.id);
  const onActiveItemChangeRef = useRef(onActiveItemChange);

  // onActiveItemChange ref 업데이트
  useEffect(() => {
    onActiveItemChangeRef.current = onActiveItemChange;
  }, [onActiveItemChange]);

  // 외부에서 인덱스 변경 요청 처리
  useEffect(() => {
    if (onNavigateToItem !== undefined && onNavigateToItem !== null) {
      isNavigatingRef.current = true; // 외부 이동 시작
      const targetIdx = Math.max(
        0,
        Math.min(onNavigateToItem, timeline.length - 1),
      );
      if (targetIdx !== activeIdx) {
        setActiveIdx(targetIdx);
        // 회전도 함께 업데이트
        const targetAngle = angleForIndex(targetIdx);
        setRotation(targetAngle - getAnchor());
      }
      // 사용 후 리셋 (무한 루프 방지)
      if (onActiveItemChangeRef.current) {
        onActiveItemChangeRef.current({
          id: timeline[targetIdx]?.id,
          kind: timeline[targetIdx]?.kind,
          color: timeline[targetIdx]?.color || data.record?.color || "#121212",
          index: targetIdx,
          event: timeline[targetIdx]?.event,
          date: timeline[targetIdx]?.date,
        });
      }
      // 이동 완료 후 플래그 리셋
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [onNavigateToItem, timeline.length]);

  useEffect(() => {
    // activeIdx나 activeItem.id가 실제로 변경된 경우에만 호출
    if (
      onActiveItemChangeRef.current &&
      activeItem &&
      (prevActiveIdxRef.current !== activeIdx ||
        prevActiveItemIdRef.current !== activeItem.id)
    ) {
      prevActiveIdxRef.current = activeIdx;
      prevActiveItemIdRef.current = activeItem.id;

      onActiveItemChangeRef.current({
        id: activeItem.id,
        kind: activeItem.kind,
        color: activeItem.color || data.record?.color || "#121212",
        index: activeIdx, // timeline에서의 인덱스 추가
        event: activeItem.event, // event (title) 추가
        date: activeItem.date, // date 추가
      });
    }
  }, [
    activeIdx,
    activeItem?.id,
    activeItem?.kind,
    activeItem?.color,
    activeItem?.event,
    activeItem?.date,
    data.record?.color,
  ]);

  const snapToIndex = (
    i,
    anchor = getAnchor(),
    reverse = false,
    isAutoSlide = false,
  ) => {
    const base = angleForIndex(i);
    const currentRotation = rotationRef.current || rotation;
    const cur = norm360(base + currentRotation);
    const delta = wrapTo180(anchor - cur);

    if (scrollSound.current) {
      scrollSound.current.currentTime = 0;

      if (isAutoSlide) {
        scrollSound.current.volume = 0.05;
      } else {
        scrollSound.current.volume = 1.0;
      }
      scrollSound.current.play().catch((err) => {
        console.error("Scroll sound 재생 실패:", err);
      });
    }
    // reverse가 true면 반대 방향으로 회전
    setRotation(norm360(currentRotation + (reverse ? -delta : delta)));
    setActiveIdx(i);
  };

  const snapToClosest = (rot, anchor = getAnchor()) => {
    let best = 0,
      bestDiff = Infinity,
      snapped = rot;
    timeline.forEach((_, i) => {
      const cur = norm360(angleForIndex(i) + rot);
      const diff = angDist(cur, anchor);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
        snapped = rot + wrapTo180(anchor - cur);
      }
    });
    setRotation(snapped);
    setActiveIdx(best);
  };

  const STEP = 3;
  const handleWheel = (e) => {
    const dir = e.deltaY > 0 ? -1 : 1;
    const next = rotation + dir * STEP;
    if (scrollSound.current) {
      scrollSound.current.currentTime = 0;
      scrollSound.current.play();
    }
    setRotation(next);
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => snapToClosest(next), 140);
  };

  useEffect(() => {
    scrollSound.current = new Audio("/sounds/scroll.m4a");
  }, []);

  // 자동 슬라이드 기능 (view 모드일 때만)
  useEffect(() => {
    if (isEditing || !autoSlideEnabled || timeline.length === 0) return;

    const autoSlideInterval = setInterval(() => {
      const currentIdx = activeIdxRef.current;
      let newIdx;
      if (currentIdx >= timeline.length - 1) {
        newIdx = 0;
      } else {
        newIdx = currentIdx + 1;
      }

      // snapToIndex를 사용하여 정확한 위치로 이동 (정상 방향)
      // isAutoSlide=true로 설정하여 볼륨을 절반으로 낮춤
      snapToIndex(newIdx, getAnchor(), false, true);
    }, 5000); // 5초마다 자동으로 넘어감

    return () => clearInterval(autoSlideInterval);
  }, [isEditing, autoSlideEnabled, timeline.length]);

  const safeIdx = Math.min(activeIdx, Math.max(0, (timeline?.length || 1) - 1));
  const mainTitle = useMemo(() => {
    const mainItem = timeline.find((it) => it.kind === "main");
    return mainItem?.title || "사용자의 이야기";
  }, [timeline]);

  return (
    <main
      className={`lr-page ${isEditing ? "lr-page--editing" : ""}`}
      style={{ ["--bg"]: theme.bg, ["--text"]: theme.text }}
    >
      {/* BGM 재생 버튼 및 자동 슬라이드 토글 버튼 (우측 상단 고정) */}
      {!isEditing && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 10000,
            display: "flex",
            gap: "12px",
            flexDirection: "column",
          }}
        >
          {data.record?.bgm && (
            <button
              onClick={handleBgmToggle}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: isBgmPlaying
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: theme.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isBgmPlaying
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.1)";
              }}
              title={isBgmPlaying ? "음악 정지" : "음악 재생"}
            >
              {isBgmPlaying ? (
                <HiVolumeUp size={24} />
              ) : (
                <HiVolumeOff size={24} />
              )}
            </button>
          )}
          <button
            onClick={() => setAutoSlideEnabled(!autoSlideEnabled)}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: autoSlideEnabled
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = autoSlideEnabled
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)";
            }}
            title={autoSlideEnabled ? "자동재생 끄기" : "자동재생 켜기"}
          >
            {autoSlideEnabled ? <HiStop size={24} /> : <HiPlay size={24} />}
          </button>
        </div>
      )}

      <div className="lr-grid">
        <section className="lr-left">
          <h1 className="lr-title">Life- Records</h1>
          <p className="lr-sub">
            <b>{data.record?.userName || "사용자"}</b>님의 라이프 레코드입니다.
            <br />
            "작은 장면을 모아 긴 기억을 만듭니다"
          </p>
        </section>

        <section className="lr-center">
          <article
            className={`lr-card ${
              activeItem?.kind === "main" ? "lr-card--main" : ""
            }`}
          >
            <div key={activeIdx} className="card-fade">
              <div className="lr-card-media" style={{ position: "relative" }}>
                {isEditing && (
                  <input
                    ref={
                      activeItem.kind === "main"
                        ? mainImageInputRef
                        : itemImageInputRef
                    }
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
                    multiple={activeItem.kind !== "main"} // main이 아닌 경우에만 multiple 허용
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0 && onImageChange) {
                        if (activeItem.kind === "main") {
                          // main은 단일 이미지만
                          onImageChange("main", null, files[0]);
                        } else {
                          // item은 최대 5개까지
                          // targetImageSlotIndex가 설정되어 있으면 해당 슬롯에 추가
                          if (targetImageSlotIndex !== null) {
                            // 특정 슬롯에 이미지 추가
                            onImageChange(
                              "item",
                              activeItem.id,
                              files[0],
                              targetImageSlotIndex,
                            );
                            setTargetImageSlotIndex(null); // 리셋
                          } else {
                            // 여러 파일 선택 시: 현재 이미지 배열에서 null이 아닌 것만 카운트
                            const currentImages = activeItem.images || [];
                            const validImages = currentImages.filter(
                              (img) => img,
                            );
                            const remainingSlots = 5 - validImages.length;
                            const filesToUpload = files.slice(
                              0,
                              remainingSlots,
                            );

                            if (files.length > remainingSlots) {
                              alert(
                                `최대 5개까지만 업로드할 수 있습니다. ${remainingSlots}개만 업로드됩니다.`,
                              );
                            }

                            // 각 파일을 순차적으로 업로드
                            filesToUpload.forEach((file) => {
                              onImageChange("item", activeItem.id, file);
                            });
                          }
                        }
                      }
                      // Reset input
                      e.target.value = "";
                    }}
                  />
                )}
                {cropState.isActive &&
                cropState.imageFile &&
                ((cropState.type === "main" && activeItem.kind === "main") ||
                  (cropState.type === "item" &&
                    cropState.itemId === activeItem.id)) ? (
                  <div
                    className="lr-cover"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <ImageCropOverlay
                      imageFile={cropState.imageFile}
                      onCropComplete={onCropComplete}
                      onCancel={onCropCancel}
                      aspectRatio={aspectRatio}
                    />
                  </div>
                ) : activeItem.video ? (
                  <video
                    className="lr-cover"
                    src={activeItem.video}
                    controls
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <>
                    {activeItem.kind === "main" ? (
                      // Main 항목: 단일 이미지만 표시
                      <img
                        src={activeItem.cover || "/images/records/No image.png"}
                        alt="cover"
                        className="lr-cover"
                        onError={(e) => {
                          e.target.src = "/images/records/No image.png";
                        }}
                      />
                    ) : isEditing ? (
                      // Edit 모드: 최대 5개 슬롯 모두 표시 (빈 슬롯은 이미지 추가 버튼)
                      <div
                        className="lr-image-slider"
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            width: `${(activeItem.images?.length || 5) * 100}%`,
                            height: "100%",
                            transform: `translateX(-${currentImageIndex * (100 / (activeItem.images?.length || 5))}%)`,
                            transition: "transform 0.3s ease",
                          }}
                        >
                          {(activeItem.images || Array(5).fill(null)).map(
                            (img, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: `${100 / (activeItem.images?.length || 5)}%`,
                                  height: "100%",
                                  position: "relative",
                                }}
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt={`cover ${idx + 1}`}
                                    className="lr-cover"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.src =
                                        "/images/records/No image.png";
                                    }}
                                  />
                                ) : (
                                  <div
                                    onClick={() => {
                                      if (!cropState.isActive) {
                                        setTargetImageSlotIndex(idx);
                                        itemImageInputRef.current?.click();
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      background: "rgba(0, 0, 0, 0.1)",
                                      border:
                                        "2px dashed rgba(255, 255, 255, 0.3)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: cropState.isActive
                                        ? "not-allowed"
                                        : "pointer",
                                      color: "#000000",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      opacity: cropState.isActive ? 0.5 : 1,
                                    }}
                                  >
                                    + 이미지 추가
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                        {/* 좌우 화살표 */}
                        {currentImageIndex > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(currentImageIndex - 1);
                            }}
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(0, 0, 0, 0.5)",
                              border: "none",
                              color: "white",
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 2,
                            }}
                            aria-label="이전 이미지"
                          >
                            ←
                          </button>
                        )}
                        {currentImageIndex <
                          (activeItem.images?.length || 5) - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(currentImageIndex + 1);
                            }}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(0, 0, 0, 0.5)",
                              border: "none",
                              color: "white",
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 2,
                            }}
                            aria-label="다음 이미지"
                          >
                            →
                          </button>
                        )}
                        {/* 인디케이터 */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "8px",
                            zIndex: 2,
                          }}
                        >
                          {(activeItem.images || Array(5).fill(null)).map(
                            (_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(idx);
                                }}
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  border: "none",
                                  background:
                                    idx === currentImageIndex
                                      ? "rgba(255, 255, 255, 0.9)"
                                      : _ === null
                                        ? "rgba(255, 255, 255, 0.2)"
                                        : "rgba(255, 255, 255, 0.4)",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                                aria-label={`이미지 ${idx + 1}`}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      // View 모드: 이미지가 있는 것만 슬라이드로 표시
                      (() => {
                        const validImages = (activeItem.images || []).filter(
                          (img) => img,
                        );
                        if (validImages.length > 1) {
                          return (
                            <div
                              className="lr-image-slider"
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  width: `${validImages.length * 100}%`,
                                  height: "100%",
                                  transform: `translateX(-${currentImageIndex * (100 / validImages.length)}%)`,
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                {validImages.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`cover ${idx + 1}`}
                                    className="lr-cover"
                                    style={{
                                      width: `${100 / validImages.length}%`,
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.src =
                                        "/images/records/No image.png";
                                    }}
                                  />
                                ))}
                              </div>
                              {/* 인디케이터 */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "16px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  display: "flex",
                                  gap: "8px",
                                  zIndex: 10,
                                  pointerEvents: "auto",
                                }}
                              >
                                {validImages.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex(idx);
                                    }}
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      borderRadius: "50%",
                                      border: "none",
                                      background:
                                        idx === currentImageIndex
                                          ? "rgba(255, 255, 255, 0.9)"
                                          : "rgba(255, 255, 255, 0.5)",
                                      cursor: "pointer",
                                      padding: 0,
                                      transition: "background 0.2s ease",
                                    }}
                                    aria-label={`이미지 ${idx + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        } else if (validImages.length === 1) {
                          return (
                            <img
                              src={validImages[0]}
                              alt="cover"
                              className="lr-cover"
                              onError={(e) => {
                                e.target.src = "/images/records/No image.png";
                              }}
                            />
                          );
                        } else {
                          return null; // 이미지가 없으면 아무것도 표시하지 않음
                        }
                      })()
                    )}
                  </>
                )}
                {isUploadingImage && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      borderRadius: "inherit",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "500",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          border: "3px solid rgba(255, 255, 255, 0.3)",
                          borderTop: "3px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <span>업로드 중...</span>
                    </div>
                  </div>
                )}

                {!isEditing && activeItem?.isHighlight && (
                  <div className="lr-fav-badge" aria-label="즐겨찾기">
                    <HiStar size={18} />
                  </div>
                )}
                {isEditing && (
                  <>
                    {activeItem.kind !== "main" && (
                      <>
                        <button
                          className={`lr-fav-badge lr-fav-toggle ${activeItem?.isHighlight ? "active" : ""}`}
                          aria-label="즐겨찾기 토글"
                          onClick={() => {
                            const newItems = data.items.map((item) =>
                              item.id === activeItem.id
                                ? { ...item, isHighlight: !item.isHighlight }
                                : item,
                            );
                            onDataChange?.({ ...data, items: newItems });
                          }}
                          style={{
                            pointerEvents: "auto",
                            cursor: "pointer",
                            opacity: activeItem?.isHighlight ? 1 : 0.5,
                            top: "10px",
                          }}
                        >
                          {activeItem?.isHighlight ? (
                            <HiStar size={18} />
                          ) : (
                            <HiOutlineStar size={18} />
                          )}
                        </button>
                        <button
                          className="lr-delete-badge"
                          aria-label="삭제"
                          onClick={() => {
                            onDeleteItem?.(activeItem.id);
                          }}
                          style={{
                            pointerEvents: "auto",
                            cursor: "pointer",
                            top: "48px",
                          }}
                        >
                          <HiTrash size={18} />
                        </button>
                      </>
                    )}
                    {/* 이미지가 있을 때만 이미지 변경/삭제 버튼 표시 */}
                    {((activeItem.kind === "main" && activeItem.cover) ||
                      (activeItem.kind !== "main" &&
                        activeItem.images &&
                        activeItem.images[currentImageIndex])) && (
                      <>
                        <button
                          className="lr-image-change-badge"
                          aria-label="이미지 변경"
                          onClick={() => {
                            if (!cropState.isActive) {
                              if (activeItem.kind === "main") {
                                mainImageInputRef.current?.click();
                              } else {
                                itemImageInputRef.current?.click();
                              }
                            }
                          }}
                          disabled={cropState.isActive}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>이미지 변경</span>
                        </button>
                        {activeItem.kind !== "main" &&
                          onImageDelete &&
                          activeItem.images &&
                          activeItem.images[currentImageIndex] && (
                            <button
                              className="lr-image-delete-badge"
                              aria-label="이미지 삭제"
                              onClick={() => {
                                if (!cropState.isActive) {
                                  onImageDelete(
                                    activeItem.id,
                                    currentImageIndex,
                                  );
                                  // 삭제 후 인덱스 조정
                                  const validImages = (
                                    activeItem.images || []
                                  ).filter((img) => img);
                                  if (
                                    currentImageIndex >=
                                    validImages.length - 1
                                  ) {
                                    setCurrentImageIndex(
                                      Math.max(0, validImages.length - 2),
                                    );
                                  }
                                }
                              }}
                              disabled={cropState.isActive}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>이미지 삭제</span>
                            </button>
                          )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="lr-card-desc">
                {activeItem.kind === "main" ? (
                  <>
                    <div className="lr-meta lr-meta--mainTop">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={data.record?.name || ""}
                            onChange={(e) => {
                              const newData = {
                                ...data,
                                record: {
                                  ...data.record,
                                  name: e.target.value,
                                },
                              };
                              onDataChange?.(newData);
                            }}
                            className="lr-name"
                            placeholder="레코드의 제목을 입력하세요"
                          />
                          <input
                            type="text"
                            value={data.record?.subName || ""}
                            onChange={(e) => {
                              const newData = {
                                ...data,
                                record: {
                                  ...data.record,
                                  subName: e.target.value,
                                },
                              };
                              onDataChange?.(newData);
                            }}
                            className="lr-subtitle"
                            placeholder="레코드에 대한 소개를 입력하세요"
                          />
                        </>
                      ) : (
                        <>
                          <div className="lr-name">{mainTitle}</div>
                          {activeItem.subtitle && (
                            <div className="lr-subtitle">
                              {activeItem.subtitle}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* 연도/나이 표시 토글 및 생년월일 입력 */}
                    {isEditing && (
                      <div className="lr-display-mode-control">
                        <div className="lr-display-mode-row">
                          <div className="lr-display-mode-toggle">
                            <span className="lr-mode-label">연도</span>
                            <button
                              type="button"
                              className={`lr-mode-switch ${displayMode === "year" ? "" : "active"}`}
                              onClick={() => {
                                const newMode =
                                  displayMode === "year" ? "age" : "year";
                                setDisplayMode(newMode);
                                const newData = {
                                  ...data,
                                  record: {
                                    ...data.record,
                                    displayMode: newMode,
                                  },
                                };
                                onDataChange?.(newData);
                              }}
                            >
                              <span className="lr-mode-switch-slider"></span>
                            </button>
                            <span className="lr-mode-label">나이</span>
                          </div>
                          <input
                            type="text"
                            value={birthDate}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBirthDate(value);
                            }}
                            onFocus={() => {
                              setIsEditingBirthDate(true);
                            }}
                            onBlur={() => {
                              setIsEditingBirthDate(false);
                              const newData = {
                                ...data,
                                record: {
                                  ...data.record,
                                  birthDate: birthDate,
                                },
                              };
                              onDataChange?.(newData);
                            }}
                            className={`lr-birthdate-input-inline ${displayMode === "age" ? "" : "lr-birthdate-input-hidden"}`}
                            placeholder="출생년도를 입력하세요. (예: 1949)"
                            maxLength={10}
                            disabled={displayMode !== "age"}
                          />
                        </div>
                      </div>
                    )}
                    {isEditing ? (
                      <>
                        <textarea
                          value={data.record?.description || ""}
                          onChange={(e) => {
                            const newData = {
                              ...data,
                              record: {
                                ...data.record,
                                description: e.target.value,
                              },
                            };
                            onDataChange?.(newData);
                          }}
                          className="lr-desc-input"
                          maxLength={80}
                          placeholder="이 레코드에 대한 간단한 소개를 적어보세요 (최대 80자)"
                        />
                        <div className="lr-char-count">
                          {(data.record?.description || "").length} / 80
                        </div>
                      </>
                    ) : (
                      <p
                        className="lr-card-desc-main"
                        style={{
                          marginBottom: "5px",
                          borderTop: "none",
                        }}
                      >
                        {activeItem.desc}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <textarea
                          value={
                            data.items?.find(
                              (item) => item.id === activeItem.id,
                            )?.description || ""
                          }
                          onChange={(e) => {
                            const newItems = data.items.map((item) =>
                              item.id === activeItem.id
                                ? { ...item, description: e.target.value }
                                : item,
                            );
                            onDataChange?.({ ...data, items: newItems });
                          }}
                          className="lr-desc-input"
                          maxLength={150}
                          placeholder="이 순간에 대한 이야기를 자유롭게 적어보세요 (최대 150자)"
                        />
                        <div className="lr-char-count">
                          {
                            (
                              data.items?.find(
                                (item) => item.id === activeItem.id,
                              )?.description || ""
                            ).length
                          }{" "}
                          / 150
                        </div>
                      </>
                    ) : (
                      <p>{activeItem.desc}</p>
                    )}
                    <div className="lr-meta">
                      {isEditing ? (
                        <textarea
                          value={
                            data.items?.find(
                              (item) => item.id === activeItem.id,
                            )?.title || ""
                          }
                          onChange={(e) => {
                            const newItems = data.items.map((item) =>
                              item.id === activeItem.id
                                ? { ...item, title: e.target.value }
                                : item,
                            );
                            onDataChange?.({ ...data, items: newItems });
                          }}
                          className="lr-name"
                          rows={2}
                          placeholder="이 순간을 표현할 수 있는 제목을 입력하세요"
                        />
                      ) : (
                        <div className="lr-name">
                          {activeItem.kind === "year"
                            ? activeItem.event
                            : "최아텍"}
                        </div>
                      )}
                      <div className="lr-date-location">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={
                                data.items?.find(
                                  (item) => item.id === activeItem.id,
                                )?.date || ""
                              }
                              onChange={(e) => {
                                const newItems = data.items.map((item) =>
                                  item.id === activeItem.id
                                    ? { ...item, date: e.target.value }
                                    : item,
                                );
                                onDataChange?.({ ...data, items: newItems });
                              }}
                              onFocus={() => {
                                // 날짜 입력 시작
                                if (activeItem?.id) {
                                  setEditingDateItemId(activeItem.id);
                                  editingDateItemIdRef.current = activeItem.id;
                                }
                              }}
                              onBlur={() => {
                                // 날짜 입력 완료 - 정렬하고 새 위치로 이동
                                if (activeItem?.id) {
                                  setEditingDateItemId(null);
                                  editingDateItemIdRef.current = null;

                                  // 정렬된 위치 계산
                                  const sortedItems = [
                                    ...(data.items || []),
                                  ].map((item) => {
                                    const [y] = (item.date || "").split(".");
                                    return {
                                      ...item,
                                      year: y ? parseInt(y, 10) : 0,
                                    };
                                  });

                                  sortedItems.sort((a, b) => {
                                    if (!a.year && !b.year) return 0;
                                    if (!a.year) return 1;
                                    if (!b.year) return -1;
                                    return a.year - b.year;
                                  });

                                  // 정렬된 위치에서 현재 항목의 인덱스 찾기 (main 제외)
                                  const sortedIdx = sortedItems.findIndex(
                                    (item) => item.id === activeItem.id,
                                  );
                                  if (sortedIdx !== -1) {
                                    // main이 첫 번째이므로 +1
                                    const targetIdx = sortedIdx + 1;
                                    setActiveIdx(targetIdx);
                                    const targetAngle =
                                      angleForIndex(targetIdx);
                                    setRotation(targetAngle - getAnchor());
                                  }
                                }
                              }}
                              placeholder="예: 2024.01.15"
                              className="lr-date-input"
                              style={{
                                width: "100%",
                                marginBottom: "4px",
                              }}
                            />
                            <input
                              type="text"
                              value={
                                data.items?.find(
                                  (item) => item.id === activeItem.id,
                                )?.location || ""
                              }
                              onChange={(e) => {
                                const newItems = data.items.map((item) =>
                                  item.id === activeItem.id
                                    ? { ...item, location: e.target.value }
                                    : item,
                                );
                                onDataChange?.({ ...data, items: newItems });
                              }}
                              placeholder="예: 서울, 파리, 제주도"
                              className="lr-location-input"
                              style={{
                                width: "100%",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <div className="lr-date">
                              {getYear(activeItem.date)}
                              {toMonthDay(activeItem.date)}
                            </div>
                            {activeItem.location && (
                              <div className="lr-location">
                                {activeItem.location}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {activeItem.kind === "main" && (
                <div className="lr-highlight-grid" role="list">
                  {timeline
                    .filter((it) => it.isHighlight)
                    .slice(0, 10)
                    .map((it) => (
                      <div
                        key={it.id}
                        className="lr-highlight-item"
                        role="listitem"
                        title={
                          (it.kind === "year" ? it.event : it.title) ||
                          "하이라이트"
                        }
                        onClick={() => {
                          const i = timeline.findIndex((x) => x.id === it.id);
                          if (i >= 0) snapToIndex(i);
                        }}
                      >
                        <img
                          src={it.cover || "/images/records/No image.png"}
                          alt={
                            (it.kind === "year" ? it.event : it.title) ||
                            "highlight"
                          }
                        />
                        <span className="lr-highlight-title">
                          {it.kind === "year" ? it.event : it.title}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="lr-right" onWheel={handleWheel}>
          <div className="lp-wrap">
            <img
              className="lp-disc"
              src="/images/records/LP-image.png"
              alt="LP"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="year-circle">
              {timeline.map((item, i) => {
                const baseAngle = angleForIndex(i);
                const phi = baseAngle + rotation;
                // anchor 위치(0도)에서의 거리를 기준으로 opacity 계산
                // rotation이 변경되어도 각 항목의 baseAngle은 고정이므로,
                // rotation을 고려한 실제 화면상 위치를 계산
                const anchor = getAnchor();
                const relativeAngle = norm360(phi - anchor);
                const opacity = getOpacityForAngle(relativeAngle, 0);
                return (
                  <span
                    key={item.id}
                    className={`year-item ${i === activeIdx ? "active" : ""}`}
                    style={{
                      transform: `rotate(${phi}deg) translate(${RADIUS}px) rotate(${-phi}deg)`,
                      opacity: opacity,
                      transition:
                        "opacity 0.25s ease, transform 0.25s ease, color 0.25s ease",
                    }}
                    onClick={() => snapToIndex(i)}
                  >
                    {item.kind === "main" || item.label === "Home" ? (
                      <HiHome size={20} />
                    ) : (
                      item.label
                    )}
                    {item.kind === "main" ? (
                      <span className="year-event">{item.title}</span>
                    ) : (
                      <span className="year-event">{item.event}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <div className="footer-logo">The Life Museum</div>
        <div className="footer-copyright">
          Copyright 2025. Creative Computing Group. All rights reserved.
        </div>
        {!isEditing && (
          <button
            className="login-btn-fixed"
            onClick={() => router.push("/login")}
          >
            로그인
          </button>
        )}
      </footer>
    </main>
  );
}
