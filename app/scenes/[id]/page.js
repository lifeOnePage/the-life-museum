"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { TbRefresh, TbRefreshOff } from "react-icons/tb";
import { MdLock, MdLockOpen } from "react-icons/md";
import Pannel from "./components/Pannel";
import SceneRing from "./components/SceneRing";
import ExhibitionRing from "./components/ExhibitionRing";
import ProfileDetailScreen from "./components/ProfileDetailScreen";
import RingSlider from "./components/RingSlider";
import ProfileCurtain from "./components/ProfileCurtain";
import {
  buildTextureData,
  ensureMinimumTextures,
} from "./utils/textureBuilder";
import { getScene } from "./services/sceneService";

export default function ViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, signout } = useAuth();
  const [mode, setMode] = useState("view");
  const [leftIndex, setLeftIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileCurtainOpen, setIsProfileCurtainOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isExhibitionMode, setIsExhibitionMode] = useState(false);
  const [exhibitionInterval, setExhibitionInterval] = useState(5000); // 기본 5초
  const [showControls, setShowControls] = useState(true); // X 버튼 표시 여부
  const [isDarkMode, setIsDarkMode] = useState(true); // 다크모드 기본값
  const [exhibitionScreen, setExhibitionScreen] = useState("ring"); // "ring" | "profile-detail"
  const [exhibitionCurrentIndex, setExhibitionCurrentIndex] = useState(0); // 전시 모드 링 인덱스
  const [enableProfileSwitch, setEnableProfileSwitch] = useState(true); // 프로필 전환 활성화 여부
  const [lockedItemId, setLockedItemId] = useState(null); // 잠금된 아이템 ID (모바일 타임라인용)
  const [curtainY, setCurtainY] = useState(0); // 모바일 커튼 Y 위치 (0 = 내려옴, -100 = 올라감)
  const [desktopCurtainY, setDesktopCurtainY] = useState(-100); // 데스크탑 프로필 커튼 Y 위치 (0 = 내려옴, -100 = 올라감)
  const [showPlayTooltip, setShowPlayTooltip] = useState(false); // 플레이 버튼 툴팁
  const [showProfileTooltip, setShowProfileTooltip] = useState(false); // 프로필 버튼 툴팁
  const [showCurtain, setShowCurtain] = useState(true); // 모바일 커튼 표시 여부
  const [showEditTooltip, setShowEditTooltip] = useState(false); // 에딧 토글 버튼 툴팁 표시 여부
  const curtainDragRef = useRef({
    isDragging: false,
    startY: 0,
    startCurtainY: 0,
  });
  const desktopCurtainDragRef = useRef({
    isDragging: false,
    startY: 0,
    startCurtainY: 0,
  });
  const idleTimerRef = useRef(null);
  const screenSwitchTimerRef = useRef(null);

  // items와 profile state 관리
  const [items, setItems] = useState([
    // 프로필 아이템을 첫 번째로 고정
    {
      id: "profile",
      title: "대표 타이틀",
      date: "",
      isProfile: true,
    },
    // 기본 이벤트 아이템 하나 추가
    {
      id: "item-0",
      title: "첫 번째 이벤트",
      date: "",
      img: [],
    },
  ]);
  const [profile, setProfile] = useState({
    photo: "",
    name: "",
    birthDate: "",
    birthPlace: "",
    biography: "",
    recordFormat: "entire-life", // "entire-life" | "specific-event"
  });

  // 로그인/로그아웃/마이페이지 핸들러
  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await signout();
  };

  const handleMypage = () => {
    router.push("/mypage");
  };

  // Scene 데이터 로드 및 소유자 확인
  useEffect(() => {
    const loadScene = async () => {
      try {
        setLoading(true);
        const sceneData = await getScene(id);

        // 소유자 확인: sceneData.userId와 현재 로그인한 user.id 비교
        if (user && sceneData.userId && user.id === sceneData.userId) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }

        // 프로필 데이터 설정
        setProfile({
          photo: sceneData.profilePhoto || "",
          name: sceneData.profileName || "",
          birthDate: sceneData.profileBirthDate || "",
          birthPlace: sceneData.profileBirthPlace || "",
          biography: sceneData.profileBiography || "",
          recordFormat: sceneData.profileRecordFormat || "entire-life",
        });

        // 아이템 데이터가 있으면 설정, 없으면 기본 아이템 유지
        if (sceneData.items && sceneData.items.length > 0) {
          setItems([
            {
              id: "profile",
              title: "대표 타이틀",
              date: "",
              isProfile: true,
            },
            ...sceneData.items.map((item) => ({
              id: `item-${item.id}`,
              title: item.title || "",
              date: item.date || "",
              desc: item.desc || "",
              img: item.images?.map((img) => img.url) || [],
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to load scene:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadScene();
    }
  }, [id, user]);

  // 프록시 함수 (이미지/비디오 URL 처리)
  const proxify = (u) => {
    try {
      if (!u) return u;
      const abs = new URL(
        u,
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost",
      );
      if (
        typeof window !== "undefined" &&
        abs.origin === window.location.origin
      )
        return u;
      if (abs.protocol === "http:" || abs.protocol === "https:") {
        return `/api/proxy?url=${encodeURIComponent(abs.href)}`;
      }
      return u;
    } catch {
      return u;
    }
  };

  // 전시 모드에서 마우스 idle 감지
  useEffect(() => {
    if (!isExhibitionMode) {
      setShowControls(true);
      return;
    }

    const handleMouseMove = () => {
      setShowControls(true);

      // 기존 타이머 클리어
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // 3초 후 컨트롤 숨기기
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 초기 타이머 설정
    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isExhibitionMode]);

  // 전시 모드에서 화면 전환 (링 ↔ 프로필 상세)
  useEffect(() => {
    if (!isExhibitionMode || !enableProfileSwitch) {
      setExhibitionScreen("ring");
      return;
    }

    // 15초마다 화면 전환
    const switchScreen = () => {
      setExhibitionScreen((prev) =>
        prev === "ring" ? "profile-detail" : "ring",
      );
    };

    screenSwitchTimerRef.current = setInterval(switchScreen, 15000);

    return () => {
      if (screenSwitchTimerRef.current) {
        clearInterval(screenSwitchTimerRef.current);
      }
    };
  }, [isExhibitionMode, enableProfileSwitch]);

  // 텍스쳐 데이터 빌드 - items와 profile 변경 시 리빌드
  const textureData = useMemo(() => {
    const { textures, itemRanges } = buildTextureData(profile, items);
    const paddedTextures = ensureMinimumTextures(textures, 100);

    return { textures: paddedTextures, itemRanges };
  }, [items, profile]);

  // 선택된 슬롯 (leftIndex에 해당)
  const selectedSlot = textureData.textures[leftIndex];

  // 마지막 컨텐츠 인덱스 찾기 (empty가 아닌 마지막)
  const lastContentIndex = useMemo(() => {
    for (let i = textureData.textures.length - 1; i >= 0; i--) {
      if (textureData.textures[i].kind !== 'empty') {
        return i;
      }
    }
    return 0;
  }, [textureData]);

  // 이미지 aspect ratio 상태
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

  // 이미지 로드 시 aspect ratio 계산
  const handleImageLoad = (e) => {
    const img = e.target;
    const aspect = img.naturalWidth / img.naturalHeight;
    setImageAspectRatio(aspect);
  };

  // 비디오 로드 시 aspect ratio 계산
  const handleVideoLoad = (e) => {
    const video = e.target;
    const aspect = video.videoWidth / video.videoHeight;
    setImageAspectRatio(aspect);
  };

  // leftIndex 변경 시 aspect ratio 리셋
  useEffect(() => {
    setImageAspectRatio(null);
  }, [leftIndex]);

  // 아이템 클릭 시 해당 아이템의 시작 미디어 인덱스로 이동 + 타임라인 스크롤
  const handleItemClick = useCallback(
    (item) => {
      // 수동 네비게이션 중에는 아이템 클릭 무시
      if (isManualNavigationRef.current) {
        return;
      }

      // 현재 선택된 아이템 찾기 (동적으로 계산)
      const currentSelectedItem = items.find((i) => {
        const range = textureData.itemRanges[i.id];
        if (!range) return false;
        return leftIndex >= range.start && leftIndex <= range.end;
      });

      // 이미 선택된 아이템을 다시 클릭하면 잠금 토글 (프로필 아이템 제외)
      if (
        currentSelectedItem &&
        currentSelectedItem.id === item.id &&
        !item.isProfile
      ) {
        if (lockedItemId === item.id) {
          setLockedItemId(null);
        } else {
          setLockedItemId(item.id);
        }
        return;
      }

      // 다른 아이템 클릭 시 잠금 해제 + 이동
      setLockedItemId(null);

      const itemRange = textureData.itemRanges[item.id];
      if (itemRange) {
        setLeftIndex(itemRange.start);
      }

      // 타임라인 스크롤 (모바일) - 프로그래매틱 스크롤 플래그 설정
      const itemElement = itemRefs.current[item.id];
      const timelineElement = timelineRef.current;
      if (itemElement && timelineElement) {
        // 스크롤 시작 플래그
        isTimelineScrollingRef.current = true;

        // 기존 타임아웃 클리어
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const timelineRect = timelineElement.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();
        const timelineCenterY = timelineRect.top + timelineRect.height / 2;
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const scrollOffset = itemCenterY - timelineCenterY;

        timelineElement.scrollBy({
          top: scrollOffset,
          behavior: "smooth",
        });

        // 스크롤 애니메이션 완료 후 플래그 해제 (일반적으로 300-500ms)
        scrollTimeoutRef.current = setTimeout(() => {
          isTimelineScrollingRef.current = false;
        }, 600);
      }
    },
    [textureData.itemRanges, leftIndex, items, lockedItemId],
  );

  // leftIndex에 해당하는 현재 아이템 찾기
  const currentItem = useMemo(() => {
    return items.find((item) => {
      const range = textureData.itemRanges[item.id];
      if (!range) return false;
      return leftIndex >= range.start && leftIndex <= range.end;
    });
  }, [leftIndex, items, textureData]);

  // 타임라인 중앙 아이템 자동 선택 및 opacity 계산 (모바일)
  const timelineRef = useRef(null);
  const itemRefs = useRef({});
  const [itemOpacities, setItemOpacities] = useState({});

  // 3D 링 드래그 상태 (모바일)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startIndex: 0,
  });

  // 프로그래매틱 스크롤 중인지 추적 (순환 참조 방지)
  const isTimelineScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleScroll = () => {
      const timelineRect = timeline.getBoundingClientRect();
      const centerY = timelineRect.top + timelineRect.height / 2;
      const maxDistance = Math.max(timelineRect.height / 2, 1); // 최소값 1로 보장하여 NaN 방지

      let closestItem = null;
      let closestDistance = Infinity;
      const newOpacities = {};

      items.forEach((item) => {
        const itemEl = itemRefs.current[item.id];
        if (!itemEl) return;

        const itemRect = itemEl.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);

        // 프로필 아이템은 opacity 계산 제외 (고정값 사용)
        if (!item.isProfile) {
          // 거리 기반 opacity 계산 (공기 원근) - 매우 강하게 적용
          const normalizedDistance = Math.min(distance / maxDistance, 1);
          // 거리에 따라 매우 급격하게 페이드: 낮은 지수로 중앙 외에는 거의 투명하게
          const fadeAmount = Math.pow(normalizedDistance, 0.4); // 0.4 지수로 매우 급격한 감소
          const opacity = Math.max(0.02, 1 - fadeAmount * 0.98);
          newOpacities[item.id] = opacity;
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      });

      setItemOpacities(newOpacities);

      // 프로그래매틱 스크롤 중이 아닐 때만 아이템 선택 (순환 참조 방지)
      if (
        !isTimelineScrollingRef.current &&
        closestItem &&
        closestItem.id !== currentItem?.id
      ) {
        handleItemClick(closestItem);
      }
    };

    timeline.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 실행

    return () => timeline.removeEventListener("scroll", handleScroll);
  }, [items, currentItem, handleItemClick]);

  // currentItem이 변경되면 타임라인 자동 스크롤 (드래그로 인한 변경 시)
  const prevItemRef = useRef(currentItem);
  useEffect(() => {
    if (
      currentItem &&
      prevItemRef.current?.id !== currentItem.id &&
      !currentItem.isProfile
    ) {
      const itemElement = itemRefs.current[currentItem.id];
      const timelineElement = timelineRef.current;

      if (itemElement && timelineElement) {
        // 스크롤 시작 플래그
        isTimelineScrollingRef.current = true;

        // 기존 타임아웃 클리어
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const timelineRect = timelineElement.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();
        const timelineCenterY = timelineRect.top + timelineRect.height / 2;
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const scrollOffset = itemCenterY - timelineCenterY;

        timelineElement.scrollBy({
          top: scrollOffset,
          behavior: "smooth",
        });

        // 스크롤 애니메이션 완료 후 플래그 해제
        scrollTimeoutRef.current = setTimeout(() => {
          isTimelineScrollingRef.current = false;
        }, 600);
      }
    }
    prevItemRef.current = currentItem;
  }, [currentItem]);

  // 3D 링 드래그 핸들러 (모바일)
  const handleRingPointerDown = (e) => {
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      startIndex: leftIndex,
    };
  };

  const handleRingPointerMove = (e) => {
    if (!dragStateRef.current.isDragging) return;

    // 드래그 민감도: 화면 너비/높이의 10% 이동 시 한 슬롯 이동
    const sensitivityX = window.innerWidth * 0.1;
    const sensitivityY = window.innerHeight * 0.1;

    // X축 델타 (좌우)
    const deltaX = e.clientX - dragStateRef.current.startX;
    const slotsDeltaX = -deltaX / sensitivityX;

    // Y축 델타 (상하)
    const deltaY = e.clientY - dragStateRef.current.startY;
    const slotsDeltaY = -deltaY / sensitivityY;

    // X와 Y 델타를 합산
    const totalSlotsDelta = slotsDeltaX + slotsDeltaY;
    const slotsDelta = Math.round(totalSlotsDelta);

    let newIndex = dragStateRef.current.startIndex + slotsDelta;

    // 잠금 상태일 때 범위 제한
    if (lockedItemId) {
      const lockedRange = textureData.itemRanges[lockedItemId];
      if (lockedRange) {
        newIndex = Math.max(
          lockedRange.start,
          Math.min(lockedRange.end, newIndex),
        );
      }
    } else {
      newIndex = Math.max(
        0,
        Math.min(textureData.textures.length - 1, newIndex),
      );
    }

    if (newIndex !== leftIndex) {
      setLeftIndex(newIndex);
    }
  };

  const handleRingPointerUp = () => {
    dragStateRef.current.isDragging = false;
  };

  // 수동 네비게이션 중인지 추적
  const isManualNavigationRef = useRef(false);
  const manualNavigationTimeoutRef = useRef(null);

  // SceneRing의 onLeftmostChange를 래핑하여 수동 네비게이션 중에는 무시
  const handleLeftmostChange = useCallback((newIndex) => {
    if (isManualNavigationRef.current) {
      return; // 수동 네비게이션 중에는 SceneRing의 콜백 무시
    }
    setLeftIndex(newIndex);
  }, []);

  // 잠금 토글 핸들러
  const handleToggleLock = useCallback(() => {
    if (!currentItem || currentItem.isProfile) {
      return;
    }

    // 수동 네비게이션 플래그 설정 (잠금 상태 변경 중 다른 로직 간섭 방지)
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    isManualNavigationRef.current = true;

    if (lockedItemId === currentItem.id) {
      // 잠금 해제 - leftIndex는 그대로 유지
      setLockedItemId(null);
    } else {
      // 잠금 설정 - 현재 아이템의 시작으로 이동
      const itemRange = textureData.itemRanges[currentItem.id];
      if (itemRange && leftIndex < itemRange.start) {
        setLeftIndex(itemRange.start);
      } else if (itemRange && leftIndex > itemRange.end) {
        setLeftIndex(itemRange.start);
      }
      setLockedItemId(currentItem.id);
    }

    // 플래그 해제
    manualNavigationTimeoutRef.current = setTimeout(() => {
      isManualNavigationRef.current = false;
    }, 1000);
  }, [currentItem, lockedItemId, leftIndex, textureData.itemRanges]);

  // 모바일 커튼 드래그 핸들러
  const handleCurtainPointerDown = (e) => {
    curtainDragRef.current = {
      isDragging: true,
      startY: e.clientY,
      startCurtainY: curtainY,
    };
  };

  const handleCurtainPointerMove = (e) => {
    if (!curtainDragRef.current.isDragging) return;

    const deltaY = e.clientY - curtainDragRef.current.startY;
    const curtainHeight = window.innerHeight;
    // 민감도 증가: 2.5배로 설정하여 더 가볍게 느껴지도록
    const deltaPercent = (deltaY / curtainHeight) * 100 * 2.5;

    let newCurtainY = curtainDragRef.current.startCurtainY + deltaPercent;

    // 범위 제한: -100% (완전히 올라감) ~ 0% (완전히 내려옴)
    newCurtainY = Math.max(-100, Math.min(0, newCurtainY));

    setCurtainY(newCurtainY);
  };

  const handleCurtainPointerUp = () => {
    if (!curtainDragRef.current.isDragging) return;
    curtainDragRef.current.isDragging = false;

    // 스냅: 25% 이상 올라갔으면 완전히 올리고, 아니면 다시 내림
    if (curtainY < -25) {
      setCurtainY(-100);
      // 커튼이 완전히 올라가면 숨김
      setTimeout(() => setShowCurtain(false), 300);
    } else {
      setCurtainY(0);
    }
  };

  // 데스크탑 커튼 드래그 핸들러
  const handleDesktopCurtainPointerDown = (e) => {
    desktopCurtainDragRef.current = {
      isDragging: true,
      startY: e.clientY,
      startCurtainY: desktopCurtainY,
    };
  };

  const handleDesktopCurtainPointerMove = (e) => {
    if (!desktopCurtainDragRef.current.isDragging) return;

    const deltaY = e.clientY - desktopCurtainDragRef.current.startY;
    const curtainHeight = window.innerHeight;
    // 민감도 증가: 2.5배로 설정하여 더 가볍게 느껴지도록
    const deltaPercent = (deltaY / curtainHeight) * 100 * 2.5;

    let newCurtainY = desktopCurtainDragRef.current.startCurtainY + deltaPercent;

    // 범위 제한: -100% (완전히 올라감) ~ 0% (완전히 내려옴)
    newCurtainY = Math.max(-100, Math.min(0, newCurtainY));

    setDesktopCurtainY(newCurtainY);
  };

  const handleDesktopCurtainPointerUp = () => {
    if (!desktopCurtainDragRef.current.isDragging) return;
    desktopCurtainDragRef.current.isDragging = false;

    // 스냅: 25% 이상 올라갔으면 완전히 올리고, 아니면 다시 내림
    if (desktopCurtainY < -25) {
      setDesktopCurtainY(-100);
    } else {
      setDesktopCurtainY(0);
    }
  };

  if (loading) {
    return (
      <div className="from-black-100 via-black-200 to-black-300 flex h-screen w-screen items-center justify-center bg-gradient-to-br font-sans text-white">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${
        isExhibitionMode
          ? isDarkMode
            ? "bg-black text-white"
            : "bg-white text-black"
          : "from-black-100 via-black-200 to-black-300 bg-gradient-to-br text-white"
      }`}
    >
      {/* 전시 모드 - 데스크탑 전용 */}
      {isExhibitionMode && (
        <div
          className={`absolute inset-0 bottom-8 z-50 hidden transition-colors duration-500 lg:block ${
            isDarkMode ? "bg-black" : "bg-white"
          }`}
        >
          {/* 컨트롤 영역 (idle 시 페이드아웃) */}
          <div
            className={`absolute top-0 right-0 z-[100] flex flex-col gap-4 p-8 transition-all duration-500 ${
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-4 opacity-0"
            }`}
          >
            {/* 타이머 드롭다운 */}
            <select
              value={exhibitionInterval}
              onChange={(e) => setExhibitionInterval(Number(e.target.value))}
              className={`cursor-pointer rounded-lg border px-4 py-2 backdrop-blur-sm transition-all ${
                isDarkMode
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-black/20 bg-black/10 text-black hover:bg-black/20"
              }`}
            >
              <option value={1000} className="bg-gray-800">
                1초
              </option>
              <option value={3000} className="bg-gray-800">
                3초
              </option>
              <option value={5000} className="bg-gray-800">
                5초
              </option>
              <option value={7000} className="bg-gray-800">
                7초
              </option>
              <option value={10000} className="bg-gray-800">
                10초
              </option>
              <option value={15000} className="bg-gray-800">
                15초
              </option>
            </select>

            {/* 다크/라이트 모드 토글 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/10 text-black hover:bg-black/20"
              }`}
              aria-label={
                isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"
              }
            >
              {isDarkMode ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* 프로필 전환 토글 */}
            <button
              onClick={() => setEnableProfileSwitch(!enableProfileSwitch)}
              className={`flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/10 text-black hover:bg-black/20"
              }`}
              aria-label={
                enableProfileSwitch ? "프로필 전환 끄기" : "프로필 전환 켜기"
              }
            >
              {enableProfileSwitch ? (
                <TbRefresh size={24} />
              ) : (
                <TbRefreshOff size={24} />
              )}
            </button>

            {/* 종료 버튼 */}
            <button
              onClick={() => setIsExhibitionMode(false)}
              className={`flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/10 text-black hover:bg-black/20"
              }`}
              aria-label="전시 모드 종료"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 화면 전환: 링 + 블러 오버레이 + 프로필 상세 */}
          <div className="absolute inset-0">
            {/* 링 화면 - 항상 백그라운드에 렌더링 */}
            <div className="absolute inset-0">
              <ExhibitionRing
                slots={textureData.textures}
                items={items}
                itemRanges={textureData.itemRanges}
                interval={exhibitionInterval}
                isDarkMode={isDarkMode}
                profile={profile}
                currentIndex={exhibitionCurrentIndex}
                onCurrentIndexChange={setExhibitionCurrentIndex}
                exhibitionScreen={exhibitionScreen}
              />
            </div>

            {/* 백드롭 블러 오버레이 - 링 → 프로필 전환 시 */}
            <AnimatePresence>
              {exhibitionScreen === "profile-detail" && (
                <motion.div
                  key="backdrop-blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-40 h-[200vh] backdrop-blur-xl"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(0, 0, 0, 0.15)"
                      : "rgba(255, 255, 255, 0.15)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* 프로필 상세 화면 - 블러 위에 오버레이 */}
            <AnimatePresence>
              {exhibitionScreen === "profile-detail" && (
                <motion.div
                  key="profile-detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: {
                      duration: 0.5,
                      delay: exhibitionScreen === "profile-detail" ? 0.3 : 0,
                    },
                  }}
                  className="absolute inset-0 z-50"
                >
                  <ProfileDetailScreen
                    profile={profile}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 모바일 레이아웃 (< 700px) */}
      <div className="pt-10 from-black-100 via-black-200 to-black-300 flex h-full w-full flex-col bg-gradient-to-br lg:hidden">
        {/* 상단 헤더 - The Life Museum + Login/Logout/Mypage */}
        <div className="z-30 flex items-center justify-between px-4 py-3">
          <h1 className="font-serif text-xl font-bold tracking-tight text-white">
            The Life Museum
          </h1>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
                >
                  Logout
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={handleMypage}
                  className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
                >
                  Mypage
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* 프로필 보기 버튼 - 하단 중앙 */}
        {!showCurtain && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setShowCurtain(true);
              setCurtainY(0);
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex-shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            프로필 보기
          </motion.button>
        )}

        {/* 컨텐츠 영역 - 이미지 + 텍스트 */}
        <div className="z-10 flex flex-col px-2.5">
          {/* 선택된 이미지/비디오 */}
          {selectedSlot && selectedSlot.url && (
            <div className="pointer-events-none w-full">
              {selectedSlot.kind === "image" ||
              selectedSlot.type === "image" ? (
                <div className="relative aspect-[3/2] w-full">
                  <img
                    src={proxify(selectedSlot.url)}
                    alt="Selected"
                    className="h-full w-full object-contain"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                  />
                </div>
              ) : selectedSlot.kind === "video" ||
                selectedSlot.type === "video" ? (
                <div className="relative aspect-[3/2] w-full">
                  <video
                    src={proxify(selectedSlot.url)}
                    className="h-full w-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleVideoLoad}
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* 아이템 설명 텍스트 */}
          {currentItem && !currentItem.isProfile && currentItem.desc && (
            <div className="px-1.5 py-3">
              <p className="text-sm leading-relaxed text-white/80">
                {currentItem.desc}
              </p>
            </div>
          )}
        </div>

        {/* SceneRing - 배경 */}
        <div
          className="pointer-events-none absolute inset-0 top-80 w-[1080px]"
          style={{ touchAction: "none" }}
        >
          <SceneRing
            slots={textureData.textures}
            leftIndex={leftIndex}
            onLeftmostChange={handleLeftmostChange}
            snapSpeed={15}
            popMode="band"
            popSpanSlots={1.2}
            bulge={1.2}
            isDesktop={false}
            lockedItemId={lockedItemId}
            cameraPosition={{ y: 3, z: 8 }}
            planeRotationX={-0.3}
          />
        </div>

        {/* 드래그 영역 - SceneRing 위에 투명하게 */}
        <div
          className="absolute inset-0 z-5"
          onPointerDown={handleRingPointerDown}
          onPointerMove={handleRingPointerMove}
          onPointerUp={handleRingPointerUp}
          onPointerLeave={handleRingPointerUp}
          style={{ touchAction: "none" }}
        />

        {/* RingSlider - 하단 배치 (주석처리: 타임라인으로 대체) */}
        {/* <div className="absolute right-0 bottom-0 left-0 z-20">
          <RingSlider
            items={items}
            textureData={textureData}
            leftIndex={leftIndex}
            onChangeLeftIndex={setLeftIndex}
            onItemClick={handleItemClick}
            isPanelOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
            isDesktop={false}
            onOpenProfileCurtain={() => setIsProfileCurtainOpen(true)}
          />
        </div> */}

        {/* 타임라인 - 모바일 전용 */}
        <div
          ref={timelineRef}
          className="absolute top-auto bottom-0 left-4 z-20 max-h-[45vh] snap-y snap-proximity overflow-y-auto py-10 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {/* 상단 패딩 (중앙 정렬용) */}
          <div className="h-[20vh]" />

          <div className="flex flex-col gap-3 pb-[20vh]">
            {items.map((item) => {
              const year = item.date ? item.date.match(/\d{4}/)?.[0] : "";

              const isLocked = lockedItemId === item.id;
              const isCurrentItem = currentItem?.id === item.id;

              // 프로필 아이템은 고정 투명도
              const itemOpacity = item.isProfile
                ? 0.5
                : (itemOpacities[item.id] ?? 0.15);

              return (
                <button
                  key={item.id}
                  ref={(el) => (itemRefs.current[item.id] = el)}
                  onClick={() => handleItemClick(item)}
                  className="relative cursor-pointer snap-center px-2 py-2 text-left text-white transition-opacity duration-200"
                  style={{
                    opacity: itemOpacity,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      {item.isProfile ? (
                        // 프로필 아이템: {이름}\n{생년} 형식
                        <>
                          <div className="text-sm leading-tight font-medium">
                            {profile.name || "대표 타이틀"}
                          </div>
                          {profile.birthDate && (
                            <div className="mt-0.5 text-xs opacity-70">
                              {profile.birthDate.match(/\d{4}/)?.[0] ||
                                profile.birthDate}
                            </div>
                          )}
                        </>
                      ) : (
                        // 일반 아이템
                        <>
                          <div className="text-sm leading-tight font-medium">
                            {item.title || "제목 없음"}
                          </div>
                          {year && (
                            <div className="mt-0.5 text-xs opacity-70">
                              {year}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* 잠금 아이콘 - 현재 선택된 아이템에만 표시 (프로필 제외) */}
                    {isCurrentItem && !item.isProfile && (
                      <div className="flex-shrink-0">
                        {isLocked ? (
                          <MdLock className="h-4 w-4 text-white/70" />
                        ) : (
                          <MdLockOpen className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pannel - 슬라이드 애니메이션과 함께 배치 */}
        <div
          className="absolute left-1/2 z-10 w-[92%] max-w-[450px] -translate-x-1/2 transition-all duration-500 ease-in-out"
          style={{
            bottom: isPanelOpen ? "170px" : "-600px",
          }}
        >
          <Pannel
            type="list"
            mode={mode}
            items={items}
            setItems={setItems}
            profile={profile}
            setProfile={setProfile}
            onItemClick={handleItemClick}
            onToggleMode={
              isOwner ? () => setMode(mode === "view" ? "edit" : "view") : null
            }
            sceneId={id}
            currentItem={currentItem}
            lockedItemId={lockedItemId}
            onToggleLock={handleToggleLock}
          />
        </div>

        {/* 프로필 디테일 커튼 - 모바일 전용 */}
        <AnimatePresence>
          {showCurtain && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: `${curtainY}%` }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-black"
              style={{ touchAction: "none" }}
              onPointerDown={handleCurtainPointerDown}
              onPointerMove={handleCurtainPointerMove}
              onPointerUp={handleCurtainPointerUp}
              onPointerLeave={handleCurtainPointerUp}
            >
              <ProfileDetailScreen
                profile={profile}
                isDarkMode={isDarkMode}
                isFullScreen={true}
                isMobile={true}
              />

              {/* 드래그 힌트 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: curtainY === 0 ? 1 : 0 }}
                className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white/60"
                >
                  <path
                    d="M12 19V5M12 5L5 12M12 5L19 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-white/60">
                  위로 드래그하여 접기
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 데스크탑 레이아웃 (>= 700px) */}
      <div
        className={`hidden h-full w-full items-end justify-center lg:flex ${isExhibitionMode ? "lg:hidden" : ""}`}
      >
        {/* Login/Logout/Mypage 버튼 - 최상단 우측 */}
        <div className="absolute top-8 right-8 z-30 flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
              >
                Logout
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={handleMypage}
                className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
              >
                Mypage
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="text-white text-sm font-medium cursor-pointer hover:text-white/70 transition-colors"
            >
              Login
            </button>
          )}
        </div>

        {/* 플레이 버튼 */}
        <div className="absolute top-20 right-8 z-30">
          <button
            onClick={() => setIsExhibitionMode(!isExhibitionMode)}
            onMouseEnter={() => setShowPlayTooltip(true)}
            onMouseLeave={() => setShowPlayTooltip(false)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/20"
            aria-label={isExhibitionMode ? "전시 모드 종료" : "전시 모드 시작"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1"
            >
              <path
                d="M8 5.14v13.72L19 12L8 5.14z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 툴팁 */}
          <AnimatePresence>
            {showPlayTooltip && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-1/2 right-full mr-4 -translate-y-1/2 overflow-hidden"
              >
                <div className="bg-black px-4 py-2.5 whitespace-nowrap">
                  <p className="text-xs text-white">
                    전시 모드를 활성화합니다.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 프로필 버튼 - 플레이와 에딧 버튼 사이 */}
        {mode !== "edit" && (
          <div className="absolute top-40 right-8 z-30">
            <button
              onClick={() => setDesktopCurtainY(desktopCurtainY === 0 ? -100 : 0)}
              onMouseEnter={() => setShowProfileTooltip(true)}
              onMouseLeave={() => setShowProfileTooltip(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-transparent text-white transition-all hover:scale-110 hover:bg-white/10"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 툴팁 */}
            <AnimatePresence>
              {showProfileTooltip && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-1/2 right-full mr-4 -translate-y-1/2 overflow-hidden"
                >
                  <div className="bg-black px-4 py-2.5 whitespace-nowrap">
                    <p className="text-xs text-white">
                      프로필을 확인합니다.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 에딧 토글 버튼 - 프로필 버튼 아래 */}
        {isOwner && (
          <div className="absolute top-60 right-8 z-30">
            <button
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
              onMouseEnter={() => setShowEditTooltip(true)}
              onMouseLeave={() => setShowEditTooltip(false)}
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-all hover:scale-110 ${
                mode === "edit"
                  ? "bg-white text-black"
                  : "border-2 border-white bg-transparent text-white hover:bg-white/10"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
            </button>

            {/* 툴팁 */}
            <AnimatePresence>
              {showEditTooltip && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-1/2 right-full mr-4 -translate-y-1/2 overflow-hidden"
                >
                  <div className="bg-black px-4 py-2.5 whitespace-nowrap">
                    <p className="text-xs text-white">
                      {mode === "edit"
                        ? "눌러서 편집을 종료하고 보기모드로 돌아갑니다."
                        : "눌러서 새 이벤트나 사진을 추가하거나 편집할 수 있습니다."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex h-full w-[86vw] min-w-[700px] px-10 flex-col items-stretch justify-end overflow-hidden bg-transparent">
          {/* 선택된 이미지/비디오 - 패널 위에 왼쪽 정렬 - 데스크탑 */}
          {selectedSlot && selectedSlot.url && mode !== 'edit' && (
            <div className="z-15 mt-20">
              {/* The Life Museum 텍스트 */}
              <div className="mb-4">
                <h1 className="font-serif font-bold italic text-white text-4xl">
                  The Life Museum
                </h1>
              </div>

              {/* 이미지/비디오 */}
              {selectedSlot.kind === "image" ||
              selectedSlot.type === "image" ? (
                <div className="h-[400px] w-auto">
                  <img
                    src={proxify(selectedSlot.url)}
                    alt="Selected"
                    className="h-full w-auto object-contain pointer-events-none select-none"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                    draggable={false}
                  />
                </div>
              ) : selectedSlot.kind === "video" ||
                selectedSlot.type === "video" ? (
                <div className="h-[400px] w-auto">
                  <video
                    src={proxify(selectedSlot.url)}
                    className="h-full w-auto object-contain pointer-events-none select-none"
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleVideoLoad}
                  />
                </div>
              ) : null}

              {/* 슬라이더 - 이미지 아래 패널 너비만큼 */}
              <div className="w-[400px] mt-4">
                <input
                  type="range"
                  min={lockedItemId && currentItem ? (textureData.itemRanges[lockedItemId]?.start || 0) : 0}
                  max={lockedItemId && currentItem ? (textureData.itemRanges[lockedItemId]?.end || lastContentIndex) : lastContentIndex}
                  value={leftIndex}
                  onChange={(e) => {
                    const newIndex = parseInt(e.target.value, 10);

                    // 수동 네비게이션 플래그 설정
                    if (manualNavigationTimeoutRef.current) {
                      clearTimeout(manualNavigationTimeoutRef.current);
                    }
                    isManualNavigationRef.current = true;

                    setLeftIndex(newIndex);

                    manualNavigationTimeoutRef.current = setTimeout(() => {
                      isManualNavigationRef.current = false;
                    }, 1000);
                  }}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    WebkitAppearance: 'none',
                  }}
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                  }

                  .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                  }
                `}</style>
              </div>
            </div>
          )}

          {/* 링 + 패널 영역 */}
          <div className={`relative flex flex-1 items-start ${mode === 'edit' ? 'mt-0 mb-0' : 'mb-10 mt-0'}`}>
            {/* 패널 - 왼쪽 */}
            <div className={`relative z-20 w-[400px] shrink-0 ${mode === 'edit' ? 'mt-30 mb-30 h-[calc(100vh-240px)]' : ''}`}>
              <Pannel
                type="list"
                mode={mode}
                items={items}
                setItems={setItems}
                profile={profile}
                setProfile={setProfile}
                onItemClick={handleItemClick}
                onToggleMode={
                  isOwner
                    ? () => setMode(mode === "view" ? "edit" : "view")
                    : null
                }
                sceneId={id}
                currentItem={currentItem}
                lockedItemId={lockedItemId}
                onToggleLock={handleToggleLock}
              />
            </div>

            {/* 링 - 오른쪽 (넓게 표시하여 반만 보이게) */}
          </div>

          {/* 슬라이더 - 하단 */}
          {/* <div className="z-20 w-full">
            <RingSlider
              items={items}
              textureData={textureData}
              leftIndex={leftIndex}
              onChangeLeftIndex={setLeftIndex}
              onItemClick={handleItemClick}
              isPanelOpen={true}
              onTogglePanel={() => {}}
              isDesktop={true}
              onOpenProfileCurtain={() => setIsProfileCurtainOpen(true)}
            />
          </div> */}
        </div>
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{
            // right: 'calc((100vw - 700px) / 2)',

            width: "200%",
            height: "100%",
          }}
        >
          <SceneRing
            slots={textureData.textures}
            leftIndex={leftIndex}
            onLeftmostChange={handleLeftmostChange}
            snapSpeed={18}
            popMode="band"
            popSpanSlots={1.2}
            bulge={3}
            isDesktop={true}
            items={items}
            itemRanges={textureData.itemRanges}
            lockedItemId={lockedItemId}
            cameraPosition={{ y: 8, z: 24}}
            planeSize={{ width: 3.6, height: 2.4 }}
            radius={10}
            planeRotationX={-0.3}
          />
        </div>
      </div>

      {/* 프로필 커튼 - 모바일과 데스크탑 모두 */}
      <ProfileCurtain
        open={isProfileCurtainOpen}
        onClose={() => setIsProfileCurtainOpen(false)}
        profile={profile}
      />

      {/* 데스크탑 프로필 커튼 */}
      <AnimatePresence>
        {desktopCurtainY > -100 && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: `${desktopCurtainY}%` }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-black hidden lg:block"
            style={{ touchAction: "none" }}
            onPointerDown={handleDesktopCurtainPointerDown}
            onPointerMove={handleDesktopCurtainPointerMove}
            onPointerUp={handleDesktopCurtainPointerUp}
            onPointerLeave={handleDesktopCurtainPointerUp}
          >
            <ProfileDetailScreen
              profile={profile}
              isDarkMode={isDarkMode}
              isFullScreen={true}
              isMobile={false}
            />

            {/* 드래그 힌트 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: desktopCurtainY === 0 ? 1 : 0 }}
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/60"
              >
                <path
                  d="M12 19V5M12 5L5 12M12 5L19 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs text-white/60">위로 드래그하여 닫기</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
