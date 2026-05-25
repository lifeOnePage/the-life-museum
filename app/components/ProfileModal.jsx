"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { requestCreditPurchase } from "@/app/utils/payment";

const CREDIT_PACKAGES = [
  {
    key: "free",
    credits: 0,
    priceKRW: 0,
    priceUSD: 0,
    labelKo: "Free",
    labelEn: "Free",
    descKo: "30일 체험",
    descEn: "30-day trial",
    badge: null,
  },
  {
    key: "credit_1000",
    credits: 1000,
    priceKRW: 10000,
    priceUSD: 999,
    labelKo: "1,000C",
    labelEn: "1,000C",
    descKo: "기본",
    descEn: "Basic",
    badge: null,
  },
  {
    key: "credit_3900",
    credits: 3900,
    priceKRW: 29000,
    priceUSD: 2499,
    labelKo: "3,900C",
    labelEn: "3,900C",
    descKo: "25% OFF",
    descEn: "25% OFF",
    badge: "25%",
  },
  {
    key: "credit_9900",
    credits: 9900,
    priceKRW: 59000,
    priceUSD: 4999,
    labelKo: "9,900C",
    labelEn: "9,900C",
    descKo: "40% OFF",
    descEn: "40% OFF",
    badge: "40%",
  },
];

const T = {
  ko: {
    profile: "프로필",
    name: "이름",
    phone: "전화번호",
    email: "Email",
    exit: "닫기",
    edit: "편집",
    cancel: "취소",
    save: "저장",
    saving: "저장 중...",
    planTitle: "크레딧 충전",
    myCredits: "내 크레딧",
    buyCredits: "구매하기",
    purchasing: "결제 진행 중...",
    domestic: "간편결제 및 카드",
    international: "페이팔",
    domesticDesc: "카드 · 카카오페이 · 네이버페이 · 토스페이",
    internationalDesc: "PayPal",
    paymentError: "결제 요청 중 오류가 발생했습니다.",
    paymentSuccess: "크레딧이 충전되었습니다!",
    usageTitle: "크레딧 정책",
    usageAlbum: "새 앨범 생성",
    usageAlbumCost: "900C / 회",
    usageEmoji: "일반 이모지",
    usageEmojiCost: "100C / 개",
    usageLimitedEmoji: "한정판 이모지",
    usageLimitedEmojiCost: "200C / 개",
    selectPackage: "패키지를 선택하세요",
    free: "무료",
    paymentErrorMsg: "결제 요청 중 오류가 발생했습니다.",
  },
  en: {
    profile: "Profile",
    name: "Name",
    phone: "Phone",
    email: "Email",
    exit: "close",
    edit: "edit",
    cancel: "cancel",
    save: "save",
    saving: "saving...",
    planTitle: "Buy Credits",
    myCredits: "My Credits",
    buyCredits: "Purchase",
    purchasing: "Processing payment...",
    domestic: "Easy Pay & Card",
    international: "PayPal",
    domesticDesc: "Card · Kakao Pay · Naver Pay · Toss Pay",
    internationalDesc: "PayPal",
    paymentError: "An error occurred while requesting payment.",
    paymentSuccess: "Credits have been added!",
    usageTitle: "Usage",
    usageAlbum: "New Album",
    usageAlbumCost: "900C / each",
    usageEmoji: "Emoji",
    usageEmojiCost: "100C / each",
    usageLimitedEmoji: "Limited Emoji",
    usageLimitedEmojiCost: "200C / each",
    selectPackage: "Select a package",
    free: "Free",
    paymentErrorMsg: "An error occurred while requesting payment.",
  },
};

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

function getStoredLocale() {
  if (typeof window === "undefined") return "ko";
  return localStorage.getItem("NEXT_LOCALE") || "ko";
}

function setLocaleCookie(locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem("NEXT_LOCALE", locale);
}

function formatPrice(price, locale) {
  if (price === 0) return locale === "ko" ? "₩0" : "$0";
  if (locale === "ko") return `₩${price.toLocaleString()}`;
  return `$${(price / 100).toFixed(2)}`;
}

