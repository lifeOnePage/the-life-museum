"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import AppName from "@/app/components/AppName";
import Footer from "@/app/components/Footer";
import { getPlatform } from "@/app/utils/platform";
import { CouponProvider } from "./CouponContext";
import {
  T,
  getStoredLocale,
  IconProfile,
  IconCredits,
  IconCoupon,
  IconBack,
} from "./shared";

// pathname(예: /ko/account/purchase)에서 활성 섹션 키를 뽑아낸다.
function sectionFromPathname(pathname) {
  if (pathname.includes("/account/purchase")) return "charge";
  if (pathname.includes("/account/coupon")) return "coupon";
  return "profile";
}

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [currentLocale, setCurrentLocale] = useState("ko");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = T[currentLocale] || T.ko;

  useEffect(() => {
    setCurrentLocale(getStoredLocale());
  }, []);

  // 네이티브 Android 앱에서는 결제/쿠폰 메뉴 자체를 숨긴다 (Play 심사 대응).
  const [showPurchase, setShowPurchase] = useState(true);
  useEffect(() => {
    setShowPurchase(getPlatform() !== "android");
  }, []);

  const activeSection = sectionFromPathname(pathname);

  const MENU = [
    {
      key: "profile",
      label: t.profile,
      icon: <IconProfile />,
      href: `/${currentLocale}/account/profile`,
    },
    ...(showPurchase
      ? [
          {
            key: "plan",
            label: t.plan,
            children: [
              {
                key: "charge",
                label: t.charge,
                icon: <IconCredits />,
                href: `/${currentLocale}/account/purchase`,
              },
              {
                key: "coupon",
                label: t.coupon,
                icon: <IconCoupon />,
                href: `/${currentLocale}/account/coupon`,
              },
            ],
          },
        ]
      : []),
  ];

  const handleNav = (href) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const mobileTitle =
    activeSection === "profile"
      ? t.profile
      : activeSection === "charge"
        ? t.charge
        : t.coupon;

  return (
    <CouponProvider>
    <div
      className="flex h-screen bg-[#141210] text-white"
      style={{ fontFamily: "pretendard, system-ui, -apple-system, sans-serif" }}
    >
      {/* ── 사이드바 (데스크탑) ── */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-white/10 bg-[#1a1710] md:block">
        <div className="sticky top-0 px-5 pt-8 pb-6">
          <button
            onClick={() => router.push(`/${currentLocale}/library`)}
            className="mb-3 flex items-center gap-2 text-xs text-white/30 transition hover:text-white/50"
          >
            <IconBack />
            {t.back}
          </button>
          <h1 className="mb-4 text-lg text-[#e8d5b7]">
            <AppName />
          </h1>

          <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <p className="text-xs text-white/30">{t.myCredits}</p>
            <p className="text-lg font-bold text-[#e8d5b7]">
              {(user?.credits ?? 0).toLocaleString()} {t.creditUnit}
            </p>
          </div>

          <nav className="">
            {MENU.map((item) =>
              item.children ? (
                <div key={item.key} className="">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => handleNav(child.href)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        activeSection === child.key
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
                  onClick={() => handleNav(item.href)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    activeSection === item.key
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
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold text-[#e8d5b7]">
            {mobileTitle}
          </h1>
          <p className="text-[11px] font-bold text-white/30">
            {(user?.credits ?? 0).toLocaleString()} {t.creditUnit}
          </p>
        </div>
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
                    onClick={() => handleNav(child.href)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                      activeSection === child.key
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
                onClick={() => handleNav(item.href)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                  activeSection === item.key
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
        <div className="mx-auto max-w-xl px-6 py-10 md:py-16">{children}</div>
        <Footer locale={currentLocale} />
      </main>
    </div>
    </CouponProvider>
  );
}
