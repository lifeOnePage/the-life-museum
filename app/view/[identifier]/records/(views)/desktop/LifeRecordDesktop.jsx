"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import ImageCropOverlay from "@/app/edit/[username]/records/components/ImageCropOverlay";
import { HiStar, HiHome, HiOutlineStar, HiTrash } from "react-icons/hi";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import "../../styles/cardPage.css";
import "../../styles/cardPage-mobile.css";
import { DEFAULT_THEME, BG_THEME_PALETTE } from "../../utils/constants";
import { calculateAge, getYear, toMonthDay } from "../../utils/dateUtils";
import { norm360, wrapTo180, angDist } from "../../utils/mathUtils";
import ControlButtons from "../../components/ControlButtons";
import useIsMobile from "@/app/hooks/useIsMobile";

export default function LifeRecordDesktop({
  width,
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
  autoSlideEnabled: propAutoSlideEnabled,
  onAutoSlideEnabledChange,
  onImageModalOpen,
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
    console.log(data?.record);

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
      // 임시 ID인 경우 label을 빈 문자열로 설정 (연도가 없으면 표시 안 함)
      let label = "";
      if (y) {
        label = y;
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
      } else if (!item.id?.toString().startsWith("temp-")) {
        // 임시 ID가 아닌 경우에만 ID 표시
        label = item.id.toString();
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
      } else if (
        item.coverUrl &&
        item.coverUrl !== "/images/records/No image.png"
      ) {
        images = [item.coverUrl];
        while (images.length < 5) {
          images.push(null);
        }
      } else {
        images = Array(5).fill(null);
      }

      // 임시 ID인 경우 또는 title이 비어있는 경우 "새로운 이벤트"로 표시
      const eventTitle = item.title?.trim() || "";
      const displayEvent =
        item.id?.toString().startsWith("temp-") || !eventTitle
          ? "새로운 이벤트"
          : eventTitle;

      return {
        id: item.id,
        kind: "year",
        label: label,
        event: displayEvent,
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
  // 자동재생 기본값: 항상 off
  // 부모에서 prop으로 전달되면 그것을 사용, 없으면 내부 상태 사용
  const [internalAutoSlideEnabled, setInternalAutoSlideEnabled] =
    useState(false);
  const autoSlideEnabled =
    propAutoSlideEnabled !== undefined
      ? propAutoSlideEnabled
      : internalAutoSlideEnabled;
  const setAutoSlideEnabled = (value) => {
    if (onAutoSlideEnabledChange) {
      onAutoSlideEnabledChange(value);
    } else {
      setInternalAutoSlideEnabled(value);
    }
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 이미지 인덱스
  const [targetImageSlotIndex, setTargetImageSlotIndex] = useState(null); // 이미지를 추가할 슬롯 인덱스
  const targetImageSlotIndexRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const itemImageInputRef = useRef(null);
  const isNavigatingRef = useRef(false); // 외부에서 명시적으로 이동 중인지 추적
  const activeItemIdRef = useRef(null); // 현재 활성화된 항목의 ID 추적
  const editingDateItemIdRef = useRef(null); // 날짜 입력 중인 항목의 ID 추적 (useMemo에서 사용)
  const originalDateRef = useRef(null); // 날짜 입력 시작 시 원래 날짜 저장
  const editingItemIdRef = useRef(null); // 현재 날짜를 수정 중인 항목의 ID 저장
  const pendingSortItemIdRef = useRef(null); // 정렬 후 이동할 항목의 ID 저장
  const latestItemsRef = useRef(null); // onChange에서 업데이트한 최신 items 저장
  const activeIdxRef = useRef(0); // 자동 슬라이드를 위한 ref
  const rotationRef = useRef(0); // 자동 슬라이드를 위한 rotation ref
  const currentImageIndexRef = useRef(0); // 자동 슬라이드를 위한 currentImageIndex ref

  // activeIdx와 rotation이 변경될 때 ref 업데이트
  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    if (!editingDateItemId && data.items && data.items.length > 0) {
      const itemsWithYear = data.items.map((item) => {
        const [y] = (item.date || "").split(".");
        const year = y ? parseInt(y, 10) : 0;
        return { ...item, year };
      });

      const isSorted = itemsWithYear.every((item, index) => {
        if (index === 0) return true;
        const prev = itemsWithYear[index - 1];
        if (!prev.year && !item.year) return true;
        if (!prev.year) return false;
        if (!item.year) return true;
        return prev.year <= item.year;
      });

      if (!isSorted) {
        itemsWithYear.sort((a, b) => {
          if (!a.year && !b.year) return 0;
          if (!a.year) return 1;
          if (!b.year) return -1;
          return a.year - b.year;
        });

        const sortedItems = itemsWithYear.map(({ year, ...item }) => item);
        onDataChange?.({ ...data, items: sortedItems });
      }
    }
  }, [data.items, editingDateItemId]);

  useEffect(() => {
    if (pendingSortItemIdRef.current && !editingDateItemId) {
      const itemId = pendingSortItemIdRef.current;
      const targetIdx = timeline.findIndex((item) => item.id === itemId);
      if (targetIdx !== -1 && targetIdx !== activeIdx) {
        setActiveIdx(targetIdx);
        const targetAngle = angleForIndex(targetIdx);
        setRotation(targetAngle - getAnchor());
      }
      pendingSortItemIdRef.current = null;
    }
  }, [timeline, editingDateItemId, activeIdx]);

  useEffect(() => {
    currentImageIndexRef.current = currentImageIndex;
  }, [currentImageIndex]);

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
        console.error("BG 재생 실패:", err);
      });
      setIsBgmPlaying(true);
    }
  };

  const isMobile = useIsMobile(1000);
  const isPcShell = typeof width === "number" && width <= 932;
  const DESKTOP = { START: 0, SWEEP: 120, RADIUS: 205, ANCHOR: 0 };
  const MOBILE = { START: 110, SWEEP: 180, RADIUS: 140, ANCHOR: 110 };
  const CFG = isPcShell ? DESKTOP : isMobile ? MOBILE : DESKTOP;
  const RADIUS = CFG.RADIUS;
  const getAnchor = () => CFG.ANCHOR;

  // isEditing이 변경될 때 autoSlideEnabled 업데이트 (edit 모드에서는 항상 off)
  useEffect(() => {
    if (isEditing) {
      setAutoSlideEnabled(false);
    }
    // view 모드에서는 사용자가 변경한 상태를 유지하므로 여기서는 변경하지 않음
  }, [isEditing]);

  const angleForIndex = (i) => {
    const FIXED_STEP = 23;
    return CFG.START + FIXED_STEP * i;
  };

  const getOpacityForAngle = (angle, anchor = getAnchor()) => {
    let diff = Math.abs(norm360(angle) - norm360(anchor));
    if (diff > 180) diff = 360 - diff;

    const normalizedDiff = Math.min(diff / 90, 1);
    const opacity = 1 - normalizedDiff * normalizedDiff * 2;
    return Math.max(opacity, 0);
  };

  useEffect(() => {
    if (activeItem?.id) {
      activeItemIdRef.current = activeItem.id;
    }
  }, [activeItem?.id]);

  useEffect(() => {
    if (!isNavigatingRef.current && activeItemIdRef.current) {
      const newIdx = timeline.findIndex(
        (item) => item.id === activeItemIdRef.current,
      );
      if (newIdx !== -1 && newIdx !== activeIdx) {
        setActiveIdx(newIdx);
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
    if (
      onNavigateToItem !== undefined &&
      onNavigateToItem !== null &&
      timeline.length > 0
    ) {
      isNavigatingRef.current = true; // 외부 이동 시작
      const targetIdx = Math.max(
        0,
        Math.min(onNavigateToItem, timeline.length - 1),
      );

      if (timeline[targetIdx] && targetIdx !== activeIdx) {
        snapToIndex(targetIdx);
      }
      // 이동 완료 후 플래그 리셋
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [onNavigateToItem, timeline.length]);

  useEffect(() => {
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
    const currentBase = angleForIndex(activeIdx);
    const currentRotation = rotationRef.current || rotation;

    // 인덱스가 증가하면 반시계 방향(음수), 감소하면 시계 방향(양수)
    // 각도 차이를 계산
    const angleDiff = base - currentBase;

    // 인덱스 방향 확인
    const isForward = i > activeIdx;

    // -180~180 범위로 정규화하여 가장 짧은 경로 선택
    const normalizedDiff = wrapTo180(angleDiff);

    // 정규화된 값과 원래 값의 절댓값 비교
    const absNormalized = Math.abs(normalizedDiff);
    const absRaw = Math.abs(angleDiff);

    // 더 작은 절댓값을 가진 방향 선택
    let finalDiff;
    if (absNormalized <= absRaw && absNormalized <= 180) {
      finalDiff = normalizedDiff;
    } else {
      finalDiff = angleDiff;
    }

    // 인덱스 방향에 따라 delta 결정
    // 인덱스 증가(앞으로): 반시계 방향(음수) → delta는 음수
    // 인덱스 감소(뒤로): 시계 방향(양수) → delta는 양수
    let delta;
    if (isForward) {
      // 앞으로: 반시계 방향 (음수)
      delta = -Math.abs(finalDiff);
    } else {
      // 뒤로: 시계 방향 (양수)
      delta = Math.abs(finalDiff);
    }

    if (reverse) delta = -delta;

    const newRotation = currentRotation + delta;

    // main과 event 간 이동 로그
    const currentItem = timeline[activeIdx];
    const targetItem = timeline[i];
    const currentKind = currentItem?.kind || "unknown";
    const targetKind = targetItem?.kind || "unknown";

    if (
      currentKind !== targetKind ||
      currentKind === "main" ||
      targetKind === "main"
    ) {
      console.log("[snapToIndex] 이동:", {
        from: `${currentKind} (idx: ${activeIdx})`,
        to: `${targetKind} (idx: ${i})`,
        isForward,
        angleDiff: angleDiff.toFixed(2),
        normalizedDiff: normalizedDiff.toFixed(2),
        finalDiff: finalDiff.toFixed(2),
        delta: delta.toFixed(2),
        currentRotation: currentRotation.toFixed(2),
        newRotation: newRotation.toFixed(2),
      });
    }

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
    setRotation(newRotation);
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

  const STEP = 8;
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

  const handleKeyDown = useCallback(
    (e) => {
      if (
        isEditing ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();

        let nextIdx;
        if (e.key === "ArrowUp") {
          if (activeIdx <= 0) return;
          nextIdx = activeIdx - 1;
        } else {
          if (activeIdx >= timeline.length - 1) return;
          nextIdx = activeIdx + 1;
        }

        if (scrollSound.current) {
          scrollSound.current.currentTime = 0;
          scrollSound.current.play();
        }

        snapToIndex(nextIdx);
      } else if (e.key === "Home" || e.key === "h" || e.key === "H") {
        // Home 키 또는 H 키로 main 이벤트로 이동
        e.preventDefault();

        const mainIdx = timeline.findIndex((it) => it.kind === "main");
        if (mainIdx !== -1 && mainIdx !== activeIdx) {
          if (scrollSound.current) {
            scrollSound.current.currentTime = 0;
            scrollSound.current.play();
          }
          snapToIndex(mainIdx);
        }
      }
    },
    [isEditing, activeIdx, timeline, snapToIndex],
  );

  useEffect(() => {
    scrollSound.current = new Audio("/sounds/scroll.m4a");
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isEditing || !autoSlideEnabled || timeline.length === 0) return;

    let timeoutId = null;

    const scheduleNext = () => {
      const currentIdx = activeIdxRef.current;
      const currentItem = timeline[currentIdx];

      // main일 때는 7초, 그 외에는 5초
      const delay = currentItem?.kind === "main" ? 7000 : 5000;

      timeoutId = setTimeout(() => {
        const currentIdx = activeIdxRef.current;
        const currentItem = timeline[currentIdx];

        const validImages = (currentItem?.images || []).filter((img) => img);

        if (validImages.length > 1) {
          const currentImgIdx = currentImageIndexRef.current;
          if (currentImgIdx < validImages.length - 1) {
            setCurrentImageIndex(currentImgIdx + 1);
          } else {
            let newIdx;
            if (currentIdx >= timeline.length - 1) {
              newIdx = 0;
            } else {
              newIdx = currentIdx + 1;
            }
            snapToIndex(newIdx, getAnchor(), false, true);
          }
        } else {
          let newIdx;
          if (currentIdx >= timeline.length - 1) {
            newIdx = 0;
          } else {
            newIdx = currentIdx + 1;
          }
          snapToIndex(newIdx, getAnchor(), false, true);
        }

        // 다음 슬라이드를 위해 재귀 호출
        scheduleNext();
      }, delay);
    };

    // 첫 번째 슬라이드 시작
    scheduleNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isEditing, autoSlideEnabled, timeline.length]);

  const safeIdx = Math.min(activeIdx, Math.max(0, (timeline?.length || 1) - 1));
  const mainTitle = useMemo(() => {
    const mainItem = timeline.find((it) => it.kind === "main");
    return mainItem?.title || "사용자의 이야기";
  }, [timeline]);

  // Home 버튼 클릭 핸들러
  const handleHomeClick = () => {
    const mainIdx = timeline.findIndex((it) => it.kind === "main");
    if (mainIdx !== -1 && mainIdx !== activeIdx) {
      if (scrollSound.current) {
        scrollSound.current.currentTime = 0;
        scrollSound.current.play();
      }
      snapToIndex(mainIdx);
    }
  };

  const isAtHome = activeItem?.kind === "main";
  console.log(activeItem);
  const defaultPageTitle = "Life-\nRecords";
  const defaultPageSubtitle = `${data.record?.userName || "사용자"}님의 라이프 레코드입니다.\n"작은 장면을 모아 긴 기억을 만듭니다"`;
  const pageTitle = data.record?.pageTitle || "";
  const pageSubtitle = data.record?.pageSubtitle || "";

  return (
    <main
      className={`lr-page ${isEditing ? "lr-page--editing" : ""} ${
        width <= 932 ? "pc-shell" : ""
      }`}
      style={{ ["--bg"]: theme.bg, ["--text"]: theme.text }}
    >
      <ControlButtons
        isEditing={isEditing}
        autoSlideEnabled={autoSlideEnabled}
        onAutoSlideEnabledChange={setAutoSlideEnabled}
        bgmUrl={data.record?.bgm}
        isBgmPlaying={isBgmPlaying}
        onBgmToggle={handleBgmToggle}
        theme={theme}
        isMobile={isMobile}
        onHomeClick={handleHomeClick}
        isAtHome={isAtHome}
      />

      <div className="lr-grid">
        <section className="lr-left">
          {isEditing ? (
            <>
              <textarea
                maxLength={20}
                className="lr-title-input"
                rows={4}
                value={pageTitle}
                placeholder={defaultPageTitle}
                onChange={(e) => {
                  const newData = {
                    ...data,
                    record: {
                      ...data.record,
                      pageTitle: e.target.value,
                    },
                  };
                  onDataChange?.(newData);
                }}
              />
              <textarea
                maxLength={100}
                className="lr-sub-input"
                rows={3}
                value={pageSubtitle}
                placeholder={defaultPageSubtitle}
                onChange={(e) => {
                  const newData = {
                    ...data,
                    record: {
                      ...data.record,
                      pageSubtitle: e.target.value,
                    },
                  };
                  onDataChange?.(newData);
                }}
              />
            </>
          ) : (
            <>
              <h1 className="lr-title" style={{ whiteSpace: "pre-line" }}>
                {pageTitle || defaultPageTitle}
              </h1>
              <p className="lr-sub" style={{ whiteSpace: "pre-line" }}>
                {pageSubtitle || defaultPageSubtitle}
              </p>
            </>
          )}
        </section>

        <section className="lr-center">
          <article
            className={`lr-card ${
              activeItem?.kind === "main" ? "lr-card--main" : ""
            }`}
          >
            <div
              key={activeIdx}
              className="card-fade"
              style={{ position: "relative" }}
            >
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
                    multiple={activeItem.kind !== "main"}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0 && onImageChange) {
                        if (activeItem.kind === "main") {
                          onImageChange("main", null, files[0]);
                        } else {
                          const dataSlot =
                            e.target.getAttribute("data-target-slot");
                          const slotIdx =
                            dataSlot !== null && dataSlot !== ""
                              ? parseInt(dataSlot, 10)
                              : targetImageSlotIndexRef.current !== null &&
                                  targetImageSlotIndexRef.current !== undefined
                                ? targetImageSlotIndexRef.current
                                : targetImageSlotIndex !== null &&
                                    targetImageSlotIndex !== undefined
                                  ? targetImageSlotIndex
                                  : null;
                          console.log("[ONCHANGE] === FILE SELECTED ===");
                          console.log(
                            "[ONCHANGE] targetImageSlotIndex (state):",
                            targetImageSlotIndex,
                          );
                          console.log(
                            "[ONCHANGE] targetImageSlotIndex (ref):",
                            targetImageSlotIndexRef.current,
                          );
                          console.log("[ONCHANGE] data-target-slot:", dataSlot);
                          console.log(
                            "[ONCHANGE] Using slotIdx:",
                            slotIdx,
                            "type:",
                            typeof slotIdx,
                          );
                          console.log(
                            "[ONCHANGE] slotIdx check:",
                            slotIdx !== null,
                            slotIdx !== undefined,
                            !isNaN(slotIdx),
                          );
                          if (
                            slotIdx !== null &&
                            slotIdx !== undefined &&
                            !isNaN(slotIdx) &&
                            slotIdx >= 0 &&
                            slotIdx < 5
                          ) {
                            console.log(
                              "[ONCHANGE] ✓ Calling onImageChange with targetSlotIndex:",
                              slotIdx,
                            );
                            onImageChange(
                              "item",
                              activeItem.id,
                              files[0],
                              slotIdx,
                            );
                            setTimeout(() => {
                              setTargetImageSlotIndex(null);
                              targetImageSlotIndexRef.current = null;
                              e.target.removeAttribute("data-target-slot");
                            }, 100);
                          } else {
                            console.log(
                              "[ONCHANGE] ✗ No targetSlotIndex, adding to empty slot",
                            );
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
                      <img
                        src={activeItem.cover || "/images/records/No image.png"}
                        alt="cover"
                        className="lr-cover"
                        onError={(e) => {
                          e.target.src = "/images/records/No image.png";
                        }}
                      />
                    ) : isEditing ? (
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
                                  <div
                                    onClick={(e) => {
                                      if (!cropState.isActive && isEditing) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        // 이미지 추가 모달 열기
                                        if (
                                          onImageModalOpen &&
                                          activeItem.kind !== "main"
                                        ) {
                                          onImageModalOpen(activeItem.id);
                                        } else {
                                          // 모달이 없으면 기존 방식 사용
                                          console.log(
                                            "[CLICK] === IMAGE CHANGE CLICKED ===",
                                          );
                                          console.log(
                                            "[CLICK] Setting targetImageSlotIndex to:",
                                            idx,
                                            "type:",
                                            typeof idx,
                                          );
                                          // ref에 먼저 저장 (동기적)
                                          targetImageSlotIndexRef.current = idx;
                                          setTargetImageSlotIndex(idx);
                                          // 파일 입력에 data attribute로도 저장
                                          if (itemImageInputRef.current) {
                                            itemImageInputRef.current.setAttribute(
                                              "data-target-slot",
                                              String(idx),
                                            );
                                            console.log(
                                              "[CLICK] Set data-target-slot to:",
                                              itemImageInputRef.current.getAttribute(
                                                "data-target-slot",
                                              ),
                                            );
                                          } else {
                                            console.log(
                                              "[CLICK] ERROR: itemImageInputRef.current is null!",
                                            );
                                          }
                                          // 약간의 지연 후 클릭 (상태 업데이트 보장)
                                          requestAnimationFrame(() => {
                                            console.log(
                                              "[CLICK] Opening file dialog, ref value:",
                                              targetImageSlotIndexRef.current,
                                            );
                                            itemImageInputRef.current?.click();
                                          });
                                        }
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      position: "relative",
                                      cursor:
                                        cropState.isActive || !isEditing
                                          ? "default"
                                          : "pointer",
                                    }}
                                  >
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
                                    {isEditing && !cropState.isActive && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          background: "rgba(0, 0, 0, 0)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          transition: "background 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background =
                                            "rgba(0, 0, 0, 0.5)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background =
                                            "rgba(0, 0, 0, 0)";
                                        }}
                                      >
                                        <span
                                          style={{
                                            opacity: 0,
                                            color: "#fff",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            transition: "opacity 0.2s",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = "1";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = "0";
                                          }}
                                        >
                                          이미지 변경
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    onClick={(e) => {
                                      if (!cropState.isActive && isEditing) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        // 이미지 추가 모달 열기
                                        if (
                                          onImageModalOpen &&
                                          activeItem.kind !== "main"
                                        ) {
                                          onImageModalOpen(activeItem.id);
                                        } else {
                                          // 모달이 없으면 기존 방식 사용
                                          console.log(
                                            "[CLICK] === EMPTY SLOT CLICKED ===",
                                          );
                                          console.log(
                                            "[CLICK] Setting targetImageSlotIndex to:",
                                            idx,
                                          );
                                          targetImageSlotIndexRef.current = idx;
                                          setTargetImageSlotIndex(idx);
                                          if (itemImageInputRef.current) {
                                            itemImageInputRef.current.setAttribute(
                                              "data-target-slot",
                                              String(idx),
                                            );
                                          }
                                          requestAnimationFrame(() => {
                                            itemImageInputRef.current?.click();
                                          });
                                        }
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
                              background: "transparent",
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
                              filter:
                                "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                            }}
                            aria-label="이전 이미지"
                          >
                            <IoIosArrowDropleftCircle size={30} />
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
                              background: "transparent",
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
                              filter:
                                "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                            }}
                            aria-label="다음 이미지"
                          >
                            <IoIosArrowDroprightCircle size={30} />
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
                            <>
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
                                {/* 좌우 화살표 */}
                                {currentImageIndex > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex(
                                        currentImageIndex - 1,
                                      );
                                    }}
                                    style={{
                                      position: "absolute",
                                      left: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      background: "transparent",
                                      border: "none",
                                      color: "white",
                                      width: "auto",
                                      height: "auto",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      zIndex: 2,
                                      filter:
                                        "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                                    }}
                                    aria-label="이전 이미지"
                                  >
                                    <IoIosArrowDropleftCircle
                                      size={30}
                                      color="white"
                                    />
                                  </button>
                                )}
                                {currentImageIndex < validImages.length - 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex(
                                        currentImageIndex + 1,
                                      );
                                    }}
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      background: "transparent",
                                      border: "none",
                                      color: "white",
                                      width: "auto",
                                      height: "auto",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      zIndex: 2,
                                      filter:
                                        "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                                    }}
                                    aria-label="다음 이미지"
                                  >
                                    <IoIosArrowDroprightCircle
                                      size={30}
                                      color="white"
                                    />
                                  </button>
                                )}
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
                            </>
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
                    {/* {((activeItem.kind === "main" && activeItem.cover) ||
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
                                // 현재 보이는 이미지 인덱스를 targetSlotIndex로 설정
                                console.log(
                                  "[BUTTON CLICK] Setting targetSlotIndex to currentImageIndex:",
                                  currentImageIndex,
                                );
                                targetImageSlotIndexRef.current =
                                  currentImageIndex;
                                setTargetImageSlotIndex(currentImageIndex);
                                if (itemImageInputRef.current) {
                                  itemImageInputRef.current.setAttribute(
                                    "data-target-slot",
                                    String(currentImageIndex),
                                  );
                                }
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
                    )} */}
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
                          maxLength={250}
                          placeholder="이 레코드에 대한 간단한 소개를 적어보세요 (최대 250자)"
                        />
                        <div className="lr-char-count">
                          {(data.record?.description || "").length} / 250
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
                          maxLength={250}
                          placeholder="이 순간에 대한 이야기를 자유롭게 적어보세요 (최대 250자)"
                        />
                        <div className="lr-char-count">
                          {
                            (
                              data.items?.find(
                                (item) => item.id === activeItem.id,
                              )?.description || ""
                            ).length
                          }{" "}
                          / 250
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
                      <div
                        className="lr-date-location"
                        onMouseDown={(e) => {
                          if (e.target.tagName === "INPUT") {
                            e.stopPropagation();
                          }
                        }}
                        onClick={(e) => {
                          if (e.target.tagName === "INPUT") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={
                                data.items?.find(
                                  (item) => item.id === activeItem.id,
                                )?.date || ""
                              }
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                console.log("=== INPUT BOX CLICK ===");
                                console.log(
                                  "data.items:",
                                  data.items?.map((item) => ({
                                    id: item.id,
                                    date: item.date,
                                  })),
                                );
                                console.log(
                                  "latestItemsRef.current:",
                                  latestItemsRef.current?.map((item) => ({
                                    id: item.id,
                                    date: item.date,
                                  })),
                                );

                                const allItems = data.items || [];
                                const latestItems =
                                  latestItemsRef.current || [];
                                const itemsMap = new Map();
                                allItems.forEach((item) => {
                                  itemsMap.set(item.id, item);
                                });
                                latestItems.forEach((item) => {
                                  itemsMap.set(item.id, item);
                                });
                                const mergedItems = Array.from(
                                  itemsMap.values(),
                                );
                                console.log(
                                  "mergedItems:",
                                  mergedItems.map((item) => ({
                                    id: item.id,
                                    date: item.date,
                                  })),
                                );

                                const sortedCheck = [...mergedItems].map(
                                  (item) => {
                                    const [y] = (item.date || "").split(".");
                                    const year = y ? parseInt(y, 10) : 0;
                                    return { ...item, year };
                                  },
                                );
                                sortedCheck.sort((a, b) => {
                                  if (!a.year && !b.year) return 0;
                                  if (!a.year) return 1;
                                  if (!b.year) return -1;
                                  return a.year - b.year;
                                });
                                console.log(
                                  "should be sorted as:",
                                  sortedCheck.map((item) => ({
                                    id: item.id,
                                    date: item.date,
                                    year: item.year,
                                  })),
                                );

                                if (activeItem?.id) {
                                  const currentItem = data.items?.find(
                                    (item) => item.id === activeItem.id,
                                  );
                                  originalDateRef.current =
                                    currentItem?.date || "";
                                  editingItemIdRef.current = activeItem.id;
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onMouseUp={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => {
                                const newItems = data.items.map((item) =>
                                  item.id === activeItem.id
                                    ? { ...item, date: e.target.value }
                                    : item,
                                );
                                latestItemsRef.current = newItems;
                                onDataChange?.({ ...data, items: newItems });
                              }}
                              onFocus={(e) => {
                                e.stopPropagation();
                                if (
                                  activeItem?.id &&
                                  editingItemIdRef.current
                                ) {
                                  setEditingDateItemId(
                                    editingItemIdRef.current,
                                  );
                                  editingDateItemIdRef.current =
                                    editingItemIdRef.current;
                                }
                              }}
                              onBlur={() => {
                                const editingItemId = editingItemIdRef.current;
                                console.log("=== DATE INPUT BLUR ===");

                                if (editingItemId) {
                                  const itemsToCheck =
                                    latestItemsRef.current || data.items || [];
                                  const currentItem = itemsToCheck.find(
                                    (item) => item.id === editingItemId,
                                  );
                                  const currentDate = currentItem?.date || "";
                                  const originalDate =
                                    originalDateRef.current || "";

                                  if (currentDate !== originalDate) {
                                    setEditingDateItemId(null);
                                    editingDateItemIdRef.current = null;
                                    originalDateRef.current = null;
                                    editingItemIdRef.current = null;
                                    console.log("=== SORTING ON BLUR ===");

                                    const latestItems =
                                      latestItemsRef.current || [];
                                    const allItems = data.items || [];
                                    const itemsMap = new Map();

                                    allItems.forEach((item) => {
                                      itemsMap.set(item.id, item);
                                    });

                                    latestItems.forEach((item) => {
                                      itemsMap.set(item.id, item);
                                    });

                                    const itemsToSort = Array.from(
                                      itemsMap.values(),
                                    );
                                    console.log(
                                      "itemsToSort:",
                                      itemsToSort.map((item) => ({
                                        id: item.id,
                                        date: item.date,
                                      })),
                                    );

                                    const sortedItems = [...itemsToSort].map(
                                      (item) => {
                                        const [y] = (item.date || "").split(
                                          ".",
                                        );
                                        const year = y ? parseInt(y, 10) : 0;
                                        return {
                                          ...item,
                                          year: year,
                                        };
                                      },
                                    );

                                    sortedItems.sort((a, b) => {
                                      if (!a.year && !b.year) return 0;
                                      if (!a.year) return 1;
                                      if (!b.year) return -1;
                                      return a.year - b.year;
                                    });

                                    const sortedItemsWithoutYear =
                                      sortedItems.map(
                                        ({ year, ...item }) => item,
                                      );

                                    pendingSortItemIdRef.current =
                                      editingItemId;

                                    console.log(
                                      "sortedItems:",
                                      sortedItems.map((item) => ({
                                        id: item.id,
                                        date: item.date,
                                        year: item.year,
                                      })),
                                    );

                                    onDataChange?.({
                                      ...data,
                                      items: sortedItemsWithoutYear,
                                    });
                                  } else {
                                    setEditingDateItemId(null);
                                    originalDateRef.current = null;
                                    editingItemIdRef.current = null;
                                  }
                                }
                              }}
                              placeholder="예: 2024.01.15"
                              className="lr-date-input"
                              style={{
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
                <>
                  <div className="lr-highlight-grid" role="list">
                    {timeline
                      .filter((it) => it.isHighlight)
                      .slice(0, 10)
                      .map((it) => {
                        let dateLabel = "";
                        if (it.date) {
                          if (displayMode === "age" && data.record?.birthDate) {
                            const age = calculateAge(
                              data.record.birthDate,
                              it.date,
                            );
                            if (age !== null) {
                              dateLabel = `${age}세`;
                            }
                          } else {
                            const year = getYear(it.date);
                            if (year) {
                              dateLabel = year.trim();
                            }
                          }
                        }
                        return (
                          <div
                            key={it.id}
                            className="lr-highlight-item"
                            role="listitem"
                            title={
                              (it.kind === "year" ? it.event : it.title) ||
                              "하이라이트"
                            }
                            onClick={() => {
                              const i = timeline.findIndex(
                                (x) => x.id === it.id,
                              );
                              if (i >= 0) snapToIndex(i);
                            }}
                          >
                            <div className="lr-highlight-image-wrapper">
                              <img
                                src={it.cover || "/images/records/No image.png"}
                                alt={
                                  (it.kind === "year" ? it.event : it.title) ||
                                  "highlight"
                                }
                              />
                            </div>
                            <span className="lr-highlight-title">
                              {it.kind === "year" ? it.event : it.title}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="lr-highlight-timeline">
                    <div className="lr-timeline-line"></div>
                    <div className="lr-timeline-markers">
                      {timeline
                        .filter((it) => it.isHighlight)
                        .slice(0, 10)
                        .map((it, index) => {
                          const colIndex = index % 5;

                          let dateLabel = "";
                          if (it.date) {
                            if (
                              displayMode === "age" &&
                              data.record?.birthDate
                            ) {
                              const age = calculateAge(
                                data.record.birthDate,
                                it.date,
                              );
                              if (age !== null) {
                                dateLabel = `${age}세`;
                              }
                            } else {
                              const year = getYear(it.date);
                              if (year) {
                                dateLabel = year.trim();
                              }
                            }
                          }
                          return (
                            <div
                              key={it.id}
                              className="lr-timeline-marker"
                              style={{
                                gridColumn: colIndex + 1,
                              }}
                              onClick={() => {
                                const i = timeline.findIndex(
                                  (x) => x.id === it.id,
                                );
                                if (i >= 0) snapToIndex(i);
                              }}
                            >
                              <div className="lr-timeline-connector"></div>
                              <div className="lr-timeline-dot"></div>
                              {it.date && (
                                <div className="lr-timeline-date">
                                  {displayMode === "age" &&
                                  data.record?.birthDate
                                    ? (() => {
                                        const age = calculateAge(
                                          data.record.birthDate,
                                          it.date,
                                        );
                                        return age !== null ? `${age}세` : "";
                                      })()
                                    : (() => {
                                        const year = getYear(it.date);
                                        return year ? year.trim() : "";
                                      })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
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
              style={{ transform: `rotate(${norm360(rotation)}deg)` }}
            />
            <div className="year-circle">
              {timeline.map((item, i) => {
                const baseAngle = angleForIndex(i);
                const phi = baseAngle + rotation;
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
