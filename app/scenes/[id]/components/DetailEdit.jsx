"use client";

import { useState, useEffect, useRef } from "react";
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

export default function DetailEdit({ item, onChange }) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    date: item?.date || "",
    desc: item?.desc || "",
    img: (item?.img || []).map((url, idx) => ({ id: `img-${Date.now()}-${idx}`, url })),
  });

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
          return { id: `img-${Date.now()}-${idx}`, url: imgUrl };
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

  // formData 변경 시 부모에게 알림
  useEffect(() => {
    if (onChange && prevItemIdRef.current !== null) {
      const dataToSend = {
        title: formData.title,
        date: formData.date,
        desc: formData.desc,
        img: formData.img.map(img => img.url),
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
    setFormData(prev => ({
      ...prev,
      img: prev.img.filter((img) => img.id !== id)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 업로드 중 표시를 위한 임시 이미지 추가
    const tempImages = files.map((file, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      isUploading: true
    }));

    setFormData(prev => ({
      ...prev,
      img: [...prev.img, ...tempImages]
    }));

    // 실제 업로드
    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataToSend = new FormData();
        formDataToSend.append("file", file);
        formDataToSend.append("prefix", "scenes");

        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formDataToSend,
        });

        const data = await res.json();

        if (data.ok && data.publicUrl) {
          uploadedImages.push({
            id: `img-${Date.now()}-${i}`,
            url: data.publicUrl
          });
        } else {
          console.error("Upload failed:", data.error);
        }
      }

      // 임시 이미지를 실제 업로드된 이미지로 교체
      setFormData(prev => ({
        ...prev,
        img: [
          ...prev.img.filter(img => !img.isUploading),
          ...uploadedImages
        ]
      }));
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");

      // 실패한 경우 임시 이미지 제거
      setFormData(prev => ({
        ...prev,
        img: prev.img.filter(img => !img.isUploading)
      }));
    }
  };

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
                    isUploading={img.isUploading}
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
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
