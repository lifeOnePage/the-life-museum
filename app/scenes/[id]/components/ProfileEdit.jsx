"use client";

import { useState, useEffect, useRef } from "react";

export default function ProfileEdit({ profile, onChange, mode = "view" }) {
  const [formData, setFormData] = useState({
    photo: profile?.photo || "",
    name: profile?.name || "",
    birthDate: profile?.birthDate || "",
    birthPlace: profile?.birthPlace || "",
    biography: profile?.biography || "",
  });

  const [shouldNotifyChange, setShouldNotifyChange] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (shouldNotifyChange && onChange) {
      onChange(formData);
      setShouldNotifyChange(false);
    }
  }, [shouldNotifyChange]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShouldNotifyChange(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleInputChange("photo", url);
    }
  };

  const handlePhotoClick = () => {
    if (mode === "edit") {
      fileInputRef.current?.click();
    }
  };

  if (mode === "view") {
    return (
      <div className="px-4 py-4">
        <div className="flex flex-col gap-4">
          {formData.photo && (
            <div className="w-full aspect-square bg-white/5 rounded-lg overflow-hidden">
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-white/60 text-xs mb-1">이름</p>
              <p className="text-white text-base">{formData.name || "-"}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">생년월일</p>
              <p className="text-white text-base">{formData.birthDate || "-"}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">출생지</p>
              <p className="text-white text-base">{formData.birthPlace || "-"}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">생애문</p>
              <p className="text-white text-base whitespace-pre-wrap">{formData.biography || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col gap-4">
        <div
          onClick={handlePhotoClick}
          className="w-full aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer relative group"
        >
          {formData.photo ? (
            <>
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">클릭하여 업로드</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/60 text-sm">클릭하여 업로드</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">이름</label>
          <input
            type="text"
            placeholder="이름"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">생년월일</label>
          <input
            type="text"
            placeholder="생년월일 (예: 1990.01.01)"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">출생지</label>
          <input
            type="text"
            placeholder="출생지"
            value={formData.birthPlace}
            onChange={(e) => handleInputChange("birthPlace", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">생애문</label>
          <textarea
            placeholder="생애문"
            value={formData.biography}
            onChange={(e) => handleInputChange("biography", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40 resize-none"
            rows={5}
          />
        </div>
      </div>
    </div>
  );
}
