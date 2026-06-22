"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { requestCreditPurchase } from "@/app/utils/payment";

// ── 번역 ──────────────────────────────
const T = {
  ko: {
    profile: "프로필",
    name: "이름",
    phone: "전화번호",
    email: "Email",
    edit: "편집",
    cancel: "취소",
    save: "저장",
    saving: "저장 중...",
    language: "언어",
    back: "돌아가기",
    deleteAccount: "계정 삭제",
    deleteConfirmTitle: "정말 계정을 삭제하시겠습니까?",
    deleteConfirmDesc:
      "계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.",
    deleteConfirm: "삭제",
    deleting: "삭제 중...",
  },
  en: {
    profile: "Profile",
    name: "Name",
    phone: "Phone",
    email: "Email",
    edit: "edit",
    cancel: "cancel",
    save: "save",
    saving: "saving...",
    language: "Language",
    back: "Go back",
    deleteAccount: "Delete Account",
    deleteConfirmTitle: "Are you sure you want to delete your account?",
    deleteConfirmDesc:
      "Deleting your account will permanently remove all your data and cannot be undone.",
    deleteConfirm: "Delete",
    deleting: "Deleting...",
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
  const { user, setUser, signout } = useAuth();

  const [currentLocale, setCurrentLocale] = useState("ko");
  const [section, setSection] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const t = T[currentLocale] || T.ko;

  // 프로필
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const locale = getStoredLocale();
    setCurrentLocale(locale);
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await authedFetch(`${BASE_URL}/users/me`, {
        method: "DELETE",
      });
      if (res.ok) {
        signout();
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const FIELDS = [
    { key: "name", label: t.name },
    { key: "phone", label: t.phone },
    { key: "email", label: t.email },
  ];

  // ── 사이드바 메뉴 ──
  const MENU = [
    { key: "profile", label: t.profile, icon: <IconProfile /> },
  ];

  const handleNav = (key) => {
    setSection(key);
    setMobileMenuOpen(false);
  };

  // ══════════════════════════════════════════════════
  return (
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
          <h1 className="mb-4 text-lg font-semibold text-[#e8d5b7]">
            The Life Recordz
          </h1>

          <nav className="">
            {MENU.map((item) =>
              item.children ? (
                <div key={item.key} className="">
                  {/* <p className="mt-5 mb-1 px-3 text-xs font-medium tracking-wider text-white/30 uppercase">
                    {item.label}
                  </p> */}
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
            {t.profile}
          </h1>
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

                {/* 계정 삭제 */}
                <div className="mt-5 border-t border-white/10 pt-5">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-400/70 transition hover:text-red-400"
                  >
                    {t.deleteAccount}
                  </button>
                </div>
              </div>

              {/* 계정 삭제 확인 모달 */}
              {showDeleteConfirm && (
                <div
                  className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <div
                    className="mx-4 w-full max-w-sm rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="mb-2 text-lg font-semibold text-[#e8d5b7]">
                      {t.deleteConfirmTitle}
                    </h3>
                    <p className="mb-5 text-sm text-[#9b8b7a]">
                      {t.deleteConfirmDesc}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-[#9b8b7a] transition hover:bg-white/5"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 rounded-lg bg-red-500/80 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-40"
                      >
                        {isDeleting ? t.deleting : t.deleteConfirm}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
