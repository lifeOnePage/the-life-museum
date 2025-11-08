"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  onActiveItemChange,
  isUploadingImage = false,
}) {
  const router = useRouter();
  // API 데이터를 timeline 형식으로 변환
  const timeline = useMemo(() => {
    const result = [];

    // 메인 아이템
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

  const [rotation, setRotation] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const DEFAULT_THEME = BG_THEME_PALETTE[0];
  const mainImageInputRef = useRef(null);
  const itemImageInputRef = useRef(null);

  const activeItem = timeline[activeIdx] || {};

  // 활성화된 item 변경 시 부모에게 알림
  useEffect(() => {
    if (onActiveItemChange && activeItem) {
      onActiveItemChange({
        id: activeItem.id,
        kind: activeItem.kind,
        color: activeItem.color || data.record?.color || "#121212",
      });
    }
  }, [activeIdx, activeItem, onActiveItemChange, data.record?.color]);

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

  const snapToIndex = (i, anchor = getAnchor()) => {
    const base = angleForIndex(i);
    const cur = norm360(base + rotation);
    const delta = wrapTo180(anchor - cur);
    // 마우스 클릭 시에도 scroll sound 재생
    if (scrollSound.current) {
      scrollSound.current.currentTime = 0;
      scrollSound.current.play().catch((err) => {
        console.error("Scroll sound 재생 실패:", err);
      });
    }
    setRotation(rotation + delta);
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

  const safeIdx = Math.min(activeIdx, Math.max(0, (timeline?.length || 1) - 1));
  const mainTitle = useMemo(() => {
    const mainItem = timeline.find((it) => it.kind === "main");
    return mainItem?.title || "사용자의 이야기";
  }, [timeline]);

  return (
    <main
      className="lr-page"
      style={{ ["--bg"]: theme.bg, ["--text"]: theme.text }}
    >
      {/* BGM 재생 버튼 (우측 상단 고정) */}
      {!isEditing && data.record?.bgm && (
        <button
          onClick={handleBgmToggle}
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 10000,
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
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
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
                    className="lr-cover"
                    src={activeItem.video}
                    controls
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <>
                    <img
                      src={activeItem.cover || "/images/records/No image.png"}
                      alt="cover"
                      className="lr-cover"
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

                {!isEditing && activeItem?.isHighlight && (
                  <div className="lr-fav-badge" aria-label="즐겨찾기">
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
                      className="lr-image-change-badge"
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
                        bottom: "10px",
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

              <div className="lr-card-desc">
                {activeItem.kind === "main" ? (
                  <>
                    <div className="lr-meta lr-meta--mainTop">
                      {isEditing ? (
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
                          className="lr-name"
                          placeholder="레코드의 제목을 입력하세요"
                        />
                      ) : (
                        <div className="lr-name">{mainTitle}</div>
                      )}
                    </div>
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
                const phi = angleForIndex(i) + rotation;
                return (
                  <span
                    key={item.id}
                    className={`year-item ${i === activeIdx ? "active" : ""}`}
                    style={{
                      transform: `rotate(${phi}deg) translate(${RADIUS}px) rotate(${-phi}deg)`,
                    }}
                    onClick={() => snapToIndex(i)}
                  >
                    {item.label}
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
        <div className="footer-logo">The Life Gallery</div>
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
