"use client";

// 쿠폰 보관함(savedCoupons)과 현재 적용된 할인(couponDiscount)은 "쿠폰" 페이지와
// "앨범 구매" 페이지 양쪽에서 함께 써야 한다. 두 섹션이 별도 라우트로 분리되면서
// 페이지 이동 시 로컬 state가 날아가지 않도록, 두 페이지의 공통 조상인
// layout에 이 state를 두고 Context로 내려준다.
//
// savedCoupons는 서버 보관함(GET /coupon/my)이 진짜 출처(source of truth)다 —
// 여기 저장된 할인 쿠폰만 실제 결제 시 백엔드가 검증·차감해준다.
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { BASE_URL } from "./shared";

const CouponContext = createContext(null);

export function CouponProvider({ children }) {
  const { token, loading } = useAuth();
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(null);

  const refreshSavedCoupons = useCallback(async () => {
    try {
      const res = await authedFetch(`${BASE_URL}/coupon/my`);
      if (!res.ok) return;
      const data = await res.json();
      setSavedCoupons(
        (data.items || []).map((c) => ({
          code: c.code,
          discountPercent: c.discount_percent,
          maxDiscountKrw: c.max_discount_krw,
        })),
      );
    } catch {
      /* ignore — 목록 갱신 실패는 조용히 무시, 다음 진입 시 재시도 */
    }
  }, []);

  useEffect(() => {
    if (!loading && token) refreshSavedCoupons();
  }, [loading, token, refreshSavedCoupons]);

  return (
    <CouponContext.Provider
      value={{
        savedCoupons,
        couponDiscount,
        setCouponDiscount,
        refreshSavedCoupons,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCouponWallet() {
  return useContext(CouponContext);
}
