"use client";

import { useState, useEffect } from "react";
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

  const [shouldNotifyChange, setShouldNotifyChange] = useState(false);

  useEffect(() => {
    if (shouldNotifyChange && onChange) {
      const dataToSend = {
        ...formData,
        img: formData.img.map(img => img.url),
      };
      onChange(dataToSend);
      setShouldNotifyChange(false);
    }
  }, [shouldNotifyChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShouldNotifyChange(true);
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
      setShouldNotifyChange(true);
    }
  };

  const handleDeleteImage = (id) => {
    setFormData(prev => ({
      ...prev,
      img: prev.img.filter((img) => img.id !== id)
    }));
    setShouldNotifyChange(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // TODO: 실제 업로드 로직 구현
    // 지금은 임시로 URL을 추가
    const newImages = files.map((file, idx) => ({
      id: `img-${Date.now()}-${formData.img.length + idx}`,
      url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      img: [...prev.img, ...newImages]
    }));
    setShouldNotifyChange(true);
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
