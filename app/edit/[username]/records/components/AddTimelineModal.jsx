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
  const [images, setImages] = useState(Array(5).fill(null)); // 최대 5장
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [targetImageSlotIndex, setTargetImageSlotIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;

    const isMultipleFiles = files.length > 1;
    const currentTargetSlot = isMultipleFiles ? null : targetImageSlotIndex;

    if (files.length > 5) {
      alert("최대 5장까지 선택할 수 있습니다.");
      e.target.value = "";
      return;
    }

    // 이미지가 5장이 모두 채워져 있는지 확인
    const validImageCount = images.filter((img) => img).length;
    const availableSlots = 5 - validImageCount;

    if (availableSlots <= 0 && currentTargetSlot === null) {
      alert("이미지는 최대 5장까지 추가할 수 있습니다.");
      e.target.value = "";
      return;
    }

    const filesToProcess =
      currentTargetSlot !== null
        ? files.slice(0, 1)
        : files.slice(0, Math.min(files.length, availableSlots));

    const imageFiles = filesToProcess.filter((f) =>
      f.type.startsWith("image/"),
    );
    const videoFiles = filesToProcess.filter((f) =>
      f.type.startsWith("video/"),
    );

    console.log("Files to process:", filesToProcess.length);
    console.log("Image files:", imageFiles.length);
    console.log("Available slots:", availableSlots);

    try {
      setIsUploading(true);

      // 모든 미디어 파일을 하나의 newImages 배열에 처리
      const newImages = [...images];
      let lastAddedIndex = null;

      // 비디오 파일 처리 (첫 번째 슬롯에만)
      if (
        videoFiles.length > 0 &&
        (currentTargetSlot === null || currentTargetSlot === 0)
      ) {
        const url = await uploadRecordFile({
          token,
          file: videoFiles[0],
          prefix: "records/timeline",
        });
        newImages[0] = url;
        lastAddedIndex = 0;
      }

      // 이미지 파일 처리 - 크롭 없이 바로 업로드
      if (imageFiles.length > 0) {
        console.log("Processing", imageFiles.length, "image files");
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(`Uploading image ${i + 1}/${imageFiles.length}`);

          const url = await uploadRecordFile({
            token,
            file,
            prefix: "records/timeline",
          });

          console.log(`Image ${i + 1} uploaded:`, url);

          if (currentTargetSlot !== null) {
            // 특정 슬롯에 추가
            newImages[currentTargetSlot] = url;
            lastAddedIndex = currentTargetSlot;
            break; // 특정 슬롯이면 하나만 추가
          } else {
            // 첫 번째 빈 슬롯에 추가
            const firstNullIndex = newImages.findIndex((img) => !img);
            console.log(`Found empty slot at index:`, firstNullIndex);
            if (firstNullIndex !== -1) {
              newImages[firstNullIndex] = url;
              lastAddedIndex = firstNullIndex; // 마지막으로 추가된 인덱스 업데이트
              console.log(
                `Added image to slot ${firstNullIndex}, newImages:`,
                newImages,
              );
            } else {
              // 빈 슬롯이 없으면 alert 후 초기화
              alert("이미지는 최대 5장까지 추가할 수 있습니다.");
              e.target.value = "";
              setIsUploading(false);
              return;
            }
          }
        }
      }

      console.log("Final newImages:", newImages);
      console.log("Last added index:", lastAddedIndex);

      setImages(newImages);
      setTargetImageSlotIndex(null);

      const firstValidIndex = newImages.findIndex((img) => img);
      if (firstValidIndex !== -1) {
        setCurrentImageIndex(firstValidIndex);
      }
    } catch (error) {
      console.error("미디어 업로드 실패:", error);
      alert("미디어 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const validImages = images.filter((img) => img);
    const coverUrl = validImages[0] || null;

    onSave({
      id: null,
      title: title.trim(),
      date: date.trim(),
      location: location.trim(),
      description: description.trim(),
      coverUrl: coverUrl,
      images: images,
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
    setImages(Array(5).fill(null));
    setCurrentImageIndex(0);
    setTargetImageSlotIndex(null);
    onClose();
  };

  const handleImageDelete = (index) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    if (currentImageIndex >= index) {
      const nextValidIndex = newImages.findIndex(
        (img, idx) => img && idx > index,
      );
      if (nextValidIndex !== -1) {
        setCurrentImageIndex(nextValidIndex);
      } else {
        const prevValidIndex = newImages.findLastIndex(
          (img, idx) => img && idx < index,
        );
        setCurrentImageIndex(prevValidIndex !== -1 ? prevValidIndex : 0);
      }
    }
  };

  const validImages = images.filter((img) => img);

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
        <div className="w-full flex-shrink-0 md:w-1/2 md:border-r md:border-gray-200">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-black md:hidden">
              새 타임라인 만들기
            </h2>
            <div className="mb-6">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                {validImages.length > 0 ? (
                  <div className="relative h-full w-full">
                    {/* 이미지 슬라이더 */}
                    <div className="relative h-full w-full overflow-hidden">
                      <div
                        className="flex h-full transition-transform duration-300 ease-in-out"
                        style={{
                          width: `${images.length * 100}%`,
                          transform: `translateX(-${currentImageIndex * (100 / images.length)}%)`,
                        }}
                      >
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative h-full"
                            style={{ width: `${100 / images.length}%` }}
                          >
                            {img ? (
                              img.match(/\.(mp4|webm)$/i) ? (
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
                              )
                            ) : (
                              <div
                                onClick={() => {
                                  setTargetImageSlotIndex(idx);
                                  fileInputRef.current?.click();
                                }}
                                className="flex h-full w-full cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                              >
                                <div className="text-center">
                                  <div className="mb-1 text-2xl">+</div>
                                  <div className="text-sm">이미지 추가</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 좌우 화살표 */}
                    {validImages.length > 1 && (
                      <>
                        {images
                          .slice(0, currentImageIndex)
                          .some((img) => img) && (
                          <button
                            type="button"
                            onClick={() => {
                              const prevValidIndex = images
                                .slice(0, currentImageIndex)
                                .map((img, idx) => ({ img, idx }))
                                .filter(({ img }) => img)
                                .pop()?.idx;
                              if (prevValidIndex !== undefined) {
                                setCurrentImageIndex(prevValidIndex);
                              }
                            }}
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                          >
                            ←
                          </button>
                        )}
                        {images
                          .slice(currentImageIndex + 1)
                          .some((img) => img) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextValidIndex = images
                                .slice(currentImageIndex + 1)
                                .findIndex((img) => img);
                              if (nextValidIndex !== -1) {
                                setCurrentImageIndex(
                                  currentImageIndex + 1 + nextValidIndex,
                                );
                              }
                            }}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                          >
                            →
                          </button>
                        )}
                      </>
                    )}

                    {/* 인디케이터 */}
                    {validImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {images.map((img, idx) => {
                          if (!img) return null;
                          const validIndex =
                            images.slice(0, idx + 1).filter((img) => img)
                              .length - 1;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`h-2 w-2 rounded-full ${
                                idx === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* 이미지 삭제 버튼 */}
                    {images[currentImageIndex] && (
                      <button
                        type="button"
                        onClick={() => handleImageDelete(currentImageIndex)}
                        className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setTargetImageSlotIndex(0);
                      fileInputRef.current?.click();
                    }}
                    className="flex h-full w-full cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                  >
                    <div className="text-center">
                      <div className="mb-1 text-2xl">+</div>
                      <div className="text-sm">이미지 추가 (최대 5장)</div>
                    </div>
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
              {validImages.length > 0 && (
                <div className="mt-2 text-center text-xs text-gray-500">
                  {validImages.length} / 5
                </div>
              )}
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
