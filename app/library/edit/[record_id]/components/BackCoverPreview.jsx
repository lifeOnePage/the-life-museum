"use client";

import { useMemo } from "react";

const BackCoverPreview = ({
  bio,
  timeline,
  theme,
  layout,
  albumTitle,
  artistName,
  zoom = 85,
}) => {
  const scale = zoom / 100;

  const storyLines = useMemo(() => {
    if (!bio) return [];
    return bio.split("\n").filter((line) => line.trim());
  }, [bio]);

  const renderSplitView = () => (
    <div className="flex h-full">
      {/* STORY side */}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-4 overflow-hidden">
        <p
          className="mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: theme.year }}
        >
          STORY
        </p>
        <div className="flex-1 overflow-hidden">
          {storyLines.length > 0 ? (
            <div className="space-y-2">
              {storyLines.map((line, i) => (
                <p
                  key={i}
                  className="text-[9px] leading-[1.6]"
                  style={{ color: theme.text }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p
              className="text-[9px] italic opacity-40"
              style={{ color: theme.text }}
            >
              스토리를 입력하세요...
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-px self-stretch my-6"
        style={{ backgroundColor: theme.divider }}
      />

      {/* TIMELINE side */}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-4 overflow-hidden">
        <p
          className="mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: theme.year }}
        >
          TIMELINE
        </p>
        <div className="flex-1 overflow-hidden">
          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span
                    className="shrink-0 text-[9px] font-bold"
                    style={{ color: theme.year }}
                  >
                    {item.year || "—"}
                  </span>
                  <span
                    className="text-[9px] leading-[1.5]"
                    style={{ color: theme.text }}
                  >
                    {item.event || "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="text-[9px] italic opacity-40"
              style={{ color: theme.text }}
            >
              타임라인을 추가하세요...
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderChronological = () => (
    <div className="flex h-full flex-col px-6 pt-6 pb-4 overflow-hidden">
      <p
        className="mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: theme.year }}
      >
        TIMELINE
      </p>
      <div className="flex-1 overflow-hidden">
        {timeline.length > 0 ? (
          <div className="space-y-2">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-baseline gap-3">
                <span
                  className="shrink-0 text-[10px] font-bold tabular-nums"
                  style={{ color: theme.year }}
                >
                  {item.year || "—"}
                </span>
                <span
                  className="text-[9px] leading-[1.5]"
                  style={{ color: theme.text }}
                >
                  {item.event || "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p
            className="text-[9px] italic opacity-40"
            style={{ color: theme.text }}
          >
            타임라인을 추가하세요...
          </p>
        )}
      </div>
      {storyLines.length > 0 && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: theme.divider }}>
          <p
            className="mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: theme.year }}
          >
            STORY
          </p>
          {storyLines.map((line, i) => (
            <p
              key={i}
              className="text-[9px] leading-[1.6]"
              style={{ color: theme.text }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  const renderPhotoGrid = () => (
    <div className="flex h-full flex-col px-6 pt-6 pb-4 overflow-hidden">
      <p
        className="mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: theme.year }}
      >
        HIGHLIGHTS
      </p>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {timeline.slice(0, 4).map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-sm p-2"
            style={{ backgroundColor: `${theme.year}10` }}
          >
            <span
              className="text-[11px] font-bold"
              style={{ color: theme.year }}
            >
              {item.year || "—"}
            </span>
            <span
              className="mt-1 text-center text-[8px] leading-tight"
              style={{ color: theme.text }}
            >
              {item.event || "—"}
            </span>
          </div>
        ))}
        {timeline.length < 4 &&
          Array.from({ length: 4 - timeline.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center rounded-sm border border-dashed opacity-30"
              style={{ borderColor: theme.text }}
            >
              <span className="text-[8px]" style={{ color: theme.text }}>
                +
              </span>
            </div>
          ))}
      </div>
      {storyLines.length > 0 && (
        <div className="mt-3">
          <p
            className="text-[9px] leading-[1.6] line-clamp-3"
            style={{ color: theme.text }}
          >
            {bio}
          </p>
        </div>
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case "chronological":
        return renderChronological();
      case "photo-grid":
        return renderPhotoGrid();
      case "split-view":
      default:
        return renderSplitView();
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div
        className="relative aspect-square w-[360px] overflow-hidden rounded-sm shadow-lg"
        style={{
          backgroundColor: theme.bg,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          transition: "transform 0.2s ease",
        }}
      >
        {/* Content area */}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-hidden">{renderLayout()}</div>

          {/* Bottom branding */}
          <div className="flex items-center justify-center pb-4 pt-1">
            <span
              className="text-[7px] tracking-[0.3em] uppercase"
              style={{ color: theme.branding }}
            >
              THE LIFE MUSEUM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackCoverPreview;
