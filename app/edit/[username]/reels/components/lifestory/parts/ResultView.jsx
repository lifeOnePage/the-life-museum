"use client";
import { motion } from "framer-motion";

export default function ResultView({
  questions,
  onGoToQA,
  story,
  isEditing,
  setIsEditing,
  onChangeStory,
}) {
  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: "easeOut" },
      }}
      className="rounded-[14px] bg-black-100 text-white py-4"
    >
      <div className="text-[18px] font-bold mb-2.5">생성된 생애문</div>
      <p className="m-0 my-4 text-sm opacity-70">
        생애문 생성 초안입니다. 내용을 직접 원하시는대로 다듬은 뒤 저장할 수
        있어요.
      </p>

      {isEditing ? (
        <textarea
          value={story}
          onChange={(e) => onChangeStory(e.target.value)}
          className="w-full min-h-[220px] rounded-xl border border-white/20 border-dashed bg-black-200 text-white p-3 text-sm/8 resize-y"
        />
      ) : (
        <div
          onClick={() => {
            setIsEditing(true);
          }}
          className="border border-white/20 border-dashed rounded-xl p-3 bg-black-200 cursor-text whitespace-pre-wrap text-sm/8"
          title="클릭하여 직접 수정할 수 있어요"
        >
          {story}
        </div>
      )}

      {!isEditing && (
        <p className="mt-4 text-sm opacity-70">
          클릭하면 직접 수정할 수 있어요
        </p>
      )}
    </motion.div>
  );
}
