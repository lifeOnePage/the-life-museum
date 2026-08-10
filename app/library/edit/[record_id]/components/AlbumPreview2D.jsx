"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, RotateCw, Trash2 } from "lucide-react";
import { extractColors } from "extract-colors";
import { generateBackCoverDataUrl } from "@/app/lib/generateBackCover";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";
import { loadCachedImage } from "@/app/lib/loadCachedImage";

// 스티커 렌더 기준 크기(px, scale=1일 때) — h-16/w-16(64px)과 일치시켜야
// 리사이즈 손잡이 드래그 시 계산한 scale이 실제 렌더 크기와 어긋나지 않는다.
const STICKER_BASE_SIZE = 64;
const STICKER_CORNER_DIST = (STICKER_BASE_SIZE / 2) * Math.SQRT2;

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;

// 이미지 로드 캐시 — 공유 유틸 사용. 앞표지 하나 바꿀 때마다 뒷면 커버(R2:
// 프록시 재시도)와 테마 이미지가 매번 재다운로드되어 Promise.all 배리어 전체가
// 수 초 걸리던 문제를 없앤다. 캐시되면 이후 선택은 "새 앞면 이미지 1장"만 기다린다.
const loadImg = loadCachedImage;

const T = {
  ko: { front: "앞면", back: "뒷면" },
  en: { front: "Front", back: "Back" },
};

