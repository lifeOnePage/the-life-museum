import { useEffect, useRef, useCallback } from "react";

const ZOOM_MIN = 2.9;
const ZOOM_MAX = 3.5;
// 앨범 선택 시 줌 제한 (앨범 Z=2.5에서 0.4 간격 — 관통 방지)
const ZOOM_MIN_SELECTED = 2.9;
const ZOOM_MAX_SELECTED = 4.0;
// 수평 패닝 범위 (앨범 크기 0.8의 ~37.5%)
const PAN_X_MAX = 0.3;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function useShelfGestures({
  wrapperRef,
  scrollRangeRef,
  cameraYOffsetRef,
  cameraXOffsetRef,
  cameraZRef,
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
        const deltaX = e.touches[0].clientX - t.startX;
        const deltaY = e.touches[0].clientY - t.startY;
        const newXOffset = t.startXOffset - deltaX * 0.002;
        cameraXOffsetRef.current = clamp(newXOffset, -PAN_X_MAX, PAN_X_MAX);
        const newYOffset = t.startOffset + deltaY * 0.009;
        const range = scrollRangeRef.current;
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else if (t.mode === "scroll" && e.touches.length === 1) {
        const delta = e.touches[0].clientY - t.startY;
        const newOffset = t.startOffset + delta * 0.009;
        const range = scrollRangeRef.current;
        cameraYOffsetRef.current = clamp(newOffset, -range, range);
      } else if (t.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();

        const dist = getTouchDist(e.touches);
        const ratio = t.startDist / dist;
        const zMin = selectedAlbum !== null ? ZOOM_MIN_SELECTED : ZOOM_MIN;
        const zMax = selectedAlbum !== null ? ZOOM_MAX_SELECTED : ZOOM_MAX;
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
        const zMin = selectedAlbum !== null ? ZOOM_MIN_SELECTED : ZOOM_MIN;
        const zMax = selectedAlbum !== null ? ZOOM_MAX_SELECTED : ZOOM_MAX;
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
        const newYOffset = cameraYOffsetRef.current + e.deltaY * 0.001;
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else {
        const range = scrollRangeRef.current;
        const newOffset = cameraYOffsetRef.current + e.deltaY * 0.001;
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
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        const newXOffset = dragRef.current.startXOffset - deltaX * 0.002;
        cameraXOffsetRef.current = clamp(newXOffset, -PAN_X_MAX, PAN_X_MAX);
        const newYOffset = dragRef.current.startOffset + deltaY * 0.003;
        const range = scrollRangeRef.current;
        cameraYOffsetRef.current = clamp(newYOffset, -range, range);
      } else {
        const delta = e.clientY - dragRef.current.startY;
        const newOffset = dragRef.current.startOffset + delta * 0.003;
        const range = scrollRangeRef.current;
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
