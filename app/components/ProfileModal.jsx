"use client";

import { Fragment, useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const TABS = [
  { key: "profile", label: "프로필" },
  { key: "plan", label: "Plan" },
];

const FIELDS = [
  { key: "name", label: "이름" },
  { key: "phone", label: "전화번호" },
  { key: "email", label: "Email" },
];

function getStoredLocale() {
  if (typeof window === "undefined") return "ko";
  return localStorage.getItem("NEXT_LOCALE") || "ko";
}

function setLocaleCookie(locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem("NEXT_LOCALE", locale);
}

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("ko");

  useEffect(() => {
    setCurrentLocale(getStoredLocale());
  }, []);

  const handleLocaleChange = (locale) => {
    setLocaleCookie(locale);
    setCurrentLocale(locale);
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
          <h2 className="text-lg font-semibold text-[#e8d5b7]">프로필</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-[#e8d5b7]"
            aria-label="닫기"
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
                    <option value="ko" style={{ background: "#1e1a14" }}>한국어</option>
                    <option value="en" style={{ background: "#1e1a14" }}>English</option>
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
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-[#c4b49a] px-4 py-2 text-sm text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
                    >
                      {saving ? "저장 중..." : "저장"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleEdit}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#c4b49a] transition hover:bg-white/5"
                    >
                      편집
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div className="py-2">
              <div className="space-y-3">
                <div className="h-5 w-1/3 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
                <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-white/5" />
              </div>
              <p className="mt-6 text-center text-sm text-white/30">
                지원 예정입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
