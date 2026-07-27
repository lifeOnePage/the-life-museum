"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { getPlatform } from "@/app/utils/platform";
import { useCouponWallet } from "../CouponContext";
import {
  T,
  BASE_URL,
  COUPON_GROUP_STYLE,
  DEFAULT_COUPON_STYLE,
  COUPON_MAP,
  getStoredLocale,
  formatPrice,
} from "../shared";

export default function AccountCouponPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const {
    savedCoupons,
    setSavedCoupons,
    couponDiscount,
    setCouponDiscount,
  } = useCouponWallet();

  const [currentLocale, setCurrentLocale] = useState("ko");
  const [currency, setCurrency] = useState("KRW");
  useEffect(() => {
    const locale = getStoredLocale();
    setCurrentLocale(locale);
    setCurrency(locale === "en" ? "USD" : "KRW");
  }, []);
  const t = T[currentLocale] || T.ko;

  // 네이티브 Android 앱에선 쿠폰 UI 자체를 숨긴다 (Play 심사 대응).
  const [showPurchase, setShowPurchase] = useState(true);
  useEffect(() => {
    setShowPurchase(getPlatform() !== "android");
  }, []);

  const [saveCouponCode, setSaveCouponCode] = useState("");
  const [saveCouponValidating, setSaveCouponValidating] = useState(false);
  const [saveCouponError, setSaveCouponError] = useState("");
  const [saveCouponSuccess, setSaveCouponSuccess] = useState("");

  // 쿠폰 등록: 할인 쿠폰(하드코딩)은 보관함에 저장, 그 외에는 크레딧 쿠폰으로 서버 등록(즉시 지급)
  const handleSaveCoupon = async () => {
    if (!saveCouponCode.trim()) return;
    setSaveCouponValidating(true);
    setSaveCouponError("");
    setSaveCouponSuccess("");

    const rawCode = saveCouponCode.trim();
    const code = rawCode.toLowerCase();
    const match = COUPON_MAP[code];
    if (match) {
      const newCoupon = {
        type: "amount",
        value: match.value,
        code: rawCode,
        groupName: match.groupName,
        couponName: match.couponName,
      };

      // 중복 체크
      if (savedCoupons.some((c) => c.code === newCoupon.code)) {
        setSaveCouponError(
          currentLocale === "ko"
            ? "이미 등록된 쿠폰입니다."
            : "Coupon already registered.",
        );
        setSaveCouponValidating(false);
        return;
      }

      setSavedCoupons((prev) => [...prev, newCoupon]);
      setSaveCouponCode("");
      setSaveCouponValidating(false);
      return;
    }

    // 크레딧 쿠폰 — 서버에서 검증 후 크레딧 즉시 지급
    try {
      const res = await authedFetch(`${BASE_URL}/coupon/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rawCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          currentLocale === "ko"
            ? data.detail || "유효하지 않은 쿠폰 코드입니다."
            : res.status === 409
              ? "This coupon has already been used."
              : "Invalid coupon code.";
        setSaveCouponError(msg);
        return;
      }
      const merged = { ...user, credits: data.credits };
      setUser(merged);
      localStorage.setItem("app_user", JSON.stringify(merged));
      setSaveCouponSuccess(
        currentLocale === "ko"
          ? `${data.added.toLocaleString()} 크레딧이 지급되었습니다. (보유 ${data.credits.toLocaleString()} 크레딧)`
          : `${data.added.toLocaleString()} credits added. (Balance: ${data.credits.toLocaleString()})`,
      );
      setSaveCouponCode("");
    } catch {
      setSaveCouponError(
        currentLocale === "ko"
          ? "쿠폰 등록 중 오류가 발생했어요. 잠시 후 다시 시도해주세요."
          : "Failed to register coupon. Please try again.",
      );
    } finally {
      setSaveCouponValidating(false);
    }
  };

  const handleCouponRemove = () => {
    setCouponDiscount(null);
  };

  const handleRemoveSavedCoupon = (code) => {
    setSavedCoupons((prev) => prev.filter((c) => c.code !== code));
    if (couponDiscount?.code === code) {
      handleCouponRemove();
    }
  };

  const handleApplySavedCoupon = (coupon) => {
    setCouponDiscount(coupon);
  };

  if (!showPurchase) return null;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-[#e8d5b7]">
        {t.couponTitle}
      </h2>
      <p className="mb-6 text-sm text-[#9b8b7a]">{t.couponDesc}</p>

      {/* 쿠폰 코드 등록 */}
      <div className="mb-6 rounded-xl border border-white/10 bg-[#1e1a14] p-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={saveCouponCode}
            onChange={(e) => {
              setSaveCouponCode(e.target.value);
              setSaveCouponError("");
              setSaveCouponSuccess("");
            }}
            placeholder={t.couponPlaceholder}
            className="flex-1 rounded-lg border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-[#e8d5b7] placeholder-white/20 transition outline-none focus:border-[#c4b49a]"
          />
          <button
            onClick={handleSaveCoupon}
            disabled={saveCouponValidating || !saveCouponCode.trim()}
            className="rounded-lg bg-[#c4b49a] px-4 py-2.5 text-sm font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
          >
            {saveCouponValidating ? t.couponRegistering : t.couponRegister}
          </button>
        </div>
        {saveCouponError && (
          <p className="mt-2 text-xs text-red-400/80">{saveCouponError}</p>
        )}
        {saveCouponSuccess && (
          <p className="mt-2 text-xs text-green-400/80">{saveCouponSuccess}</p>
        )}
      </div>

      {/* 보유 쿠폰 목록 */}
      <h3 className="mb-3 text-sm font-medium text-[#9b8b7a]">
        {t.savedCoupons}
      </h3>
      {savedCoupons.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1e1a14] px-5 py-8 text-center text-sm text-[#9b8b7a]">
          {t.noCoupons}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {savedCoupons.map((coupon, idx) => {
            const gs =
              COUPON_GROUP_STYLE[coupon.groupName] || DEFAULT_COUPON_STYLE;
            return (
              <div
                key={coupon.code}
                className={`flex items-center justify-between border-l-[3px] bg-[#1e1a14] px-5 py-4 ${gs.border} ${idx > 0 ? "border-t border-white/8" : ""}`}
              >
                <div className="flex flex-col gap-0.5">
                  {coupon.groupName && (
                    <span
                      className={`inline-block w-fit rounded-full px-1.5 py-0.5 text-[10px] font-medium ${gs.badge}`}
                    >
                      {coupon.groupName}
                    </span>
                  )}
                  <span className="text-sm font-medium text-[#e8d5b7]">
                    {coupon.couponName || coupon.code}
                  </span>
                  <span className="text-xs text-[#c4b49a]">
                    {coupon.type === "percent"
                      ? `${coupon.value}% ${t.discountLabel}`
                      : `${formatPrice(coupon.value, currency === "KRW" ? "ko" : "en")} ${t.discountLabel}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {couponDiscount?.code === coupon.code ? (
                    <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
                      {t.couponApplied}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        handleApplySavedCoupon(coupon);
                        router.push(`/${currentLocale}/account/purchase`);
                      }}
                      className="rounded-lg border border-[#c4b49a]/30 px-3 py-1 text-xs text-[#c4b49a] transition hover:bg-[#c4b49a]/10"
                    >
                      {t.couponUse}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveSavedCoupon(coupon.code)}
                    className="text-xs text-white/30 transition hover:text-white/50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
