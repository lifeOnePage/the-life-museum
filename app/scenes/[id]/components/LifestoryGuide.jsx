// app/scenes/[id]/components/LifestoryGuide.jsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/app/contexts/AuthContext";

// 기존 parts 컴포넌트들 임포트
import Header from "@/app/edit/[identifier]/reels/components/lifestory/parts/Header";
import StylePicker from "@/app/edit/[identifier]/reels/components/lifestory/parts/StylePicker";
import CountPicker from "@/app/edit/[identifier]/reels/components/lifestory/parts/CountPicker";
import QACard from "@/app/edit/[identifier]/reels/components/lifestory/parts/QACard";
import ProgressDots from "@/app/edit/[identifier]/reels/components/lifestory/parts/ProgressDots";
import {
  Primary,
  Secondary,
} from "@/app/edit/[identifier]/reels/components/lifestory/parts/Buttons";

const STYLE_OPTIONS = ["진중한", "낭만적인", "재치있는", "신비로운"];
const COUNT_OPTIONS = [5, 10];

export default function LifestoryGuide({
  userName = "사용자",
  onBack,
  onApply,
  initialData = null,
}) {
  const { token } = useAuth();
  const [step, setStep] = useState("intro");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerMap, setAnswerMap] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tokenUsage, setTokenUsage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [shouldFetchOnQA, setShouldFetchOnQA] = useState(true);

  // 초기 데이터 로드 (로컬 상태에서 복원)
  useEffect(() => {
    if (!initialData) return;

    const {
      style,
      questions: savedQuestions = [],
      answers: savedAnswers = [],
      story = "",
      tokenUsage: savedTokenUsage = 0,
      currentStep = "intro",
    } = initialData;

    setSelectedStyle(style ?? null);
    setQuestionCount(savedQuestions.length || null);
    setQuestions(savedQuestions);
    setAnswers(savedAnswers);
    setTokenUsage(savedTokenUsage);
    setGeneratedStory(story);

    const map = {};
    savedQuestions.forEach((q, i) => (map[q] = savedAnswers[i] ?? ""));
    setAnswerMap(map);

    if (story?.trim()) {
      setStep("result");
    } else if (savedQuestions.length > 0) {
      const nextIdx = Math.max(
        0,
        savedAnswers.findIndex((a) => !a || !String(a).trim()),
      );
      setCurrentIdx(nextIdx === -1 ? savedQuestions.length - 1 : nextIdx);
      setStep("qa");
      setShouldFetchOnQA(false);
    } else if (style) {
      setStep("count");
    } else if (currentStep) {
      setStep(currentStep);
    }
  }, [initialData]);

  // QA 진입 시 기본 질문 세팅
  useEffect(() => {
    if (step !== "qa" || !selectedStyle || !questionCount) return;
    if (!shouldFetchOnQA) {
      setShouldFetchOnQA(true);
      return;
    }
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
  }, [step, selectedStyle, questionCount, shouldFetchOnQA]); // eslint-disable-line

  // 현재 진행 상황 데이터
  const currentProgressData = useMemo(
    () => ({
      style: selectedStyle,
      questions,
      answers,
      story: generatedStory,
      tokenUsage,
      currentStep: step,
    }),
    [selectedStyle, questions, answers, generatedStory, tokenUsage, step],
  );

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

  /** 마지막 질문에서 '생애문 생성하기!' */
  const handleNextQA = async () => {
    if (currentIdx === questions.length - 1) {
      if (tokenUsage >= 3) {
        alert("이미 생성 기회를 모두 사용했어요 🥹");
        return;
      }
      setIsGenerating(true);
      try {
        setTokenUsage((u) => u + 1);

        const messages = [];
        for (let i = 0; i < questions.length; i++) {
          messages.push({ sender: "bot", text: `질문: ${questions[i]}` });
          messages.push({ sender: "user", text: `답변: ${answers[i] ?? ""}` });
        }

        // generateStory API 호출
        const res = await fetch("/api/gpt-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ style: selectedStyle, messages, userName }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "generate failed");

        const story = json.story;
        setGeneratedStory(story);
        setStep("result");
      } catch (e) {
        alert("생성 중 오류가 발생했어요.");
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleBack = () => {
    // 진행 상황과 함께 뒤로가기
    if (onBack) {
      onBack(currentProgressData);
    }
  };

  const handleApply = () => {
    // 생성된 생애문 적용 + 진행 상황 저장
    if (onApply && generatedStory.trim()) {
      onApply(generatedStory, currentProgressData);
    }
  };

  return (
    <div className="relative flex w-full flex-col text-white">
      {/* 우상단 닫기 버튼 (프로필 편집으로 돌아가기) - 스티키 */}
      <div className="from-black-100/40 sticky top-0 z-20 flex justify-end bg-gradient-to-b to-transparent pt-4 pr-4">
        <button
          onClick={handleBack}
          className="text-white/60 transition-colors hover:text-white"
          title="프로필 편집으로 돌아가기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="box-border flex-1 px-6 pb-5">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.section
              key="intro"
              {...fadeSlide}
              className="flex w-full flex-col items-center justify-center py-8 text-center"
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
                <strong>{userName}</strong>님의 생애문을 함께 작성해드릴게요.
              </motion.p>
              <div className="mt-5">
                <Primary onClick={goNextFromIntro}>시작하기</Primary>
              </div>
              <p className="mt-4 text-[0.75rem] text-white/60">
                약 5~10분 소요
              </p>
            </motion.section>
          )}

          {step === "style" && (
            <motion.section
              key="style"
              {...fadeSlide}
              className="flex w-full flex-col py-4"
            >
              {/* 좌측 이전 버튼 */}
              <button
                onClick={() => setStep("intro")}
                className="mb-4 self-start text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                이전으로
              </button>

              <Header
                title="어떤 분위기의 생애문을 원하시나요?"
                subtitle="원하는 스타일을 선택해 주세요."
              />
              <StylePicker
                options={STYLE_OPTIONS}
                selected={selectedStyle}
                onSelect={setSelectedStyle}
              />
              <div className="mt-6 flex justify-end">
                <Primary disabled={!selectedStyle} onClick={goNextFromStyle}>
                  다음
                </Primary>
              </div>
            </motion.section>
          )}

          {step === "count" && (
            <motion.section
              key="count"
              {...fadeSlide}
              className="flex w-full flex-col py-4"
            >
              {/* 좌측 이전 버튼 */}
              <button
                onClick={() => setStep("style")}
                className="mb-4 self-start text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                이전으로
              </button>

              <Header
                title="질문 개수를 선택하세요"
                subtitle={`더 많은 질문에 답할수록 ${userName}님의 이야기를 풍부하게 담을 수 있어요.`}
              />
              <CountPicker
                options={COUNT_OPTIONS}
                selected={questionCount}
                onSelect={setQuestionCount}
              />
              <div className="mt-6 flex justify-end">
                <Primary disabled={!questionCount} onClick={goNextFromCount}>
                  다음
                </Primary>
              </div>
            </motion.section>
          )}

          {step === "qa" && (
            <motion.section
              key="qa"
              {...fadeSlide}
              className="flex w-full flex-col py-4"
            >
              {/* 좌측 이전 버튼 */}
              <button
                onClick={handlePrevQA}
                className="mb-4 self-start text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                이전으로
              </button>

              <ProgressDots
                total={questions.length}
                current={currentIdx}
                onDotClick={(i) => {
                  if (i <= currentIdx) setCurrentIdx(i);
                }}
              />
              <div className="relative mt-3">
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
              <div className="mt-8 flex items-center justify-between">
                <div className="text-xs text-white/50">
                  생성 가능: <b>{Math.max(0, 3 - tokenUsage)}</b> / 3
                </div>
                <div className="flex gap-2">
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
              </div>

              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 grid place-items-center bg-black/50"
                  >
                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
                    <div className="mt-2 text-[14px] opacity-90">
                      생성 중이에요...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {step === "result" && (
            <motion.section
              key="result"
              {...fadeSlide}
              className="flex w-full flex-col py-4"
            >
              {/* 좌측 이전 버튼 */}
              <button
                onClick={() => {
                  setStep("qa");
                  setCurrentIdx(questions.length - 1);
                }}
                className="mb-4 self-start text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                이전으로
              </button>

              <ProgressDots
                total={questions.length}
                current={questions.length - 1}
                onDotClick={(i) => {
                  setStep("qa");
                  setCurrentIdx(i);
                }}
              />
              <div className="relative mt-3">
                <div className="bg-black-100 rounded-lg border border-white/10 p-4">
                  <h3 className="mb-3 text-base font-bold">생성된 생애문</h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedStory}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Secondary
                  onClick={() => {
                    if (tokenUsage >= 3) {
                      alert("이미 생성 기회를 모두 사용했어요 🥹");
                      return;
                    }
                    setGeneratedStory("");
                    setStep("style");
                  }}
                >
                  다시 생성 {"(" + (3 - tokenUsage) + "/3)"}
                </Secondary>

                <Primary
                  onClick={handleApply}
                  disabled={!generatedStory.trim()}
                >
                  적용하기
                </Primary>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
