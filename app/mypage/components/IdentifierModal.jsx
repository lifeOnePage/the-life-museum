"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { iconBtn, inputStyle } from "./styles";
import { SlQuestion } from "react-icons/sl";

export default function IdentifierModal({
  open,
  title,
  contentType = "reel", // 'reel' | 'records'
  onClose,
  onConfirm, // (identifier: string, meta?: { name: string })
}) {
  const [step, setStep] = useState(0); // 0: name, 1: identifier
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [toggleViewIdInstruction, setToggleViewIdInstruction] = useState(false);

  // 포커스 타겟
  const nameRef = useRef(null);
  const idRef = useRef(null);

  // 뷰포트 높이 애니메이션용
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const [viewportH, setViewportH] = useState(0);

  // 타입별 카피
  const copy = useMemo(() => {
    if (contentType === "records") {
      return {
        titleDefault: "새로운 LifeRecords 만들기",
        nameLabel: "Records를 제작할 대상의 성함을 적어주세요.",
        namePlaceholder: "예: 홍길동",
        nameHelp: "이름은 나중에도 수정할 수 있어요.",
        idHeader: "ID에 대하여",
        idLines: [
          "ID는 LifeRecords의 고유한 주소를 만드는 값이에요.",
          "다른 Records와 중복될 수 없고, 영문/숫자/언더스코어(_)/하이픈(-)만 가능해요.",
          "마이페이지에서 언제든 다시 변경할 수 있어요.",
        ],
        idPlaceholder: "예: my-first-records",
      };
    }
    return {
      titleDefault: "새 Life-Reels",
      nameLabel: "Life-Reels를 제작할 대상의 성함을 적어주세요.",
      namePlaceholder: "예: 홍길동",
      nameHelp: "성함은 나중에도 수정할 수 있어요.",
      idLabel: "Life-Reels의 ID를 만들어주세요.",
      idHeader: "ID에 대하여",
      idLines: [
        "Life-Reels의 고유 이름이에요.",
        "완성된 Life-Reels를 ID가 포함된 링크로 공유할 수 있어요.",
        "다른 Life-Reels와 중복될 수 없고, 영문/숫자/언더스코어(_)/하이픈(-)만 사용할 수 있어요.",
        "마이페이지에서 언제든 다시 변경할 수 있어요.",
      ],
      idPlaceholder: "예: my-first-reel",
    };
  }, [contentType]);

  // 열릴 때 초기화 + 포커스
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName("");
    setIdentifier("");
    setLoading(false);
    // 다음 tick에 포커스
    const t = setTimeout(() => nameRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // 스텝 전환 시 포커스
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (step === 0) nameRef.current?.focus();
      else idRef.current?.focus();
      // 현재 콘텐츠 높이 측정
      if (contentRef.current) {
        setViewportH(contentRef.current.offsetHeight);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open, step]);

  // 초기 높이 보정
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (contentRef.current) setViewportH(contentRef.current.offsetHeight);
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const handleNext = () => {
    const n = name.trim();
    if (!n) return alert("이름을 입력해주세요.");
    setStep(1);
  };

  const submit = async () => {
    const idf = identifier.trim();
    if (!/^[a-z0-9_-]{3,32}$/i.test(idf)) {
      alert("ID는 3~32자, 영문/숫자/언더스코어(_)/하이픈(-)만 허용해요.");
      return;
    }
    setLoading(true);
    try {
      await onConfirm({ identifier: identifier.trim(), name: name.trim() });
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  const onViewportKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (step === 0) handleNext();
    else submit();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(80vw, 760px)",
          height: "fit-content",
          background: "#121212",
          border: "1px solid #2e2e2e",
          borderRadius: 12,
          padding: "16px 16px 20px",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* ===== 헤더: 고정 영역 (애니메이션 대상 아님) ===== */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          {step === 1 && (
            <button
              onClick={() => setStep(0)}
              aria-label="뒤로"
              style={{
                ...iconBtn,
                padding: "6px 16px 6px 6px",
                borderRadius: 999,
                marginRight: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              이전으로
            </button>
          )}
          <h3 style={{ margin: 0 }}>{title || copy.titleDefault}</h3>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{ ...iconBtn, padding: 6, borderRadius: 999 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ===== 콘텐츠 뷰포트: 고정 프레임(헤더와 분리), 내부만 슬라이드 ===== */}
        <motion.div
          ref={viewportRef}
          animate={{ height: "auto" }}
          transition={{ duration: 0.22 }}
          style={{
            // overflow: "hidden",
            position: "relative",
            borderTop: "1px solid #2e2e2e",
            paddingTop: 12,
          }}
          onKeyDown={onViewportKeyDown}
          tabIndex={-1} // 키 입력 받을 수 있도록
        >
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => {
              // exit 완료 후 높이 재계산
              if (contentRef.current)
                setViewportH(contentRef.current.offsetHeight);
            }}
          >
            {step === 0 ? (
              <motion.div
                key="step-name"
                ref={contentRef}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{ position: "relative" }}
              >
                <p
                  style={{ marginTop: 4, color: "#bbb", lineHeight: "1.6rem" }}
                >
                  {copy.nameLabel}
                </p>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
                <p style={{ color: "#888", marginTop: 8, fontSize: 12 }}>
                  {copy.nameHelp}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <button onClick={onClose} style={iconBtn}>
                    취소
                  </button>
                  <button onClick={handleNext} style={iconBtn}>
                    다음
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-id"
                ref={contentRef}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{ position: "relative" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: "12px 0px", color: "#bbb" }}>
                    {copy.idLabel}
                  </p>
                  <button
                    onClick={() => setToggleViewIdInstruction((v) => !v)}
                    aria-expanded={toggleViewIdInstruction}
                    aria-controls="id-instruction-panel"
                    style={{
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                    title="설명 보기"
                  >
                    <SlQuestion size={16} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {toggleViewIdInstruction && (
                    <motion.div
                      id="id-instruction-panel"
                      key="id-instruction"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      style={{
                        overflow: "hidden", // 높이 애니메이션시 내용 잘림 방지
                        display: "flex",
                        flexDirection: "column",
                        padding: 12,
                        // border: "1px solid #777",
                        borderRadius: 12,
                        marginBottom: 16,
                        fontSize: "0.85rem",
                        background: "#222",
                      }}
                    >
                      <p
                        style={{
                          width: "fit-content",
                          padding: "6px 14px",
                          borderRadius: 14,
                          background: "#343434",
                          fontWeight: 700,
                          border: "1px solid #aaa",
                          margin: 0,
                          marginBottom: 8,
                        }}
                      >
                        {copy.idHeader}
                      </p>

                      {copy.idLines.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            color: "#bbb",
                            lineHeight: "1.35rem",
                            margin: "4px 0",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={idRef}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={copy.idPlaceholder}
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <button onClick={onClose} style={iconBtn}>
                    취소
                  </button>
                  <button
                    onClick={submit}
                    disabled={loading}
                    style={{ ...iconBtn, opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? "생성 중..." : "생성"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
