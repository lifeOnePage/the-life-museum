"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { requestAlbumPayment } from "@/app/utils/payment";

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
    planSupport: "지원 예정입니다.",
    planTitle: "앨범 구매",
    planDesc: "앨범 1권을 구매하면 나만의 전시를 만들 수 있어요.",
    albumPrice: "₩10,000",
    albumUnit: "/ 1권",
    buyAlbum: "구매하기",
    purchasing: "결제 진행 중...",
    paymentMethods: "카드 · 카카오페이 · 네이버페이 · 토스페이",
    paymentError: "결제 요청 중 오류가 발생했습니다.",
    paymentSuccess: "결제가 완료되었습니다!",
    verifying: "결제 확인 중...",
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
    planSupport: "Coming soon.",
    planTitle: "Purchase Album",
    planDesc: "Buy an album to create your own exhibition.",
    albumPrice: "₩10,000",
    albumUnit: "/ 1 album",
    buyAlbum: "Purchase",
    purchasing: "Processing payment...",
    paymentMethods: "Card · Kakao Pay · Naver Pay · Toss Pay",
    paymentError: "An error occurred while requesting payment.",
    paymentSuccess: "Payment complete!",
    verifying: "Verifying payment...",
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

export default function ProfileModal({ onClose }) {
  const [currentLocale, setCurrentLocale] = useState("ko");

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

  useEffect(() => {
    setCurrentLocale(getStoredLocale());
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

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-[#1e1a14] shadow-xl ring-1 ring-white/10 sm:mx-0"
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
              {/* 가격 카드 */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="mb-1 text-base font-semibold text-[#e8d5b7]">
                  {t.planTitle}
                </h3>
                <p className="mb-4 text-sm text-[#9b8b7a]">
                  {t.planDesc}
                </p>

                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#e8d5b7]">
                    {t.albumPrice}
                  </span>
                  <span className="text-sm text-[#9b8b7a]">{t.albumUnit}</span>
                </div>

                {paymentSuccess ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-400">{t.paymentSuccess}</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        setPurchasing(true);
                        setPaymentError("");
                        try {
                          const rsp = await requestAlbumPayment({
                            userId: user?.id || "anonymous",
                            userName: user?.name || "",
                            userEmail: user?.email || "",
                            locale: currentLocale,
                          });
                          // 결제 성공 → 백엔드 검증
                          const res = await authedFetch(`${BASE_URL}/payment/confirm`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              imp_uid: rsp.imp_uid,
                              merchant_uid: rsp.merchant_uid,
                            }),
                          });
                          if (res.ok) {
                            setPaymentSuccess(true);
                          } else {
                            const data = await res.json().catch(() => ({}));
                            setPaymentError(data.message || data.detail || t.paymentError);
                          }
                        } catch (err) {
                          console.error("Payment failed:", err);
                          setPaymentError(err.message || t.paymentError);
                        } finally {
                          setPurchasing(false);
                        }
                      }}
                      disabled={purchasing}
                      className="w-full rounded-lg bg-[#c4b49a] py-3 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                    >
                      {purchasing ? t.purchasing : t.buyAlbum}
                    </button>

                    {paymentError && (
                      <p className="mt-3 text-center text-sm text-red-400/80">
                        {paymentError}
                      </p>
                    )}

                    <p className="mt-3 text-center text-xs text-white/20">
                      {t.paymentMethods}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
