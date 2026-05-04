import { useEffect, useRef, useCallback } from "react";

const ZOOM_MIN = 2.5;
const ZOOM_MAX = 5.5;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function useShelfGestures({
  wrapperRef,
  scrollRangeRef,
  cameraYOffsetRef,
  cameraZRef,
  selectedAlbum,
}) {
  // Touch state
  const touchRef = useRef({
    mode: null, // 'scroll' | 'pinch' | null
    startY: 0,
    startOffset: 0,
    startDist: 0,
    startZoom: 0,
  });

  // Mouse drag state
  const dragRef = useRef({ dragging: false, startY: 0, startOffset: 0 });

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
        t.mode = "scroll";
        t.startY = e.touches[0].clientY;
        t.startOffset = cameraYOffsetRef.current;
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

      if (t.mode === "scroll" && e.touches.length === 1) {
        const delta = e.touches[0].clientY - t.startY;
        const newOffset = t.startOffset + delta * 0.006;
        const range = scrollRangeRef.current;
        cameraYOffsetRef.current = clamp(newOffset, -range, range);
      } else if (t.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();
        if (selectedAlbum === null) return;

        const dist = getTouchDist(e.touches);
        const ratio = t.startDist / dist;
        cameraZRef.current = clamp(t.startZoom * ratio, ZOOM_MIN, ZOOM_MAX);
      }
    }

    function onTouchEnd(e) {
      const t = touchRef.current;

      if (e.touches.length === 0) {
        t.mode = null;
      } else if (e.touches.length === 1 && t.mode === "pinch") {
        // Pinch → single finger: seamlessly switch to scroll
        t.mode = "scroll";
        t.startY = e.touches[0].clientY;
        t.startOffset = cameraYOffsetRef.current;
      }
    }

    function onWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // works because passive:false
        cameraZRef.current = clamp(
          cameraZRef.current + e.deltaY * 0.005,
          ZOOM_MIN,
          ZOOM_MAX,
        );
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
  }, [wrapperRef, scrollRangeRef, cameraYOffsetRef, cameraZRef, selectedAlbum]);

  // Mouse pointer handlers (returned for JSX props — touch skipped)
  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === "touch") return;
      dragRef.current = {
        dragging: true,
        startY: e.clientY,
        startOffset: cameraYOffsetRef.current,
      };
    },
    [cameraYOffsetRef],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType === "touch") return;
      if (!dragRef.current.dragging) return;
      const delta = e.clientY - dragRef.current.startY;
      const newOffset = dragRef.current.startOffset + delta * 0.003;
      const range = scrollRangeRef.current;
      cameraYOffsetRef.current = clamp(newOffset, -range, range);
    },
    [scrollRangeRef, cameraYOffsetRef],
  );

  const onPointerUp = useCallback((e) => {
    if (e.pointerType === "touch") return;
    dragRef.current.dragging = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
