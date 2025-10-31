// app/components/lifestory/LifestorySection.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./parts/Header";
import StylePicker from "./parts/StylePicker";
import CountPicker from "./parts/CountPicker";
import QACard from "./parts/QACard";
import ResultView from "./parts/ResultView";
import ProgressDots from "./parts/ProgressDots";
import PrevButton from "./parts/PrevButton";
import { Primary, Secondary } from "./parts/Buttons";
import {
  fetchLifestory,
  saveLifestory,
  generateStory,
} from "@/app/edit/[username]/editApi";
import { useAuth } from "@/app/contexts/AuthContext";

const STYLE_OPTIONS = ["진중한", "낭만적인", "재치있는", "신비로운"];
const COUNT_OPTIONS = [5, 10];

export default function LifestorySection({ reelId, userName, isPreview }) {
  const { user, token, signinWithToken } = useAuth();
  const [step, setStep] = useState("intro");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerMap, setAnswerMap] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [boot, setBoot] = useState(true);
  const [shouldFetchOnQA, setShouldFetchOnQA] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);
  const [isEditingResult, setIsEditingResult] = useState(true);

  // ▶︎ 프리뷰는 이번 작업 제외 (스켈레톤만)
  if (isPreview) {
    return (
      <div className="relative w-full min-h-screen grid place-items-center p-6 bg-black-100 text-white">
        <div className="text-white/60">프리뷰 모드는 별도 구현 예정</div>
      </div>
    );
  }

  // 初 로드: 저장된 값 하이드레이션
  useEffect(() => {
    console.group("LifestorySection");
    console.log("reelId: ", reelId);
    console.log("userName: ", userName);
    console.groupEnd();
    (async () => {
      try {
        const saved = await fetchLifestory({ token, id: reelId, edit: true });
        if (!saved) {
          setStep("intro");
          setBoot(false);
          return;
        }
        const {
          style,
          qaCount,
          questions = [],
          answers = [],
          story = "",
        } = saved;
        setSelectedStyle(style);
        setQuestionCount(questions.length || qaCount || null);
        setQuestions(questions);
        setAnswers(answers);
        const map = {};
        questions.forEach((q, i) => (map[q] = answers[i] ?? ""));
        setAnswerMap(map);

        if (story?.trim()) {
          setGeneratedStory(story);
          setHasSaved(true);
          setIsEditingResult(false);
          setStep("result");
          setShouldFetchOnQA(false);
        } else if (questions.length > 0) {
          const nextIdx = Math.max(
            0,
            answers.findIndex((a) => !a || !String(a).trim()),
          );
          setCurrentIdx(nextIdx === -1 ? questions.length - 1 : nextIdx);
          setStep("qa");
          setShouldFetchOnQA(false);
        } else if (style) {
          setStep("count");
        } else {
          setStep("intro");
        }
      } finally {
        setBoot(false);
      }
    })();
  }, [reelId, token]);

  // QA 진입 시 질문 세팅 (스텁)
  useEffect(() => {
    if (step !== "qa" || !selectedStyle || !questionCount) return;
    if (!shouldFetchOnQA) {
      setShouldFetchOnQA(true);
      return;
    }
    (async () => {
      const base = [
        "어릴 적 가장 소중한 기억은 무엇인가요?",
        "당신을 지금의 당신으로 만든 전환점은 언제였나요?",
        "가장 사랑하는 사람과의 추억 한 장면을 들려주세요.",
        "일과 삶 사이에서 지켜온 원칙이 있다면 무엇인가요?",
        "힘들던 시기를 건너게 한 한 문장(혹은 노래)은 무엇이었나요?",
        "인생에서 가장 용감했던 순간을 떠올려 본다면?",
        "당신의 하루를 특별하게 만드는 사소한 습관은?",
        "감사함을 느끼게 하는 장소나 풍경이 있나요?",
        "지난 시간 속 당신이 꼭 전하고 싶은 한 마디는?",
        "앞으로의 당신에게 바라는 점은 무엇인가요?",
      ];
      const qs = base.slice(0, questionCount);
      setQuestions(qs);
      setAnswers(qs.map((q) => answerMap[q] ?? ""));
      setCurrentIdx(0);
    })();
  }, [step, selectedStyle, questionCount, shouldFetchOnQA]); // eslint-disable-line

  const fadeSlide = {
    initial: { x: 24, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.25 } },
    exit: { x: -24, opacity: 0, transition: { duration: 0.2 } },
  };

  const currentQuestion = questions[currentIdx] ?? "";
  const currentAnswer = answers[currentIdx] ?? "";

  const goNextFromIntro = () => setStep("style");
  const goNextFromStyle = () => selectedStyle && setStep("count");
  const goNextFromCount = () => {
    if (!questionCount) return;
    setShouldFetchOnQA(true);
    setStep("qa");
  };

  const handlePrevQA = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
    else setStep("count");
  };
  const handleNextQA = async () => {
    if (currentIdx === questions.length - 1) {
      setIsGenerating(true);
      try {
        const messages = [];
        for (let i = 0; i < questions.length; i++) {
          messages.push({ sender: "bot", text: `질문: ${questions[i]}` });
          messages.push({ sender: "user", text: `답변: ${answers[i] ?? ""}` });
        }
        const story = await generateStory({
          token,
          style: selectedStyle,
          messages,
          userName,
        });
        setGeneratedStory(story);
        setHasSaved(false);
        setIsEditingResult(true);
        setStep("result");
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleDotClick = (idx) => {
    if (idx <= currentIdx) setCurrentIdx(idx);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveLifestory({
        id: reelId,
        style: selectedStyle,
        questions,
        answers,
        story: generatedStory,
      });
      setHasSaved(true);
      setIsEditingResult(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full py-20 flex items-center justify-center bg-black-100 text-white">
      <div className="flex-1  h-full px-1 py-5 box-border">
        <AnimatePresence mode="wait">
          {boot && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 grid place-items-center"
            >
              <div className="text-white/90">불러오는 중…</div>
            </motion.div>
          )}

          {step === "intro" && !boot && (
            <motion.section
              key="intro"
              {...fadeSlide}
              className="flex-1 w-full h-full flex flex-col items-center justify-center text-center"
            >
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-0 text-xl font-bold"
              >
                당신의 이야기를 알려주세요
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm opacity-85"
              >
                <strong>{userName}</strong>님의 생애문을 함께 정성스럽게 작성해
                드릴게요.
                <br />
                시작해볼까요?
              </motion.p>
              <div className="mt-5">
                <Primary onClick={goNextFromIntro}>시작하기</Primary>
              </div>
              <p className="text-[0.8rem] text-white/60 mt-5">
                약 5분~10분 정도 소요돼요.
              </p>
            </motion.section>
          )}

          {step === "style" && !boot && (
            <motion.section
              key="style"
              {...fadeSlide}
              className="flex-1  w-full h-full flex flex-col"
            >
              <Header
                title="어떤 분위기의 생애문을 원하시나요?"
                subtitle="원하는 스타일을 선택해 주세요."
              />
              <StylePicker
                options={STYLE_OPTIONS}
                selected={selectedStyle}
                onSelect={setSelectedStyle}
              />
              <div className="mt-8 flex justify-end">
                <Primary disabled={!selectedStyle} onClick={goNextFromStyle}>
                  다음
                </Primary>
              </div>
            </motion.section>
          )}

          {step === "count" && !boot && (
            <motion.section
              key="count"
              {...fadeSlide}
              className="w-full h-full flex flex-col"
            >
              <Header
                title="질문 개수를 고를게요"
                subtitle={`몇 개의 질문에 답하시겠어요? 더 많은 질문에 대답하면 ${userName}님의 이야기를 보다 잘 담을 수 있어요.`}
              />
              <CountPicker
                options={COUNT_OPTIONS}
                selected={questionCount}
                onSelect={setQuestionCount}
              />
              <div className="mt-8 flex justify-end">
                <Primary disabled={!questionCount} onClick={goNextFromCount}>
                  다음
                </Primary>
              </div>
            </motion.section>
          )}

          {step === "qa" && !boot && (
            <motion.section
              key="qa"
              {...fadeSlide}
              className="w-full h-full flex flex-col"
            >
              <ProgressDots
                total={questions.length}
                current={currentIdx}
                onDotClick={handleDotClick}
              />
              <div className="relative mt-4">
                <PrevButton onClick={handlePrevQA} />
                <QACard
                  idx={currentIdx}
                  total={questions.length}
                  question={currentQuestion}
                  answer={currentAnswer}
                  onChange={(v) => {
                    setAnswers((arr) => {
                      const copy = [...arr];
                      copy[currentIdx] = v;
                      return copy;
                    });
                    setAnswerMap((prev) => ({ ...prev, [currentQuestion]: v }));
                  }}
                />
              </div>
              <div className="mt-12 flex gap-2 justify-end">
                <Secondary onClick={handlePrevQA}>이전</Secondary>
                <Primary
                  onClick={handleNextQA}
                  disabled={!currentAnswer.trim() || isGenerating}
                >
                  {currentIdx === questions.length - 1
                    ? "생애문 생성하기!"
                    : "다음"}
                </Primary>
              </div>

              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 grid place-items-center"
                  >
                    <div className="w-7 h-7 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
                    <div className="mt-2 text-[14px] opacity-90">
                      생성 중이에요...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {step === "result" && !boot && (
            <motion.section
              key="result"
              {...fadeSlide}
              className="w-full h-full flex flex-col"
            >
              <ProgressDots
                total={questions.length}
                current={questions.length - 1}
                onDotClick={(i) => {
                  setStep("qa");
                  setCurrentIdx(i);
                }}
              />
              <div className="relative mt-4">
                <PrevButton
                  onClick={() => {
                    setStep("qa");
                    setCurrentIdx(questions.length - 1);
                  }}
                />
                <ResultView
                  questions={questions}
                  onGoToQA={(i) => {
                    setStep("qa");
                    setCurrentIdx(i);
                  }}
                  story={generatedStory}
                  isEditing={isEditingResult}
                  setIsEditing={setIsEditingResult}
                  onChangeStory={setGeneratedStory}
                />
              </div>
              <div className="mt-12 flex gap-2 justify-end">
                <Secondary
                  onClick={() => {
                    setGeneratedStory("");
                    setHasSaved(false);
                    setIsEditingResult(true);
                    setStep("style");
                  }}
                >
                  다시 생성하기
                </Secondary>
                {isEditingResult && (
                  <Primary
                    onClick={handleSave}
                    disabled={!generatedStory.trim() || isSaving}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </Primary>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