export default function AlbumPreview2D({
  frontCover,
  backCoverImageUrl,
  bio,
  timeline,
  selectedTheme,
  stickers,
  onStickersChange,
  onBackCoverDataUrlChange,
  albumTitle,
  albumSubTitle,
  titleOverlayEnabled,
  titlePosition,
  titleFont,
  titleColor,
  titleStroke,
  titleStrokeOpacity,
  flipped,
  onFlipChange,
  locale,
  // 최신 합성 커버(dataURL)를 부모로 전달 — 편집 페이지가 저장 시
  // 라이브러리 캐시에 심어 복귀 즉시 최종 모습이 보이게 하는 용도
  onCoversComposited,
}) {
  const t = T[locale] || T.ko;
  const [isFlipped, setIsFlipped] = useState(false);
  const toggleFlip = () => {
    setIsFlipped((f) => {
      const next = !f;
      onFlipChange?.(next);
      return next;
    });
  };

  // 제어형 flipped prop과 동기화 (좌측 섹션을 열면 부모가 면을 바꿔줌)
  useEffect(() => {
    if (flipped !== undefined) {
      setIsFlipped(flipped);
    }
  }, [flipped]);

  // 스티커는 항상 "지금 보이는 면"에서 바로 드래그로 편집할 수 있다 — 어떤
  // 좌측 탭이 열려 있는지와 무관하게 뒤집힌 면을 그대로 편집 대상으로 삼는다.
  const editableSide = isFlipped ? "back" : "front";

  const [frontCoverImg, setFrontCoverImg] = useState(null);
  const [backCoverImg, setBackCoverImg] = useState(null);
  const [extractedColors, setExtractedColors] = useState(null);
  const [themeBgImg, setThemeBgImg] = useState(null);
  const [themeStickerImg, setThemeStickerImg] = useState(null);
  const [themeFlowerImg, setThemeFlowerImg] = useState(null);
  const [stickerImages, setStickerImages] = useState({});

  // Load all images in parallel + extract colors — single effect to avoid
  // multiple sequential state updates that each trigger an expensive canvas recompute.
  useEffect(() => {
    if (typeof document === "undefined") return;
    let cancelled = false;

    async function loadAll() {
      const key = selectedTheme || "minimalist";
      const bgMap = {
        kitsch: "/images/albumtheme/kitsch.png",
        illustration: "/images/albumtheme/illustration.png",
        travel: "/images/albumtheme/travel/travel1_back.svg",
      };
      const backSrc =
        backCoverImageUrl && backCoverImageUrl !== frontCover
          ? backCoverImageUrl
          : null;
      const frontFrameMap = {
        memorial_light: "/stickers/memorial/image 406.svg",
        memorial_dark: "/stickers/memorial/image 406.svg",
        travel: "/images/albumtheme/travel/travel1_front.svg",
        couple_1: "/images/albumtheme/couple/couple-1.svg",
        couple_2: "/images/albumtheme/couple/couple-2.svg",
        children_1: "/images/albumtheme/children/children-1.svg",
        children_2: "/images/albumtheme/children/children-2.svg",
      };

      const [frontImg, backImg, bgImg, stickerImg, flowerImg] =
        await Promise.all([
          loadImg(frontCover),
          loadImg(backSrc),
          loadImg(bgMap[key] || null, false),
          key === "kitsch"
            ? loadImg("/images/albumtheme/kitsch 2.png", false)
            : Promise.resolve(null),
          loadImg(frontFrameMap[key] || null, false),
        ]);

      if (cancelled) return;

      let colors = null;
      if (frontImg) {
        try {
          const extracted = await extractColors(frontImg, {
            pixels: 10000,
            distance: 0.2,
          });
          const main = extracted.sort((a, b) => b.area - a.area)[0];
          if (main) {
            const { red, green, blue } = main;
            colors = [0.4, 0.7, 1.0].map((factor) => {
              const r = Math.min(255, Math.round(red * factor));
              const g = Math.min(255, Math.round(green * factor));
              const b = Math.min(255, Math.round(blue * factor));
              return `rgb(${r}, ${g}, ${b})`;
            });
          }
        } catch {}
      }

      if (cancelled) return;

      // All state updates batched into one render (React 18)
      setFrontCoverImg(frontImg);
      setBackCoverImg(backImg);
      setThemeBgImg(bgImg);
      setThemeStickerImg(stickerImg);
      setThemeFlowerImg(flowerImg);
      setExtractedColors(colors);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [frontCover, backCoverImageUrl, selectedTheme]);

  // Preload user-placed sticker images (from the back theme editor) so the
  // canvas can draw them synchronously once loaded.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!stickers || stickers.length === 0) {
      setStickerImages({});
      return;
    }
    let cancelled = false;
    const uniqueSrcs = [...new Set(stickers.map((s) => s.src))];

    Promise.all(
      uniqueSrcs.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve([src, img]);
            img.onerror = () => resolve([src, null]);
            img.src = src;
          }),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      setStickerImages(Object.fromEntries(pairs));
    });

    return () => {
      cancelled = true;
    };
  }, [stickers]);

  const themeKey = selectedTheme || "minimalist";

  // 앞/뒷면에 붙은 스티커를 각각 분리 — side 없는 기존 데이터는 뒷면으로 취급(하위 호환)
  const frontStickers = (stickers || []).filter((s) => s.side === "front");
  const backStickers = (stickers || []).filter((s) => s.side !== "front");

  // Debounced front cover canvas: run async after render, 200ms debounce
  // prevents blocking the main thread on every prop change
  const [frontCoverDataUrl, setFrontCoverDataUrl] = useState(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (
      !frontCoverImg &&
      !(titleOverlayEnabled && albumTitle) &&
      frontStickers.length === 0
    ) {
      setFrontCoverDataUrl(null);
      return;
    }
    const t = setTimeout(() => {
      setFrontCoverDataUrl(
        generateFrontCoverDataUrl(frontCoverImg, {
          title: titleOverlayEnabled ? albumTitle || "" : "",
          subtitle: "",
          position: titlePosition || "bottom-center",
          font: titleFont || "Pretendard Variable",
          color: titleColor || "#000000",
          stroke: titleStroke ?? false,
          strokeOpacity: titleStrokeOpacity ?? 100,
          themeKey,
          albumTitle: albumTitle || "",
          flowerImg: themeFlowerImg,
          locale,
          // 편집 중(스티커 오버레이가 직접 뜬 상태)에는 캔버스에 굽지 않고
          // DOM 오버레이로만 보여준다 — 그렇지 않으면 두 번 겹쳐 보인다.
          stickers: editableSide === "front" ? [] : frontStickers,
          stickerImages,
        }),
      );
    }, 200);
    return () => clearTimeout(t);
  }, [
    frontCoverImg,
    albumTitle,
    titleOverlayEnabled,
    titlePosition,
    titleFont,
    titleColor,
    titleStroke,
    titleStrokeOpacity,
    themeKey,
    themeFlowerImg,
    locale,
    frontStickers,
    stickerImages,
    editableSide,
  ]);

  // Debounced back cover canvas: coalesces rapid sequential updates (image loads,
  // bio typing, theme changes) into a single 200ms-delayed canvas computation
  const [backCoverDataUrl, setBackCoverDataUrl] = useState(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const imgForBack = backCoverImg || frontCoverImg;
    const t = setTimeout(() => {
      const dataUrl = generateBackCoverDataUrl(
        themeKey,
        bio || "",
        timeline || [],
        imgForBack,
        albumTitle || "",
        albumSubTitle || "",
        extractedColors,
        themeBgImg,
        themeStickerImg,
        // 편집 중(스티커 오버레이가 직접 뜬 상태)에는 캔버스에 굽지 않고
        // DOM 오버레이로만 보여준다 — 그렇지 않으면 두 번 겹쳐 보인다.
        editableSide === "back" ? [] : backStickers,
        stickerImages,
      );
      setBackCoverDataUrl(dataUrl);
      onBackCoverDataUrlChange?.(dataUrl);
    }, 200);
    return () => clearTimeout(t);
  }, [
    themeKey,
    bio,
    timeline,
    backCoverImg,
    frontCoverImg,
    albumTitle,
    albumSubTitle,
    extractedColors,
    themeBgImg,
    themeStickerImg,
    backStickers,
    editableSide,
    stickerImages,
    onBackCoverDataUrlChange,
  ]);

  // 합성 커버가 갱신될 때마다 부모에 최신본 전달 (라이브러리 캐시 낙관 갱신용)
  useEffect(() => {
    onCoversComposited?.({
      frontImage: frontCoverDataUrl || frontCover || null,
      backImage: backCoverDataUrl || null,
    });
  }, [frontCoverDataUrl, backCoverDataUrl, frontCover, onCoversComposited]);

  const frontSrc = frontCoverDataUrl || frontCover;
  const backSrc = backCoverDataUrl;

  // ─── 스티커 드래그 배치 (스티커 패널 활성 시 앞/뒷면 실제 미리보기 위에서 직접 조작) ───
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const frontStageRef = useRef(null);
  const backStageRef = useRef(null);
  const activeStageRef =
    editableSide === "front" ? frontStageRef : backStageRef;
  const dragRef = useRef(null);

  useEffect(() => {
    setSelectedStickerId(null);
  }, [editableSide]);

  const updateSticker = (id, patch) => {
    onStickersChange?.(
      (stickers || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const removeSticker = (id) => {
    onStickersChange?.((stickers || []).filter((s) => s.id !== id));
    setSelectedStickerId((cur) => (cur === id ? null : cur));
  };

  // 몸통 드래그 = 이동
  const handleStickerPointerDown = (e, sticker) => {
    e.stopPropagation();
    e.preventDefault();
    if (!activeStageRef.current) return;
    e.target.setPointerCapture(e.pointerId);
    setSelectedStickerId(sticker.id);
    dragRef.current = {
      mode: "move",
      id: sticker.id,
      rect: activeStageRef.current.getBoundingClientRect(),
      startX: sticker.x,
      startY: sticker.y,
      pointerX: e.clientX,
      pointerY: e.clientY,
    };
  };

  // 위쪽 손잡이 드래그 = 회전 (캔바 스타일 — 스티커 중심 기준 각도)
  const handleRotateDown = (e, sticker) => {
    e.stopPropagation();
    e.preventDefault();
    if (!activeStageRef.current) return;
    e.target.setPointerCapture(e.pointerId);
    setSelectedStickerId(sticker.id);
    const rect = activeStageRef.current.getBoundingClientRect();
    dragRef.current = {
      mode: "rotate",
      id: sticker.id,
      centerX: rect.left + sticker.x * rect.width,
      centerY: rect.top + sticker.y * rect.height,
    };
  };

  // 모서리 손잡이 드래그 = 크기 조절 (중심에서 포인터까지 거리 기반, 회전 무관)
  const handleResizeDown = (e, sticker) => {
    e.stopPropagation();
    e.preventDefault();
    if (!activeStageRef.current) return;
    e.target.setPointerCapture(e.pointerId);
    setSelectedStickerId(sticker.id);
    const rect = activeStageRef.current.getBoundingClientRect();
    dragRef.current = {
      mode: "resize",
      id: sticker.id,
      centerX: rect.left + sticker.x * rect.width,
      centerY: rect.top + sticker.y * rect.height,
    };
  };

  const handleStickerPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === "move") {
      const dx = (e.clientX - drag.pointerX) / drag.rect.width;
      const dy = (e.clientY - drag.pointerY) / drag.rect.height;
      updateSticker(drag.id, {
        x: Math.min(1, Math.max(0, drag.startX + dx)),
        y: Math.min(1, Math.max(0, drag.startY + dy)),
      });
      return;
    }

    if (drag.mode === "rotate") {
      const angleDeg =
        (Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX) * 180) /
        Math.PI;
      let rotation = angleDeg + 90; // 손잡이가 위(=회전 0도)일 때 기준
      if (rotation > 180) rotation -= 360;
      if (rotation < -180) rotation += 360;
      updateSticker(drag.id, { rotation: Math.round(rotation) });
      return;
    }

    if (drag.mode === "resize") {
      const dist = Math.hypot(
        e.clientX - drag.centerX,
        e.clientY - drag.centerY,
      );
      const scale = Math.min(2.5, Math.max(0.4, dist / STICKER_CORNER_DIST));
      updateSticker(drag.id, { scale: Math.round(scale * 100) / 100 });
    }
  };

  const handleStickerPointerUp = () => {
    dragRef.current = null;
  };

  // ─── 데스크탑 스크롤 / 모바일 핀치로 프리뷰 확대·축소 ───
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const zoomContainerRef = useRef(null);
  const pinchStartDist = useRef(null);
  const pinchStartZoom = useRef(null);

  useEffect(() => {
    const el = zoomContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const next = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, zoomRef.current - e.deltaY * 0.003),
      );
      zoomRef.current = next;
      setZoom(next);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist.current = Math.hypot(dx, dy);
        pinchStartZoom.current = zoomRef.current;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / pinchStartDist.current;
        const next = Math.max(
          ZOOM_MIN,
          Math.min(ZOOM_MAX, pinchStartZoom.current * scale),
        );
        zoomRef.current = next;
        setZoom(next);
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchStartDist.current = null;
        pinchStartZoom.current = null;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // 앞/뒷면 공통 스티커 오버레이 렌더러 — 드래그 이동/회전/크기조절/삭제 핸들 포함
  const renderStickerOverlay = (items) =>
    items.map((s) => {
      const isSelected = selectedStickerId === s.id;
      const dispSize = STICKER_BASE_SIZE * s.scale;
      return (
        <div
          key={s.id}
          className="absolute touch-none select-none"
          style={{
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            width: dispSize,
            height: dispSize,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
          }}
        >
          <img
            src={s.src}
            alt=""
            draggable={false}
            onPointerDown={(e) => handleStickerPointerDown(e, s)}
            onClick={(e) => e.stopPropagation()}
            className={`h-full w-full cursor-grab touch-none object-contain active:cursor-grabbing ${
              isSelected
                ? "outline outline-2 outline-offset-2 outline-[#c4b49a]"
                : ""
            }`}
          />

          {isSelected && (
            <>
              {/* 회전 손잡이 — 위쪽, 연결선 포함 */}
              <div className="pointer-events-none absolute bottom-full left-1/2 h-5 w-px -translate-x-1/2 bg-[#c4b49a]" />
              <button
                onPointerDown={(e) => handleRotateDown(e, s)}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-5 cursor-grab touch-none items-center justify-center rounded-full border-2 border-[#c4b49a] bg-[#2a2318] text-[#c4b49a] active:cursor-grabbing"
                title="회전"
              >
                <RotateCw className="h-3 w-3" />
              </button>

              {/* 크기 조절 손잡이 — 우하단 모서리 */}
              <button
                onPointerDown={(e) => handleResizeDown(e, s)}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize touch-none rounded-full border-2 border-[#c4b49a] bg-[#2a2318]"
                title="크기 조절"
              />

              {/* 삭제 버튼 — 좌상단 모서리 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSticker(s.id);
                }}
                className="absolute top-0 left-0 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500/80"
                title="삭제"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      );
    });

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <button
          onClick={toggleFlip}
          className="flex items-center gap-1.5 rounded-md px-1 py-1 text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7]"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-[#e8d5b7]">
          {isFlipped ? t.back : t.front}
        </span>
      </div>

      <div
        ref={zoomContainerRef}
        className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden p-6"
        style={{ perspective: "1600px" }}
      >
        <div
          className="w-full max-w-[420px]"
          style={{ transform: `scale(${zoom})` }}
        >
          <div
            className="relative aspect-square w-full cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.5s ease",
              transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
            }}
            onClick={toggleFlip}
          >
            {/* Front face */}
            <div
              ref={frontStageRef}
              onPointerMove={
                editableSide === "front" ? handleStickerPointerMove : undefined
              }
              onPointerUp={
                editableSide === "front" ? handleStickerPointerUp : undefined
              }
              onPointerCancel={
                editableSide === "front" ? handleStickerPointerUp : undefined
              }
              onClickCapture={(e) => {
                if (editableSide === "front" && e.target === e.currentTarget) {
                  setSelectedStickerId(null);
                }
              }}
              className={`absolute inset-0 overflow-hidden rounded-lg border border-amber-50/20 bg-black/20 shadow-xl ${editableSide === "front" ? "touch-none select-none" : ""}`}
              style={{ backfaceVisibility: "hidden" }}
            >
              {frontSrc && (
                <img
                  src={frontSrc}
                  alt=""
                  draggable={false}
                  className={`h-full w-full object-cover ${editableSide === "front" ? "pointer-events-none" : ""}`}
                />
              )}

              {editableSide === "front" && renderStickerOverlay(frontStickers)}
            </div>

            {/* Back face */}
            <div
              ref={backStageRef}
              onPointerMove={
                editableSide === "back" ? handleStickerPointerMove : undefined
              }
              onPointerUp={
                editableSide === "back" ? handleStickerPointerUp : undefined
              }
              onPointerCancel={
                editableSide === "back" ? handleStickerPointerUp : undefined
              }
              onClickCapture={(e) => {
                if (editableSide === "back" && e.target === e.currentTarget) {
                  setSelectedStickerId(null);
                }
              }}
              className={`absolute inset-0 overflow-hidden rounded-lg border border-amber-50/20 bg-black/20 shadow-xl ${editableSide === "back" ? "touch-none select-none" : ""}`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {backSrc && (
                <img
                  src={backSrc}
                  alt=""
                  draggable={false}
                  className={`h-full w-full object-cover ${editableSide === "back" ? "pointer-events-none" : ""}`}
                />
              )}

              {editableSide === "back" && renderStickerOverlay(backStickers)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
