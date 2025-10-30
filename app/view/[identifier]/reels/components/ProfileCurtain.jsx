"use client";
import { motion } from "framer-motion";

export default function ProfileCurtain({ open, onClose, profile }) {
  // 드래그로 위로 날리면 닫힘
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
      className="absolute inset-0 z-40 grid place-items-center bg-black-100"
    >
      <div className="w-[92vw] max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-black-200">
        {/* 이미지 */}
        <div className="relative h-64 w-full overflow-hidden">
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
          <div className="text-xl font-semibold">{profile?.name || "이름 미상"}</div>
          <div className="text-white/80">
            {profile?.birthDate} · {profile?.birthPlace}
          </div>
          {profile?.motto && (
            <div className="text-white/70">“{profile.motto}”</div>
          )}
          {profile?.story && (
            <div className="mt-2 whitespace-pre-wrap leading-relaxed text-white/90">
              {profile.story}
            </div>
          )}
          <p className="pt-2 text-right text-xs text-white/50">위로 드래그하여 닫기</p>
        </div>
      </div>
    </motion.div>
  );
}
