"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageCropOverlay from "@/app/edit/[username]/records/components/ImageCropOverlay";
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

function formatDate(str) {
  if (!str) return "";
  const parts = str.split(".").map((s) => parseInt(s, 10));
  const [y, m, d] = parts;

  if (!y) return "";
  if (!m) return String(y);
  if (!d) return `${y} ${MONTHS[m - 1]}`;

  const monthName = MONTHS[m - 1] || "";
  const day = String(d).padStart(2, "0");
  return `${y} ${monthName} ${day}`;
}

export default function LifeRecordMobile({
  data,
  isEditing = false,
  onDataChange,
  onDeleteItem,
  onImageChange,
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

  // API 데이터를 timeline 형식으로 변환
  const timeline = useMemo(() => {
    const result = [];

    if (data.record) {
      const coverUrl = data.record.coverUrl || "/images/records/No image.png";
      const isVideo = coverUrl.match(/\.(mp4|mov|webm|m4v|avi)$/i);
      result.push({
        id: "home",
        kind: "main",
        label: "home",
        title: data.record.name || "사용자의 이야기",
        date: "",
        location: "",
        desc: data.record.description || "",
        cover: isVideo ? null : coverUrl,
        video: isVideo ? coverUrl : null,
        isHighlight: data.record?.isHighlight || false,
      });
    }

    // RecordItems를 year 타입으로 변환
    const items = (data.items || []).map((item) => {
      const [y] = (item.date || "").split(".");
      const coverUrl = item.coverUrl || "/images/records/No image.png";
      const isVideo = coverUrl.match(/\.(mp4|mov|webm|m4v|avi)$/i);
      return {
        id: item.id,
        kind: "year",
        label: y || item.id.toString(),
        event: item.title || "",
        date: item.date || "",
        location: item.location || "",
        cover: isVideo ? null : coverUrl,
        video: isVideo ? coverUrl : null,
        desc: item.description || "",
        isHighlight: item.isHighlight || false,
        color: item.color || "",
        year: y ? parseInt(y, 10) : 0, // 정렬을 위한 연도 숫자
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
  }, [data, editingDateItemId]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const DEFAULT_THEME = BG_THEME_PALETTE[0];
  const mainImageInputRef = useRef(null);
  const itemImageInputRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const isNavigatingRef = useRef(false); // 외부에서 명시적으로 이동 중인지 추적
  const activeItemIdRef = useRef(null); // 현재 활성화된 항목의 ID 추적

  const activeItem = timeline[activeIdx] || {};

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
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIdx(newIdx);
          setIsTransitioning(false);
        }, 150);
      }
    }
  }, [timeline]);

  // 외부에서 인덱스 변경 요청 처리
  useEffect(() => {
    if (onNavigateToItem !== undefined && onNavigateToItem !== null) {
      isNavigatingRef.current = true; // 외부 이동 시작
      const targetIdx = Math.max(
        0,
        Math.min(onNavigateToItem, timeline.length - 1),
      );
      if (targetIdx !== activeIdx) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIdx(targetIdx);
          setIsTransitioning(false);
        }, 150);
      }
      // 사용 후 리셋 (무한 루프 방지)
      if (onActiveItemChangeRef.current) {
        onActiveItemChangeRef.current({
          id: timeline[targetIdx]?.id,
          kind: timeline[targetIdx]?.kind,
          color: timeline[targetIdx]?.color || data.record?.color || "#121212",
          index: targetIdx,
          label: timeline[targetIdx]?.label,
          event: timeline[targetIdx]?.event,
        });
      }
      // 이동 완료 후 플래그 리셋
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [onNavigateToItem, timeline.length]);

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

  // 활성화된 item 변경 시 부모에게 알림
  const prevActiveIdxRef = useRef(activeIdx);
  const prevActiveItemIdRef = useRef(activeItem?.id);
  const onActiveItemChangeRef = useRef(onActiveItemChange);

  // onActiveItemChange ref 업데이트
  useEffect(() => {
    onActiveItemChangeRef.current = onActiveItemChange;
  }, [onActiveItemChange]);

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
        label: activeItem.label, // label 추가
        event: activeItem.event, // event 추가
      });
    }
  }, [
    activeIdx,
    activeItem?.id,
    activeItem?.kind,
    activeItem?.color,
    activeItem?.event,
    activeItem?.label,
    data.record?.color,
  ]);

  // 활성화된 item의 color를 우선 사용, 없으면 record의 color 사용
  const theme = useMemo(() => {
    // 활성화된 item의 color가 있으면 우선 사용
    const colorHex = activeItem.color || data.record?.color;
    if (colorHex) {
      const matchedTheme = BG_THEME_PALETTE.find(
        (t) => t.bg.toLowerCase() === colorHex.toLowerCase(),
      );
      if (matchedTheme) {
        return matchedTheme;
      }
      return {
        bg: colorHex,
        text: "#F2F2F2",
      };
    }
    return DEFAULT_THEME;
  }, [activeItem.color, data.record?.color]);

  const mainTitle = useMemo(() => {
    const mainItem = timeline.find((it) => it.kind === "main");
    return mainItem?.title || "사용자의 이야기";
  }, [timeline]);

  const handlePrev = () => {
    if (activeIdx === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx((i) => Math.max(0, i - 1));
      setIsTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    if (activeIdx === timeline.length - 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx((i) => Math.min(timeline.length - 1, i + 1));
      setIsTransitioning(false);
    }, 150);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleSelectItem = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx(index);
      setShowMenu(false);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <main
      className="lr-mobile-root"
      style={{ ["--bg"]: theme.bg, ["--text"]: theme.text }}
    >
      {/* BGM 재생 버튼 (우측 상단 고정) */}
      {!isEditing && data.record?.bgm && (
        <button
          onClick={handleBgmToggle}
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 10000,
            width: "44px",
            height: "44px",
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
          title={isBgmPlaying ? "음악 정지" : "음악 재생"}
        >
          {isBgmPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
      )}

      <header className="lr-mobile-header">
        <div className="lr-mobile-title">Life-Records</div>
        <div className="lr-mobile-desc">
          <b>{data.record?.userName || "사용자"}</b>님의 라이프 레코드입니다.
          <br />
          "작은 장면을 모아 긴 기억을 만듭니다"
        </div>
      </header>

      <div className="lr-mobile-cover-wrap" style={{ position: "relative" }}>
        {isEditing && (
          <input
            ref={
              activeItem.kind === "main" ? mainImageInputRef : itemImageInputRef
            }
            type="file"
            accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageChange) {
                if (activeItem.kind === "main") {
                  onImageChange("main", null, file);
                } else {
                  onImageChange("item", activeItem.id, file);
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
          (cropState.type === "item" && cropState.itemId === activeItem.id)) ? (
          <div
            className={`lr-mobile-cover ${isTransitioning ? "fade-out" : "fade-in"}`}
            style={{ position: "relative", width: "100%", height: "100%" }}
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
            className={`lr-mobile-cover ${
              isTransitioning ? "fade-out" : "fade-in"
            }`}
            src={activeItem.video}
            controls
            playsInline
            autoPlay
            loop
            key={activeIdx}
          />
        ) : (
          <>
            <img
              className={`lr-mobile-cover ${
                isTransitioning ? "fade-out" : "fade-in"
              }`}
              src={activeItem.cover || "/images/records/No image.png"}
              alt="앨범 커버"
              key={activeIdx}
              onError={(e) => {
                e.target.src = "/images/records/No image.png";
              }}
            />
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
        {!isEditing &&
          activeItem?.isHighlight &&
          activeItem.kind !== "main" && (
            <div className="lr-mobile-fav-badge" aria-label="즐겨찾기">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        {isEditing && (
          <>
            {activeItem.kind !== "main" && (
              <>
                <button
                  className={`lr-mobile-fav-badge lr-mobile-fav-toggle ${activeItem?.isHighlight ? "active" : ""}`}
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
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  className="lr-mobile-delete-badge"
                  aria-label="삭제"
                  onClick={() => {
                    onDeleteItem?.(activeItem.id);
                  }}
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                  }}
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
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </>
            )}
            <button
              className="lr-mobile-image-change-badge"
              aria-label="이미지 변경"
              onClick={() => {
                if (activeItem.kind === "main") {
                  mainImageInputRef.current?.click();
                } else {
                  itemImageInputRef.current?.click();
                }
              }}
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
              }}
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
          </>
        )}
      </div>

      <div
        className={`lr-mobile-meta ${isTransitioning ? "fade-out" : "fade-in"}`}
      >
        {activeItem.kind === "main" ? (
          <>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={data.record?.name || ""}
                  onChange={(e) => {
                    const newData = {
                      ...data,
                      record: { ...data.record, name: e.target.value },
                    };
                    onDataChange?.(newData);
                  }}
                  className="lr-mobile-meta-title lr-mobile-edit-input"
                  placeholder="레코드의 제목을 입력하세요"
                />
                <textarea
                  value={data.record?.description || ""}
                  onChange={(e) => {
                    const newData = {
                      ...data,
                      record: { ...data.record, description: e.target.value },
                    };
                    onDataChange?.(newData);
                  }}
                  className="lr-mobile-meta-desc lr-mobile-edit-input"
                  maxLength={80}
                  placeholder="이 레코드에 대한 간단한 소개를 적어보세요 (최대 80자)"
                />
                <div className="lr-mobile-char-count">
                  {(data.record?.description || "").length} / 80
                </div>
                {/* 하이라이트된 타임라인 아이템 표시 */}
                {timeline.filter((it) => it.isHighlight && it.kind !== "main")
                  .length > 0 && (
                  <div className="lr-mobile-highlight-grid">
                    {timeline
                      .filter((it) => it.isHighlight && it.kind !== "main")
                      .slice(0, 10)
                      .map((it) => (
                        <div
                          key={it.id}
                          className="lr-mobile-highlight-item"
                          onClick={() => {
                            const i = timeline.findIndex((x) => x.id === it.id);
                            if (i >= 0) {
                              setIsTransitioning(true);
                              setTimeout(() => {
                                setActiveIdx(i);
                                setIsTransitioning(false);
                              }, 150);
                            }
                          }}
                        >
                          <img
                            src={it.cover || "/images/records/No image.png"}
                            alt={it.kind === "year" ? it.event : it.title}
                          />
                          <span className="lr-mobile-highlight-title">
                            {it.kind === "year" ? it.event : it.title}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="lr-mobile-meta-title">{mainTitle}</div>
                <div
                  className="lr-mobile-meta-desc"
                  style={{ marginBottom: "16px" }}
                >
                  {activeItem.desc}
                </div>
                {/* 하이라이트된 타임라인 아이템 표시 */}
                {timeline.filter((it) => it.isHighlight && it.kind !== "main")
                  .length > 0 && (
                  <div className="lr-mobile-highlight-grid">
                    {timeline
                      .filter((it) => it.isHighlight && it.kind !== "main")
                      .slice(0, 10)
                      .map((it) => (
                        <div
                          key={it.id}
                          className="lr-mobile-highlight-item"
                          onClick={() => {
                            const i = timeline.findIndex((x) => x.id === it.id);
                            if (i >= 0) {
                              setIsTransitioning(true);
                              setTimeout(() => {
                                setActiveIdx(i);
                                setIsTransitioning(false);
                              }, 150);
                            }
                          }}
                        >
                          <img
                            src={it.cover || "/images/records/No image.png"}
                            alt={it.kind === "year" ? it.event : it.title}
                          />
                          <span className="lr-mobile-highlight-title">
                            {it.kind === "year" ? it.event : it.title}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <textarea
                  value={
                    data.items?.find((item) => item.id === activeItem.id)
                      ?.description || ""
                  }
                  onChange={(e) => {
                    const newItems = data.items.map((item) =>
                      item.id === activeItem.id
                        ? { ...item, description: e.target.value }
                        : item,
                    );
                    onDataChange?.({ ...data, items: newItems });
                  }}
                  className="lr-mobile-meta-desc lr-mobile-edit-input"
                  maxLength={150}
                  placeholder="이 순간에 대한 이야기를 자유롭게 적어보세요 (최대 150자)"
                />
                <div className="lr-mobile-char-count">
                  {
                    (
                      data.items?.find((item) => item.id === activeItem.id)
                        ?.description || ""
                    ).length
                  }{" "}
                  / 150
                </div>
                <div className="lr-mobile-meta-info">
                  <textarea
                    value={
                      data.items?.find((item) => item.id === activeItem.id)
                        ?.title || ""
                    }
                    onChange={(e) => {
                      const newItems = data.items.map((item) =>
                        item.id === activeItem.id
                          ? { ...item, title: e.target.value }
                          : item,
                      );
                      onDataChange?.({ ...data, items: newItems });
                    }}
                    className="lr-mobile-meta-name lr-mobile-edit-input"
                    rows={2}
                    placeholder="이 순간을 표현할 수 있는 제목을 입력하세요"
                  />
                  <div className="lr-mobile-meta-right">
                    <input
                      type="text"
                      value={
                        data.items?.find((item) => item.id === activeItem.id)
                          ?.date || ""
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
                        }
                      }}
                      onBlur={() => {
                        // 날짜 입력 완료 - 정렬하고 새 위치로 이동
                        if (activeItem?.id) {
                          setEditingDateItemId(null);

                          // 정렬된 위치 계산
                          const sortedItems = [...(data.items || [])].map(
                            (item) => {
                              const [y] = (item.date || "").split(".");
                              return {
                                ...item,
                                year: y ? parseInt(y, 10) : 0,
                              };
                            },
                          );

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
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setActiveIdx(targetIdx);
                              setIsTransitioning(false);
                            }, 150);
                          }
                        }
                      }}
                      placeholder="예: 2024.01.15"
                      className="lr-mobile-meta-date lr-mobile-edit-input"
                    />
                    <input
                      type="text"
                      value={
                        data.items?.find((item) => item.id === activeItem.id)
                          ?.location || ""
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
                      className="lr-mobile-meta-location lr-mobile-edit-input"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lr-mobile-meta-desc">{activeItem.desc}</div>
                <div className="lr-mobile-meta-info">
                  <div className="lr-mobile-meta-name">
                    {activeItem.kind === "year"
                      ? activeItem.event
                      : activeItem.title}
                  </div>
                  <div className="lr-mobile-meta-right">
                    <div className="lr-mobile-meta-date">
                      {formatDate(activeItem.date)}
                    </div>
                    {activeItem.location && (
                      <div className="lr-mobile-meta-location">
                        {activeItem.location}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <nav className="lr-mobile-nav">
        <span
          onClick={() => {
            const mainIdx = timeline.findIndex((it) => it.kind === "main");
            if (mainIdx >= 0) {
              setIsTransitioning(true);
              setTimeout(() => {
                setActiveIdx(mainIdx);
                setIsTransitioning(false);
              }, 150);
            }
          }}
          style={{
            cursor: activeIdx === 0 ? "default" : "pointer",
            opacity: activeIdx === 0 ? 0 : 1,
            pointerEvents: activeIdx === 0 ? "none" : "auto",
          }}
        >
          home
        </span>
        <div className="lr-mobile-nav-timeline">
          <span
            onClick={handlePrev}
            style={{
              cursor: activeIdx === 0 ? "default" : "pointer",
              opacity: activeIdx === 0 ? 0 : 1,
              pointerEvents: activeIdx === 0 ? "none" : "auto",
            }}
          >
            &lt;
          </span>
          <span>{activeItem.label || "home"}</span>
          <span
            onClick={handleNext}
            style={{
              cursor: activeIdx === timeline.length - 1 ? "default" : "pointer",
              opacity: activeIdx === timeline.length - 1 ? 0 : 1,
              pointerEvents:
                activeIdx === timeline.length - 1 ? "none" : "auto",
            }}
          >
            &gt;
          </span>
        </div>
        <span onClick={handleMenuClick} style={{ cursor: "pointer" }}>
          ≡
        </span>
      </nav>

      <footer className="lr-mobile-footer">
        <div className="lr-mobile-footer-logo">The Life Gallery</div>
        <div className="lr-mobile-footer-copyright">
          Copyright 2025. Creative Computing Group.
          <br />
          All rights reserved.
        </div>
        {!isEditing && (
          <button
            className="lr-mobile-login-btn"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        )}
      </footer>

      {showMenu && (
        <div className="lr-mobile-menu-overlay" onClick={handleMenuClick}>
          <div className="lr-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="lr-mobile-menu-header">
              <h3>타임라인 목록</h3>
              <button
                className="lr-mobile-menu-close"
                onClick={handleMenuClick}
              >
                ✕
              </button>
            </div>
            <div className="lr-mobile-menu-list">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className={`lr-mobile-menu-item ${
                    index === activeIdx ? "active" : ""
                  }`}
                  onClick={() => handleSelectItem(index)}
                >
                  <div className="lr-mobile-menu-item-cover">
                    <img
                      src={item.cover || "/images/records/No image.png"}
                      alt={item.kind === "year" ? item.event : item.title}
                    />
                  </div>
                  <div className="lr-mobile-menu-item-info">
                    <div className="lr-mobile-menu-item-label">
                      {item.label}
                    </div>
                    <div className="lr-mobile-menu-item-title">
                      {item.kind === "main"
                        ? item.title
                        : item.kind === "year"
                          ? item.event
                          : item.title}
                    </div>
                    {item.kind === "year" && item.date && (
                      <div className="lr-mobile-menu-item-date">
                        {formatDate(item.date)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
