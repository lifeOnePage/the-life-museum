import { useState, useRef } from "react"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  BookOpen,
  User,
  MessageCircle,
  FileText,
  Gift,
  Phone,
  Calendar,
  Camera,
  Heart,
  Star,
  Leaf,
  Sun,
  Edit3,
  SkipForward,
  Trash2,
  Pencil,
  List,
  CheckSquare,
  Type,
} from "lucide-react"
import image1 from "@/imports/image-1.png"
import image2 from "@/imports/image-2.png"
import image4 from "@/imports/image-4.png"

// ─────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────
const C = {
  bg: "#0f0a05",
  surface: "#1a1208",
  raised: "#221810",
  divider: "#2e2018",
  accent: "#C4956A",
  accentSubtle: "rgba(196,149,106,0.10)",
  accentMid: "#8B6B47",
  textPrimary: "#f2e8d8",
  textSecondary: "#9a7f65",
  textMuted: "#5a4530",
  gold: "#e8c49a",
  success: "#6B9B6B",
  danger: "#8B4040",
}

const TOTAL_STEPS = 6
type Milestone = { year: string event: string }
type UserInfo = { name: string birth: string phone: string }

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function PrimaryBtn({
  onClick,
  disabled = false,
  children,
  icon,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
}) {
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
          ? C.raised
          : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
        color: disabled ? C.textMuted : "#fff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: "-0.3px",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(196,149,106,0.25)",
      }}
    >
      {children}
      {icon && !disabled && icon}
    </button>
  )
}

function SecondaryBtn({
  onClick,
  children,
  icon,
}: {
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}) {
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
  )
}

function Chip({
  onClick,
  children,
  active,
}: {
  onClick: () => void
  children: React.ReactNode
  active?: boolean
}) {
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
  )
}

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string label: string icon: React.ReactNode }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        background: C.raised,
        borderRadius: 14,
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 8px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            background: active === t.id ? C.surface : "transparent",
            color: active === t.id ? C.textPrimary : C.textMuted,
            border: `1px solid ${active === t.id ? C.divider : "transparent"}`,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}

function StepLabel({ children }: { children: React.ReactNode }) {
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
  )
}
function PageTitle({ children }: { children: React.ReactNode }) {
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
  )
}
function PageSub({ children }: { children: React.ReactNode }) {
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
  )
}
function SectionHead({ children }: { children: React.ReactNode }) {
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
  )
}

function ProgressBar({ step }: { step: number }) {
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
  )
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
}: {
  id?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  placeholder: string
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  large?: boolean
}) {
  const [focused, setFocused] = useState(false)
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
  )
}