export default function ProfileModal({ onClose }) {
  const [currentLocale, setCurrentLocale] = useState("ko");
  const [currency, setCurrency] = useState("KRW");

  const t = T[currentLocale] || T.ko;

  const TABS = [
    { key: "profile", label: t.profile },
    { key: "plan", label: "Plan" },
  ];

  const FIELDS = [
    { key: "name", label: t.name },
    { key: "phone", label: t.phone },
    { key: "email", label: t.email },
  ];

  const router = useRouter();
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("credit_1000");

  useEffect(() => {
    const locale = getStoredLocale();
    setCurrentLocale(locale);
    setCurrency(locale === "en" ? "USD" : "KRW");
  }, []);

  const handleLocaleChange = (locale) => {
    setLocaleCookie(locale);
    setCurrentLocale(locale);
    router.push(`/${locale}`);
  };

  const isEdit = mode === "edit";

  const handleEdit = () => {
    setDraft({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    });
    setMode("edit");
  };

  const handleCancel = () => setMode("view");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authedFetch(`${BASE_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name || null,
          phone: draft.phone || null,
          email: draft.email || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        const merged = { ...user, ...updated };
        setUser(merged);
        localStorage.setItem("app_user", JSON.stringify(merged));
        setMode("view");
      } else {
        console.error("Failed to update profile:", res.status);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePurchase = async (method) => {
    if (selectedPackage === "free") return;
    setPurchasing(true);
    setPaymentError("");
    try {
      const rsp = await requestCreditPurchase({
        package: selectedPackage,
        userId: user?.id || "anonymous",
        userName: user?.name || "",
        userEmail: user?.email || "",
        locale: currentLocale,
        method,
      });
      // 결제 성공 → 백엔드에 크레딧 충전 요청
      if (rsp?.imp_uid || rsp?.paymentId) {
        const res = await authedFetch(`${BASE_URL}/credit/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: selectedPackage }),
        });
        if (res.ok) {
          const data = await res.json();
          const merged = { ...user, credits: data.credits };
          setUser(merged);
          localStorage.setItem("app_user", JSON.stringify(merged));
          setPaymentSuccess(true);
        } else {
          const data = await res.json().catch(() => ({}));
          setPaymentError(data.message || data.detail || t.paymentError);
        }
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setPaymentError(err.message || t.paymentError);
    } finally {
      setPurchasing(false);
    }
  };

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.key === selectedPackage);
  console.log("user", user);
  console.log("user?.credit", user?.credit);

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-2xl bg-[#1e1a14] shadow-xl ring-1 ring-white/10 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#e8d5b7]">{t.profile}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-[#e8d5b7]"
            aria-label={t.exit}
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-white/10 px-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`mr-6 -mb-px border-b-2 py-3 text-sm font-medium transition ${
                tab === key
                  ? "border-[#c4b49a] text-[#e8d5b7]"
                  : "border-transparent text-white/30 hover:text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 py-5">
          {tab === "profile" && (
            <div>
              <div
                style={{
                  display: "grid",
                  rowGap: 20,
                  columnGap: 32,
                  gridTemplateColumns: "auto 1fr",
                }}
              >
                {FIELDS.map(({ key, label }) => (
                  <Fragment key={key}>
                    <span className="self-center text-sm font-medium text-[#9b8b7a]">
                      {label}
                    </span>
                    {isEdit ? (
                      <input
                        type="text"
                        value={draft[key]}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [key]: e.target.value }))
                        }
                        className="border-b border-white/20 bg-transparent py-1 text-sm text-[#e8d5b7] outline-none focus:border-[#c4b49a]"
                      />
                    ) : (
                      <span className="self-center text-sm text-[#e8d5b7]">
                        {user?.[key] || "-"}
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>

              {/* 언어 선택 */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#9b8b7a]">
                    {currentLocale === "en" ? "Language" : "언어"}
                  </span>
                  <select
                    value={currentLocale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                    className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-sm text-[#e8d5b7] outline-none focus:border-[#c4b49a]"
                    style={{ background: "#1e1a14" }}
                  >
                    <option value="ko" style={{ background: "#1e1a14" }}>
                      한국어
                    </option>
                    <option value="en" style={{ background: "#1e1a14" }}>
                      English
                    </option>
                  </select>
                </div>
              </div>

              {/* 버튼 */}
              <div className="mt-6 flex justify-end gap-2">
                {isEdit ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-[#c4b49a] px-4 py-2 text-sm text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                    >
                      {saving ? t.saving : t.save}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      {t.exit}
                    </button>
                    <button
                      onClick={handleEdit}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      {t.edit}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div className="py-2">
              {/* 잔액 + 통화 토글 */}
              <div className="mb-5 flex items-center justify-between">
                <span className="text-base font-medium text-[#9b8b7a]">
                  {t.myCredits}
                </span>
                <span className="text-2xl font-bold text-[#e8d5b7]">
                  {(user?.credits ?? 0).toLocaleString()} C
                </span>
              </div>

              {/* 통화 토글 */}
              <div className="mb-5 flex items-center justify-center">
                <div className="flex items-center rounded-full border border-white/10 text-sm">
                  <button
                    onClick={() => setCurrency("KRW")}
                    className={`rounded-l-full px-4 py-1.5 transition ${
                      currency === "KRW"
                        ? "bg-[#c4b49a]/20 text-[#e8d5b7]"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    ₩ {t.domestic}
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`rounded-r-full px-4 py-1.5 transition ${
                      currency === "USD"
                        ? "bg-[#c4b49a]/20 text-[#e8d5b7]"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    $ {t.international}
                  </button>
                </div>
              </div>

              {/* 패키지 선택 그리드 */}
              <div className="mb-5 grid grid-cols-4 gap-2.5">
                {CREDIT_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.key;
                  const isFree = pkg.key === "free";
                  const price =
                    currency === "KRW" ? pkg.priceKRW : pkg.priceUSD;

                  return (
                    <button
                      key={pkg.key}
                      onClick={() => !isFree && setSelectedPackage(pkg.key)}
                      disabled={isFree}
                      className={`relative rounded-lg border p-3.5 text-center transition ${
                        isFree
                          ? "cursor-default border-white/5 bg-white/[0.02] opacity-50"
                          : isSelected
                            ? "border-[#c4b49a] bg-[#c4b49a]/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2.5 -right-1 rounded-full bg-[#c4b49a] px-2 py-0.5 text-xs font-bold text-[#1a1510]">
                          {pkg.badge}
                        </span>
                      )}
                      <div className="text-base font-semibold text-[#e8d5b7]">
                        {currentLocale === "ko" ? pkg.labelKo : pkg.labelEn}
                      </div>
                      <div className="mt-1 text-sm text-[#9b8b7a]">
                        {isFree
                          ? t.free
                          : formatPrice(
                              price,
                              currency === "KRW" ? "ko" : "en",
                            )}
                      </div>
                      {pkg.descKo && !isFree && (
                        <div className="mt-0.5 text-xs text-[#9b8b7a]/70">
                          {currentLocale === "ko" ? pkg.descKo : pkg.descEn}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 크레딧 정책 안내 */}
              <div className="mb-5 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3.5">
                <p className="mb-2.5 text-sm font-medium text-[#9b8b7a]">
                  {t.usageTitle}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#e8d5b7]/80">
                    <span>{t.usageAlbum}</span>
                    <span className="text-[#9b8b7a]">{t.usageAlbumCost}</span>
                  </div>
                  <div className="flex justify-between text-[#e8d5b7]/80">
                    <span>{t.usageEmoji}</span>
                    <span className="text-[#9b8b7a]">{t.usageEmojiCost}</span>
                  </div>
                  <div className="flex justify-between text-[#e8d5b7]/80">
                    <span>{t.usageLimitedEmoji}</span>
                    <span className="text-[#9b8b7a]">
                      {t.usageLimitedEmojiCost}
                    </span>
                  </div>
                </div>
              </div>

              {/* 구매 버튼 / 성공 상태 */}
              {paymentSuccess ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <svg
                      className="h-6 w-6 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-green-400">
                    {t.paymentSuccess}
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handlePurchase(
                        currency === "KRW" ? "domestic" : "international",
                      )
                    }
                    disabled={purchasing || selectedPackage === "free"}
                    className="flex w-full flex-col items-center gap-2 rounded-lg bg-[#c4b49a] py-3.5 transition hover:bg-[#e8d5b7] disabled:opacity-40"
                  >
                    <span className="text-base font-medium text-[#1a1510]">
                      {purchasing
                        ? t.purchasing
                        : currency === "KRW"
                          ? t.domestic
                          : t.international}
                    </span>
                    {/* 로고 */}
                    <div className="flex items-center gap-2">
                      {currency === "KRW" ? (
                        <>
                          <img src="/logo/Toss_App_Icon.png" alt="Toss Pay" className="h-5 rounded-sm object-contain" />
                          <img src="/logo/bade_kakaopay.png" alt="Kakao Pay" className="h-5 rounded-sm object-contain" />
                          <img src="/logo/badge_npay.svg" alt="Naver Pay" className="h-5 rounded-sm object-contain" />
                        </>
                      ) : (
                        <img src="/logo/PayPal-Monogram-FullColor-RGB.png" alt="PayPal" className="h-5 rounded-sm object-contain" />
                      )}
                    </div>
                    <span className="text-xs text-[#1a1510]/60">
                      {selectedPkg
                        ? formatPrice(
                            currency === "KRW"
                              ? selectedPkg.priceKRW
                              : selectedPkg.priceUSD,
                            currency === "KRW" ? "ko" : "en",
                          )
                        : ""}
                    </span>
                  </button>

                  {paymentError && (
                    <p className="mt-3 text-center text-sm text-red-400/80">
                      {t.paymentErrorMsg}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
