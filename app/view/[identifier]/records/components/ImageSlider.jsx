"use client";
import { useState, useEffect } from "react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";

export default function ImageSlider({
  images = [],
  currentIndex: controlledIndex,
  onIndexChange,
  isEditing = false,
  onImageClick,
  onEmptySlotClick,
  cropState = { isActive: false },
  isMobile = false,
  isTransitioning = false,
  onTouchStart,
  onTouchEnd,
  className = "",
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;

  const validImages = images.filter((img) => img);
  const maxSlots = isEditing ? 5 : validImages.length;
  const displayImages = isEditing
    ? images.slice(0, 5)
    : validImages;

  const handleIndexChange = (newIndex) => {
    if (isControlled) {
      onIndexChange?.(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      handleIndexChange(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    const maxIndex = isEditing ? maxSlots - 1 : validImages.length - 1;
    if (currentIndex < maxIndex) {
      handleIndexChange(currentIndex + 1);
    }
  };

  const handleIndicatorClick = (idx, e) => {
    e?.stopPropagation();
    handleIndexChange(idx);
  };

  const sliderClassName = isMobile
    ? `lr-mobile-image-slider ${className}`
    : `lr-image-slider ${className}`;
  const coverClassName = isMobile
    ? `lr-mobile-cover ${isTransitioning ? "fade-out" : "fade-in"}`
    : "lr-cover";

  if (isEditing) {
    return (
      <div
        className={sliderClassName}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            width: `${maxSlots * 100}%`,
            height: "100%",
            transform: `translateX(-${currentIndex * (100 / maxSlots)}%)`,
            transition: "transform 0.3s ease",
          }}
        >
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                width: `${100 / maxSlots}%`,
                height: "100%",
                position: "relative",
              }}
            >
              {img ? (
                <div
                  onClick={(e) => {
                    if (!cropState.isActive && isEditing && onImageClick) {
                      e.stopPropagation();
                      e.preventDefault();
                      onImageClick(idx);
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    cursor:
                      cropState.isActive || !isEditing
                        ? "default"
                        : "pointer",
                  }}
                >
                  <img
                    src={img}
                    alt={`cover ${idx + 1}`}
                    className={coverClassName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/images/records/No image.png";
                    }}
                  />
                  {isEditing && !cropState.isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0)";
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0)";
                      }}
                    >
                      <span
                        style={{
                          opacity: 0,
                          color: "#fff",
                          fontSize: isMobile ? "11px" : "12px",
                          fontWeight: "500",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0";
                        }}
                      >
                        이미지 변경
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    if (!cropState.isActive && onEmptySlotClick) {
                      e.stopPropagation();
                      e.preventDefault();
                      onEmptySlotClick(idx);
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.1)",
                    border: "2px dashed rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: cropState.isActive ? "not-allowed" : "pointer",
                    color: "#000000",
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "500",
                    opacity: cropState.isActive ? 0.5 : 1,
                  }}
                >
                  + 이미지 추가
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 좌우 화살표 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: isMobile ? "rgba(0, 0, 0, 0.5)" : "transparent",
              border: "none",
              color: "white",
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              fontSize: isMobile ? "18px" : "auto",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
            }}
            aria-label="이전 이미지"
          >
            {isMobile ? (
              "←"
            ) : (
              <IoIosArrowDropleftCircle size={30} />
            )}
          </button>
        )}
        {currentIndex < maxSlots - 1 && (
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: isMobile ? "rgba(0, 0, 0, 0.5)" : "transparent",
              border: "none",
              color: "white",
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              fontSize: isMobile ? "18px" : "auto",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
            }}
            aria-label="다음 이미지"
          >
            {isMobile ? (
              "→"
            ) : (
              <IoIosArrowDroprightCircle size={30} />
            )}
          </button>
        )}
        {/* 인디케이터 */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? "10px" : "10px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: isMobile ? "6px" : "8px",
            zIndex: 2,
          }}
        >
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleIndicatorClick(idx, e)}
              style={{
                width: isMobile ? "6px" : "8px",
                height: isMobile ? "6px" : "8px",
                borderRadius: "50%",
                border: "none",
                background:
                  idx === currentIndex
                    ? isMobile
                      ? `color-mix(in srgb, var(--text) 90%, transparent)`
                      : "rgba(255, 255, 255, 0.9)"
                    : _ === null
                      ? isMobile
                        ? `color-mix(in srgb, var(--text) 20%, transparent)`
                        : "rgba(255, 255, 255, 0.2)"
                      : isMobile
                        ? `color-mix(in srgb, var(--text) 40%, transparent)`
                        : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`이미지 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // View 모드: 이미지가 있는 것만 슬라이드로 표시
  if (validImages.length > 1) {
    return (
      <div
        className={sliderClassName}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            width: `${validImages.length * 100}%`,
            height: "100%",
            transform: `translateX(-${currentIndex * (100 / validImages.length)}%)`,
            transition: "transform 0.3s ease",
            ...(isMobile && {
              position: "absolute",
              top: 0,
              left: 0,
            }),
          }}
        >
          {validImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`cover ${idx + 1}`}
              className={coverClassName}
              style={{
                width: `${100 / validImages.length}%`,
                height: "100%",
                objectFit: "cover",
                ...(isMobile && { display: "block" }),
              }}
              onError={(e) => {
                e.target.src = "/images/records/No image.png";
              }}
            />
          ))}
        </div>
        {/* 좌우 화살표 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: isMobile ? "rgba(0, 0, 0, 0.5)" : "transparent",
              border: "none",
              color: "white",
              width: isMobile ? "auto" : "auto",
              height: isMobile ? "auto" : "auto",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
            }}
            aria-label="이전 이미지"
          >
            {isMobile ? (
              "←"
            ) : (
              <IoIosArrowDropleftCircle size={30} color="white" />
            )}
          </button>
        )}
        {currentIndex < validImages.length - 1 && (
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: isMobile ? "rgba(0, 0, 0, 0.5)" : "transparent",
              border: "none",
              color: "white",
              width: isMobile ? "auto" : "auto",
              height: isMobile ? "auto" : "auto",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
            }}
            aria-label="다음 이미지"
          >
            {isMobile ? (
              "→"
            ) : (
              <IoIosArrowDroprightCircle size={30} color="white" />
            )}
          </button>
        )}
        {/* 인디케이터 */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? "12px" : "16px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: isMobile ? "6px" : "8px",
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          {validImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleIndicatorClick(idx, e)}
              style={{
                width: isMobile ? "8px" : "10px",
                height: isMobile ? "8px" : "10px",
                borderRadius: "50%",
                border: "none",
                background:
                  idx === currentIndex
                    ? isMobile
                      ? `color-mix(in srgb, var(--text) 90%, transparent)`
                      : "rgba(255, 255, 255, 0.9)"
                    : isMobile
                      ? `color-mix(in srgb, var(--text) 50%, transparent)`
                      : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                padding: 0,
                transition: "background 0.2s ease",
              }}
              aria-label={`이미지 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  } else if (validImages.length === 1) {
    return (
      <img
        src={validImages[0]}
        alt="cover"
        className={coverClassName}
        onError={(e) => {
          e.target.src = "/images/records/No image.png";
        }}
      />
    );
  }

  return null;
}



