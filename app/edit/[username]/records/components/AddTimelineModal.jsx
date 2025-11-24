"use client";
import { useState, useRef } from "react";
import { uploadRecordFile } from "../services/editApi";
import { useAuth } from "@/app/contexts/AuthContext";
import ImageCropOverlay from "./ImageCropOverlay";

export default function AddTimelineModal({ isOpen, onClose, onSave }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // 이미지 파일인 경우 크롭 모달 표시
    if (file.type.startsWith("image/")) {
      setSelectedImageFile(file);
      setShowCropModal(true);
    } else {
      // 비디오 파일인 경우 바로 업로드
      try {
        setIsUploading(true);
        const url = await uploadRecordFile({
          token,
          file,
          prefix: "records/timeline",
        });
        setCoverUrl(url);
      } catch (error) {
        console.error("미디어 업로드 실패:", error);
        alert("미디어 업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCropComplete = async (croppedFile) => {
    if (!token || !croppedFile) return;

    try {
      setIsUploading(true);
      const url = await uploadRecordFile({
        token,
        file: croppedFile,
        prefix: "records/timeline",
      });
      setCoverUrl(url);
    } catch (error) {
      console.error("미디어 업로드 실패:", error);
      alert("미디어 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setSelectedImageFile(null);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    onSave({
      id: null,
      title: title.trim(),
      date: date.trim(),
      location: location.trim(),
      description: description.trim(),
      coverUrl: coverUrl || null,
      color: "",
      isHighlight: false,
    });

    // 모달 닫기 및 초기화
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
    setCoverUrl("");
    setSelectedImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
        onClick={handleClose}
      >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-2xl font-bold text-black">
          새 타임라인 만들기
        </h2>

        {/* 미디어 업로드 영역 */}
        <div className="mb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            {showCropModal && selectedImageFile ? (
              <ImageCropOverlay
                imageFile={selectedImageFile}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                  setShowCropModal(false);
                  setSelectedImageFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aspectRatio={1}
              />
            ) : coverUrl ? (
              coverUrl.match(/\.(mp4|webm)$/i) ? (
                <video
                  src={coverUrl}
                  className="h-full w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={coverUrl}
                  alt="커버 미디어"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                미디어 없음
              </div>
            )}
            {!showCropModal && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {isUploading ? "업로드 중..." : "미디어 변경"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

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
            placeholder="이벤트에 대한 설명을 입력해주세요.(최대 150자 입력 가능)"
            rows={4}
            maxLength={150}
            className="w-full resize-none border-b border-gray-300 pb-2 text-black outline-none placeholder:text-gray-400 focus:border-gray-600"
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {description.length} / 150
          </div>
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
  );
}
