import { useEffect, useRef, useCallback } from "react";

// 줌 범위는 baseZ 기준 상대 오프셋으로 결정됨 (getZoomBounds 참조)
// 수평 패닝 범위 (앨범 크기 0.8의 ~37.5%)
const PAN_X_MAX = 0.3;

// 터치 감도 — 뷰포트 기반 보정 (모바일에서 약간 감소, 데스크톱에서 약간 증가)
const REF_WIDTH = 1440;
const TOUCH_SENSITIVITY = 0.007; // 터치 수평 패닝 감도 (세로 스크롤은 scrollDelta가 처리)
function touchScale() {
  // sqrt 적용으로 모바일 감도 완만하게 감소 (390px → ~0.52, 768px → ~0.73)
  return Math.sqrt(window.innerWidth / REF_WIDTH);
}

// ── 세로 스크롤 감도 ──
// 픽셀당 이동량(월드 유닛/px)을 선반 높이(앨범 수)와 무관하게 "고정"한다.
// 이전에는 감도를 스크롤 범위(span = 2*range, range = (ROWS-1)*0.7)에 비례시켜,
// 앨범이 적어 선반이 짧으면 픽셀당 이동량이 작아지고(감도 하한 0.0024까지 떨어짐)
// 손가락 이동 대비 반응이 매우 무겁게 느껴졌다. 일반 스크롤 UI처럼 픽셀당 이동량을
// 고정하면 선반 높이와 상관없이 감도가 항상 동일하고(짧은 선반도 가볍게), 긴 선반은
// 자연스럽게 더 많이 스크롤하면 된다. (-range ~ +range 범위 클램프는 각 호출부에서 수행)
const SCROLL_SENSITIVITY = 0.0055;

