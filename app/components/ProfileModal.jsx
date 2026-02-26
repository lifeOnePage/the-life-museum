"use client";

import { Fragment, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

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

export default function ProfileModal({ onClose }) {
  const { user, token, setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

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
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-xl sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-black">프로필</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition hover:bg-gray-100 hover:text-black"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`mr-6 -mb-px border-b-2 py-3 text-sm font-medium transition ${
                tab === key
                  ? "border-black text-black"
                  : "border-transparent text-black/40 hover:text-black/70"
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
                    <span className="self-center text-sm font-medium text-black/50">
                      {label}
                    </span>
                    {isEdit ? (
                      <input
                        type="text"
                        value={draft[key]}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [key]: e.target.value }))
                        }
                        className="border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-black"
                      />
                    ) : (
                      <span className="self-center text-sm text-black">
                        {user?.[key] || "-"}
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>

              {/* 버튼 */}
              <div className="mt-6 flex justify-end gap-2">
                {isEdit ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-black/80 disabled:opacity-40"
                    >
                      {saving ? "저장 중..." : "저장"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-50"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleEdit}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-50"
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
                <div className="h-5 w-1/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-gray-100" />
              </div>
              <p className="mt-6 text-center text-sm text-black/40">
                지원 예정입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
