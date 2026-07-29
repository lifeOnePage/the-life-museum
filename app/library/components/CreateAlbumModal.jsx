"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/app/utils/authedFetch";
import { useAuth } from "@/app/contexts/AuthContext";

const T = {
  ko: {
    tabNew: "새 앨범 만들기",
    tabShare: "공유 앨범 추가",
    titleLabel: "앨범 제목 (선택)",
    titlePlaceholder: "ex. 우리 가족의 국내여행",
    subtitleLabel: "부제목 (선택)",
    subtitlePlaceholder: "ex. 2026년 3월 2일",
    photoStorage: "사진 저장소",
    comingSoon: "추후 지원 예정",
    cancel: "취소",
    creating: "생성 중...",
    create: "만들기",
    shareDesc:
      "공유받은 더라이프메모리 링크를 붙여넣으면 내 라이브러리에 앨범이 추가됩니다.",
    shareLabel: "공유 링크",
    adding: "추가 중...",
    add: "추가하기",
    errorAdd: "공유 앨범 추가에 실패했습니다.",
    firstFree: "첫 앨범은 30일간 무료로 체험할 수 있어요",
    insufficient: "앨범을 만들려면 결제가 필요해요.",
    buyCredits: "결제하러 가기",
  },
  en: {
    tabNew: "New Album",
    tabShare: "Add Shared Album",
    titleLabel: "Album Title",
    titlePlaceholder: "Leave blank to use Google Photos album name",
    subtitleLabel: "SubTitle",
    subtitlePlaceholder: "Enter album description",
    photoStorage: "Photo Storage",
    comingSoon: "Coming soon",
    cancel: "Cancel",
    creating: "Creating...",
    create: "Create",
    shareDesc:
      "Paste a shared TheLifeMemory link to add the album to your library.",
    shareLabel: "Share Link",
    adding: "Adding...",
    add: "Add",
    errorAdd: "Failed to add shared album.",
    firstFree: "Your first album gets a free 30-day trial",
    insufficient: "Payment is required to create an album.",
    buyCredits: "Proceed to payment",
  },
};

// 사진 저장소 종류 (edit 페이지의 사진 저장소 입력 구조와 통일)
const URL_TYPES = [
  { key: "google", label: "Google Photo" },
  { key: "drive", label: "Google Drive" },
  { key: "icloud", label: "iCloud" },
  { key: "mybox", label: "Mybox" },
];

const URL_PLACEHOLDERS = {
  google: "https://photos.google.com/...",
  drive: "https://drive.google.com/drive/folders/...",
  icloud: "https://www.icloud.com/sharedalbum/...",
};

export default function CreateAlbumModal({
  onClose,
  onCreated,
  baseUrl,
  locale,
}) {
  const t = T[locale] || T.ko;
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new"); // 'new' | 'share'

  // 첫 앨범(체험 미사용)은 무료, 이후는 결제된 생성권 1개 소모.
  // (잔액 자체는 화면에 노출하지 않고, 생성 가능 여부만 판단해 결제 유도로 분기)
  const remainingSlots = user?.credits ?? 0;
  const isFirstFree = !(user?.free_trial_used ?? false);
  const canAfford = isFirstFree || remainingSlots >= 1;

  // 새 앨범 만들기 상태
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  // 사진 저장소: 종류 선택 + 단일 URL 입력 (edit 페이지와 동일 구조)
  const [selectedUrlType, setSelectedUrlType] = useState("google");
  const [urlValue, setUrlValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 공유 앨범 추가 상태
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 생성권 부족(무료 대상 아님) 시 생성 대신 결제 페이지로
    if (!canAfford) {
      router.push(`/${locale}/account/purchase`);
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      // 선택된 저장소 종류에 맞는 필드에만 URL 매핑 (Mybox는 추후 지원)
      const url = urlValue.trim();
      const res = await authedFetch(`${baseUrl}/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          subTitle: subtitle.trim(),
          googlePhotoUrl: selectedUrlType === "google" ? url || null : null,
          googleDriveUrl: selectedUrlType === "drive" ? url || null : null,
          icloudUrl: selectedUrlType === "icloud" ? url || null : null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail || errData.message || `Error ${res.status}`;
        alert(msg);
        return;
      }
      const json = await res.json();
      if (json.ok) {
        onCreated?.(json.data);
        onClose();
        if (json.data?.id) {
          router.push(`/library/edit/${json.data.id}`);
        }
      } else {
        alert(json.message || json.detail || "Failed to create album");
      }
    } catch (err) {
      console.error("Failed to create album:", err);
      alert(err.message || "Network error");
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
        console.error(
          "Failed to add shared album:",
          json.message || json.detail,
        );
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
        className="mx-4 w-full max-w-md rounded-2xl bg-[#1e1a14] p-6 shadow-xl ring-1 ring-white/10"
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
            {/* 사진 저장소: 종류 선택 + 단일 URL 입력 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
                {t.photoStorage}
              </label>
              <div className="mb-3 flex gap-2">
                {URL_TYPES.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedUrlType(opt.key)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                      selectedUrlType === opt.key
                        ? "border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
                        : "border-white/15 text-[#9b8b7a] hover:border-white/25"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={selectedUrlType === "mybox" ? "" : urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                disabled={selectedUrlType === "mybox"}
                placeholder={URL_PLACEHOLDERS[selectedUrlType] || t.comingSoon}
                className={`w-full rounded-lg border px-3 py-2 placeholder-white/25 outline-none focus:border-[#c4b49a] ${
                  selectedUrlType === "mybox"
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
                    : "border-white/10 bg-white/5 text-[#e8d5b7]"
                }`}
              />
            </div>
            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-normal text-[#9b8b7a]">
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
              <label className="mb-1 block text-sm font-normal text-[#9b8b7a]">
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

            {isFirstFree && (
              <div className="rounded-xl border border-[#c4b49a]/30 bg-[#c4b49a]/10 p-3 text-center text-sm text-[#c4b49a]">
                {t.firstFree}
              </div>
            )}
            {!canAfford && (
              <p className="text-center text-xs text-red-400">
                {t.insufficient}
              </p>
            )}

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
                {submitting
                  ? t.creating
                  : !canAfford
                    ? t.buyCredits
                    : t.create}
              </button>
            </div>
          </form>
        )}

        {/* 공유 앨범 추가 탭 */}
        {activeTab === "share" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#9b8b7a]">{t.shareDesc}</p>
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
