"use client";

import { useState, useEffect, useRef } from "react";

export default function ProfileEdit({ profile, onChange, mode = "view", onStartLifestoryGuide }) {
  const [formData, setFormData] = useState({
    photo: profile?.photo || "",
    name: profile?.name || "",
    birthDate: profile?.birthDate || "",
    birthPlace: profile?.birthPlace || "",
    biography: profile?.biography || "",
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const isInternalUpdateRef = useRef(false);

  // profile prop이 외부에서 변경되면 formData 업데이트 (생애문 가이드 등)
  useEffect(() => {
    if (profile && !isInternalUpdateRef.current) {
      setFormData({
        photo: profile.photo || "",
        name: profile.name || "",
        birthDate: profile.birthDate || "",
        birthPlace: profile.birthPlace || "",
        biography: profile.biography || "",
      });
    }
    isInternalUpdateRef.current = false;
  }, [profile]);

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // 부모로 즉시 전달하되, 내부 업데이트 플래그 설정
    if (onChange) {
      isInternalUpdateRef.current = true;
      onChange(newFormData);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("prefix", "scenes/profiles");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (data.ok && data.publicUrl) {
        handleInputChange("photo", data.publicUrl);
      } else {
        console.error("Upload failed:", data.error);
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingPhoto(false);
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
          className={`w-full aspect-square bg-white/5 rounded-lg overflow-hidden ${
            isUploadingPhoto ? "cursor-wait" : "cursor-pointer"
          } relative group`}
        >
          {formData.photo ? (
            <>
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
              />
              {!isUploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">클릭하여 업로드</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/60 text-sm">클릭하여 업로드</span>
            </div>
          )}
          {isUploadingPhoto && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={isUploadingPhoto}
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-white/60 text-xs">생애문</label>
            {onStartLifestoryGuide && (
              <button
                onClick={onStartLifestoryGuide}
                className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-xs text-white/80 hover:text-white"
                type="button"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                생성하기
              </button>
            )}
          </div>
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
