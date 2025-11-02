"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfileCurtain({ open, onClose, profile }) {
  // 첫 접속 시 한 번만 보이는 힌트 애니메이션 (세션 기준)
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const done = sessionStorage.getItem("profileCurtainHintDone");
      if (!done) {
        setShowHint(true);
        const t = setTimeout(() => {
          setShowHint(false);
          // sessionStorage.setItem("profileCurtainHintDone", "1");
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
      className="bg-black-100 absolute inset-0 z-40 grid place-items-center"
    >
      <div className="bg-black-200 relative w-[92vw] max-w-[480px] overflow-hidden rounded-2xl border border-white/10">
        {/* 이미지 */}
        <div className="relative h-full w-full overflow-hidden">
          {profile?.profileImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profileImg}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-white/40">
              프로필 이미지 없음
            </div>
          )}
          {/* 클릭시 토글 */}
          <button
            onClick={onClose}
            className="absolute inset-0 bg-black/0 transition hover:bg-black/40"
            aria-label="닫기"
          />
        </div>

        {/* 정보 */}
        <div className="space-y-2 p-4 text-sm">
          <div className="text-xl font-semibold">
            {profile?.name || "이름 미상"}
          </div>
          <div className="text-white/80">
            {profile?.birthDate} · {profile?.birthPlace}
          </div>
          {profile?.motto && (
            <div className="text-white/70">“{profile.motto}”</div>
          )}
          {profile?.story && (
            <div className="mt-2 leading-relaxed whitespace-pre-wrap text-white/90">
              {profile.story}
            </div>
          )}
          <p className="pt-2 text-right text-xs text-white/50">
            위로 드래그하여 닫기
          </p>
        </div>

        {/* 초기 터치 유도 힌트: 흰 원이 커지며 사라지는 subtle 애니메이션 (한 번만) */}
        {showHint && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-1">
            {/* 바닥 근처에 두 번의 리플 */}
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
