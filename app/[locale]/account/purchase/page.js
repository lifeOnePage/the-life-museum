"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { requestCreditPurchase } from "@/app/utils/payment";
import LegalModal from "@/app/components/LegalModal";
import { getPlatform } from "@/app/utils/platform";
import { useCouponWallet } from "../CouponContext";
import {
  T,
  BASE_URL,
  CREDIT_PACKAGES,
  COUPON_GROUP_STYLE,
  DEFAULT_COUPON_STYLE,
  COUPON_MAP,
  getStoredLocale,
  formatPrice,
} from "../shared";

export default function AccountPurchasePage() {
  const { user, setUser } = useAuth();
  const { savedCoupons, couponDiscount, setCouponDiscount } = useCouponWallet();

  const [currentLocale, setCurrentLocale] = useState("ko");
  useEffect(() => {
    setCurrentLocale(getStoredLocale());
  }, []);
  const t = T[currentLocale] || T.ko;

  // 네이티브 Android 앱에선 결제 UI 자체를 숨긴다 (Play 심사 대응).
  const [showPurchase, setShowPurchase] = useState(true);
  useEffect(() => {
    setShowPurchase(getPlatform() !== "android");
  }, []);

  const [chargeCouponOpen, setChargeCouponOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]?.key);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreeModal, setShowAgreeModal] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handlePurchase = async () => {
    if (!agreedToTerms) return;
    setPurchasing(true);
    setPaymentError("");
    try {
      const rsp = await requestCreditPurchase({
        package: selectedPackage,
        userId: user?.id || "anonymous",
        userName: user?.name || "",
        userEmail: user?.email || "",
        userPhone: user?.phone || "",
        locale: currentLocale,
        method: "domestic",
      });
      if (rsp?.paymentId) {
        const res = await authedFetch(`${BASE_URL}/credit/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package: selectedPackage,
            payment_id: rsp.paymentId,
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
          console.error(
            "[credit/purchase] rejected — status:",
            res.status,
            "body:",
            data,
          );
          setPaymentError(data.message || data.detail || t.paymentError);
        }
      }
    } catch (err) {
      console.error("[requestCreditPurchase] failed:", err);
      setPaymentError(err.message || t.paymentError);
    } finally {
      setPurchasing(false);
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError("");
    setCouponDiscount(null);

    // TODO: 임시 — 쿠폰 코드별 할인
    await new Promise((r) => setTimeout(r, 500));
    const code = couponCode.trim().toLowerCase();
    const match = COUPON_MAP[code];
    if (!match) {
      setCouponError(t.couponInvalid);
      setCouponValidating(false);
      return;
    }
    setCouponDiscount({
      type: "amount",
      value: match.value,
      code: couponCode.trim(),
      groupName: match.groupName,
      couponName: match.couponName,
    });
    setCouponValidating(false);
  };

  const handleCouponRemove = () => {
    setCouponCode("");
    setCouponDiscount(null);
    setCouponError("");
  };

  const handleApplySavedCoupon = (coupon) => {
    setCouponDiscount(coupon);
    setCouponCode(coupon.code);
  };

  const calcDiscountedPrice = (price) => {
    if (!couponDiscount) return price;
    if (couponDiscount.type === "percent")
      return Math.round(price * (1 - couponDiscount.value / 100));
    return Math.max(0, price - couponDiscount.value);
  };

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.key === selectedPackage);

  if (!showPurchase) return null;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-[#e8d5b7]">{t.charge}</h2>

      {/* 앨범 상품 리스트 */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
        {CREDIT_PACKAGES.map((pkg, idx) => {
          const isSelected = selectedPackage === pkg.key;
          return (
            <button
              key={pkg.key}
              onClick={() => setSelectedPackage(pkg.key)}
              className={`flex w-full items-center gap-3 px-4 py-4 transition ${
                isSelected ? "bg-[#c4b49a]/10" : "hover:bg-white/5"
              } ${idx > 0 ? "border-t border-white/8" : ""}`}
            >
              {/* 라디오 */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-[#c4b49a]" : "border-white/30"
                }`}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#c4b49a]" />
                )}
              </div>
              {/* 앨범 상품명 */}
              <span className="text-base font-semibold text-[#e8d5b7]">
                {currentLocale === "ko" ? pkg.labelKo : pkg.labelEn}
              </span>
              {/* 가격 + 배지 (오른쪽) */}
              <span className="ml-auto flex items-center gap-2 text-sm">
                {pkg.badge && (
                  <span className="rounded-full bg-[#c4b49a] px-2 py-0.5 text-[10px] font-bold text-[#1a1510]">
                    {pkg.badge}
                  </span>
                )}
                <span className="text-[#e8d5b7]">
                  {formatPrice(pkg.priceKRW, "ko")}
                </span>
                {pkg.originalPriceKRW && (
                  <span className="text-[#9b8b7a]/50 line-through">
                    {formatPrice(pkg.originalPriceKRW, "ko")}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 쿠폰 적용 (접이식) */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
        <button
          onClick={() => setChargeCouponOpen(!chargeCouponOpen)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#9b8b7a]">
              {t.coupon}
            </span>
            {couponDiscount && (
              <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                {t.couponApplied}
              </span>
            )}
          </div>
          <svg
            className={`h-4 w-4 text-[#9b8b7a] transition-transform ${chargeCouponOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
        {chargeCouponOpen && (
          <div className="border-t border-white/8 px-4 py-4">
            {couponDiscount ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                <div className="flex items-center justify-between">
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
                    <span className="text-sm font-medium text-green-400">
                      {couponDiscount.type === "percent"
                        ? `${couponDiscount.value}% ${t.discountLabel}`
                        : `${formatPrice(couponDiscount.value, "ko")} ${t.discountLabel}`}
                    </span>
                  </div>
                  <button
                    onClick={handleCouponRemove}
                    className="text-xs text-white/40 transition hover:text-white/60"
                  >
                    {t.couponRemove}
                  </button>
                </div>
                {(couponDiscount.groupName || couponDiscount.couponName) &&
                  (() => {
                    const gs =
                      COUPON_GROUP_STYLE[couponDiscount.groupName] ||
                      DEFAULT_COUPON_STYLE;
                    return (
                      <div className="mt-2 flex flex-col gap-0.5 pl-6 text-xs">
                        {couponDiscount.groupName && (
                          <span className={gs.text}>
                            {couponDiscount.groupName}
                          </span>
                        )}
                        {couponDiscount.couponName && (
                          <span className="text-green-400/70">
                            {couponDiscount.couponName}
                          </span>
                        )}
                      </div>
                    );
                  })()}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* 보관함 쿠폰 선택 */}
                {savedCoupons.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {savedCoupons.map((coupon) => {
                      const gs =
                        COUPON_GROUP_STYLE[coupon.groupName] ||
                        DEFAULT_COUPON_STYLE;
                      return (
                        <button
                          key={coupon.code}
                          onClick={() => handleApplySavedCoupon(coupon)}
                          className={`flex items-center justify-between rounded-lg border border-l-[3px] border-white/10 ${gs.border} px-4 py-3 text-left transition hover:bg-white/5`}
                        >
                          <div className="flex flex-col gap-0.5">
                            {coupon.groupName && (
                              <span
                                className={`inline-block w-fit rounded-full px-1.5 py-0.5 text-[10px] font-medium ${gs.badge}`}
                              >
                                {coupon.groupName}
                              </span>
                            )}
                            <span className="text-sm text-[#e8d5b7]">
                              {coupon.couponName || coupon.code}
                            </span>
                          </div>
                          <span className="text-xs text-[#c4b49a]">
                            {coupon.type === "percent"
                              ? `${coupon.value}%`
                              : formatPrice(coupon.value, "ko")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* 직접 입력 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    placeholder={t.couponPlaceholder}
                    className="flex-1 rounded-lg border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-[#e8d5b7] placeholder-white/20 transition outline-none focus:border-[#c4b49a]"
                  />
                  <button
                    onClick={handleCouponApply}
                    disabled={couponValidating || !couponCode.trim()}
                    className="rounded-lg bg-[#c4b49a] px-4 py-2.5 text-sm font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                  >
                    {couponValidating ? t.couponApplying : t.couponApply}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-400/80">
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 결제 요약 — 앨범명 / 결제 금액만 표시 */}
      {selectedPkg && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1a14] px-5 py-4 text-sm">
          <span className="font-medium text-[#e8d5b7]">
            {currentLocale === "ko" ? selectedPkg.labelKo : selectedPkg.labelEn}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-bold text-[#e8d5b7]">
              {formatPrice(calcDiscountedPrice(selectedPkg.priceKRW), "ko")}
            </span>
            {couponDiscount &&
              calcDiscountedPrice(selectedPkg.priceKRW) !==
                selectedPkg.priceKRW && (
                <span className="text-[#9b8b7a]/50 line-through">
                  {formatPrice(selectedPkg.priceKRW, "ko")}
                </span>
              )}
          </span>
        </div>
      )}

      {/* 구매 조건 동의 (결제 직전 필수 체크) */}
      {!paymentSuccess && (
        <label className="mb-4 flex items-start gap-2.5 text-sm text-[#9b8b7a]">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setPaymentError("");
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#c4b49a]"
          />
          <span>
            {t.purchaseAgreeLabel}{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowAgreeModal(true);
              }}
              className="text-[#c4b49a] underline underline-offset-2 transition hover:text-[#e8d5b7]"
            >
              {t.purchaseAgreeViewDetail}
            </button>
          </span>
        </label>
      )}

      {/* 결제 버튼 */}
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
            onClick={handlePurchase}
            disabled={purchasing || !agreedToTerms}
            className="flex w-full flex-col items-center gap-2 rounded-xl bg-[#c4b49a] py-4 transition hover:bg-[#e8d5b7] disabled:opacity-40"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#1a1510]">
                {purchasing ? t.purchasing : t.purchase}
              </span>
              <span className="text-sm text-[#1a1510]/40">
                {currentLocale === "ko" ? "간편결제 / 카드" : "Easy Pay / Card"}
              </span>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </button>
          {paymentError && (
            <p className="mt-3 text-center text-sm text-red-400/80">
              {paymentError}
            </p>
          )}
        </>
      )}

      {showAgreeModal && (
        <LegalModal
          title={t.purchaseAgreeModalTitle}
          onClose={() => setShowAgreeModal(false)}
        >
          {t.purchaseAgreeModalBody}
        </LegalModal>
      )}
    </div>
  );
}