function scrollDelta(deltaPx) {
  return deltaPx * SCROLL_SENSITIVITY;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getZoomBounds(baseZ, isSelected) {
  if (isSelected) {
    return { zMin: baseZ - 0.9, zMax: baseZ + 0.6 };
  }
  return { zMin: baseZ - 0.6, zMax: baseZ + 0.6 };
}

export default function useShelfGestures({
  wrapperRef,
  scrollRangeRef,
  cameraYOffsetRef,
  cameraXOffsetRef,
  cameraZRef,
  baseZRef,
  selectedAlbum,
}) {
  // Touch state
  const touchRef = useRef({
    mode: null, // 'scroll' | 'pinch' | 'pan' | null
    startY: 0,
    startX: 0,
    startOffset: 0,
    startXOffset: 0,
    startDist: 0,
    startZoom: 0,
  });

  // Mouse drag state
  const dragRef = useRef({
    dragging: false,
    startY: 0,
    startX: 0,
    startOffset: 0,
    startXOffset: 0,
  });

  // Scrolling flag — true during active touch scroll or mouse drag
  const isScrollingRef = useRef(false);

  // Touch + wheel handlers — all via addEventListener with passive:false
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function getTouchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function onTouchStart(e) {
      const t = touchRef.current;
      if (e.touches.length === 1) {
        if (selectedAlbum !== null) {
          // 앨범 선택 시: 수평 + 수직 패닝 모드
          t.mode = "pan";
          t.startX = e.touches[0].clientX;
          t.startY = e.touches[0].clientY;
          t.startXOffset = cameraXOffsetRef.current;
          t.startOffset = cameraYOffsetRef.current;
        } else {
          t.mode = "scroll";
          t.startY = e.touches[0].clientY;
          t.startOffset = cameraYOffsetRef.current;
          isScrollingRef.current = true;
        }
        // Do NOT preventDefault for 1-finger — R3F click/hover must work
      } else if (e.touches.length === 2) {
        t.mode = "pinch";
        t.startDist = getTouchDist(e.touches);
        t.startZoom = cameraZRef.current;
        e.preventDefault(); // prevent native pinch zoom from starting
      }
    }

    function onTouchMove(e) {
      const t = touchRef.current;

      if (t.mode === "pan" && e.touches.length === 1) {
        // 앨범 선택 시: 수평 + 수직 패닝
        const s = touchScale();
        const range = scrollRangeRef.current;
        const deltaX = e.touches[0].clientX - t.startX;
        const deltaY = e.touches[0].clientY - t.startY;
        const newXOffset = t.startXOffset - deltaX * TOUCH_SENSITIVITY * s;
        cameraXOffsetRef.current = clamp(newXOffset, -PAN_X_MAX, PAN_X_MAX);
        const newYOffset = t.startOffset + scrollDelta(deltaY);
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else if (t.mode === "scroll" && e.touches.length === 1) {
        const range = scrollRangeRef.current;
        const delta = e.touches[0].clientY - t.startY;
        const newOffset = t.startOffset + scrollDelta(delta);
        cameraYOffsetRef.current = clamp(newOffset, -range, range);
      } else if (t.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();

        const dist = getTouchDist(e.touches);
        const ratio = t.startDist / dist;
        const { zMin, zMax } = getZoomBounds(baseZRef.current, selectedAlbum !== null);
        cameraZRef.current = clamp(t.startZoom * ratio, zMin, zMax);
      }
    }

    function onTouchEnd(e) {
      const t = touchRef.current;

      if (e.touches.length === 0) {
        t.mode = null;
        isScrollingRef.current = false;
      } else if (e.touches.length === 1 && t.mode === "pinch") {
        // Pinch → single finger: seamlessly switch
        if (selectedAlbum !== null) {
          t.mode = "pan";
          t.startX = e.touches[0].clientX;
          t.startY = e.touches[0].clientY;
          t.startXOffset = cameraXOffsetRef.current;
          t.startOffset = cameraYOffsetRef.current;
        } else {
          t.mode = "scroll";
          t.startY = e.touches[0].clientY;
          t.startOffset = cameraYOffsetRef.current;
        }
      }
    }

    function onWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // works because passive:false
        const { zMin, zMax } = getZoomBounds(baseZRef.current, selectedAlbum !== null);
        cameraZRef.current = clamp(
          cameraZRef.current + e.deltaY * 0.005,
          zMin,
          zMax,
        );
      } else if (selectedAlbum !== null) {
        // 앨범 선택 시: 수평 패닝 + 수직 스크롤
        e.preventDefault();
        const newXOffset = cameraXOffsetRef.current + e.deltaX * 0.001;
        cameraXOffsetRef.current = clamp(newXOffset, -PAN_X_MAX, PAN_X_MAX);
        const range = scrollRangeRef.current;
        const newYOffset = cameraYOffsetRef.current + scrollDelta(e.deltaY);
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else {
        const range = scrollRangeRef.current;
        const newOffset = cameraYOffsetRef.current + scrollDelta(e.deltaY);
        cameraYOffsetRef.current = clamp(newOffset, -range, range);
      }
    }

    // passive:false on touchstart so we can preventDefault on 2-finger (pinch)
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    // passive:false on wheel so Ctrl+wheel preventDefault works
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, [
    wrapperRef,
    scrollRangeRef,
    cameraYOffsetRef,
    cameraXOffsetRef,
    cameraZRef,
    baseZRef,
    selectedAlbum,
  ]);

  // Mouse pointer handlers (returned for JSX props — touch skipped)
  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === "touch") return;
      dragRef.current = {
        dragging: true,
        startY: e.clientY,
        startX: e.clientX,
        startOffset: cameraYOffsetRef.current,
        startXOffset: cameraXOffsetRef.current,
      };
      isScrollingRef.current = true;
    },
    [cameraYOffsetRef, cameraXOffsetRef],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType === "touch") return;
      if (!dragRef.current.dragging) return;

      if (selectedAlbum !== null) {
        // 앨범 선택 시: 수평 + 수직 패닝
        const range = scrollRangeRef.current;
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        const newXOffset = dragRef.current.startXOffset - deltaX * 0.002;
        cameraXOffsetRef.current = clamp(newXOffset, -PAN_X_MAX, PAN_X_MAX);
        const newYOffset = dragRef.current.startOffset + scrollDelta(deltaY);
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else {
        const range = scrollRangeRef.current;
        const delta = e.clientY - dragRef.current.startY;
        const newOffset = dragRef.current.startOffset + scrollDelta(delta);
        cameraYOffsetRef.current = clamp(newOffset, -range, range);
      }
    },
    [scrollRangeRef, cameraYOffsetRef, cameraXOffsetRef, selectedAlbum],
  );

  const onPointerUp = useCallback((e) => {
    if (e.pointerType === "touch") return;
    dragRef.current.dragging = false;
    isScrollingRef.current = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, isScrollingRef };
}
