"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
}) {
  const router = useRouter();
  // API 데이터를 timeline 형식으로 변환
  const timeline = useMemo(() => {
    const result = [];

    if (data.record) {
      result.push({
        id: "PLAY",
        kind: "main",
        label: "PLAY",
        title: data.record.name || "사용자의 이야기",
        date: "",
        location: "",
        desc: data.record.description || "",
        cover: data.record.coverUrl || "/images/records/No image.png",
        isHighlight: false,
      });
    }

    // RecordItems를 year 타입으로 변환하고 연도 순서대로 정렬
    const items = (data.items || []).map((item) => {
      const [y] = (item.date || "").split(".");
      return {
        id: item.id,
        kind: "year",
        label: y || item.id.toString(),
        event: item.title || "",
        date: item.date || "",
        location: item.location || "",
        cover: item.coverUrl || "/images/records/No image.png",
        desc: item.description || "",
        isHighlight: item.isHighlight || false,
        color: item.color || "",
        year: y ? parseInt(y, 10) : 0, // 정렬을 위한 연도 숫자
      };
    });

    // 연도 순서대로 정렬 (오름차순: 오래된 것부터)
    items.sort((a, b) => {
      // 연도가 없는 경우 뒤로
      if (!a.year && !b.year) return 0;
      if (!a.year) return 1;
      if (!b.year) return -1;
      return a.year - b.year;
    });

    result.push(...items);

    return result;
  }, [data]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const DEFAULT_THEME = BG_THEME_PALETTE[0];
  const mainImageInputRef = useRef(null);
  const itemImageInputRef = useRef(null);

  // API에서 받은 color를 사용하여 테마 설정
  const theme = useMemo(() => {
    if (data.record?.color) {
      const colorHex = data.record.color;
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
  }, [data.record?.color]);

  const activeItem = timeline[activeIdx] || {};

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
      <header className="lr-mobile-header">
        <div className="lr-mobile-title">Life-Records</div>
        <div className="lr-mobile-desc">
          <b>{data.record?.userName || "사용자"}</b>님의 포스트 카드입니다.
          <br />
          "작은 장면을 모아 긴 기억을 만듭니다"
        </div>
      </header>

      <div className="lr-mobile-cover-wrap">
        {isEditing && (
          <input
            ref={
              activeItem.kind === "main" ? mainImageInputRef : itemImageInputRef
            }
            type="file"
            accept="image/*,video/*"
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
        {activeItem.video ? (
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
                    top: "12px",
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
                    top: "50px",
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
                bottom: "12px",
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
                />
                <div className="lr-mobile-char-count">
                  {(data.record?.description || "").length} / 80
                </div>
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
                      placeholder="2001.08.23"
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
                      placeholder="장소"
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
        <span>home</span>
        <span
          onClick={handlePrev}
          style={{
            cursor: activeIdx === 0 ? "not-allowed" : "pointer",
            opacity: activeIdx === 0 ? 0.3 : 1,
          }}
        >
          &lt;
        </span>
        <span>{activeItem.label || "PLAY"}</span>
        <span
          onClick={handleNext}
          style={{
            cursor:
              activeIdx === timeline.length - 1 ? "not-allowed" : "pointer",
            opacity: activeIdx === timeline.length - 1 ? 0.3 : 1,
          }}
        >
          &gt;
        </span>
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
