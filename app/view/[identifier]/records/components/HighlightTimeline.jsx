"use client";
import { HiHome } from "react-icons/hi";
import { getYear, calculateAge } from "../utils/dateUtils";

export default function HighlightTimeline({
  timeline,
  displayMode,
  birthDate,
  onItemClick,
  isMobile = false,
}) {
  const highlightedItems = timeline
    .filter((it) => it.isHighlight && it.kind !== "main")
    .slice(0, 10);

  if (highlightedItems.length === 0) return null;

  const prefix = isMobile ? "lr-mobile" : "lr";

  const getDateLabel = (item) => {
    if (!item.date) return "";
    if (displayMode === "age" && birthDate) {
      const age = calculateAge(birthDate, item.date);
      return age !== null ? `${age}세` : "";
    }
    const year = getYear(item.date);
    return year ? year.trim() : "";
  };

  return (
    <>
      <div className={`${prefix}-highlight-grid`} role="list">
        {highlightedItems.map((it) => {
          const dateLabel = getDateLabel(it);
          return (
            <div
              key={it.id}
              className={`${prefix}-highlight-item`}
              role="listitem"
              title={
                (it.kind === "year" ? it.event : it.title) || "하이라이트"
              }
              onClick={() => {
                onItemClick?.(it.id);
              }}
            >
              <div className={`${prefix}-highlight-image-wrapper`}>
                <img
                  src={it.cover || "/images/records/No image.png"}
                  alt={
                    (it.kind === "year" ? it.event : it.title) || "highlight"
                  }
                />
              </div>
              <span className={`${prefix}-highlight-title`}>
                {it.kind === "year" ? it.event : it.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className={`${prefix}-highlight-timeline`}>
        <div className={`${prefix}-timeline-line`}></div>
        <div className={`${prefix}-timeline-markers`}>
          {highlightedItems.map((it, index) => {
            const colIndex = index % 5;
            const dateLabel = getDateLabel(it);
            return (
              <div
                key={it.id}
                className={`${prefix}-timeline-marker`}
                style={{
                  gridColumn: colIndex + 1,
                }}
                onClick={() => {
                  onItemClick?.(it.id);
                }}
              >
                <div className={`${prefix}-timeline-connector`}></div>
                <div className={`${prefix}-timeline-dot`}></div>
                {it.date && (
                  <div className={`${prefix}-timeline-date`}>
                    {dateLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}



