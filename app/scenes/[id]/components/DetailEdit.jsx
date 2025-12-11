"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import ImageThumbnail from "./ImageThumbnail";

const DetailEdit = forwardRef(function DetailEdit({ item, onChange, onUploadStateChange }, ref) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    date: item?.date || "",
    desc: item?.desc || "",
    img: (item?.img || []).map((url, idx) => ({ id: `img-${Date.now()}-${idx}`, url, isUploaded: true })),
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingImageIds, setUploadingImageIds] = useState(new Set());

  const lastSentDataRef = useRef(null);
  const prevItemIdRef = useRef(null);

  // item이 변경되면 formData 업데이트 (새로고침 시 데이터 로드 또는 다른 아이템 선택)
  useEffect(() => {
    if (item && item.id !== prevItemIdRef.current) {
      prevItemIdRef.current = item.id;
      setFormData({
        title: item.title || "",
        date: item.date || "",
        desc: item.desc || "",
        img: (item.img || item.images || []).map((url, idx) => {
          const imgUrl = typeof url === 'string' ? url : url.url;
          return { id: `img-${Date.now()}-${idx}`, url: imgUrl, isUploaded: true };
        }),
      });
      // 초기화 시에는 onChange 호출하지 않도록 lastSentDataRef 업데이트
      lastSentDataRef.current = JSON.stringify({
        title: item.title || "",
        date: item.date || "",
        desc: item.desc || "",
        img: (item.img || item.images || []).map((url) => {
          return typeof url === 'string' ? url : url.url;
        }),
      });
    }
  }, [item]);

  // 업로드 상태 변경 시 부모에게 알림
  useEffect(() => {
    if (onUploadStateChange) {
      // 실제 업로드 중일 때만 true (pending 이미지가 있다고 해서 업로드 중인 것은 아님)
      onUploadStateChange(isProcessing);
    }
  }, [isProcessing, onUploadStateChange]);

  // formData 변경 시 부모에게 알림
  useEffect(() => {
    if (onChange && prevItemIdRef.current !== null) {
      const uploadedImages = formData.img.filter(img => img.isUploaded);
      const pendingImages = formData.img.filter(img => !img.isUploaded);

      const dataToSend = {
        title: formData.title,
        date: formData.date,
        desc: formData.desc,
        // 전체 img 배열 전달 (내부 상태 유지를 위해)
        img: formData.img,
        // 업로드된 URL만 별도로 전달
        _uploadedUrls: uploadedImages.map(img => img.url),
        // pending 이미지 개수도 전달
        _hasPendingImages: pendingImages.length > 0,
      };

      // 이전에 보낸 데이터와 비교하여 실제로 변경된 경우에만 onChange 호출
      const dataString = JSON.stringify(dataToSend);
      if (lastSentDataRef.current !== dataString) {
        lastSentDataRef.current = dataString;
        onChange(dataToSend);
      }
    }
  }, [formData, onChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.img.findIndex((img) => img.id === active.id);
        const newIndex = prev.img.findIndex((img) => img.id === over.id);
        const newImg = arrayMove(prev.img, oldIndex, newIndex);
        return { ...prev, img: newImg };
      });
    }
  };

  const handleDeleteImage = (id) => {
    setFormData(prev => {
      // 삭제할 이미지 찾기
      const imgToDelete = prev.img.find(img => img.id === id);

      // Blob URL이면 메모리에서 해제
      if (imgToDelete && !imgToDelete.isUploaded && imgToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(imgToDelete.url);
      }

      return {
        ...prev,
        img: prev.img.filter((img) => img.id !== id)
      };
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Blob URL 생성 (즉시 표시용) + File 객체 보관 (나중에 업로드용)
    const newImages = files.map((file, idx) => ({
      id: `pending-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      file: file, // File 객체 보관
      isUploaded: false // 아직 업로드 안됨
    }));

    setFormData(prev => ({
      ...prev,
      img: [...prev.img, ...newImages]
    }));
  };

  // 저장 시 호출될 업로드 함수 (외부에서 사용 가능하도록 useImperativeHandle 대신 직접 노출)
  const uploadPendingImages = async () => {
    const pendingImages = formData.img.filter(img => !img.isUploaded);
    if (pendingImages.length === 0) return formData.img;

    setIsProcessing(true);
    // 업로드 중인 이미지 ID 추적
    setUploadingImageIds(new Set(pendingImages.map(img => img.id)));

    try {
      const uploadPromises = pendingImages.map(async (img) => {
        const formDataToSend = new FormData();
        formDataToSend.append("file", img.file);
        formDataToSend.append("prefix", "scenes");

        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formDataToSend,
        });

        const data = await res.json();

        if (data.ok && data.publicUrl) {
          // Blob URL 해제
          URL.revokeObjectURL(img.url);
          return {
            id: img.id,
            url: data.publicUrl,
            isUploaded: true
          };
        } else {
          console.error("Upload failed:", data.error);
          throw new Error(data.error || "Upload failed");
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // formData 업데이트: 업로드된 이미지로 교체
      const updatedImages = formData.img.map(img => {
        if (!img.isUploaded) {
          const uploaded = uploadedImages.find(u => u.id === img.id);
          return uploaded || img;
        }
        return img;
      });

      setFormData(prev => ({
        ...prev,
        img: updatedImages
      }));

      setIsProcessing(false);
      setUploadingImageIds(new Set());
      return updatedImages;
    } catch (error) {
      console.error("Failed to upload images:", error);
      setIsProcessing(false);
      setUploadingImageIds(new Set());
      throw error;
    }
  };

  // 컴포넌트가 언마운트될 때 Blob URL 해제
  useEffect(() => {
    return () => {
      formData.img.forEach(img => {
        if (!img.isUploaded && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [formData.img]);

  // 외부에서 호출 가능하도록 ref로 uploadPendingImages 노출
  useImperativeHandle(ref, () => ({
    uploadPendingImages
  }));

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h3 className="text-white text-lg font-medium mb-1">장면 추가하기</h3>
        <p className="text-white/60 text-sm">기억에 남는 순간을 자유롭게 기록해보세요</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-white/60 text-xs mb-1 block">제목</label>
          <input
            type="text"
            placeholder="제목"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">일자</label>
          <input
            type="text"
            placeholder="날짜 (예: 2024.01.01)"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">내용</label>
          <textarea
            placeholder="설명"
            value={formData.desc}
            onChange={(e) => handleInputChange("desc", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40 resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-6">
        {formData.img && formData.img.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={formData.img.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-2">
                {formData.img.slice(0, 15).map((img) => (
                  <ImageThumbnail
                    key={img.id}
                    id={img.id}
                    imgUrl={img.url}
                    onDelete={() => handleDeleteImage(img.id)}
                    isUploading={uploadingImageIds.has(img.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : null}

        <label
          htmlFor="image-upload"
          className="mt-4 w-full h-32 bg-white/5 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/10 transition-colors border border-dashed border-white/30"
        >
          <span className="text-white text-sm">클릭하여 업로드</span>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      </div>
    </div>
  );
});

export default DetailEdit;
