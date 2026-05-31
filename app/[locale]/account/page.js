"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { requestCreditPurchase } from "@/app/utils/payment";

// ── 크레딧 패키지 ──────────────────────────────
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

// ── 번역 ──────────────────────────────
const T = {
  ko: {
    profile: "프로필",
    plan: "플랜",
    charge: "충전",
    coupon: "쿠폰",
    name: "이름",
    phone: "전화번호",
    email: "Email",
    edit: "편집",
    cancel: "취소",
    save: "저장",
    saving: "저장 중...",
    language: "언어",
    back: "돌아가기",
    myCredits: "내 크레딧",
    purchasing: "결제 진행 중...",
    purchase: "결제하기",
    domestic: "₩ KRW",
    international: "$ USD",
    paymentError: "결제 요청 중 오류가 발생했습니다.",
    paymentSuccess: "크레딧이 충전되었습니다!",
    free: "무료",
    paymentErrorMsg: "결제 요청 중 오류가 발생했습니다.",
    couponPlaceholder: "쿠폰 코드 입력",
    couponApply: "적용",
    couponApplying: "확인 중...",
    couponApplied: "쿠폰 적용됨",
    couponRemove: "해제",
    couponInvalid: "유효하지 않은 쿠폰 코드입니다.",
    discountLabel: "할인",
    finalPrice: "결제 금액",
    couponTitle: "쿠폰 관리",
    couponDesc: "보유 중인 쿠폰 코드를 입력하면 결제 시 할인이 적용됩니다.",
    couponHistory: "적용된 쿠폰",
    noCoupons: "적용된 쿠폰이 없습니다.",
  },
  en: {
    profile: "Profile",
    plan: "Plan",
    charge: "Credits",
    coupon: "Coupon",
    name: "Name",
    phone: "Phone",
    email: "Email",
    edit: "edit",
    cancel: "cancel",
    save: "save",
    saving: "saving...",
    language: "Language",
    back: "Go back",
    myCredits: "My Credits",
    purchasing: "Processing payment...",
    purchase: "Purchase",
    domestic: "₩ KRW",
    international: "$ USD",
    paymentError: "An error occurred while requesting payment.",
    paymentSuccess: "Credits have been added!",
    free: "Free",
    paymentErrorMsg: "An error occurred while requesting payment.",
    couponPlaceholder: "Enter coupon code",
    couponApply: "Apply",
    couponApplying: "Checking...",
    couponApplied: "Coupon applied",
    couponRemove: "Remove",
    couponInvalid: "Invalid coupon code.",
    discountLabel: "Discount",
    finalPrice: "Total",
    couponTitle: "Coupon",
    couponDesc: "Enter a coupon code to get a discount on your next purchase.",
    couponHistory: "Applied Coupons",
    noCoupons: "No coupons applied.",
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

// ── 사이드바 메뉴 아이콘 ──────────────────────────────
function IconProfile() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}
function IconCredits() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  );
}
function IconCoupon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
      />
    </svg>
  );
}
function IconBack() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
}

