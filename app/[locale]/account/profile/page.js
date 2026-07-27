"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";
import { T, BASE_URL, getStoredLocale, setLocaleCookie } from "../shared";

export default function AccountProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [currentLocale, setCurrentLocale] = useState("ko");
  useEffect(() => {
    setCurrentLocale(getStoredLocale());
  }, []);
  const t = T[currentLocale] || T.ko;

  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLocaleChange = (locale) => {
    setLocaleCookie(locale);
    setCurrentLocale(locale);
    router.push(`/${locale}/account/profile`);
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
        localStorage.removeItem("app_user");
        localStorage.removeItem("access_token");
        router.push(`/${currentLocale}`);
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const FIELDS = [
    { key: "name", label: t.name },
    { key: "phone", label: t.phone },
    { key: "email", label: t.email },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#e8d5b7]">{t.profile}</h2>
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
        <div className="mt-8 border-t border-white/10 pt-5">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-400/70 underline underline-offset-2 hover:text-red-400"
          >
            {t.deleteAccount}
          </button>
        </div>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1e1a14] p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#e8d5b7]">
              {t.deleteConfirmTitle}
            </h3>
            <p className="mb-6 text-sm text-white/50">{t.deleteConfirmDesc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/60"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500/80 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? t.deleting : t.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
