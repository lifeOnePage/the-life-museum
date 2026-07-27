"use client";

// 쿠폰 보관함(savedCoupons)과 현재 적용된 할인(couponDiscount)은 "쿠폰" 페이지와
// "충전" 페이지 양쪽에서 함께 써야 한다. 두 섹션이 별도 라우트로 분리되면서
// 페이지 이동 시 로컬 state가 날아가지 않도록, 두 페이지의 공통 조상인
// layout에 이 state를 두고 Context로 내려준다.
import { createContext, useContext, useState } from "react";

const CouponContext = createContext(null);

export function CouponProvider({ children }) {
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(null);

  return (
    <CouponContext.Provider
      value={{ savedCoupons, setSavedCoupons, couponDiscount, setCouponDiscount }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCouponWallet() {
  return useContext(CouponContext);
}
