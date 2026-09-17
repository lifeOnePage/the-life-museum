"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRight,
  ChevronLeft,
  Check,
  Plus,
  X,
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  BookOpen,
  User,
  RefreshCw,
  Phone,
  Calendar,
  Camera,
  Clock,
  Star,
  Edit3,
  Trash2,
  Pencil,
  GripVertical,
  Type,
} from "lucide-react";

// ─────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────
// Palette: bg = Soft Porcelain, key color = Shell Radiance, emphasis = Ivory Mineral, type = Nickel Diffusion
const C = {
  bg: "#F4F4F4",
  surface: "#ffffff",
  raised: "#FEF7EE",
  divider: "#DDDDDD",
  accent: "#6C6459",
  accentSubtle: "rgba(238,221,196,0.4)",
  accentMid: "#4D4A44",
  textPrimary: "#2A2A2A",
  textSecondary: "#787776",
  textMuted: "#A39D93",
  success: "#3f8f5f",
  danger: "#a13f3f",
};

const TOTAL_STEPS = 6;

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled = false, children, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "18px 28px",
        borderRadius: 16,
        fontSize: 18,
        fontWeight: 700,
        background: disabled
          ? C.divider
          : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
        color: disabled ? C.textMuted : "#fff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: "-0.3px",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(108,100,89,0.25)",
      }}
    >
      {children}
      {icon && !disabled && icon}
    </button>
  );
}

function SecondaryBtn({ onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "16px 24px",
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 500,
        background: "transparent",
        color: C.textSecondary,
        border: `1px solid ${C.divider}`,
        cursor: "pointer",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Chip({ onClick, children, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        background: active ? C.accent : C.raised,
        color: active ? "#fff" : C.textSecondary,
        border: `1px solid ${active ? C.accent : C.divider}`,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function StepLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.accent,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </p>
  );
}
function PageTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: 30,
        fontWeight: 800,
        color: C.textPrimary,
        lineHeight: 1.3,
        letterSpacing: "-0.8px",
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}
function PageSub({ children }) {
  return (
    <p
      style={{
        fontSize: 16,
        color: C.textSecondary,
        lineHeight: 1.7,
        marginTop: 8,
      }}
    >
      {children}
    </p>
  );
}
function SectionHead({ children }) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.textMuted,
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ padding: "16px 24px 0" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: i <= step ? C.accent : C.divider,
              transition: "background 0.4s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
        {step + 1} / {TOTAL_STEPS} 단계
      </p>
    </div>
  );
}

function UnderlineInput({
  id,
  type = "text",
  inputMode,
  placeholder,
  value,
  onChange,
  onKeyDown,
  autoFocus,
  large,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full outline-none"
      style={{
        fontSize: large ? 28 : 20,
        fontWeight: large ? 700 : 500,
        padding: large ? "18px 0" : "14px 0",
        background: "transparent",
        color: C.textPrimary,
        border: "none",
        borderBottom: `2px solid ${focused ? C.accent : C.divider}`,
        borderRadius: 0,
        letterSpacing: "-0.3px",
        transition: "border-color 0.2s",
        width: "100%",
        display: "block",
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Step 0 — Landing
// ─────────────────────────────────────────────
function Step0({ onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ textAlign: "left", paddingTop: 8 }}>
        <span
          style={{
            display: "block",
            fontFamily: "'Futura', 'Futura PT', sans-serif",
            fontSize: 15,
            fontWeight: 300,
            color: C.textPrimary,
            marginBottom: 24,
          }}
        >
          the
          <span
            style={{
              fontSize: "1.25em",
              textTransform: "uppercase",
            }}
          >
            LIFE
          </span>
          memory
        </span>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: C.textPrimary,
            lineHeight: 1.35,
            letterSpacing: "-0.8px",
            margin: 0,
          }}
        >
          살아온 날들을
          <br />한 권의 <span style={{ color: C.accent }}>앨범</span>에
          <br />
          담아보세요
        </h1>
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 15,
            color: C.textSecondary,
            lineHeight: 1.7,
            marginTop: 12,
          }}
        >
          <Clock size={14} color={C.textSecondary} strokeWidth={2} />
          10분이면 완성돼요
        </p>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 45px rgba(36,26,15,0.15)",
        }}
      >
        <img
          src="/simple/simpletutorial.png"
          alt="예시 앨범"
          style={{
            width: "100%",
            aspectRatio: "1176 / 1337",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <button
        onClick={onNext}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "18px 28px",
          borderRadius: 16,
          fontSize: 18,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          letterSpacing: "-0.3px",
          boxShadow: "0 10px 24px rgba(108,100,89,0.35)",
        }}
      >
        앨범 만들기 시작
        <ArrowRight size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 1 — Registration
// ─────────────────────────────────────────────
const REG_FIELDS = [
  {
    key: "name",
    icon: <User size={18} strokeWidth={1.5} />,
    question: "성함이 어떻게 되세요?",
    hint: "앨범 표지에 이름이 들어가요",
    placeholder: "예: 홍길동",
  },
  {
    key: "birth",
    icon: <Calendar size={18} strokeWidth={1.5} />,
    question: "생년월일을 알려주세요",
    hint: "숫자 8자리로 입력해주세요",
    placeholder: "예: 19501015",
    inputMode: "numeric",
  },
  {
    key: "phone",
    icon: <Phone size={18} strokeWidth={1.5} />,
    question: "핸드폰 번호를 알려주세요",
    hint: "완성된 앨범을 보내드릴게요",
    placeholder: "010-0000-0000",
    inputMode: "numeric",
  },
];