// ─────────────────────────────────────────────
// Step 0 — Landing
// ─────────────────────────────────────────────
function Step0({ onNext }: { onNext: () => void }) {
  const pages = [image4, image1, image2]
  const [page, setPage] = useState(0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            background: C.accentSubtle,
            border: `1px solid rgba(196,149,106,0.2)`,
            marginBottom: 20,
          }}
        >
          <Sparkles size={13} color={C.accent} strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>
            AI 생애 앨범 서비스
          </span>
        </div>
        <PageTitle>
          당신의 앨범을
          <br />
          만들어 보세요
        </PageTitle>
        <PageSub>
          6가지 간단한 단계만으로
          <br />
          평생 간직할 앨범이 완성됩니다
        </PageSub>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          background: "#f0e8d8",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <img
          src={pages[page]}
          alt="예시 앨범"
          style={{
            width: "100%",
            height: 280,
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "4px 10px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            예시 앨범
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            padding: 14,
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                d: page === 0,
                fn: () => setPage((p) => Math.max(0, p - 1)),
                icon: <ChevronLeft size={18} strokeWidth={2} />,
              },
              null,
              {
                d: page === pages.length - 1,
                fn: () => setPage((p) => Math.min(pages.length - 1, p + 1)),
                icon: <ChevronRight size={18} strokeWidth={2} />,
              },
            ].map((btn, i) =>
              btn === null ? (
                <div key={i} style={{ display: "flex", gap: 6 }}>
                  {pages.map((_, j) => (
                    <button
                      key={j}
                      onClick={() => setPage(j)}
                      style={{
                        width: j === page ? 20 : 6,
                        height: 6,
                        borderRadius: 999,
                        background:
                          j === page ? "#fff" : "rgba(255,255,255,0.35)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <button
                  key={i}
                  onClick={btn.fn}
                  disabled={btn.d}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: btn.d ? "not-allowed" : "pointer",
                    opacity: btn.d ? 0.3 : 1,
                  }}
                >
                  {btn.icon}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[
          {
            icon: <Heart size={20} color={C.accent} strokeWidth={1.5} />,
            title: "소중한 기억을 영원히",
            desc: "흩어진 기억들이 하나의 아름다운 앨범이 됩니다",
          },
          {
            icon: <Sparkles size={20} color={C.accent} strokeWidth={1.5} />,
            title: "AI가 글을 대신 써드려요",
            desc: "말씀해주신 순간들로 생애문을 자동으로 완성해드려요",
          },
          {
            icon: <Gift size={20} color={C.accent} strokeWidth={1.5} />,
            title: "가족에게 특별한 선물",
            desc: "자녀와 손자녀에게 세상 하나뿐인 선물이 됩니다",
          },
        ].map((b, i, arr) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              padding: "18px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: C.accentSubtle,
                border: `1px solid rgba(196,149,106,0.15)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {b.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.3px",
                  marginBottom: 4,
                }}
              >
                {b.title}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: C.textSecondary,
                  lineHeight: 1.5,
                }}
              >
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px",
          borderRadius: 14,
          background: C.raised,
        }}
      >
        <span style={{ fontSize: 13, color: C.textMuted }}>완성까지 약</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>
          10분
        </span>
        <span style={{ fontSize: 13, color: C.textMuted }}>소요됩니다</span>
      </div>
      <PrimaryBtn
        onClick={onNext}
        icon={<ArrowRight size={20} strokeWidth={2} />}
      >
        지금 시작하기
      </PrimaryBtn>
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 1 — Registration
// ─────────────────────────────────────────────
const REG_FIELDS = [
  {
    key: "name" as const,
    icon: <User size={18} strokeWidth={1.5} />,
    question: "성함이 어떻게 되세요?",
    hint: "앨범 표지에 이름이 들어가요",
    placeholder: "예: 홍길동",
  },
  {
    key: "birth" as const,
    icon: <Calendar size={18} strokeWidth={1.5} />,
    question: "생년월일을 알려주세요",
    hint: "숫자 8자리로 입력해주세요",
    placeholder: "예: 19501015",
    inputMode: "numeric" as const,
  },
  {
    key: "phone" as const,
    icon: <Phone size={18} strokeWidth={1.5} />,
    question: "핸드폰 번호를 알려주세요",
    hint: "완성된 앨범을 보내드릴게요",
    placeholder: "010-0000-0000",
    inputMode: "numeric" as const,
  },
]

function Step1({
  onNext,
  info,
  setInfo,
}: {
  onNext: () => void
  info: UserInfo
  setInfo: (u: UserInfo) => void
}) {
  const [idx, setIdx] = useState(0)
  const done = idx === REG_FIELDS.length
  const field = done ? null : REG_FIELDS[idx]
  const fieldLabel = (k: keyof UserInfo) =>
    k === "name" ? "이름" : k === "birth" ? "생년월일" : "연락처"

  function handleChange(v: string) {
    if (!field) return
    if (field.key === "birth") {
      setInfo({ ...info, birth: v.replace(/\D/g, "").slice(0, 8) })
      return
    }
    if (field.key === "phone") {
      const d = v.replace(/\D/g, "").slice(0, 11)
      const f =
        d.length > 7
          ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
          : d.length > 3
            ? `${d.slice(0, 3)}-${d.slice(3)}`
            : d
      setInfo({ ...info, phone: f })
      return
    }
    setInfo({ ...info, [field.key]: v })
  }

  function valid() {
    if (!field) return true
    if (field.key === "name") return info.name.trim().length > 0
    if (field.key === "birth") return info.birth.length === 8
    if (field.key === "phone") return info.phone.replace(/\D/g, "").length >= 10
    return false
  }

  const birthDisplay =
    info.birth.length === 8
      ? `${info.birth.slice(0, 4)}년 ${info.birth.slice(4, 6)}월 ${info.birth.slice(6, 8)}일`
      : ""

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
              boxShadow: "0 12px 36px rgba(196,149,106,0.3)",
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
    )
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
              background: i < idx ? C.accent : i === idx ? C.gold : C.divider,
              width: i === idx ? 24 : 8,
            }}
          />
        ))}
        <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 6 }}>
          {idx + 1} / {REG_FIELDS.length}
        </span>
      </div>
      {idx > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {REG_FIELDS.slice(0, idx).map((f) => (
            <button
              key={f.key}
              onClick={() => setIdx(REG_FIELDS.indexOf(f))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                background: C.raised,
                border: "none",
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
            inputMode={(field as any).inputMode}
            placeholder={field.placeholder}
            value={info[field.key]}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid()) setIdx((i) => i + 1)
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
  )
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
]

const QUESTION_EXAMPLES: string[][] = [
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
]

const ALT_QUESTIONS = [
  "첫 직장을 다니던 때가 기억나세요?",
  "가장 멀리 여행을 갔던 때는 언제였나요?",
  "처음으로 큰 결정을 내렸던 순간은요?",
  "어린 시절 가장 좋아했던 놀이나 장소가 있나요?",
  "자녀나 손자녀와의 특별한 순간이 있나요?",
  "가장 자랑스러웠던 성취가 있다면?",
  "고마운 사람이 생각나는 순간이 있나요?",
  "가장 맛있게 먹었던 기억이 있나요?",
]

const ALT_EXAMPLES: Record<string, string[]> = {
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
}

function getYearSuggestions(text: string): string[] {
  const digits = text.replace(/\D/g, "")
  if (digits.length === 3) {
    const d = digits + "0"
    return [`${d}년대 초반`, `${d}년대 중반`, `${d}년대 말`]
  }
  if (digits.length === 4) {
    const y = parseInt(digits)
    const dec = Math.floor(y / 10) * 10
    if (y % 10 === 0)
      return [
        `${y}년`,
        `${y}년 쯤`,
        `${dec}년대 초반`,
        `${dec}년대 중반`,
        `${dec}년대 말`,
      ]
    return [`${y}년`, `${y}년 쯤`]
  }
  return []
}

function VoiceBtn({ onResult }: { onResult: (t: string) => void }) {
  const [on, setOn] = useState(false)
  const ref = useRef<any>(null)
  const SR =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null
  function toggle() {
    if (on) {
      ref.current?.stop()
      setOn(false)
      return
    }
    const r = new SR()
    r.lang = "ko-KR"
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e: any) => {
      onResult(e.results[0][0].transcript)
      setOn(false)
    }
    r.onerror = () => setOn(false)
    r.onend = () => setOn(false)
    r.start()
    ref.current = r
    setOn(true)
  }
  return (
    <button
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        background: on ? "rgba(180,60,60,0.12)" : C.accentSubtle,
        color: on ? "#e07070" : C.accent,
        border: `1px solid ${
          on ? "rgba(180,60,60,0.25)" : "rgba(196,149,106,0.2)"
        }`,
        cursor: "pointer",
      }}
    >
      {on ? (
        <Square size={12} strokeWidth={2} fill="#e07070" />
      ) : (
        <Mic size={14} strokeWidth={1.5} />
      )}
      {on ? "중지" : "음성 입력"}
    </button>
  )
}

function Step2({
  onNext,
  milestones,
  setMilestones,
}: {
  onNext: () => void
  milestones: Milestone[]
  setMilestones: (m: Milestone[]) => void
}) {
  const MIN = 3
  const [cur, setCur] = useState(0)
  const [questions, setQuestions] = useState([...MAIN_QUESTIONS])
  const [tab, setTab] = useState<"answer" | "manage">("answer")
  const [showAlt, setShowAlt] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const m = milestones[cur] || { year: "", event: "" }
  const filled = milestones.filter((x) => x.year && x.event)
  const currentOk = m.year.trim() && m.event.trim()
  const canFinish = filled.length >= MIN
  const isLast = cur === questions.length - 1
  const yearSuggestions = getYearSuggestions(m.year)

  const currentExamples =
    cur < QUESTION_EXAMPLES.length
      ? QUESTION_EXAMPLES[cur]
      : ALT_EXAMPLES[questions[cur]] || ["자유롭게 입력해주세요"]

  function upd(f: keyof Milestone, v: string) {
    setMilestones(
      milestones.map((item, i) => (i === cur ? { ...item, [f]: v } : item)),
    )
  }

  function updAt(idx: number, f: keyof Milestone, v: string) {
    setMilestones(
      milestones.map((item, i) => (i === idx ? { ...item, [f]: v } : item)),
    )
  }

  function deleteAt(idx: number) {
    const next = milestones.map((item, i) =>
      i === idx ? { year: "", event: "" } : item,
    )
    setMilestones(next)
    setDeleteConfirm(null)
    setEditingIdx(null)
  }

  function pickAlt(q: string) {
    const next = [...questions]
    next[cur] = q
    setQuestions(next)
    setShowAlt(false)
  }

  const altPool = ALT_QUESTIONS.filter((q) => !questions.includes(q)).slice(
    0,
    3,
  )

  const manageTabs = [
    {
      id: "answer",
      label: "질문 답하기",
      icon: <MessageCircle size={14} strokeWidth={1.5} />,
    },
    {
      id: "manage",
      label: "타임라인 수정",
      icon: <List size={14} strokeWidth={1.5} />,
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <StepLabel>인생 이야기</StepLabel>
        <PageTitle>
          기억에 남는
          <br />
          순간들을 알려주세요
        </PageTitle>
        <PageSub>최소 {MIN}개 이상, 건너뛰기도 가능해요</PageSub>
      </div>

      <TabBar
        tabs={manageTabs}
        active={tab}
        onChange={(id) => {
          setTab(id as any)
          setShowAlt(false)
          setEditingIdx(null)
          setDeleteConfirm(null)
        }}
      />

      {/* ── Manage Tab ── */}
      {tab === "manage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {milestones.every((m) => !m.year && !m.event) ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 16, color: C.textMuted }}>
                아직 입력된 순간이 없어요
              </p>
              <button
                onClick={() => setTab("answer")}
                style={{
                  marginTop: 12,
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: C.accentSubtle,
                  border: `1px solid rgba(196,149,106,0.2)`,
                  color: C.accent,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                질문 답하러 가기
              </button>
            </div>
          ) : (
            milestones.map((item, i) => {
              if (!item.year && !item.event) return null
              const isEditing = editingIdx === i
              const isDeleting = deleteConfirm === i
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${isEditing ? C.accent : C.divider}`,
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 16px",
                      background: C.raised,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: C.accent,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.accent,
                        }}
                      >
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
                      onClick={() => {
                        setEditingIdx(isEditing ? null : i)
                        setDeleteConfirm(null)
                      }}
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
                      onClick={() => {
                        setDeleteConfirm(isDeleting ? null : i)
                        setEditingIdx(null)
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isDeleting
                          ? "rgba(139,64,64,0.15)"
                          : "transparent",
                        border: `1px solid ${
                          isDeleting ? C.danger : C.divider
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2
                        size={14}
                        color={isDeleting ? "#c07070" : C.textMuted}
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
                          onChange={(e) => updAt(i, "year", e.target.value)}
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
                          onChange={(e) => updAt(i, "event", e.target.value)}
                          rows={2}
                          className="w-full outline-none resize-none"
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
                        onClick={() => setEditingIdx(null)}
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
                      <span style={{ flex: 1, fontSize: 14, color: "#c07070" }}>
                        이 순간을 삭제할까요?
                      </span>
                      <button
                        onClick={() => deleteAt(i)}
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
                        onClick={() => setDeleteConfirm(null)}
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
              )
            })
          )}
          {canFinish && (
            <PrimaryBtn
              onClick={onNext}
              icon={<ArrowRight size={20} strokeWidth={2} />}
            >
              이야기 완성하기 ({filled.length}개)
            </PrimaryBtn>
          )}
        </div>
      )}

      {/* ── Answer Tab ── */}
      {tab === "answer" && (
        <>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCur(i)
                  setShowAlt(false)
                }}
                style={{
                  height: 4,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  background:
                    milestones[i]?.year && milestones[i]?.event
                      ? C.accent
                      : i === cur
                        ? C.gold
                        : C.divider,
                  width: i === cur ? 24 : 8,
                }}
              />
            ))}
            <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 6 }}>
              {cur + 1} / {questions.length}
            </span>
          </div>

          {showAlt ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.textSecondary,
                }}
              >
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 24,
                  }}
                >
                  <p
                    style={{
                      fontSize: 21,
                      fontWeight: 700,
                      color: C.textPrimary,
                      letterSpacing: "-0.4px",
                      lineHeight: 1.4,
                      flex: 1,
                      marginRight: 10,
                    }}
                  >
                    {questions[cur]}
                  </p>
                  <button
                    onClick={() => setShowAlt(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 12px",
                      borderRadius: 10,
                      background: C.raised,
                      border: `1px solid ${C.divider}`,
                      color: C.textMuted,
                      fontSize: 12,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={12} strokeWidth={1.5} />
                    다른 질문
                  </button>
                </div>

                {/* Year */}
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.textMuted,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    언제쯤이었나요?
                  </span>
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
                      marginTop: 8,
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

                {/* Event */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.textMuted,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      어떤 일이 있었나요?
                    </span>
                    <VoiceBtn onResult={(t) => upd("event", t)} />
                  </div>
                  <textarea
                    id={`event-${cur}`}
                    placeholder="간단하게 적어주세요"
                    value={m.event}
                    onChange={(e) => upd("event", e.target.value)}
                    rows={3}
                    className="w-full outline-none resize-none"
                    style={{
                      fontSize: 18,
                      padding: "14px 0",
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
                      예시 — 탭하면 바로 입력돼요
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
              </div>

              {/* Filled summary */}
              {filled.length > 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: C.textMuted,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    입력된 순간 · {filled.length}개
                  </span>
                  {milestones.map((item, i) =>
                    item.year && item.event ? (
                      <button
                        key={i}
                        onClick={() => setCur(i)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: C.raised,
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <Check size={13} color={C.success} strokeWidth={2.5} />
                        <span
                          style={{
                            fontSize: 13,
                            color: C.accent,
                            fontWeight: 700,
                          }}
                        >
                          {item.year}
                        </span>
                        <span style={{ fontSize: 13, color: C.textSecondary }}>
                          · {item.event}
                        </span>
                      </button>
                    ) : null,
                  )}
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  {cur > 0 && (
                    <SecondaryBtn
                      onClick={() => setCur((c) => c - 1)}
                      icon={<ChevronLeft size={16} strokeWidth={2} />}
                    >
                      이전
                    </SecondaryBtn>
                  )}
                  {canFinish && isLast ? (
                    <PrimaryBtn
                      onClick={onNext}
                      icon={<ArrowRight size={20} strokeWidth={2} />}
                    >
                      이야기 완성하기
                    </PrimaryBtn>
                  ) : (
                    <PrimaryBtn
                      onClick={() => {
                        if (!isLast) setCur((c) => c + 1)
                        else onNext()
                      }}
                      disabled={!currentOk && !canFinish}
                      icon={<ArrowRight size={20} strokeWidth={2} />}
                    >
                      {!currentOk && cur < MIN - 1
                        ? `다음 (필수 ${MIN - filled.length}개 남음)`
                        : "다음 질문"}
                    </PrimaryBtn>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {canFinish && !isLast && (
                    <SecondaryBtn
                      onClick={onNext}
                      icon={<Check size={15} strokeWidth={2.5} />}
                    >
                      여기서 완성하기 ({filled.length}개)
                    </SecondaryBtn>
                  )}
                  <SecondaryBtn
                    onClick={() => {
                      if (!isLast) setCur((c) => c + 1)
                      else onNext()
                    }}
                    icon={<SkipForward size={15} strokeWidth={2} />}
                  >
                    이 질문 건너뛰기
                  </SecondaryBtn>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 3 — AI Story (editable)
// ─────────────────────────────────────────────
function Step3({
  onNext,
  info,
  milestones,
  story,
  setStory,
}: {
  onNext: () => void
  info: UserInfo
  milestones: Milestone[]
  story: string
  setStory: (s: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [editing, setEditing] = useState(false)
  const filled = milestones.filter((m) => m.year && m.event)
  const aiStory = `${info.name || "어르신"}의 인생은 참으로 아름다운 여정이었습니다. ${
    filled[0] ? `${filled[0].year}, ${filled[0].event}의 순간을 시작으로` : ""
  } 수많은 기쁨과 도전이 함께했습니다. ${
    filled[1] ? `${filled[1].year}에는 ${filled[1].event}를 경험하며` : ""
  } 더욱 단단하고 깊은 사람으로 성장했습니다. ${
    filled[2] ? `${filled[2].year}, ${filled[2].event} —` : ""
  } 그 모든 순간들이 모여 지금의 빛나는 삶이 되었습니다. 이 앨범이 소중한 기억의 선물이 되기를 바랍니다.`

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
            setLoading(true)
            setTimeout(() => {
              setLoading(false)
              setGenerated(true)
              setStory(aiStory)
            }, 2800)
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
                  className="w-full outline-none resize-none"
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
                setStory(aiStory)
                setEditing(false)
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
          {!editing && (
            <SecondaryBtn
              onClick={() => {
                setGenerated(false)
                setStory("")
              }}
              icon={<RotateCcw size={14} strokeWidth={2} />}
            >
              다시 생성하기
            </SecondaryBtn>
          )}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 4 — Photos + Cover
// ─────────────────────────────────────────────
function Step4({
  onNext,
  photos,
  setPhotos,
  coverIdx,
  setCoverIdx,
}: {
  onNext: () => void
  photos: string[]
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>
  coverIdx: number
  setCoverIdx: (i: number) => void
}) {
  const MIN = 5,
    MAX = 20
  const fileRef = useRef<HTMLInputElement>(null)
  const valid = photos.length >= MIN
  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => {
      const r = new FileReader()
      r.onload = (e) => {
        const url = e.target?.result as string
        setPhotos((prev: string[]) =>
          prev.length < MAX ? [...prev, url] : prev,
        )
      }
      r.readAsDataURL(file)
    })
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
          border: `1.5px dashed rgba(196,149,106,0.3)`,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(196,149,106,0.16)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.accentSubtle
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
                        "linear-gradient(to top, rgba(196,149,106,0.9), transparent)",
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
                    setPhotos(photos.filter((_, j) => j !== i))
                    if (coverIdx === i) setCoverIdx(0)
                    else if (coverIdx > i) setCoverIdx(coverIdx - 1)
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
  )
}

// ─────────────────────────────────────────────
// Step 5 — Final Review + Customization
// ─────────────────────────────────────────────
const THEMES = [
  { id: "cream", label: "따뜻한 크림", bg: "#f5e8d0", dot: "#8B6B47" },
  { id: "vintage", label: "빈티지", bg: "#e0d0b8", dot: "#6B4F35" },
  { id: "minimal", label: "미니멀", bg: "#f5f4f0", dot: "#444" },
  { id: "spring", label: "봄날", bg: "#fce8ec", dot: "#c87090" },
  { id: "forest", label: "포레스트", bg: "#dce8dc", dot: "#4a7060" },
]

const STICKERS = [
  { id: "heart", icon: <Heart size={18} strokeWidth={1.5} />, label: "하트" },
  { id: "star", icon: <Star size={18} strokeWidth={1.5} />, label: "별" },
  {
    id: "sparkle",
    icon: <Sparkles size={18} strokeWidth={1.5} />,
    label: "반짝임",
  },
  { id: "leaf", icon: <Leaf size={18} strokeWidth={1.5} />, label: "잎새" },
  { id: "sun", icon: <Sun size={18} strokeWidth={1.5} />, label: "햇살" },
  { id: "camera", icon: <Camera size={18} strokeWidth={1.5} />, label: "추억" },
]

function Step5({
  info,
  milestones,
  photos,
  coverIdx,
  story,
  subtitle,
  setSubtitle,
  selectedTheme,
  setSelectedTheme,
  selectedStickers,
  setSelectedStickers,
}: {
  info: UserInfo
  milestones: Milestone[]
  photos: string[]
  coverIdx: number
  story: string
  subtitle: string
  setSubtitle: (s: string) => void
  selectedTheme: string
  setSelectedTheme: (t: string) => void
  selectedStickers: string[]
  setSelectedStickers: (s: string[]) => void
}) {
  const [creating, setCreating] = useState(false)
  const [done, setDone] = useState(false)
  const filled = milestones.filter((m) => m.year && m.event)

  function toggleSticker(id: string) {
    setSelectedStickers(
      selectedStickers.includes(id)
        ? selectedStickers.filter((s) => s !== id)
        : [...selectedStickers, id],
    )
  }

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
            boxShadow: "0 16px 48px rgba(196,149,106,0.35)",
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
              background:
                THEMES.find((t) => t.id === selectedTheme)?.bg || "#f0e8d8",
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#5a4030",
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
                  color: "#8a7060",
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
                        i === coverIdx
                          ? `3px solid ${THEMES.find((t) => t.id === selectedTheme)?.dot || C.accent}`
                          : "none",
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
        <SecondaryBtn
          onClick={() => {
            setDone(false)
            setCreating(false)
          }}
          icon={<RotateCcw size={14} strokeWidth={2} />}
        >
          처음으로 돌아가기
        </SecondaryBtn>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <StepLabel>최종 확인 및 꾸미기</StepLabel>
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
          부제목{" "}
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
            placeholder="예: 나의 소중한 추억들, 우리 가족 이야기"
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
              const p = e.currentTarget.parentElement
              if (p) p.style.borderBottomColor = C.accent
            }}
            onBlur={(e) => {
              const p = e.currentTarget.parentElement
              if (p) p.style.borderBottomColor = C.divider
            }}
          />
        </div>
      </div>

      {/* Theme */}
      <div>
        <SectionHead>앨범 테마</SectionHead>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderRadius: 16,
                background: t.bg,
                border: `2px solid ${
                  selectedTheme === t.id ? t.dot : "transparent"
                }`,
                cursor: "pointer",
                minWidth: 70,
                transition: "border-color 0.2s",
                outline: "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: t.dot,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: selectedTheme === t.id ? 700 : 500,
                  color: t.dot,
                  letterSpacing: "-0.2px",
                }}
              >
                {t.label}
              </span>
              {selectedTheme === t.id && (
                <Check size={12} color={t.dot} strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stickers */}
      <div>
        <SectionHead>
          스티커{" "}
          <span style={{ fontWeight: 400, color: C.textMuted }}>
            (여러 개 선택 가능)
          </span>
        </SectionHead>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {STICKERS.map((s) => {
            const active = selectedStickers.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSticker(s.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 8px",
                  borderRadius: 16,
                  background: active ? C.accentSubtle : C.raised,
                  border: `1.5px solid ${active ? C.accent : C.divider}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ color: active ? C.accent : C.textMuted }}>
                  {s.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? C.accent : C.textSecondary,
                  }}
                >
                  {s.label}
                </span>
                {active && (
                  <Check size={12} color={C.accent} strokeWidth={2.5} />
                )}
              </button>
            )
          })}
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
            setCreating(true)
            setTimeout(() => {
              setCreating(false)
              setDone(true)
            }, 3000)
          }}
          icon={<Sparkles size={18} strokeWidth={1.5} />}
        >
          앨범 생성하기
        </PrimaryBtn>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0)
  const [info, setInfo] = useState<UserInfo>({ name: "", birth: "", phone: "" })
  const [milestones, setMilestones] = useState<Milestone[]>(
    Array.from({ length: 8 }, () => ({ year: "", event: "" })),
  )
  const [photos, setPhotos] = useState<string[]>([])
  const [coverIdx, setCoverIdx] = useState(0)
  const [story, setStory] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("cream")
  const [selectedStickers, setSelectedStickers] = useState<string[]>([])

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
          background: "rgba(15,10,5,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
        <button
          onClick={prev}
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
            fontSize: 17,
            fontWeight: 800,
            color: C.textPrimary,
            letterSpacing: "-0.5px",
          }}
        >
          the<span style={{ color: C.accent }}>LIFE</span>memory
        </span>
        <div style={{ width: 36 }} />
      </header>

      <ProgressBar step={step} />

      <main
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {step === 0 && <Step0 onNext={next} />}
        {step === 1 && <Step1 onNext={next} info={info} setInfo={setInfo} />}
        {step === 2 && (
          <Step2
            onNext={next}
            milestones={milestones}
            setMilestones={setMilestones}
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
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            selectedStickers={selectedStickers}
            setSelectedStickers={setSelectedStickers}
          />
        )}
      </main>
    </div>
  )
}
