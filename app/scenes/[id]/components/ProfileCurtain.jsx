"use client";
import { motion } from "framer-motion";
import { ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfileCurtain({ open, onClose, profile }) {
  // 첫 접속 시 한 번만 보이는 힌트 애니메이션 (세션 기준)
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const done = sessionStorage.getItem("sceneProfileCurtainHintDone");
      if (!done) {
        setShowHint(true);
        const t = setTimeout(() => {
          setShowHint(false);
        }, 3000);
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage 불가 환경 대비: 조용히 무시
    }
  }, [open]);

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: open ? 0 : "-110%" }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      drag="y"
      dragConstraints={{ top: -1000, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80) onClose?.();
      }}
      className="bg-black-100/95 backdrop-blur-md absolute inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div className="bg-black-200 relative w-[92vw] max-w-[480px] my-auto rounded-2xl border border-white/10 overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* 이미지 */}
        <div className="relative w-full overflow-hidden">
          {profile?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo}
              alt={profile?.name || "프로필"}
              className="w-full h-auto max-h-[40vh] object-cover object-center"
            />
          ) : (
            <div className="grid h-[30vh] w-full place-items-center text-white/40 bg-white/5">
              프로필 이미지 없음
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="space-y-3 p-6 text-sm">
          <div className="text-2xl font-semibold text-white">
            {profile?.name || "이름 미상"}
          </div>

          {(profile?.birthDate || profile?.birthPlace) && (
            <div className="text-white/80">
              {profile?.birthDate && <span>{profile.birthDate}</span>}
              {profile?.birthDate && profile?.birthPlace && <span> · </span>}
              {profile?.birthPlace && <span>{profile.birthPlace}</span>}
            </div>
          )}

          {profile?.biography && (
            <div className="mt-4 leading-relaxed whitespace-pre-wrap text-white/90 max-h-[30vh] overflow-y-auto">
              {profile.biography}
            </div>
          )}

          <p className="flex items-center justify-end gap-2 pt-4 text-xs text-white/50">
            <ChevronUp className="h-4 w-4" />
            위로 드래그하여 닫기
          </p>
        </div>

        {/* 초기 터치 유도 힌트 */}
        {showHint && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-1">
            <motion.div
              initial={{ opacity: 0.8, scale: 0.6, y: 0 }}
              animate={{ opacity: 0, scale: 1.8, y: -8 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute right-8 bottom-2 h-10 w-10 rounded-full bg-white/35"
            />
            <motion.div
              initial={{ opacity: 0.8, scale: 0, y: 0 }}
              animate={{ opacity: 0, scale: 2.2, y: -8 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 1.6 }}
              className="absolute right-8 bottom-2 h-10 w-10 rounded-full bg-white/20"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
