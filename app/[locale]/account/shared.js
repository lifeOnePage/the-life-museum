// app/[locale]/account/shared.js
// 프로필/충전/쿠폰 라우트(layout + 각 page)가 공유하는 번역/상수/아이콘.

export const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

// ── 크레딧 패키지 ──────────────────────────────
export const CREDIT_PACKAGES = [
  {
    key: "credit_1000",
    credits: 1000,
    priceKRW: 10000,
    priceUSD: 999,
    originalPriceKRW: null,
    originalPriceUSD: null,
    labelKo: "1,000 크레딧",
    labelEn: "1,000 Credits",
    descKo: "기본",
    descEn: "Basic",
    badge: null,
  },
  {
    key: "credit_3000",
    credits: 3000,
    priceKRW: 24000,
    priceUSD: 2099,
    originalPriceKRW: 30000,
    originalPriceUSD: 3000,
    labelKo: "3,000 크레딧",
    labelEn: "3,000 Credits",
    descKo: "20% OFF",
    descEn: "20% OFF",
    badge: "-20%",
  },
  {
    key: "credit_6000",
    credits: 6000,
    priceKRW: 39000,
    priceUSD: 3399,
    originalPriceKRW: 60000,
    originalPriceUSD: 6000,
    labelKo: "6,000 크레딧",
    labelEn: "6,000 Credits",
    descKo: "35% OFF",
    descEn: "35% OFF",
    badge: "-35%",
  },
];

// ── 번역 ──────────────────────────────
export const T = {
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
    creditUnit: "크레딧",
    purchasing: "결제 진행 중...",
    purchase: "결제하기",
    domestic: "₩ 원화",
    international: "$ 달러",
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
    expectedCredits: "충전 후 예상 보유 크레딧",
    totalPayment: "총 결제 금액",
    couponTitle: "쿠폰 보관함",
    couponDesc:
      "쿠폰 코드를 등록하세요. 크레딧 쿠폰은 즉시 지급되고, 할인 쿠폰은 충전 시 사용할 수 있습니다.",
    couponHistory: "적용된 쿠폰",
    noCoupons: "등록된 쿠폰이 없습니다.",
    couponRegister: "등록",
    couponRegistering: "확인 중...",
    savedCoupons: "보유 쿠폰",
    couponUse: "사용하기",
    deleteAccount: "계정 삭제",
    deleteConfirmTitle: "정말 계정을 삭제하시겠습니까?",
    deleteConfirmDesc:
      "계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.",
    deleteConfirm: "삭제",
    deleting: "삭제 중...",
    purchaseAgreeLabel: "[필수] 구매 조건 및 결제 진행 동의",
    purchaseAgreeViewDetail: "약관 보기",
    purchaseAgreeModalTitle: "구매 조건 및 환불 규정",
    purchaseAgreeModalBody:
      "충전 후 사용하지 않은 크레딧은 결제일로부터 7일 이내 환불 가능하며, 일부 사용 시 잔여 크레딧의 10%가 수수료로 공제됩니다. 크레딧으로 구매한 디지털 앨범 생성 서비스 및 꾸미기 아이템(디지털 콘텐츠)은 구매 즉시 또는 사용 개시 이후 환불이 제한됩니다.",
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
    creditUnit: "Credits",
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
    expectedCredits: "Expected credits after purchase",
    totalPayment: "Total payment",
    couponTitle: "Coupon Wallet",
    couponDesc:
      "Register coupon codes. Credit coupons are granted instantly; discount coupons can be used when purchasing credits.",
    couponHistory: "Applied Coupons",
    noCoupons: "No coupons registered.",
    couponRegister: "Register",
    couponRegistering: "Checking...",
    savedCoupons: "My Coupons",
    couponUse: "Use",
    deleteAccount: "Delete Account",
    deleteConfirmTitle: "Are you sure you want to delete your account?",
    deleteConfirmDesc:
      "Deleting your account will permanently remove all your data and cannot be undone.",
    deleteConfirm: "Delete",
    deleting: "Deleting...",
    purchaseAgreeLabel:
      "[Required] I agree to the purchase terms and refund policy",
    purchaseAgreeViewDetail: "View details",
    purchaseAgreeModalTitle: "Purchase Terms & Refund Policy",
    purchaseAgreeModalBody:
      "Unused credits may be refunded within 7 days of payment. If a portion of the credits has been used, a 10% fee will be deducted from the remaining balance upon refund. Digital albums and decoration items purchased with credits cannot be refunded once purchased or used.",
  },
};

export function getStoredLocale() {
  if (typeof window === "undefined") return "ko";
  return localStorage.getItem("NEXT_LOCALE") || "ko";
}

export function setLocaleCookie(locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem("NEXT_LOCALE", locale);
}

export const COUPON_GROUP_STYLE = {
  "와디즈 쿠폰": {
    border: "border-l-[#c4b49a]",
    badge: "bg-[#c4b49a]/15 text-[#c4b49a]",
    text: "text-[#c4b49a]/70",
  },
  카톡이벤트: {
    border: "border-l-[#fee500]",
    badge: "bg-[#fee500]/15 text-[#fee500]",
    text: "text-[#fee500]/70",
  },
};
export const DEFAULT_COUPON_STYLE = {
  border: "border-l-white/20",
  badge: "bg-white/10 text-white/50",
  text: "text-white/50",
};

// 임시 하드코딩 쿠폰 맵 — handleCouponApply/handleSaveCoupon이 공유.
export const COUPON_MAP = {
  manwon: {
    value: 10000,
    groupName: "와디즈 쿠폰",
    couponName: "10,000원 할인권",
  },
  "2manwon": {
    value: 20000,
    groupName: "카톡이벤트",
    couponName: "팔로워 20,000원 할인권",
  },
  "3manwon": {
    value: 30000,
    groupName: "와디즈 쿠폰",
    couponName: "오픈 이벤트 30,000원 할인권",
  },
};

export function formatPrice(price, locale) {
  if (price === 0) return locale === "ko" ? "₩0" : "$0";
  if (locale === "ko") return `₩${price.toLocaleString()}`;
  return `$${(price / 100).toFixed(2)}`;
}

// ── 사이드바 메뉴 아이콘 ──────────────────────────────
export function IconProfile() {
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
export function IconCredits() {
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
export function IconCoupon() {
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
export function IconBack() {
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
