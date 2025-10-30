"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/contexts/AuthContext";

export default function EditProfile({ reels }) {
  const { user, token, signinWithToken } = useAuth();
  const [item, setItem] = useState([
    { label: "이름", value: "", placeholder: "홍길동" },
    { label: "출생일", value: "", placeholder: "YYYY-MM-DD" },
    { label: "출생지", value: "", placeholder: "서울특별시" },
    { label: "한줄소개", value: "", placeholder: "한 줄 소개" },
  ]);

  const [img, setImg] = useState("/images/img.jpg");
  const fileInputRef = useRef(null);
  const prevBlobUrlRef = useRef(null);

  useEffect(() => {
    console.group("EditProfile");
    console.log("reels:", reels);
    console.groupEnd();

    if (!reels) return;
    setImg(reels.profileImg);

    setItem([
      { label: "이름", value: reels.name ?? "", placeholder: "홍길동" },
      {
        label: "출생일",
        value: reels.birthDate ?? "",
        placeholder: "YYYY-MM-DD",
      },
      {
        label: "출생지",
        value: reels.birthPlace ?? "",
        placeholder: "서울특별시",
      },
      {
        label: "한줄소개",
        value: reels.motto ?? "",
        placeholder: "한 줄 소개",
      },
    ]);
  }, [reels]);

  // blob URL 정리
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = blobUrl;
    setImg(blobUrl);
  };

  const handleChange = (idx, value) => {
    setItem((prev) => prev.map((it, i) => (i === idx ? { ...it, value } : it)));
  };



  // 순차 등장 애니메이션
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="text-white text-sm relative py-3 w-full h-auto flex flex-col gap-6"
    >
      
      <motion.div variants={fadeUp} className="py-1">
        사진을 클릭하여 변경할 수 있어요.
      </motion.div>

      {/* 레이아웃: 모바일 세로, 데스크탑 가로 */}
      <div className="flex flex-col md:flex-row gap-10 md:h-[400px] md:items-start">
        {/* 이미지 영역 (고정/최소 폭) */}
        <motion.div
          variants={fadeUp}
          className="group relative w-full md:flex-none md:basis-[310px] min-w-[310px] min-h-[400px] overflow-hidden rounded-2xl cursor-pointer"
          onClick={handlePickImage}
        >
          <Image
            src={img}
            alt="profile"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
          {/* 데스크탑 hover 오버레이 */}
          <div
            className="hidden md:flex
            absolute inset-0 flex items-center justify-center
            md:opacity-0 md:group-hover:opacity-100
            transition-opacity duration-200
            bg-black/50
          "
          >
            <span className="hidden md:inline-block text-white text-sm tracking-wide">
              사진 업로드
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>

        {/* 입력 폼: 남은 영역 모두 */}
        <motion.div
          variants={fadeUp}
          className="flex-1 h-full min-w-[310px] w-full bg-black-200 rounded-2xl p-5 border border-white/20 border-dashed"
        >
          <div className="flex flex-col gap-4">
            {item.map((it, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col w-full"
              >
                <label className="mb-2 text-[13px] text-white/90">
                  {it.label}
                </label>
                <input
                  value={it.value}
                  placeholder={it.placeholder}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="
                    w-full bg-transparent text-white placeholder-white/40
                    border-b border-white focus:outline-none
                    py-2 px-1
                  "
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
