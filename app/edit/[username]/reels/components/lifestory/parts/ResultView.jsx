"use client";
import { motion } from "framer-motion";
import { RiErrorWarningLine } from "react-icons/ri";
export default function ResultView({
  tokenUsage,
  questions,
  onGoToQA,
  story,
  isEditing,
  setIsEditingResult,
  onChangeStory,
}) {
  console.log(tokenUsage);
  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: "easeOut" },
      }}
      className="bg-black-100 rounded-[14px] py-4 text-white"
    >
      <div className="mb-2.5 text-[18px] font-bold">생성된 생애문</div>
      <p className="m-0 my-4 text-sm opacity-70">
        생애문 생성 초안입니다. 내용을 직접 원하시는대로 다듬은 뒤 저장할 수
        있어요.
      </p>

      {isEditing ? (
        <textarea
          value={story}
          onChange={(e) => onChangeStory(e.target.value)}
          className="bg-black-200 min-h-[220px] w-full resize-y rounded-xl border border-dashed border-white/20 p-3 text-sm/8 text-white"
        />
      ) : (
        <div
          onClick={() => {
            setIsEditingResult(true);
          }}
          className="bg-black-200 cursor-text rounded-xl border border-dashed border-white/20 p-3 text-sm/8 whitespace-pre-wrap"
          title="클릭하여 직접 수정할 수 있어요"
        >
          {story}
        </div>
      )}

      {!isEditing && (
        <div className="flex-col">
          {tokenUsage < 3 ? (
            <div>
              {/* <div className="mt-4 flex items-center gap-2 text-sm opacity-70">
                {" "}
                <RiErrorWarningLine color="white" /> 재생성 기회:{" "}
                {3 - tokenUsage} / 3
              </div> */}
              <p className="mt-4 text-sm opacity-70">
                다시 생성하기를 누르실 경우 이전에 입력한 답변을 수정할 수
                있어요.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-sm opacity-70">
              {" "}
              <RiErrorWarningLine color="white" /> 재생성 기회를 모두
              사용했어요. 대신 생애문을 직접 수정하는 건 언제든 가능해요!
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
