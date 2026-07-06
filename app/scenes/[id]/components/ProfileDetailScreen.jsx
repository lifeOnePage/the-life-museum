"use client";

import { motion } from "framer-motion";
import AppName from "@/app/components/AppName";

export default function ProfileDetailScreen({ profile, isDarkMode = true, isFullScreen = false, isMobile = false }) {
  // console.group("profile")
  // console.log(profile)
  // console.groupEnd()
  return (
    <div className={`w-full h-full flex items-center justify-center transition-colors duration-500 ${
      isMobile
        ? 'bg-black/50'
        : isDarkMode
          ? 'bg-black'
          : 'bg-white'
    }`}>
      {/* 프로필 이미지 컨테이너 - 정방형 */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className={`relative ${isMobile ? 'w-screen aspect-[2/3]' : 'aspect-square h-screen'}`}
      >
        {/* 배경 이미지 */}
        {profile?.photo ? (
          <>
            <img
              src={profile.photo}
              alt={profile?.name || "대표 타이틀"}
              className="w-full h-full object-cover object-top"
            />
            {/* 오버레이 (다크모드: 어둡게, 라이트모드: 밝게) */}
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/20' : 'bg-white/15'}`} />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDarkMode ? 'bg-white/10 text-white/40' : 'bg-black/10 text-black/40'
          }`}>
            <span className="text-sm">대표 이미지 없음</span>
          </div>
        )}

        {/* 상단 중앙 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
          className={`absolute top-0 left-0 right-0 flex justify-center ${isMobile ? 'pt-8 px-4' : 'pt-12'}`}
        >
          <h2 className={`font-bold text-white tracking-tight ${isMobile ? 'text-5xl' : 'text-8xl'}`}>
            <AppName />
          </h2>
        </motion.div>

        {/* 왼쪽 장식 텍스트 (90도 회전) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 1 }}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${isMobile ? 'left-6' : 'left-10'}`}
        >
          <p
            className={`font-bold text-white/40 whitespace-nowrap ${isMobile ? 'text-[0.65rem]' : 'text-xs'}`}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center center",
              letterSpacing: "0.4em"
            }}
          >
            ARCHIVE YOUR LIFE
          </p>
        </motion.div>

        {/* 오른쪽 장식 텍스트 (90도 회전) - PC 전시모드에서만 표시 */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 1 }}
            className={`absolute top-1/2 -translate-y-1/ translate-x-1/2 ${isMobile ? 'right-6' : 'right-10'}`}
          >
            <p
              className={`font-bold text-white/40 whitespace-nowrap ${isMobile ? 'text-[0.65rem]' : 'text-xs'}`}
              style={{
                transform: "rotate(90deg)",
                transformOrigin: "center center",
                letterSpacing: "0.4em"
              }}
            >
              CHRONICLE YOUR STORY
            </p>
          </motion.div>
        )}

        {/* 우하단 텍스트 오버레이 */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
          className={`absolute left-0 right-0 bottom-0 text-right ${isMobile ? 'px-6 pb-6' : 'p-12'}`}
        >
          {/* 이름/제목 */}
          <h1
            className={`leading-tight text-white font-bold mb-3 ${isMobile ? 'text-3xl' : 'text-5xl'}`}
            style={{ letterSpacing: '-0.05rem' }}
          >
            {profile?.name || ""}
          </h1>

          {/* 생년월일/일자 & 출생지 */}
          <div className="mb-3">
            <span
              className={`text-white/95 ${isMobile ? 'text-base' : 'text-xl'}`}
              style={{ letterSpacing: '-0.05rem' }}
            >
              {profile?.birthDate || "-"}
              {profile?.birthPlace && ` | ${profile.birthPlace} 출생`}
            </span>
          </div>

          {/* 생애문/설명 */}
          {profile?.biography && (
            <p
              className={`leading-relaxed whitespace-pre-wrap text-white/90 max-h-[30vh] overflow-y-auto ${isMobile ? 'text-sm' : 'text-base'}`}
              style={{ letterSpacing: '-0.05rem' }}
            >
              {profile.biography}
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
