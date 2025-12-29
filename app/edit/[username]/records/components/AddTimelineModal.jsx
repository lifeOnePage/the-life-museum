"use client";
import { useState, useRef } from "react";
import { uploadRecordFile } from "../services/editApi";
import { useAuth } from "@/app/contexts/AuthContext";

export default function AddTimelineModal({ isOpen, onClose, onSave }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // 이미지 URL 배열 (최대 5장)
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;

    // 현재 이미지 개수 확인
    const currentCount = images.length;
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

      // 이미지 배열에 추가 (순서대로)
      setImages((prev) => [...prev, ...uploadedUrls]);
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
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const coverUrl = images[0] || null;
    // images 배열을 5개로 채우기 (null로 패딩)
    const paddedImages = [...images];
    while (paddedImages.length < 5) {
      paddedImages.push(null);
    }

    onSave({
      id: null,
      title: title.trim(),
      date: date.trim(),
      location: location.trim(),
      description: description.trim(),
      coverUrl: coverUrl,
      images: paddedImages,
      color: "",
      isHighlight: false,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
    setImages([]);
    setDraggedIndex(null);
    onClose();
  };

  const handleImageDelete = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="fixed top-[20%] right-0 bottom-0 left-0 flex h-[80vh] max-w-none flex-col overflow-y-auto rounded-t-2xl bg-white shadow-xl md:relative md:top-auto md:right-auto md:bottom-auto md:left-auto md:h-[80vh] md:max-h-[800px] md:w-full md:max-w-5xl md:flex-row md:overflow-hidden md:rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full flex-shrink-0 md:w-1/2 md:overflow-y-auto md:border-r md:border-gray-200">
          <div
            className="p-6 md:p-8"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <h2 className="mb-6 text-2xl font-bold text-black md:hidden">
              새 타임라인 만들기
            </h2>
            추{" "}
            <div className="mb-6 flex flex-col gap-4">
              {/* 이미지 그리드 (상단) */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square overflow-hidden rounded-lg bg-gray-200 ${
                        draggedIndex === idx ? "opacity-50" : ""
                      } cursor-move`}
                    >
                      {img.match(/\.(mp4|webm)$/i) ? (
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
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 추가 버튼 (하단) */}
              {images.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 ${
                    isUploading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-1 text-2xl">+</div>
                    <div className="text-sm">
                      {isUploading ? "업로드 중..." : "이미지 추가"}
                    </div>
                    {images.length > 0 && (
                      <div className="mt-1 text-xs text-gray-400">
                        ({images.length} / 5)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 이미지 개수 표시 */}
              {images.length > 0 && images.length >= 5 && (
                <div className="text-center text-xs text-gray-500">
                  {images.length} / 5
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div
          className="flex-1 md:w-1/2 md:overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="p-6 md:p-8">
            <h2 className="mb-6 hidden text-2xl font-bold text-black md:block">
              새 타임라인 만들기
            </h2>

            {/* 제목 입력 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="이벤트의 이름을 입력해주세요. (ex.새로운 경험!)"
                className="w-full border-b border-gray-300 pb-2 text-black outline-none placeholder:text-gray-400 focus:border-gray-600"
              />
            </div>

            {/* 연도 입력 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                날짜
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="날짜를 입력해주세요.(ex. 2000.01.01)"
                className="w-full border-b border-gray-300 pb-2 text-black outline-none placeholder:text-gray-400 focus:border-gray-600"
              />
            </div>

            {/* 장소 입력 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                장소
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장소를 입력해주세요"
                className="w-full border-b border-gray-300 pb-2 text-black outline-none placeholder:text-gray-400 focus:border-gray-600"
              />
            </div>

            {/* 설명 입력 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이벤트에 대한 설명을 입력해주세요.(최대 250자 입력 가능)"
                rows={4}
                maxLength={250}
                className="w-full resize-none border-b border-gray-300 pb-2 text-black outline-none placeholder:text-gray-400 focus:border-gray-600"
              />
              <div className="mt-1 text-right text-xs text-gray-500">
                {description.length} / 250
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3 pb-4 md:pb-0">
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
    </div>
  );
}
