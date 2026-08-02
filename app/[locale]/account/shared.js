// app/[locale]/account/shared.js
// 프로필/충전/쿠폰 라우트(layout + 각 page)가 공유하는 번역/상수/아이콘.

export const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

// ── 앨범 결제 상품 ──────────────────────────────
// "포인트/크레딧 충전"이 아니라 "앨범 생성권 N개"를 직접 구매하는 구조.
// KRW 결제만 지원 (PayPal/USD는 잠시 비활성화 — app/utils/payment.js 참고).
// 임시 결제 테스트용 패키지 — 잠시 주석 처리 (실 서비스 오픈 전까지 노출 안 함)
// const TEST_PACKAGE = {
//   key: "album_test_1000",
//   albums: 1,
//   priceKRW: 1000,
//   originalPriceKRW: null,
//   labelKo: "[테스트] 앨범 1개",
//   labelEn: "[Test] 1 Album",
//   descKo: "결제 테스트",
//   descEn: "Payment test",
//   badge: "TEST",
// };

export const CREDIT_PACKAGES = [
  // TEST_PACKAGE,
  {
    key: "album_1",
    albums: 1,
    priceKRW: 9000,
    originalPriceKRW: 10000,
    labelKo: "앨범 1개",
    labelEn: "1 Album",
    descKo: "오픈 기념 10% 할인",
    descEn: "Launch event -10%",
    badge: "-10%",
  },
  {
    key: "album_3",
    albums: 3,
    priceKRW: 24000,
    originalPriceKRW: 30000,
    labelKo: "앨범 3개",
    labelEn: "3 Albums",
    descKo: "오픈 기념 20% 할인",
    descEn: "Launch event -20%",
    badge: "-20%",
  },
  {
    key: "album_6",
    albums: 6,
    priceKRW: 39000,
    originalPriceKRW: 60000,
    labelKo: "앨범 6개",
    labelEn: "6 Albums",
    descKo: "오픈 기념 35% 할인",
    descEn: "Launch event -35%",
    badge: "-35%",
  },
];

// ── 번역 ──────────────────────────────
export const T = {
  ko: {
    profile: "프로필",
    plan: "플랜",
    charge: "앨범 구매",
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
    purchasing: "결제 진행 중...",
    purchase: "결제하기",
    paymentError: "결제 요청 중 오류가 발생했습니다.",
    paymentSuccess: "결제가 완료됐어요!",
    free: "무료",
    couponPlaceholder: "쿠폰 코드 입력",
    couponApply: "적용",
    couponApplying: "확인 중...",
    couponApplied: "쿠폰 적용됨",
    couponRemove: "해제",
    couponInvalid: "유효하지 않은 쿠폰 코드입니다.",
    discountLabel: "할인",
    finalPrice: "결제 금액",
    totalPayment: "총 결제 금액",
    couponTitle: "쿠폰 보관함",
    couponDesc:
      "쿠폰 코드를 등록하세요. 즉시 지급되는 쿠폰도 있고, 앨범 구매 시 할인으로 쓸 수 있는 쿠폰도 있어요.",
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
    servicePeriodNotice: "서비스 제공기간 : 생성일로부터 1년",
    refundNoticePrefix: "환불 및 취소 규정은 ",
    refundNoticeLink: "이용약관",
    refundNoticeSuffix: "을 참고해주세요.",
    purchaseAgreeLabel: "[필수] 구매 조건 및 결제 진행 동의",
    purchaseAgreeViewDetail: "약관 보기",
    purchaseAgreeModalTitle: "구매 조건 및 환불 규정",
    purchaseAgreeModalBody:
      "서비스 제공기간: 생성된 AI 앨범은 생성일로부터 1년 동안 서비스 내에서 열람할 수 있습니다.\n\nAI 앨범 생성이 시작되기 전까지는 결제 취소 및 전액 환불이 가능합니다. AI 앨범 생성이 완료된 이후에는 디지털 콘텐츠의 특성상 환불이 불가능합니다. 단, 서비스 장애 또는 회사의 귀책사유로 정상적인 서비스 이용이 불가능한 경우에는 환불이 가능합니다.\n\n자세한 내용은 [환불 및 취소정책] 페이지를 참고해주세요.",
  },
  en: {
    profile: "Profile",
    plan: "Plan",
    charge: "Buy Albums",
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
    purchasing: "Processing payment...",
    purchase: "Purchase",
    paymentError: "An error occurred while requesting payment.",
    paymentSuccess: "Payment complete!",
    free: "Free",
    couponPlaceholder: "Enter coupon code",
    couponApply: "Apply",
    couponApplying: "Checking...",
    couponApplied: "Coupon applied",
    couponRemove: "Remove",
    couponInvalid: "Invalid coupon code.",
    discountLabel: "Discount",
    finalPrice: "Total",
    totalPayment: "Total payment",
    couponTitle: "Coupon Wallet",
    couponDesc:
      "Register coupon codes. Some are granted instantly; others can be used as a discount when buying albums.",
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
    servicePeriodNotice: "Service period: 1 year from creation date",
    refundNoticePrefix: "See our ",
    refundNoticeLink: "Terms of Service",
    refundNoticeSuffix: " for refund and cancellation details.",
    purchaseAgreeLabel:
      "[Required] I agree to the purchase terms and refund policy",
    purchaseAgreeViewDetail: "View details",
    purchaseAgreeModalTitle: "Purchase Terms & Refund Policy",
    purchaseAgreeModalBody:
      "Service period: Generated AI albums can be viewed within the service for 1 year from their creation date.\n\nYou may cancel and receive a full refund before AI album generation begins. Once generation is complete, refunds are not available due to the nature of digital content — except when normal use of the service is impossible due to a service outage or fault attributable to the company.\n\nSee the [Refund & Cancellation Policy] page for details.",
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
