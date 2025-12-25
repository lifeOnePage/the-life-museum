"use client";
import { HiPlay, HiStop, HiVolumeUp, HiVolumeOff } from "react-icons/hi";

export default function ControlButtons({
  isEditing,
  autoSlideEnabled,
  onAutoSlideEnabledChange,
  bgmUrl,
  isBgmPlaying,
  onBgmToggle,
  theme,
  isMobile = false,
}) {
  if (isEditing) return null;

  const buttonSize = isMobile ? "44px" : "48px";
  const iconSize = isMobile ? 20 : 24;
  const gap = isMobile ? "8px" : "12px";
  const top = isMobile ? "16px" : "24px";
  const right = isMobile ? "16px" : "24px";

  return (
    <div
      style={{
        position: "fixed",
        top: top,
        right: right,
        zIndex: 10000,
        display: "flex",
        gap: gap,
        flexDirection: "column",
      }}
    >
      {bgmUrl && (
        <button
          onClick={onBgmToggle}
          style={{
            width: buttonSize,
            height: buttonSize,
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
            <HiVolumeUp size={iconSize} />
          ) : (
            <HiVolumeOff size={iconSize} />
          )}
        </button>
      )}
      <button
        onClick={() => onAutoSlideEnabledChange(!autoSlideEnabled)}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: "50%",
          background: autoSlideEnabled
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
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = autoSlideEnabled
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.1)";
        }}
        title={autoSlideEnabled ? "자동재생 끄기" : "자동재생 켜기"}
      >
        {autoSlideEnabled ? (
          <HiStop size={iconSize} />
        ) : (
          <HiPlay size={iconSize} />
        )}
      </button>
    </div>
  );
}
