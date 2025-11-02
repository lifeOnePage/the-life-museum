"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/contexts/AuthContext";
import { IoImageSharp } from "react-icons/io5";

export default function EditProfile({ reel, onSaveReelProfile, onToast }) {
  const { user, token, signinWithToken } = useAuth();
  const [item, setItem] = useState([
    { label: "이름", value: "", placeholder: "홍길동" },
    { label: "출생일", value: "", placeholder: "YYYY-MM-DD" },
    { label: "출생지", value: "", placeholder: "서울특별시" },
    { label: "한줄소개", value: "", placeholder: "한 줄 소개" },
  ]);

  const [hasChange, setHasChange] = useState(false);
  const [img, setImg] = useState("/images/img.jpg");
  const fileInputRef = useRef(null);
  const prevBlobUrlRef = useRef(null);

  useEffect(() => {
    if (!reel) return;
    setImg(reel.profileImg);

    setItem([
      { label: "이름", value: reel.name ?? "", placeholder: "홍길동" },
      {
        label: "출생일",
        value: reel.birthDate ?? "",
        placeholder: "YYYY-MM-DD",
      },
      {
        label: "출생지",
        value: reel.birthPlace ?? "",
        placeholder: "서울특별시",
      },
      {
        label: "한줄소개",
        value: reel.motto ?? "",
        placeholder: "한 줄 소개",
      },
    ]);
    console.group("EditProfile");
    console.log("reel:", reel);
    console.groupEnd();
  }, [reel]);

  // blob URL 정리
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
      if (reel) {
        console.log(reel);
        // const initItem = item.map((it, i) => {
        //   return {
        //     label: it.label,
        //     value: reel.name ?? "",
        //     placeholder: "홍길동",
        //   };
        // });
      }
    };
  }, []);

  const handlePickImage = () => {
    setHasChange(true);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    setHasChange(true);
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = blobUrl;
    setImg(blobUrl);
  };

  const handleChange = (idx, value) => {
    setHasChange(true);
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

  console.group("Edit Profile");
  console.log("item info:", item);
  console.groupEnd();
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="relative flex h-auto w-full flex-col gap-6 py-3 text-sm text-white"
    >
      <motion.div variants={fadeUp} className="py-1">
        사진을 클릭하여 변경할 수 있어요.
      </motion.div>

      {/* 레이아웃: 모바일 세로, 데스크탑 가로 */}
      <div className="flex flex-col gap-10 md:h-[400px] md:flex-row md:items-start">
        {/* 이미지 영역 (고정/최소 폭) */}
        <motion.div
          variants={fadeUp}
          className="group relative min-h-[400px] w-full min-w-[310px] cursor-pointer overflow-hidden rounded-2xl md:flex-none md:basis-[310px]"
          onClick={handlePickImage}
        >
          {img !== null ? (
            <Image
              src={img}
              alt="profile"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          ) : (
            <div className="bg-black-200 horver:bg-black-200 border-white-100 absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl border border-dashed text-center">
              <IoImageSharp size={100} color="white" opacity={0.2} />
            </div>
          )}
          {/* 데스크탑 hover 오버레이 */}
          <div className="absolute inset-0 flex hidden items-center justify-center bg-black/50 transition-opacity duration-200 md:flex md:opacity-0 md:group-hover:opacity-100">
            <span className="hidden text-sm tracking-wide text-white md:inline-block">
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
        <motion.div variants={fadeUp} className="">
          <div className="bg-black-200 flex h-full w-full min-w-[310px] flex-1 flex-col gap-4 rounded-2xl border border-dashed border-white/20 p-5 text-white">
            {item.map((it, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex w-full flex-col"
              >
                <label className="mb-2 text-[13px] text-white/90">
                  {it.label}
                </label>
                <input
                  value={it.value}
                  placeholder={it.placeholder}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full border-b border-white bg-transparent px-1 py-2 text-white placeholder-white/40 focus:outline-none"
                />
              </motion.div>
            ))}
          </div>
          <button
            onClick={async () => {
              const data = {
                name: item[0].value,
                birthDate: item[1].value,
                birthPlace: item[2].value,
                motto: item[3].value,
              };

              await onSaveReelProfile({ img, item: { ...data, id: reel.id } });
              setHasChange(false);
              onToast?.("프로필이 저장되었습니다.", { tone: "success" });
            }}
            className={`pointer-events-auto w-full bg-${hasChange ? "white" : "black-300"} text-white-300 border-white-300 my-4 rounded-lg border py-2 text-center text-base`}
          >
            저장
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