// ══════════════════════════════════════════════════
export default function AccountPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [currentLocale, setCurrentLocale] = useState("ko");
  const [currency, setCurrency] = useState("KRW");
  const [section, setSection] = useState("profile"); // "profile" | "charge" | "coupon"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = T[currentLocale] || T.ko;

  // 프로필
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  // 충전
  const [selectedPackage, setSelectedPackage] = useState("credit_1000");
  const [purchasing, setPurchasing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // 쿠폰
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const locale = getStoredLocale();
    setCurrentLocale(locale);
    setCurrency(locale === "en" ? "USD" : "KRW");
  }, []);

  const handleLocaleChange = (locale) => {
    setLocaleCookie(locale);
    setCurrentLocale(locale);
    router.push(`/${locale}/account`);
  };

  // ── 프로필 핸들러 ──
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
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── 결제 핸들러 ──
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
      if (rsp?.imp_uid || rsp?.paymentId) {
        const res = await authedFetch(`${BASE_URL}/credit/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package: selectedPackage,
            ...(couponDiscount?.code && { couponCode: couponDiscount.code }),
          }),
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
      setPaymentError(err.message || t.paymentError);
    } finally {
      setPurchasing(false);
    }
  };

  // ── 쿠폰 핸들러 ──
  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError("");
    setCouponDiscount(null);
    try {
      const res = await authedFetch(`${BASE_URL}/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          package: selectedPackage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCouponDiscount({
          type: data.type,
          value: data.value,
          code: couponCode.trim(),
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setCouponError(data.message || data.detail || t.couponInvalid);
      }
    } catch {
      setCouponError(t.couponInvalid);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCouponRemove = () => {
    setCouponCode("");
    setCouponDiscount(null);
    setCouponError("");
  };

  const calcDiscountedPrice = (price) => {
    if (!couponDiscount) return price;
    if (couponDiscount.type === "percent")
      return Math.round(price * (1 - couponDiscount.value / 100));
    return Math.max(0, price - couponDiscount.value);
  };

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.key === selectedPackage);

  const FIELDS = [
    { key: "name", label: t.name },
    { key: "phone", label: t.phone },
    { key: "email", label: t.email },
  ];

  // ── 사이드바 메뉴 ──
  const MENU = [
    { key: "profile", label: t.profile, icon: <IconProfile /> },
    {
      key: "plan",
      label: t.plan,
      children: [
        { key: "charge", label: t.charge, icon: <IconCredits /> },
        { key: "coupon", label: t.coupon, icon: <IconCoupon /> },
      ],
    },
  ];

  const handleNav = (key) => {
    setSection(key);
    setMobileMenuOpen(false);
  };

  // ══════════════════════════════════════════════════
  return (
    <div
      className="flex min-h-screen bg-[#141210] text-white"
      style={{ fontFamily: "pretendard, system-ui, -apple-system, sans-serif" }}
    >
      {/* ── 사이드바 (데스크탑) ── */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-white/10 bg-[#1a1710] md:block">
        <div className="sticky top-0 px-5 pt-8 pb-6">
          <h1 className="mb-4 text-lg font-semibold text-[#e8d5b7]">
            The Life Records
          </h1>

          <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <p className="text-xs text-white/30">{t.myCredits}</p>
            <p className="text-lg font-bold text-[#e8d5b7]">
              {(user?.credits ?? 0).toLocaleString()} C
            </p>
          </div>

          <nav className="space-y-1">
            {MENU.map((item) =>
              item.children ? (
                <div key={item.key}>
                  <p className="mt-5 mb-1 px-3 text-xs font-medium tracking-wider text-white/30 uppercase">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => handleNav(child.key)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        section === child.key
                          ? "bg-[#c4b49a]/15 text-[#e8d5b7]"
                          : "text-white/40 hover:bg-white/5 hover:text-white/60"
                      }`}
                    >
                      {child.icon}
                      {child.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    section === item.key
                      ? "bg-[#c4b49a]/15 text-[#e8d5b7]"
                      : "text-white/40 hover:bg-white/5 hover:text-white/60"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ),
            )}
          </nav>

          <button
            onClick={() => router.push(`/${currentLocale}/library`)}
            className="mt-10 flex items-center gap-2 px-3 text-xs text-white/30 transition hover:text-white/50"
          >
            <IconBack />
            {t.back}
          </button>
        </div>
      </aside>

      {/* ── 모바일 헤더 ── */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#1a1710] px-4 py-3 pt-[max(env(safe-area-inset-top),12px)] md:hidden">
        <button
          onClick={() => router.push(`/${currentLocale}/library`)}
          className="text-white/40"
        >
          <IconBack />
        </button>
        <h1 className="text-sm font-semibold text-[#e8d5b7]">
          {section === "profile"
            ? t.profile
            : section === "charge"
              ? t.charge
              : t.coupon}
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white/40"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[calc(49px+max(env(safe-area-inset-top),12px)-12px)] z-30 border-b border-white/10 bg-[#1a1710] p-4 md:hidden">
          {MENU.map((item) =>
            item.children ? (
              <div key={item.key}>
                <p className="mt-3 mb-1 px-2 text-xs font-medium tracking-wider text-white/30 uppercase">
                  {item.label}
                </p>
                {item.children.map((child) => (
                  <button
                    key={child.key}
                    onClick={() => handleNav(child.key)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                      section === child.key
                        ? "bg-[#c4b49a]/15 text-[#e8d5b7]"
                        : "text-white/40"
                    }`}
                  >
                    {child.icon}
                    {child.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                  section === item.key
                    ? "bg-[#c4b49a]/15 text-[#e8d5b7]"
                    : "text-white/40"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}

      {/* ── 메인 컨텐츠 ── */}
      <main className="flex-1 overflow-y-auto pt-[calc(3.5rem+max(env(safe-area-inset-top),12px)-12px)] md:pt-0">
        <div className="mx-auto max-w-xl px-6 py-10 md:py-16">
          {/* ═══ 프로필 섹션 ═══ */}
          {section === "profile" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#e8d5b7]">
                  {t.profile}
                </h2>
                {isEdit ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-[#c4b49a] px-4 py-1.5 text-sm text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                    >
                      {saving ? t.saving : t.save}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-[#c4b49a] transition hover:bg-white/5"
                  >
                    {t.edit}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#1e1a14] p-6">
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

                {/* 언어 */}
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#9b8b7a]">
                      {t.language}
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
              </div>
            </div>
          )}

          {/* ═══ 충전 섹션 ═══ */}
          {section === "charge" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold text-[#e8d5b7]">
                {t.charge}
              </h2>

              {/* 통화 토글 */}
              <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center rounded-full border border-white/10 text-sm">
                  <button
                    onClick={() => setCurrency("KRW")}
                    className={`rounded-l-full px-4 py-1.5 transition ${currency === "KRW" ? "bg-[#c4b49a]/20 text-[#e8d5b7]" : "text-white/30 hover:text-white/50"}`}
                  >
                    {t.domestic}
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`rounded-r-full px-4 py-1.5 transition ${currency === "USD" ? "bg-[#c4b49a]/20 text-[#e8d5b7]" : "text-white/30 hover:text-white/50"}`}
                  >
                    {t.international}
                  </button>
                </div>
              </div>

              {/* 패키지 그리드 */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                      className={`relative rounded-xl border p-4 text-center transition ${
                        isFree
                          ? "cursor-default border-white/5 bg-white/[0.02] opacity-50"
                          : isSelected
                            ? "border-[#c4b49a] bg-[#c4b49a]/10"
                            : "border-white/10 bg-[#1e1a14] hover:border-white/20"
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

              {/* 할인 표시 */}
              {couponDiscount && selectedPkg && selectedPackage !== "free" && (
                <div className="mb-6 rounded-xl border border-white/10 bg-[#1e1a14] px-5 py-4 text-sm">
                  <div className="flex justify-between text-[#9b8b7a]">
                    <span>{selectedPkg.credits.toLocaleString()}C</span>
                    <span>
                      {formatPrice(
                        currency === "KRW"
                          ? selectedPkg.priceKRW
                          : selectedPkg.priceUSD,
                        currency === "KRW" ? "ko" : "en",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>{t.discountLabel}</span>
                    <span>
                      -
                      {formatPrice(
                        (currency === "KRW"
                          ? selectedPkg.priceKRW
                          : selectedPkg.priceUSD) -
                          calcDiscountedPrice(
                            currency === "KRW"
                              ? selectedPkg.priceKRW
                              : selectedPkg.priceUSD,
                          ),
                        currency === "KRW" ? "ko" : "en",
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-medium text-[#e8d5b7]">
                    <span>{t.finalPrice}</span>
                    <span>
                      {formatPrice(
                        calcDiscountedPrice(
                          currency === "KRW"
                            ? selectedPkg.priceKRW
                            : selectedPkg.priceUSD,
                        ),
                        currency === "KRW" ? "ko" : "en",
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* 구매 버튼 */}
              {paymentSuccess ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 py-6">
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
                    className="flex w-full flex-col items-center gap-2 rounded-xl bg-[#c4b49a] py-4 transition hover:bg-[#e8d5b7] disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-[#1a1510]">
                        {purchasing ? t.purchasing : t.purchase}
                      </span>
                      <span className="text-sm text-[#1a1510]/40">
                        {currency === "KRW"
                          ? currentLocale === "ko" ? "간편결제 / 카드" : "Easy Pay / Card"
                          : "PayPal"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currency === "KRW" ? (
                        <>
                          <img
                            src="/logo/Toss_App_Icon.png"
                            alt="Toss Pay"
                            className="h-5 rounded-sm object-contain"
                          />
                          <img
                            src="/logo/bade_kakaopay.png"
                            alt="Kakao Pay"
                            className="h-5 rounded-sm object-contain"
                          />
                          <img
                            src="/logo/badge_npay.svg"
                            alt="Naver Pay"
                            className="h-5 rounded-sm object-contain"
                          />
                        </>
                      ) : (
                        <img
                          src="/logo/PayPal-Monogram-FullColor-RGB.png"
                          alt="PayPal"
                          className="h-5 rounded-sm object-contain"
                        />
                      )}
                    </div>
                    <span className="text-xs text-[#1a1510]/60">
                      {selectedPkg
                        ? `${currentLocale === "ko" ? "총" : "Total"} ${formatPrice(
                            calcDiscountedPrice(
                              currency === "KRW"
                                ? selectedPkg.priceKRW
                                : selectedPkg.priceUSD,
                            ),
                            currency === "KRW" ? "ko" : "en",
                          )}`
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

          {/* ═══ 쿠폰 섹션 ═══ */}
          {section === "coupon" && (
            <div>
              <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">
                {t.couponTitle}
              </h2>
              <p className="mb-6 text-sm text-[#9b8b7a]">{t.couponDesc}</p>

              {/* 쿠폰 입력 */}
              <div className="rounded-xl border border-white/10 bg-[#1e1a14] p-6">
                {couponDiscount ? (
                  <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-400"
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
                      <span className="text-sm text-green-400">
                        {t.couponApplied} (
                        {couponDiscount.type === "percent"
                          ? `${couponDiscount.value}%`
                          : formatPrice(
                              couponDiscount.value,
                              currency === "KRW" ? "ko" : "en",
                            )}
                        )
                      </span>
                    </div>
                    <button
                      onClick={handleCouponRemove}
                      className="text-xs text-white/40 transition hover:text-white/60"
                    >
                      {t.couponRemove}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder={t.couponPlaceholder}
                        className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#e8d5b7] placeholder-white/20 transition outline-none focus:border-[#c4b49a]"
                      />
                      <button
                        onClick={handleCouponApply}
                        disabled={couponValidating || !couponCode.trim()}
                        className="rounded-xl bg-[#c4b49a] px-5 py-3 text-sm font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                      >
                        {couponValidating ? t.couponApplying : t.couponApply}
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-xs text-red-400/80">
                        {couponError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 쿠폰 적용 시 → 충전 페이지로 유도 */}
              {couponDiscount && (
                <div className="mt-6 rounded-xl border border-white/10 bg-[#1e1a14] p-6">
                  <p className="mb-4 text-sm text-[#9b8b7a]">
                    {currentLocale === "ko"
                      ? "쿠폰이 적용되었습니다. 충전 페이지에서 결제를 진행해 주세요."
                      : "Coupon applied. Please proceed to the Credits page to complete your purchase."}
                  </p>
                  <button
                    onClick={() => setSection("charge")}
                    className="rounded-xl bg-[#c4b49a] px-5 py-2.5 text-sm font-medium text-[#1a1510] transition hover:bg-[#e8d5b7]"
                  >
                    {t.charge} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
