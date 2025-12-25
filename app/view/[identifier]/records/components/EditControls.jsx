"use client";
import { HiStar, HiOutlineStar, HiTrash } from "react-icons/hi";

export default function EditControls({
  activeItem,
  isEditing,
  onToggleHighlight,
  onDeleteItem,
  onImageChange,
  onImageDelete,
  currentImageIndex,
  mainImageInputRef,
  itemImageInputRef,
  cropState,
  isMobile = false,
}) {
  if (!isEditing) return null;

  const badgePrefix = isMobile ? "lr-mobile" : "lr";

  return (
    <>
      {activeItem.kind !== "main" && (
        <>
          <button
            className={`${badgePrefix}-fav-badge ${badgePrefix}-fav-toggle ${
              activeItem?.isHighlight ? "active" : ""
            }`}
            aria-label="즐겨찾기 토글"
            onClick={() => {
              onToggleHighlight?.(activeItem.id);
            }}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              opacity: activeItem?.isHighlight ? 1 : 0.5,
              top: isMobile ? undefined : "10px",
            }}
          >
            {activeItem?.isHighlight ? (
              <HiStar size={18} />
            ) : (
              <HiOutlineStar size={18} />
            )}
          </button>
          <button
            className={`${badgePrefix}-delete-badge`}
            aria-label="삭제"
            onClick={() => {
              onDeleteItem?.(activeItem.id);
            }}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              top: isMobile ? undefined : "48px",
            }}
          >
            <HiTrash size={18} />
          </button>
        </>
      )}
      {/* 이미지가 있을 때만 이미지 변경/삭제 버튼 표시 */}
      {((activeItem.kind === "main" && activeItem.cover) ||
        (activeItem.kind !== "main" &&
          activeItem.images &&
          activeItem.images[currentImageIndex])) && (
        <>
          <button
            className={`${badgePrefix}-image-change-badge`}
            aria-label="이미지 변경"
            onClick={() => {
              if (!cropState.isActive) {
                if (activeItem.kind === "main") {
                  mainImageInputRef?.current?.click();
                } else {
                  itemImageInputRef?.current?.click();
                }
              }
            }}
            disabled={cropState.isActive}
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
          {activeItem.kind !== "main" &&
            onImageDelete &&
            activeItem.images &&
            activeItem.images[currentImageIndex] && (
              <button
                className={`${badgePrefix}-image-delete-badge`}
                aria-label="이미지 삭제"
                onClick={() => {
                  if (!cropState.isActive) {
                    onImageDelete(activeItem.id, currentImageIndex);
                  }
                }}
                disabled={cropState.isActive}
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>이미지 삭제</span>
              </button>
            )}
        </>
      )}
    </>
  );
}