function Step1({ onNext, info, setInfo, backRef }) {
  const [idx, setIdx] = useState(0);
  const done = idx === REG_FIELDS.length;
  const field = done ? null : REG_FIELDS[idx];

  useEffect(() => {
    if (backRef) {
      backRef.current = idx > 0 ? () => setIdx((i) => i - 1) : null;
      return () => {
        backRef.current = null;
      };
    }
  }, [backRef, idx]);
  const fieldLabel = (k) =>
    k === "name" ? "이름" : k === "birth" ? "생년월일" : "연락처";

  function handleChange(v) {
    if (!field) return;
    if (field.key === "birth") {
      setInfo({ ...info, birth: v.replace(/\D/g, "").slice(0, 8) });
      return;
    }
    if (field.key === "phone") {
      const d = v.replace(/\D/g, "").slice(0, 11);
      const f =
        d.length > 7
          ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
          : d.length > 3
            ? `${d.slice(0, 3)}-${d.slice(3)}`
            : d;
      setInfo({ ...info, phone: f });
      return;
    }
    setInfo({ ...info, [field.key]: v });
  }

  function valid() {
    if (!field) return true;
    if (field.key === "name") return info.name.trim().length > 0;
    if (field.key === "birth") return info.birth.length === 8;
    if (field.key === "phone")
      return info.phone.replace(/\D/g, "").length >= 10;
    return false;
  }

  const birthDisplay =
    info.birth.length === 8
      ? `${info.birth.slice(0, 4)}년 ${info.birth.slice(4, 6)}월 ${info.birth.slice(6, 8)}일`
      : "";

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ textAlign: "center", paddingTop: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 12px 36px rgba(108,100,89,0.3)",
            }}
          >
            <Check size={34} color="#fff" strokeWidth={2.5} />
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.textPrimary,
              letterSpacing: "-0.6px",
              marginBottom: 10,
            }}
          >
            잘하셨어요!
          </h2>
          <p style={{ fontSize: 17, color: C.textSecondary, lineHeight: 1.7 }}>
            {info.name}님, 기본 정보가 입력되었어요.
            <br />
            이제 인생의 소중한 순간들을 알려주세요.
          </p>
        </div>
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${C.divider}`,
          }}
        >
          {REG_FIELDS.map((f, i) => (
            <div
              key={f.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: i % 2 === 0 ? C.raised : C.surface,
                borderBottom:
                  i < REG_FIELDS.length - 1 ? `1px solid ${C.divider}` : "none",
              }}
            >
              <span style={{ fontSize: 14, color: C.textMuted }}>
                {fieldLabel(f.key)}
              </span>
              <span
                style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}
              >
                {info[f.key]}
              </span>
            </div>
          ))}
        </div>
        <PrimaryBtn
          onClick={onNext}
          icon={<ArrowRight size={20} strokeWidth={2} />}
        >
          다음 단계로
        </PrimaryBtn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div>
        <StepLabel>당신에 대해서</StepLabel>
        <PageTitle>
          당신에 대해서
          <br />
          알려주세요
        </PageTitle>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {REG_FIELDS.map((_, i) => (
          <div
            key={i}
            style={{
              height: 4,
              borderRadius: 999,
              transition: "all 0.3s",
              background:
                i < idx
                  ? C.accent
                  : i === idx
                    ? "rgba(108,100,89,0.45)"
                    : C.divider,
              width: i === idx ? 24 : 8,
            }}
          />
        ))}
        <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 6 }}>
          {idx + 1} / {REG_FIELDS.length}
        </span>
      </div>
      {idx > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {REG_FIELDS.slice(0, idx).map((f, i, arr) => (
            <button
              key={f.key}
              onClick={() => setIdx(REG_FIELDS.indexOf(f))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 4px",
                background: "transparent",
                border: "none",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Check size={14} color={C.success} strokeWidth={2.5} />
              <span style={{ fontSize: 13, color: C.textMuted }}>
                {fieldLabel(f.key)}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: C.textSecondary,
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                {info[f.key]}
              </span>
            </button>
          ))}
        </div>
      )}
      {field && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ color: C.accent }}>{field.icon}</span>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {field.hint}
            </span>
          </div>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.textPrimary,
              marginBottom: 4,
              letterSpacing: "-0.5px",
            }}
          >
            {field.question}
          </p>
          <UnderlineInput
            id={field.key}
            type={field.key === "phone" ? "tel" : "text"}
            inputMode={field.inputMode}
            placeholder={field.placeholder}
            value={info[field.key]}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid()) setIdx((i) => i + 1);
            }}
            autoFocus
            large
          />
          {birthDisplay && (
            <span
              style={{
                fontSize: 15,
                color: C.accent,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {birthDisplay}
            </span>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        {idx > 0 && (
          <SecondaryBtn
            onClick={() => setIdx((i) => i - 1)}
            icon={<ChevronLeft size={16} strokeWidth={2} />}
          >
            이전
          </SecondaryBtn>
        )}
        <PrimaryBtn
          onClick={() => setIdx((i) => i + 1)}
          disabled={!valid()}
          icon={<ArrowRight size={20} strokeWidth={2} />}
        >
          다음
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 2 — Milestones
// ─────────────────────────────────────────────
const MAIN_QUESTIONS = [
  "지금 제일 생각나는 순간은 언제인가요?",
  "가장 행복했던 때는 언제였나요?",
  "가장 힘들었지만 이겨낸 순간은요?",
  "가족과의 소중한 추억이 있다면?",
  "살면서 가장 잘한 일은 무엇인가요?",
];

const QUESTION_EXAMPLES = [
  ["결혼식 날 아침", "첫 아이가 태어난 날", "고향 골목에서 뛰어놀던 기억"],
  [
    "온 가족이 여행 갔을 때",
    "오래된 친구와 다시 만났을 때",
    "오랫동안 바라던 일이 이루어졌을 때",
  ],
  [
    "큰 병을 이겨냈을 때",
    "어려운 고비를 가족과 함께 넘겼을 때",
    "힘든 일을 꾸준히 버텨냈을 때",
  ],
  [
    "자녀 결혼식 날",
    "손자 손녀 첫 돌잔치",
    "명절에 온 가족이 한자리에 모였을 때",
  ],
  [
    "자식을 건강하게 키운 것",
    "평생 한 가지 일을 성실히 해온 것",
    "어려운 이웃을 도왔던 것",
  ],
];

const ALT_QUESTIONS = [
  "첫 직장을 다니던 때가 기억나세요?",
  "가장 멀리 여행을 갔던 때는 언제였나요?",
  "처음으로 큰 결정을 내렸던 순간은요?",
  "어린 시절 가장 좋아했던 놀이나 장소가 있나요?",
  "자녀나 손자녀와의 특별한 순간이 있나요?",
  "가장 자랑스러웠던 성취가 있다면?",
  "고마운 사람이 생각나는 순간이 있나요?",
  "가장 맛있게 먹었던 기억이 있나요?",
];

const ALT_EXAMPLES = {
  "첫 직장을 다니던 때가 기억나세요?": [
    "첫 월급을 탔던 날",
    "직장 동료들과 회식하던 날",
    "처음 업무를 배우던 시절",
  ],
  "가장 멀리 여행을 갔던 때는 언제였나요?": [
    "제주도 가족 여행",
    "처음 해외에 나갔을 때",
    "친구들과 기차 여행",
  ],
  "처음으로 큰 결정을 내렸던 순간은요?": [
    "직업을 선택하던 때",
    "이사를 결심했을 때",
    "중요한 약속을 했을 때",
  ],
  "어린 시절 가장 좋아했던 놀이나 장소가 있나요?": [
    "뒷산에서 뛰어놀던 기억",
    "동네 친구들과 놀던 골목",
    "할머니 댁 마당",
  ],
  "자녀나 손자녀와의 특별한 순간이 있나요?": [
    "아이 첫 걸음마를 봤을 때",
    "학교 입학식 날",
    "함께 요리를 만들었을 때",
  ],
  "가장 자랑스러웠던 성취가 있다면?": [
    "자격증이나 시험에 합격했을 때",
    "힘든 일을 해냈을 때",
    "누군가를 도와 감사 인사를 받았을 때",
  ],
  "고마운 사람이 생각나는 순간이 있나요?": [
    "힘들 때 도와준 친구",
    "늘 곁에 있어준 배우자",
    "은사님 또는 스승님",
  ],
  "가장 맛있게 먹었던 기억이 있나요?": [
    "어머니가 해주신 음식",
    "처음 먹어본 특별한 요리",
    "가족과 함께한 식사",
  ],
};

const ALL_EXAMPLES = {
  ...Object.fromEntries(
    MAIN_QUESTIONS.map((q, i) => [q, QUESTION_EXAMPLES[i]]),
  ),
  ...ALT_EXAMPLES,
};

function getYearSuggestions(text) {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 3) {
    const d = digits + "0";
    return [`${d}년대 초반`, `${d}년대 중반`, `${d}년대 말`];
  }
  if (digits.length === 4) {
    const y = parseInt(digits);
    const dec = Math.floor(y / 10) * 10;
    if (y % 10 === 0)
      return [
        `${y}년`,
        `${y}년 쯤`,
        `${dec}년대 초반`,
        `${dec}년대 중반`,
        `${dec}년대 말`,
      ];
    return [`${y}년`, `${y}년 쯤`];
  }
  return [];
}

function VoiceBtn({ onResult }) {
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  if (typeof window === "undefined") return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  function toggle() {
    if (on) {
      ref.current?.stop();
      setOn(false);
      return;
    }
    const r = new SR();
    r.lang = "ko-KR";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      onResult(e.results[0][0].transcript);
      setOn(false);
    };
    r.onerror = () => setOn(false);
    r.onend = () => setOn(false);
    r.start();
    ref.current = r;
    setOn(true);
  }
  return (
    <button
      onClick={toggle}
      aria-label={on ? "음성 입력 중지" : "음성으로 입력하기"}
      style={{
        position: "absolute",
        right: 4,
        bottom: 10,
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: on ? "#b23b3b" : C.accent,
        border: "none",
        boxShadow: on
          ? "0 4px 14px rgba(178,59,59,0.35)"
          : "0 4px 14px rgba(108,100,89,0.35)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {on ? (
        <Square size={16} strokeWidth={2} color="#fff" fill="#fff" />
      ) : (
        <Mic size={20} strokeWidth={2} color="#fff" />
      )}
    </button>
  );
}

function TimelineRow({
  item,
  isEditing,
  isDeleting,
  onToggleEdit,
  onToggleDelete,
  onFieldChange,
  onSaveEdit,
  onConfirmDelete,
  onCancelDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${isEditing ? C.accent : C.divider}`,
    background: C.surface,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Row header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          background: C.raised,
        }}
      >
        <span
          {...attributes}
          {...listeners}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <GripVertical size={16} color={C.textMuted} strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
            {item.year}
          </span>
          <p
            style={{
              fontSize: 14,
              color: C.textSecondary,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.event}
          </p>
        </div>
        <button
          onClick={onToggleEdit}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isEditing ? C.accentSubtle : "transparent",
            border: `1px solid ${isEditing ? C.accent : C.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Pencil
            size={14}
            color={isEditing ? C.accent : C.textMuted}
            strokeWidth={2}
          />
        </button>
        <button
          onClick={onToggleDelete}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isDeleting ? "rgba(139,64,64,0.15)" : "transparent",
            border: `1px solid ${isDeleting ? C.danger : C.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Trash2
            size={14}
            color={isDeleting ? "#a13f3f" : C.textMuted}
            strokeWidth={2}
          />
        </button>
      </div>
      {/* Edit form */}
      {isEditing && (
        <div
          style={{
            padding: "16px",
            background: C.surface,
            borderTop: `1px solid ${C.divider}`,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              연도
            </span>
            <input
              value={item.year}
              onChange={(e) => onFieldChange("year", e.target.value)}
              placeholder="예: 1985년 쯤"
              className="w-full outline-none"
              style={{
                fontSize: 18,
                fontWeight: 600,
                padding: "10px 0",
                background: "transparent",
                color: C.textPrimary,
                border: "none",
                borderBottom: `1.5px solid ${C.divider}`,
                width: "100%",
                display: "block",
                marginTop: 6,
              }}
            />
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              내용
            </span>
            <textarea
              value={item.event}
              onChange={(e) => onFieldChange("event", e.target.value)}
              rows={2}
              className="w-full resize-none outline-none"
              style={{
                fontSize: 16,
                padding: "10px 0",
                background: "transparent",
                color: C.textPrimary,
                border: "none",
                borderBottom: `1.5px solid ${C.divider}`,
                width: "100%",
                display: "block",
                lineHeight: 1.6,
                marginTop: 6,
              }}
            />
          </div>
          <button
            onClick={onSaveEdit}
            style={{
              padding: "10px",
              borderRadius: 10,
              background: C.accent,
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            저장
          </button>
        </div>
      )}
      {/* Delete confirm */}
      {isDeleting && (
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(139,64,64,0.08)",
            borderTop: `1px solid rgba(139,64,64,0.2)`,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ flex: 1, fontSize: 14, color: "#a13f3f" }}>
            이 순간을 삭제할까요?
          </span>
          <button
            onClick={onConfirmDelete}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: C.danger,
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            삭제
          </button>
          <button
            onClick={onCancelDelete}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              color: C.textMuted,
              border: `1px solid ${C.divider}`,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}

function Step2({
  onNext,
  milestones,
  setMilestones,
  backRef,
  stage,
  setStage,
}) {
  const MIN = 3;
  const [cur, setCur] = useState(0);
  const [questions, setQuestions] = useState([...MAIN_QUESTIONS]);
  const [showAlt, setShowAlt] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (!backRef) return;
    if (showAlt) {
      backRef.current = () => setShowAlt(false);
    } else if (stage === "review") {
      backRef.current = () => {
        setStage("question");
        setCur(questions.length - 1);
      };
    } else if (stage === "question" && cur > 0) {
      backRef.current = () => setCur((c) => c - 1);
    } else if (stage === "question" && cur === 0) {
      backRef.current = () => setStage("intro");
    } else {
      backRef.current = null;
    }
    return () => {
      backRef.current = null;
    };
  }, [backRef, stage, cur, showAlt, questions.length]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const m = milestones[cur] || { year: "", event: "" };
  const filled = milestones.filter((x) => x.year && x.event);
  const currentOk = m.year.trim() && m.event.trim();
  const canFinish = filled.length >= MIN;
  const isLast = cur === questions.length - 1;
  const yearSuggestions = getYearSuggestions(m.year);

  const currentExamples = ALL_EXAMPLES[questions[cur]] || [
    "자유롭게 입력해주세요",
  ];

  function upd(f, v) {
    setMilestones(
      milestones.map((item, i) => (i === cur ? { ...item, [f]: v } : item)),
    );
  }

  function updAt(id, f, v) {
    setMilestones(
      milestones.map((item) => (item.id === id ? { ...item, [f]: v } : item)),
    );
  }

  function deleteAt(id) {
    setMilestones(
      milestones.map((item) =>
        item.id === id ? { ...item, year: "", event: "" } : item,
      ),
    );
    setDeleteConfirmId(null);
    setEditingId(null);
  }

  function handleReorder(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filled.findIndex((f) => f.id === active.id);
    const newIndex = filled.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(filled, oldIndex, newIndex);
    const empty = milestones.filter((x) => !(x.year && x.event));
    setMilestones([...reordered, ...empty]);
  }

  function pickAlt(q) {
    const next = [...questions];
    next[cur] = q;
    setQuestions(next);
    setShowAlt(false);
  }

  function advance() {
    if (!isLast) {
      setCur((c) => c + 1);
      return;
    }
    if (canFinish) {
      setStage("review");
      return;
    }
    const more = ALT_QUESTIONS.find((q) => !questions.includes(q));
    if (more) {
      setQuestions((qs) => [...qs, more]);
      setCur((c) => c + 1);
      return;
    }
    setStage("review");
  }

  const altPool = [...MAIN_QUESTIONS, ...ALT_QUESTIONS].filter(
    (q) => !questions.includes(q),
  );

  let content;

  // ── Stage: intro ──
  if (stage === "intro") {
    content = (
      <div
        style={{
          position: "relative",
          margin: "-32px -24px 0",
          minHeight: "calc(100dvh - 130px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <img
          src="/simple/simplegallery.png"
          alt="인생 갤러리 예시"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(42,42,42,0.55) 0%, rgba(42,42,42,0.25) 35%, rgba(42,42,42,0.75) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 24px 32px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.3,
                letterSpacing: "-0.8px",
                margin: 0,
              }}
            >
              기억에 남는
              <br />
              순간들을 알려주세요
            </h2>
            <p
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#EEDDC4",
                letterSpacing: "-0.3px",
                lineHeight: 1.4,
                marginTop: 16,
              }}
            >
              지금 제일 생각나는 순간은 언제인가요?
            </p>
          </div>
          <button
            onClick={() => setStage("question")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "18px 28px",
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              background: "#fff",
              color: C.accent,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.3px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            }}
          >
            이제 시작하기
            <ArrowRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  } else if (stage === "review") {
    content = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <StepLabel>인생 이야기</StepLabel>
          <PageTitle>
            입력하신 이야기를
            <br />
            확인해주세요
          </PageTitle>
          <PageSub>
            내용을 고치거나 지울 수 있고, 손잡이(⠿)를 눌러 끌면 순서를 바꿀 수
            있어요
          </PageSub>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleReorder}
        >
          <SortableContext
            items={filled.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filled.map((item) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  isDeleting={deleteConfirmId === item.id}
                  onToggleEdit={() => {
                    setEditingId(editingId === item.id ? null : item.id);
                    setDeleteConfirmId(null);
                  }}
                  onToggleDelete={() => {
                    setDeleteConfirmId(
                      deleteConfirmId === item.id ? null : item.id,
                    );
                    setEditingId(null);
                  }}
                  onFieldChange={(f, v) => updAt(item.id, f, v)}
                  onSaveEdit={() => setEditingId(null)}
                  onConfirmDelete={() => deleteAt(item.id)}
                  onCancelDelete={() => setDeleteConfirmId(null)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <PrimaryBtn
          onClick={onNext}
          icon={<ArrowRight size={20} strokeWidth={2} />}
        >
          다음
        </PrimaryBtn>
      </div>
    );
  } else {
    // ── Stage: question ──
    content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {showAlt ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.textSecondary }}>
            다른 질문을 선택해 보세요
          </p>
          {altPool.map((q) => (
            <button
              key={q}
              onClick={() => pickAlt(q)}
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: C.raised,
                border: `1px solid ${C.divider}`,
                color: C.textPrimary,
                fontSize: 16,
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                lineHeight: 1.5,
              }}
            >
              {q}
            </button>
          ))}
          <SecondaryBtn onClick={() => setShowAlt(false)}>
            돌아가기
          </SecondaryBtn>
        </div>
      ) : (
        <>
          <div>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: C.textPrimary,
                letterSpacing: "-0.4px",
                lineHeight: 1.4,
                marginBottom: 14,
              }}
            >
              {questions[cur]}
            </p>
            <button
              onClick={() => setShowAlt(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                background: C.raised,
                border: `1px solid ${C.divider}`,
                color: C.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={13} strokeWidth={1.5} />
              다른 질문으로 바꾸기
            </button>
          </div>

          {/* Year */}
          <div>
            <input
              id={`year-${cur}`}
              inputMode="text"
              placeholder="예: 1975, 1980년 쯤, 1990년대 초반"
              value={m.year}
              onChange={(e) => upd("year", e.target.value)}
              className="w-full outline-none"
              style={{
                fontSize: 22,
                fontWeight: 600,
                padding: "14px 0",
                background: "transparent",
                color: C.textPrimary,
                border: "none",
                borderBottom: `2px solid ${C.divider}`,
                borderRadius: 0,
                width: "100%",
                display: "block",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = C.accent)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = C.divider)
              }
            />
            {yearSuggestions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                {yearSuggestions.map((s) => (
                  <Chip
                    key={s}
                    onClick={() => upd("year", s)}
                    active={m.year === s}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {/* Event — only after a year is entered */}
          {m.year.trim() && (
            <div>
              <div style={{ position: "relative" }}>
                <textarea
                  id={`event-${cur}`}
                  placeholder="간단하게 적어주세요 (오른쪽 마이크를 눌러 말씀하셔도 돼요)"
                  value={m.event}
                  onChange={(e) => upd("event", e.target.value)}
                  rows={3}
                  className="w-full resize-none outline-none"
                  style={{
                    fontSize: 18,
                    padding: "14px 56px 14px 0",
                    background: "transparent",
                    color: C.textPrimary,
                    border: "none",
                    borderBottom: `2px solid ${C.divider}`,
                    letterSpacing: "-0.2px",
                    lineHeight: 1.7,
                    width: "100%",
                    display: "block",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderBottomColor = C.accent)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderBottomColor = C.divider)
                  }
                />
                <VoiceBtn onResult={(t) => upd("event", t)} />
              </div>

              {/* Examples */}
              <div style={{ marginTop: 16 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: C.textMuted,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  생각이 안 나시면 이걸 골라보세요
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {currentExamples.map((ex) => (
                    <Chip
                      key={ex}
                      onClick={() => upd("event", ex)}
                      active={m.event === ex}
                    >
                      {ex}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {canFinish && !isLast ? (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <SecondaryBtn onClick={advance}>다음</SecondaryBtn>
                </div>
                <div style={{ flex: 1 }}>
                  <PrimaryBtn
                    onClick={() => setStage("review")}
                    icon={<ArrowRight size={20} strokeWidth={2} />}
                  >
                    완성하기 ({filled.length}개)
                  </PrimaryBtn>
                </div>
              </div>
            ) : (
              <PrimaryBtn
                onClick={advance}
                disabled={!currentOk && !canFinish}
                icon={<ArrowRight size={20} strokeWidth={2} />}
              >
                {canFinish && isLast ? "이야기 확인하러 가기" : "다음"}
              </PrimaryBtn>
            )}
          </div>
        </>
      )}
    </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Step 3 — AI Story (editable)
// ─────────────────────────────────────────────
const MAX_REGENERATIONS = 3;

function Step3({ onNext, info, milestones, story, setStory }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const filled = milestones.filter((m) => m.year && m.event);
  const aiStory = `${info.name || "어르신"}의 인생은 참으로 아름다운 여정이었습니다. ${
    filled[0] ? `${filled[0].year}, ${filled[0].event}의 순간을 시작으로` : ""
  } 수많은 기쁨과 도전이 함께했습니다. ${
    filled[1] ? `${filled[1].year}에는 ${filled[1].event}를 경험하며` : ""
  } 더욱 단단하고 깊은 사람으로 성장했습니다. ${
    filled[2] ? `${filled[2].year}, ${filled[2].event} —` : ""
  } 그 모든 순간들이 모여 지금의 빛나는 삶이 되었습니다. 이 앨범이 소중한 기억의 선물이 되기를 바랍니다.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <StepLabel>AI 글쓰기</StepLabel>
        <PageTitle>
          AI가 이야기를
          <br />
          써드려요
        </PageTitle>
        <PageSub>생성 후 직접 수정도 할 수 있어요</PageSub>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {filled.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.accent,
                  marginTop: 5,
                }}
              />
              {i < filled.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    background: C.divider,
                    marginTop: 4,
                  }}
                />
              )}
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
                {m.year}
              </span>
              <p style={{ fontSize: 14, color: C.textSecondary, marginTop: 2 }}>
                {m.event}
              </p>
            </div>
          </div>
        ))}
      </div>
      {!generated && !loading && (
        <PrimaryBtn
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setGenerated(true);
              setStory(aiStory);
            }, 2800);
          }}
          icon={<Sparkles size={18} strokeWidth={1.5} />}
        >
          AI 이야기 생성하기
        </PrimaryBtn>
      )}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: "32px 0",
          }}
        >
          <div style={{ animation: "spin 2s linear infinite" }}>
            <Sparkles size={40} color={C.accent} strokeWidth={1} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>
              이야기를 쓰고 있어요
            </p>
            <p style={{ fontSize: 15, color: C.textMuted, marginTop: 6 }}>
              잠시만 기다려주세요
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.accent,
                  animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      {generated && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${C.divider}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: C.raised,
                borderBottom: `1px solid ${C.divider}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={14} color={C.accent} strokeWidth={1.5} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.accent,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  생성된 생애문
                </span>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: editing ? C.accentSubtle : "transparent",
                  border: `1px solid ${editing ? C.accent : C.divider}`,
                  color: editing ? C.accent : C.textMuted,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Edit3 size={13} strokeWidth={2} />
                {editing ? "완료" : "수정하기"}
              </button>
            </div>
            <div style={{ padding: "20px 18px", background: C.surface }}>
              {editing ? (
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={8}
                  className="w-full resize-none outline-none"
                  style={{
                    fontSize: 16,
                    background: "transparent",
                    color: C.textPrimary,
                    border: "none",
                    lineHeight: 1.9,
                    letterSpacing: "-0.2px",
                    width: "100%",
                  }}
                />
              ) : (
                <p
                  style={{
                    fontSize: 16,
                    color: C.textPrimary,
                    lineHeight: 1.9,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {story}
                </p>
              )}
            </div>
          </div>
          {editing && (
            <SecondaryBtn
              onClick={() => {
                setStory(aiStory);
                setEditing(false);
              }}
              icon={<RotateCcw size={14} strokeWidth={2} />}
            >
              AI 원본으로 되돌리기
            </SecondaryBtn>
          )}
          <PrimaryBtn
            onClick={onNext}
            icon={<ArrowRight size={20} strokeWidth={2} />}
          >
            사진 넣기
          </PrimaryBtn>
          {!editing &&
            (regenCount < MAX_REGENERATIONS ? (
              <SecondaryBtn
                onClick={() => {
                  setRegenCount((c) => c + 1);
                  setGenerated(false);
                  setStory("");
                }}
                icon={<RotateCcw size={14} strokeWidth={2} />}
              >
                다시 생성하기 ({MAX_REGENERATIONS - regenCount}번 남음)
              </SecondaryBtn>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: C.textMuted,
                  textAlign: "center",
                }}
              >
                다시 생성하기를 모두 사용했어요. 대신 직접 수정해보세요.
              </p>
            ))}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 4 — Photos + Cover
// ─────────────────────────────────────────────
function Step4({ onNext, photos, setPhotos, coverIdx, setCoverIdx }) {
  const MIN = 5,
    MAX = 20;
  const fileRef = useRef(null);
  const valid = photos.length >= MIN;
  function handleFiles(files) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const r = new FileReader();
      r.onload = (e) => {
        const url = e.target?.result;
        setPhotos((prev) => (prev.length < MAX ? [...prev, url] : prev));
      };
      r.readAsDataURL(file);
    });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <StepLabel>사진 넣기</StepLabel>
        <PageTitle>
          소중한 사진을
          <br />
          넣어주세요
        </PageTitle>
        <PageSub>별표를 눌러 표지 사진을 선택하세요</PageSub>
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          width: "100%",
          minHeight: 148,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: C.accentSubtle,
          border: `1.5px dashed rgba(108,100,89,0.3)`,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(108,100,89,0.16)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.accentSubtle;
        }}
      >
        <Camera size={34} color={C.accent} strokeWidth={1.25} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary }}>
            사진 선택하기
          </p>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            갤러리에서 여러 장 선택 가능
          </p>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{ fontSize: 14, color: C.textSecondary, fontWeight: 600 }}
          >
            {photos.length}장 선택됨
          </span>
          <span style={{ fontSize: 14, color: valid ? C.accent : C.textMuted }}>
            {valid ? "준비 완료" : `${MIN - photos.length}장 더 필요`}
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: C.divider,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${C.accentMid}, ${C.accent})`,
              width: `${Math.min((photos.length / MIN) * 100, 100)}%`,
              transition: "width 0.4s",
            }}
          />
        </div>
      </div>
      {photos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: C.raised,
            }}
          >
            <Star size={14} color={C.accent} strokeWidth={2} fill={C.accent} />
            <span style={{ fontSize: 14, color: C.textSecondary }}>
              별표를 눌러{" "}
              <span style={{ color: C.accent, fontWeight: 600 }}>
                표지 사진
              </span>
              을 선택하세요
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {photos.map((src, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  borderRadius: 14,
                  overflow: "hidden",
                  aspectRatio: "1",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <button
                  onClick={() => setCoverIdx(i)}
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: i === coverIdx ? C.accent : "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    border:
                      i === coverIdx
                        ? "none"
                        : "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Star
                    size={14}
                    color="#fff"
                    strokeWidth={2}
                    fill={i === coverIdx ? "#fff" : "transparent"}
                  />
                </button>
                {i === coverIdx && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "6px 8px",
                      background:
                        "linear-gradient(to top, rgba(108,100,89,0.9), transparent)",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}
                    >
                      표지
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setPhotos(photos.filter((_, j) => j !== i));
                    if (coverIdx === i) setCoverIdx(0);
                    else if (coverIdx > i) setCoverIdx(coverIdx - 1);
                  }}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {photos.length < MAX && (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  borderRadius: 14,
                  aspectRatio: "1",
                  background: C.raised,
                  border: `1.5px dashed ${C.divider}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={22} color={C.textMuted} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </>
      )}
      <PrimaryBtn
        onClick={onNext}
        disabled={!valid}
        icon={<ArrowRight size={20} strokeWidth={2} />}
      >
        {valid
          ? `${photos.length}장으로 앨범 만들기`
          : `${MIN}장 이상 필요해요`}
      </PrimaryBtn>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 5 — Final Review + Customization
// ─────────────────────────────────────────────
function Step5({
  info,
  milestones,
  photos,
  coverIdx,
  story,
  subtitle,
  setSubtitle,
  onRestart,
}) {
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const filled = milestones.filter((m) => m.year && m.event);

  if (done) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          padding: "24px 0",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 48px rgba(108,100,89,0.35)",
          }}
        >
          <Check size={40} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ textAlign: "center" }}>
          <PageTitle>앨범이 완성되었어요</PageTitle>
          <PageSub>
            {info.name || "어르신"}님의 인생 앨범이
            <br />
            카카오톡으로 전달되었어요
          </PageSub>
        </div>
        {photos.length > 0 && (
          <div
            style={{
              width: "100%",
              borderRadius: 24,
              overflow: "hidden",
              background: C.raised,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.textPrimary,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {info.name}의 인생 이야기
            </p>
            {subtitle && (
              <p
                style={{
                  fontSize: 13,
                  color: C.textSecondary,
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
              }}
            >
              {[
                coverIdx,
                ...photos.map((_, i) => i).filter((i) => i !== coverIdx),
              ]
                .slice(0, 6)
                .map((i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      aspectRatio: "1",
                      outline:
                        i === coverIdx ? `3px solid ${C.accent}` : "none",
                    }}
                  >
                    <img
                      src={photos[i]}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
        <SecondaryBtn onClick={onRestart} icon={<RotateCcw size={14} strokeWidth={2} />}>
          처음으로 돌아가기
        </SecondaryBtn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <StepLabel>최종 확인</StepLabel>
        <PageTitle>앨범을 완성해요</PageTitle>
        <PageSub>내용을 확인하고 앨범을 꾸며주세요</PageSub>
      </div>

      {/* Basic info */}
      <div>
        <SectionHead>기본 정보</SectionHead>
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${C.divider}`,
          }}
        >
          {[
            { label: "이름", value: info.name || "미입력" },
            {
              label: "생년월일",
              value:
                info.birth.length === 8
                  ? `${info.birth.slice(0, 4)}.${info.birth.slice(4, 6)}.${info.birth.slice(6, 8)}`
                  : "미입력",
            },
            { label: "연락처", value: info.phone || "미입력" },
            { label: "사진", value: `${photos.length}장` },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: i % 2 === 0 ? C.raised : C.surface,
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
              }}
            >
              <span style={{ fontSize: 14, color: C.textMuted }}>
                {row.label}
              </span>
              <span
                style={{ fontSize: 15, color: C.textPrimary, fontWeight: 600 }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story preview */}
      {story && (
        <div>
          <SectionHead>생애문</SectionHead>
          <div
            style={{
              padding: "18px",
              borderRadius: 16,
              background: C.raised,
              borderLeft: `3px solid ${C.accent}`,
            }}
          >
            <p style={{ fontSize: 15, color: C.textPrimary, lineHeight: 1.8 }}>
              {story.length > 120 ? story.slice(0, 120) + "..." : story}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {filled.length > 0 && (
        <div>
          <SectionHead>인생 타임라인 · {filled.length}개</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filled.map((m, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 14, paddingBottom: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.accent,
                      marginTop: 4,
                    }}
                  />
                  {i < filled.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        flex: 1,
                        background: C.divider,
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
                <div>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: C.accent }}
                  >
                    {m.year}
                  </span>
                  <p
                    style={{
                      fontSize: 14,
                      color: C.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtitle */}
      <div>
        <SectionHead>
          나의 인생 문장{" "}
          <span style={{ fontWeight: 400, color: C.textMuted }}>(선택)</span>
        </SectionHead>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 0",
            borderBottom: `2px solid ${C.divider}`,
          }}
        >
          <Type size={16} color={C.textMuted} strokeWidth={1.5} />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="예: 가장 중요한 건 눈에 보이지 않는다."
            className="w-full outline-none"
            style={{
              fontSize: 17,
              fontWeight: 500,
              padding: "12px 0",
              background: "transparent",
              color: C.textPrimary,
              border: "none",
              width: "100%",
              letterSpacing: "-0.2px",
            }}
            onFocus={(e) => {
              const p = e.currentTarget.parentElement;
              if (p) p.style.borderBottomColor = C.accent;
            }}
            onBlur={(e) => {
              const p = e.currentTarget.parentElement;
              if (p) p.style.borderBottomColor = C.divider;
            }}
          />
        </div>
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}
        >
          {["현재를 즐겨라", "오늘도 감사한 하루"].map((ex) => (
            <Chip
              key={ex}
              onClick={() => setSubtitle(ex)}
              active={subtitle === ex}
            >
              {ex}
            </Chip>
          ))}
        </div>
      </div>

      {/* Cover strip */}
      {photos.length > 0 && (
        <div>
          <SectionHead>표지 사진</SectionHead>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                position: "relative",
                flexShrink: 0,
                width: 80,
                height: 80,
                borderRadius: 14,
                overflow: "hidden",
                outline: `2px solid ${C.accent}`,
              }}
            >
              <img
                src={photos[coverIdx]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: C.accent,
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                  표지
                </span>
              </div>
            </div>
            {photos
              .filter((_, i) => i !== coverIdx)
              .slice(0, 5)
              .map((src, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: 80,
                    height: 80,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            {photos.length > 6 && (
              <div
                style={{
                  flexShrink: 0,
                  width: 80,
                  height: 80,
                  borderRadius: 14,
                  background: C.raised,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ fontSize: 14, color: C.accent, fontWeight: 700 }}
                >
                  +{photos.length - 6}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {creating ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "20px 0",
          }}
        >
          <div style={{ animation: "spin 2s linear infinite" }}>
            <Sparkles size={36} color={C.accent} strokeWidth={1} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>
            앨범을 만들고 있어요
          </p>
        </div>
      ) : (
        <PrimaryBtn
          onClick={() => {
            setCreating(true);
            setTimeout(() => {
              setCreating(false);
              setDone(true);
            }, 3000);
          }}
          icon={<Sparkles size={18} strokeWidth={1.5} />}
        >
          앨범 생성하기
        </PrimaryBtn>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
export default function SimpleAlbumPage() {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ name: "", birth: "", phone: "" });
  const [milestones, setMilestones] = useState(
    Array.from({ length: 8 }, (_, i) => ({ id: i, year: "", event: "" })),
  );
  const [step2Stage, setStep2Stage] = useState("intro"); // "intro" | "question" | "review"
  const [photos, setPhotos] = useState([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [story, setStory] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const backRef = useRef(null);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function handleBack() {
    if (backRef.current) {
      backRef.current();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    prev();
  }
  function restart() {
    backRef.current = null;
    setInfo({ name: "", birth: "", phone: "" });
    setMilestones(
      Array.from({ length: 8 }, (_, i) => ({ id: i, year: "", event: "" })),
    );
    setStep2Stage("intro");
    setPhotos([]);
    setCoverIdx(0);
    setStory("");
    setSubtitle("");
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isLanding = step === 0;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.bg,
        fontFamily:
          "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isLanding && (
        <>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              height: 56,
              background: "rgba(244,244,244,0.92)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <button
              onClick={handleBack}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "none",
                background: step > 0 ? C.raised : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: step > 0 ? "pointer" : "default",
                opacity: step > 0 ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <ChevronLeft size={20} color={C.textSecondary} strokeWidth={2} />
            </button>
            <span
              style={{
                fontFamily: "'Futura', 'Futura PT', sans-serif",
                fontSize: 15,
                fontWeight: 300,
                color: C.textPrimary,
                letterSpacing: "-0.5px",
              }}
            >
              the
              <span style={{ fontSize: "1.25em", textTransform: "uppercase" }}>
                LIFE
              </span>
              memory
            </span>
            <div style={{ width: 36 }} />
          </header>

          <ProgressBar step={step} />
        </>
      )}

      <main
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 80px",
          overflow: "hidden",
        }}
      >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
        {step === 0 && <Step0 onNext={next} />}
        {step === 1 && (
          <Step1
            onNext={next}
            info={info}
            setInfo={setInfo}
            backRef={backRef}
          />
        )}
        {step === 2 && (
          <Step2
            onNext={next}
            milestones={milestones}
            setMilestones={setMilestones}
            backRef={backRef}
            stage={step2Stage}
            setStage={setStep2Stage}
          />
        )}
        {step === 3 && (
          <Step3
            onNext={next}
            info={info}
            milestones={milestones}
            story={story}
            setStory={setStory}
          />
        )}
        {step === 4 && (
          <Step4
            onNext={next}
            photos={photos}
            setPhotos={setPhotos}
            coverIdx={coverIdx}
            setCoverIdx={setCoverIdx}
          />
        )}
        {step === 5 && (
          <Step5
            info={info}
            milestones={milestones}
            photos={photos}
            coverIdx={coverIdx}
            story={story}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            onRestart={restart}
          />
        )}
        </motion.div>
      </AnimatePresence>
      </main>
    </div>
  );
}
