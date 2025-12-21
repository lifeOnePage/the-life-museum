"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TooltipPortal from "./TooltipPortal";

export default function ProfileEdit({ profile, onChange, mode = "view", onStartLifestoryGuide }) {
  const [formData, setFormData] = useState({
    photo: profile?.photo || "",
    name: profile?.name || "",
    birthDate: profile?.birthDate || "",
    birthPlace: profile?.birthPlace || "",
    biography: profile?.biography || "",
    recordFormat: profile?.recordFormat || "entire-life",
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showInstructionTooltip, setShowInstructionTooltip] = useState(false);
  const [showEntireLifeTooltip, setShowEntireLifeTooltip] = useState(false);
  const [showSpecificEventTooltip, setShowSpecificEventTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef(null);
  const isInternalUpdateRef = useRef(null);
  const entireLifeButtonRef = useRef(null);
  const specificEventButtonRef = useRef(null);
  const instructionTextRef = useRef(null);

  // profile prop이 외부에서 변경되면 formData 업데이트 (생애문 가이드 등)
  useEffect(() => {
    if (profile && !isInternalUpdateRef.current) {
      setFormData({
        photo: profile.photo || "",
        name: profile.name || "",
        birthDate: profile.birthDate || "",
        birthPlace: profile.birthPlace || "",
        biography: profile.biography || "",
        recordFormat: profile.recordFormat || "entire-life",
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

  const calculateTooltipPosition = (element, tooltipWidth = 200) => {
    if (!element) return { top: 0, left: 0 };
    const rect = element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;

    // 툴팁이 화면 왼쪽/오른쪽 밖으로 나가는지 확인
    const tooltipLeft = elementCenterX - tooltipWidth / 2;
    const tooltipRight = elementCenterX + tooltipWidth / 2;

    let adjustedLeft = elementCenterX;

    // 왼쪽으로 넘어가는 경우
    if (tooltipLeft < 10) {
      adjustedLeft = tooltipWidth / 2 + 10;
    }
    // 오른쪽으로 넘어가는 경우
    else if (tooltipRight > window.innerWidth - 10) {
      adjustedLeft = window.innerWidth - tooltipWidth / 2 - 10;
    }

    return {
      top: rect.bottom + 8,
      left: adjustedLeft,
    };
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
              <p className="text-white/60 text-xs mb-1">
                {formData.recordFormat === "entire-life" ? "이름" : "제목"}
              </p>
              <p className="text-white text-base">{formData.name || "-"}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">
                {formData.recordFormat === "entire-life" ? "생년월일" : "일자"}
              </p>
              <p className="text-white text-base">{formData.birthDate || "-"}</p>
            </div>
            {formData.recordFormat === "entire-life" && (
              <div>
                <p className="text-white/60 text-xs mb-1">출생지</p>
                <p className="text-white text-base">{formData.birthPlace || "-"}</p>
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs mb-1">
                {formData.recordFormat === "entire-life" ? "생애문" : "설명"}
              </p>
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

        {/* 기록 형식 토글 */}
        <div className="relative">
          <label className="text-white/60 text-xs mb-2 block">기록 형식</label>

          {/* 선택된 형식에 대한 인스트럭션 */}
          <p className="text-white/40 text-xs mb-2">
            {formData.recordFormat === "entire-life"
              ? "기억하고 싶은 대상의 일생을 기록합니다."
              : "인생에서 특별한 의미가 있었던 기억을 기록합니다."}
          </p>

          <div className="relative flex gap-0 bg-white/10 rounded-full p-1">
            {/* 선택된 메뉴 표시 (슬라이딩 배경) */}
            <div
              className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-full transition-transform duration-300 ease-out"
              style={{
                transform: formData.recordFormat === "entire-life" ? "translateX(0)" : "translateX(calc(100% + 8px))",
              }}
            />
            {/* 버튼들 */}
            <div className="relative flex-1">
              <button
                ref={entireLifeButtonRef}
                type="button"
                onClick={() => handleInputChange("recordFormat", "entire-life")}
                onMouseEnter={(e) => {
                  setTooltipPosition(calculateTooltipPosition(e.currentTarget));
                  setShowEntireLifeTooltip(true);
                }}
                onMouseLeave={() => setShowEntireLifeTooltip(false)}
                className={`relative z-10 w-full py-2 px-4 text-sm rounded-full transition-colors ${
                  formData.recordFormat === "entire-life" ? "text-black" : "text-white"
                }`}
              >
                일생 전체
              </button>
              {/* 툴팁 - 일생 전체 */}
              <AnimatePresence>
                {showEntireLifeTooltip && (
                  <TooltipPortal>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        position: 'fixed',
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: 'translateX(-50%)',
                      }}
                      className="z-[9999] pointer-events-none bg-black px-3 py-1.5 whitespace-nowrap"
                    >
                      <p className="text-white text-xs">기억하고 싶은 대상의 일생을 기록합니다.</p>
                    </motion.div>
                  </TooltipPortal>
                )}
              </AnimatePresence>
            </div>
            <div className="relative flex-1">
              <button
                ref={specificEventButtonRef}
                type="button"
                onClick={() => handleInputChange("recordFormat", "specific-event")}
                onMouseEnter={(e) => {
                  setTooltipPosition(calculateTooltipPosition(e.currentTarget));
                  setShowSpecificEventTooltip(true);
                }}
                onMouseLeave={() => setShowSpecificEventTooltip(false)}
                className={`relative z-10 w-full py-2 px-4 text-sm rounded-full transition-colors ${
                  formData.recordFormat === "specific-event" ? "text-black" : "text-white"
                }`}
              >
                특정 이벤트
              </button>
              {/* 툴팁 - 특정 이벤트 */}
              <AnimatePresence>
                {showSpecificEventTooltip && (
                  <TooltipPortal>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        position: 'fixed',
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: 'translateX(-50%)',
                      }}
                      className="z-[9999] pointer-events-none bg-black px-3 py-1.5 whitespace-nowrap"
                    >
                      <p className="text-white text-xs">인생에서 특별한 의미가 있었던 기억을 기록합니다.</p>
                    </motion.div>
                  </TooltipPortal>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">
            {formData.recordFormat === "entire-life" ? "이름" : "제목"}
          </label>
          <input
            type="text"
            placeholder={formData.recordFormat === "entire-life" ? "이름" : "제목"}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">
            {formData.recordFormat === "entire-life" ? "생년월일" : "일자"}
          </label>
          <input
            type="text"
            placeholder={formData.recordFormat === "entire-life" ? "생년월일 (예: 1990.01.01)" : "일자 (예: 2000년 1월 1일)"}
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40"
          />
        </div>

        {formData.recordFormat === "entire-life" && (
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
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-white/60 text-xs">
              {formData.recordFormat === "entire-life" ? "생애문" : "설명"}
            </label>
            {onStartLifestoryGuide && formData.recordFormat === "entire-life" && (
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
            placeholder={formData.recordFormat === "entire-life" ? "생애문" : "설명"}
            value={formData.biography}
            onChange={(e) => handleInputChange("biography", e.target.value)}
            className="w-full bg-transparent text-white text-base py-2 border-b border-white outline-none placeholder:text-white/40 resize-none"
            rows={5}
          />

          {/* 인스트럭션 텍스트 */}
          <div className="relative mt-2">
            {/* <p
              ref={instructionTextRef}
              onMouseEnter={(e) => {
                setTooltipPosition(calculateTooltipPosition(e.currentTarget));
                setShowInstructionTooltip(true);
              }}
              onMouseLeave={() => setShowInstructionTooltip(false)}
              className="text-white/40 text-xs cursor-default"
            >
              {formData.recordFormat === "entire-life"
                ? "기억하고 싶은 대상의 일생을 기록합니다."
                : "인생에서 특별한 의미가 있었던 기억을 기록합니다."}
            </p> */}

            {/* 툴팁 */}
            <AnimatePresence>
              {showInstructionTooltip && (
                <TooltipPortal>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: 'fixed',
                      top: `${tooltipPosition.top}px`,
                      left: `${tooltipPosition.left}px`,
                    }}
                    className="z-[9999] pointer-events-none bg-black px-3 py-1.5 whitespace-nowrap"
                  >
                    <p className="text-white text-xs">
                      {formData.recordFormat === "entire-life"
                        ? "기억하고 싶은 대상의 일생을 기록합니다."
                        : "인생에서 특별한 의미가 있었던 기억을 기록합니다."}
                    </p>
                  </motion.div>
                </TooltipPortal>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
