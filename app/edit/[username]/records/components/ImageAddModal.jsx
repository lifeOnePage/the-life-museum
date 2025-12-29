"use client";
import { useState, useRef, useEffect } from "react";
import { uploadRecordFile } from "../services/editApi";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ImageAddModal({ isOpen, onClose, onSave, currentImages = [] }) {
  const { token } = useAuth();
  const [images, setImages] = useState(Array(5).fill(null)); // 5개 슬롯으로 초기화
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // 모달이 열릴 때마다 currentImages로 초기화
  useEffect(() => {
    if (isOpen) {
      // currentImages를 5개 슬롯으로 변환
      const paddedImages = [...(currentImages || [])];
      while (paddedImages.length < 5) {
        paddedImages.push(null);
      }
      setImages(paddedImages.slice(0, 5));
    }
  }, [isOpen, currentImages]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;

    // 현재 이미지 개수 확인 (null 제외)
    const currentCount = images.filter(img => img !== null).length;
    const availableSlots = 5 - currentCount;

    if (availableSlots <= 0) {
      alert("이미지는 최대 5장까지 추가할 수 있습니다.");
      e.target.value = "";
      return;
    }

    // 선택한 파일 중 처리할 파일만 추출 (최대 5장까지)
    const filesToProcess = files.slice(
      0,
      Math.min(files.length, availableSlots),
    );

    // 이미지/동영상 파일만 필터링
    const validFiles = filesToProcess.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    if (validFiles.length === 0) {
      alert("이미지 또는 동영상 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    // 5장 초과 시 경고
    if (files.length > availableSlots) {
      alert(
        `최대 ${availableSlots}장까지 추가할 수 있습니다. ${availableSlots}장만 추가됩니다.`,
      );
    }

    try {
      setIsUploading(true);

      // 모든 파일을 순차적으로 업로드
      const uploadedUrls = [];
      for (const file of validFiles) {
        const url = await uploadRecordFile({
          token,
          file,
          prefix: "records/timeline",
        });
        uploadedUrls.push(url);
      }

      // 기존 이미지 배열에 추가 (null 슬롯에 채우기)
      const newImages = [...images];
      let addedCount = 0;
      for (let i = 0; i < newImages.length && addedCount < uploadedUrls.length; i++) {
        if (newImages[i] === null) {
          newImages[i] = uploadedUrls[addedCount];
          addedCount++;
        }
      }
      // 남은 이미지는 뒤에 추가
      while (addedCount < uploadedUrls.length && newImages.length < 5) {
        newImages.push(uploadedUrls[addedCount]);
        addedCount++;
      }

      setImages(newImages);
    } catch (error) {
      console.error("미디어 업로드 실패:", error);
      alert("미디어 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    // images 배열을 5개로 채우기 (null로 패딩)
    const paddedImages = [...images];
    while (paddedImages.length < 5) {
      paddedImages.push(null);
    }

    onSave(paddedImages);
    handleClose();
  };

  const handleClose = () => {
    // currentImages로 리셋
    const paddedImages = [...(currentImages || [])];
    while (paddedImages.length < 5) {
      paddedImages.push(null);
    }
    setImages(paddedImages.slice(0, 5));
    setDraggedIndex(null);
    onClose();
  };

  const handleImageDelete = (index) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) {
      return;
    }
    
    const newImages = [...images];
    newImages[index] = null;
    // null을 제거하고 뒤에 추가하여 5개 유지
    const filtered = newImages.filter(img => img !== null);
    while (filtered.length < 5) {
      filtered.push(null);
    }
    setImages(filtered);
  };

  if (!isOpen) return null;

  const validImages = images.filter(img => img !== null);
  const hasEmptySlots = validImages.length < 5;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="fixed top-[20%] right-0 bottom-0 left-0 flex h-[80vh] max-w-none flex-col overflow-y-auto rounded-t-2xl bg-white shadow-xl md:relative md:top-auto md:right-auto md:bottom-auto md:left-auto md:h-[80vh] md:max-h-[800px] md:w-full md:max-w-3xl md:overflow-hidden md:rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full overflow-y-auto p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-black">
            이미지 추가 및 순서 변경
          </h2>

          <div className="mb-6 flex flex-col gap-4">
            {/* 이미지 그리드 - 더 작게 표시 (3열) */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {Array.from({ length: 5 }).map((_, idx) => {
                const img = images[idx];
                return (
                  <div
                    key={idx}
                    draggable={img !== null}
                    onDragStart={img !== null ? (e) => handleDragStart(e, idx) : undefined}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-gray-200 ${
                      draggedIndex === idx ? "opacity-50" : ""
                    } ${img !== null ? "cursor-move" : ""}`}
                  >
                    {img ? (
                      <>
                        {img.match(/\.(mp4|webm|mov|m4v|avi)$/i) ? (
                          <video
                            src={img}
                            className="h-full w-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={img}
                            alt={`이미지 ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        )}
                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleImageDelete(idx)}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                          title="삭제"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex h-full w-full cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 ${
                          isUploading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <div className="text-center">
                          <div className="mb-1 text-2xl">+</div>
                          <div className="text-sm">
                            {isUploading ? "업로드 중..." : "이미지 추가"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 이미지 개수 표시 */}
            <div className="text-center text-xs text-gray-500">
              {validImages.length} / 5
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

