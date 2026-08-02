"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const TUTORIAL_STEPS_KO = [
  { targetSelector: '[data-tutorial="preview"]', title: "미리보기", description: "버튼을 눌러 앞/뒷면을 확인할 수 있어요", position: "right", tab: null, panel: null },
  { targetSelector: '[data-tutorial="cover-editor"]', title: "표지 디자인", description: "AI로 표지를 생성하거나 직접 업로드할 수 있어요", position: "left", tab: "cover", panel: "cover" },
  { targetSelector: '[data-tutorial="story"]', title: "스토리", description: "키워드를 선택하고 AI로 글을 생성해보세요", position: "left", tab: "cover", panel: "story" },
  { targetSelector: '[data-tutorial="timeline"]', title: "타임라인", description: "인생의 주요 순간들을 기록하세요. 드래그로 순서 변경 가능해요", position: "left", tab: "cover", panel: "timeline" },
  { targetSelector: '[data-tutorial="theme"]', title: "테마", description: "뒷면 디자인 테마를 선택하세요", position: "left", tab: "cover", panel: "theme" },
  { targetSelector: '[data-tutorial="exit"]', title: "저장하고 나가기", description: "편집이 끝나면 이 버튼을 눌러 저장하고 나가세요", position: "right", tab: null, panel: null },
];

const TUTORIAL_STEPS_EN = [
  { targetSelector: '[data-tutorial="preview"]', title: "Preview", description: "Tap the button to see the front and back", position: "right", tab: null, panel: null },
  { targetSelector: '[data-tutorial="cover-editor"]', title: "Cover Design", description: "Generate a cover with AI or upload your own", position: "left", tab: "cover", panel: "cover" },
  { targetSelector: '[data-tutorial="story"]', title: "Story", description: "Select keywords and let AI generate your story", position: "left", tab: "cover", panel: "story" },
  { targetSelector: '[data-tutorial="timeline"]', title: "Timeline", description: "Record key moments in your life. Drag to reorder", position: "left", tab: "cover", panel: "timeline" },
  { targetSelector: '[data-tutorial="theme"]', title: "Theme", description: "Choose a back cover design theme", position: "left", tab: "cover", panel: "theme" },
  { targetSelector: '[data-tutorial="exit"]', title: "Save & Exit", description: "When done, press this button to save and exit", position: "right", tab: null, panel: null },
];

export default function TutorialOverlay({
  isActive,
  onClose,
  activeTab,
  setActiveTab,
  coverPanel,
  setCoverPanel,
  locale,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const TUTORIAL_STEPS = locale === "en" ? TUTORIAL_STEPS_EN : TUTORIAL_STEPS_KO;
  const step = TUTORIAL_STEPS[currentStep];

  const measureTarget = useCallback(() => {
    if (!isActive || !step) return;
    const el = document.querySelector(step.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Re-measure after scroll settles
      setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 350);
    } else {
      setTargetRect(null);
    }
  }, [isActive, step]);

  // Switch tab + rail panel when step changes
  useEffect(() => {
    if (!isActive || !step) return;
    if (step.tab && step.tab !== activeTab) {
      setActiveTab(step.tab);
    }
    if (step.panel && step.panel !== coverPanel) {
      setCoverPanel(step.panel);
    }
  }, [currentStep, isActive, step, activeTab, setActiveTab, coverPanel, setCoverPanel]);

  // Measure target after tab/panel switch settles
  useEffect(() => {
    if (!isActive) return;
    // Small delay to let tab content render
    const timer = setTimeout(measureTarget, 150);
    return () => clearTimeout(timer);
  }, [currentStep, isActive, activeTab, coverPanel, measureTarget]);

  // Reset step on open
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
    }
  }, [isActive]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Compute tooltip box position
  const getTooltipStyle = () => {
    if (!targetRect)
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const padding = 16;
    const tooltipWidth = 300;
    const tooltipHeight = 160;

    let top, left;

    switch (step.position) {
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case "bottom":
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left;
    }

    // Clamp to viewport
    top = Math.max(12, Math.min(top, window.innerHeight - tooltipHeight - 12));
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

    return { top, left, width: tooltipWidth };
  };

  // Spotlight clip path (cut-out rectangle)
  const getSpotlightStyle = () => {
    if (!targetRect) return {};
    const inset = 6;
    return {
      position: "fixed",
      top: targetRect.top - inset,
      left: targetRect.left - inset,
      width: targetRect.width + inset * 2,
      height: targetRect.height + inset * 2,
      borderRadius: 12,
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
      pointerEvents: "none",
      zIndex: 61,
    };
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop — clicks close tutorial */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spotlight hole */}
      {targetRect && <div style={getSpotlightStyle()} />}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={getTooltipStyle()}
          className="fixed z-[62] rounded-xl bg-[#1e1a14] p-5 shadow-2xl ring-1 ring-white/10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#9b8b7a] transition-colors hover:text-[#e8d5b7]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step indicator */}
          <div className="mb-2 flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? "bg-[#c4b49a] w-4"
                    : i < currentStep
                      ? "bg-[#c4b49a]/40 w-1.5"
                      : "w-1.5 bg-white/10"
                }`}
              />
            ))}
            <span className="ml-auto text-[11px] text-[#9b8b7a]">
              {currentStep + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h3 className="mb-1 text-sm font-bold text-[#e8d5b7]">{step.title}</h3>
          <p className="mb-4 text-[13px] leading-relaxed text-[#9b8b7a]">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                currentStep === 0
                  ? "cursor-default text-[#9b8b7a]/30"
                  : "text-[#9b8b7a] hover:bg-white/8 hover:text-[#e8d5b7]"
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {locale === "en" ? "Prev" : "이전"}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg bg-[#c4b49a] px-4 py-1.5 text-xs font-semibold text-[#1a1510] transition-colors hover:bg-[#e8d5b7]"
            >
              {currentStep === TUTORIAL_STEPS.length - 1
                ? (locale === "en" ? "Done" : "완료")
                : (locale === "en" ? "Next" : "다음")}
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
