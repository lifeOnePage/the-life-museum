"use client";
import { motion } from "framer-motion";

export default function QACard({
  idx, total, question, answer, onChange,
}) {
  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }}
      exit={{ y: -12, opacity: 0, transition: { duration: 0.2 } }}
      className="rounded-[14px] bg-black-100 text-white py-4"
    >
      <div className="text-[14px] opacity-70 mb-1.5">{`질문 ${idx + 1} / ${total}`}</div>
      <div className="text-[18px] font-bold mb-3">{question}</div>
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="여기에 답변을 적어주세요"
        className="w-full min-h-40 rounded-xl border border-white-200 bg-black-100 text-white p-3 outline-[0.15rem] outline-dashed outline-[#6dacff44] text-[16px] leading-normal resize-y"
      />
    </motion.div>
  );
}