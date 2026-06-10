"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/app/utils/authedFetch";

const T = {
  ko: {
    tabNew: "새 앨범 만들기",
    tabShare: "공유 앨범 추가",
    titleLabel: "앨범 제목",
    titlePlaceholder: "비워두면 구글 포토 앨범명 사용",
    subtitleLabel: "설명",
    subtitlePlaceholder: "앨범 설명을 입력하세요",
    comingSoon: "추후 지원 예정",
    cancel: "취소",
    creating: "생성 중...",
    create: "만들기",
    shareDesc: "공유받은 전시 링크를 붙여넣으면 내 라이브러리에 앨범이 추가됩니다.",
    shareLabel: "공유 링크",
    adding: "추가 중...",
    add: "추가하기",
    errorAdd: "공유 앨범 추가에 실패했습니다.",
  },
  en: {
    tabNew: "New Album",
    tabShare: "Add Shared Album",
    titleLabel: "Album Title",
    titlePlaceholder: "Leave blank to use Google Photos album name",
    subtitleLabel: "Description",
    subtitlePlaceholder: "Enter album description",
    comingSoon: "Coming soon",
    cancel: "Cancel",
    creating: "Creating...",
    create: "Create",
    shareDesc: "Paste a shared exhibition link to add the album to your library.",
    shareLabel: "Share Link",
    adding: "Adding...",
    add: "Add",
    errorAdd: "Failed to add shared album.",
  },
};

export default function CreateAlbumModal({ onClose, onCreated, baseUrl, locale }) {
  const t = T[locale] || T.ko;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("new"); // 'new' | 'share'

  // 새 앨범 만들기 상태
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [icloudUrl, setIcloudUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 공유 앨범 추가 상태
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await authedFetch(`${baseUrl}/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          subTitle: subtitle.trim(),
          googlePhotoUrl: googlePhotoUrl.trim() || null,
          icloudUrl: icloudUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        onCreated?.(json.data);
        onClose();
        if (json.data?.id) {
          router.push(`/library/edit/${json.data.id}`);
        }
      } else {
        console.error("Failed to create album:", json.message);
      }
    } catch (err) {
      console.error("Failed to create album:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddShared = async () => {
    if (!shareUrl.trim()) return;

    setSharing(true);
    try {
      const res = await authedFetch(`${baseUrl}/record/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shareUrl.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        onCreated?.(json.data);
        onClose();
      } else {
        console.error("Failed to add shared album:", json.message || json.detail);
        alert(json.detail || json.message || t.errorAdd);
      }
    } catch (err) {
      console.error("Failed to add shared album:", err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 탭 헤더 */}
        <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === "new"
                ? "bg-white/10 text-[#e8d5b7] shadow"
                : "text-[#9b8b7a] hover:text-[#c4b49a]"
            }`}
            onClick={() => setActiveTab("new")}
          >
            {t.tabNew}
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === "share"
                ? "bg-white/10 text-[#e8d5b7] shadow"
                : "text-[#9b8b7a] hover:text-[#c4b49a]"
            }`}
            onClick={() => setActiveTab("share")}
          >
            {t.tabShare}
          </button>
        </div>

        {/* 새 앨범 만들기 탭 */}
        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                {t.titleLabel}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[#e8d5b7] placeholder-white/25 outline-none focus:border-[#c4b49a]"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                {t.subtitleLabel}
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder={t.subtitlePlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[#e8d5b7] placeholder-white/25 outline-none focus:border-[#c4b49a]"
              />
            </div>

            {/* Google Photo URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                Google Photo URL
              </label>
              <input
                type="url"
                value={googlePhotoUrl}
                onChange={(e) => setGooglePhotoUrl(e.target.value)}
                placeholder="https://photos.google.com/..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[#e8d5b7] placeholder-white/25 outline-none focus:border-[#c4b49a]"
              />
            </div>

            {/* Mybox URL (비활성화) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-white/20">
                Mybox URL
              </label>
              <input
                type="url"
                disabled
                placeholder={t.comingSoon}
                className="w-full cursor-not-allowed rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-white/20 placeholder-white/15"
              />
            </div>

            {/* iCloud URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                iCloud URL
              </label>
              <input
                type="url"
                value={icloudUrl}
                onChange={(e) => setIcloudUrl(e.target.value)}
                placeholder="https://www.icloud.com/sharedalbum/..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[#e8d5b7] placeholder-white/25 outline-none focus:border-[#c4b49a]"
              />
            </div>

            {/* 버튼 */}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 py-2 font-medium text-[#c4b49a] transition hover:bg-white/5"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#c4b49a] py-2 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
              >
                {submitting ? t.creating : t.create}
              </button>
            </div>
          </form>
        )}

        {/* 공유 앨범 추가 탭 */}
        {activeTab === "share" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#9b8b7a]">
              {t.shareDesc}
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                {t.shareLabel}
              </label>
              <input
                type="text"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                placeholder="https://.../walk/xxxxxxxx-xxxx-..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[#e8d5b7] placeholder-white/25 outline-none focus:border-[#c4b49a]"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 py-2 font-medium text-[#c4b49a] transition hover:bg-white/5"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddShared}
                disabled={sharing || !shareUrl.trim()}
                className="flex-1 rounded-lg bg-[#c4b49a] py-2 font-medium text-[#1a1510] transition hover:bg-[#e8d5b7] disabled:opacity-40"
              >
                {sharing ? t.adding : t.add}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
