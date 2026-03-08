"use client";

import { useState } from "react";

export default function CreateAlbumModal({ onClose, onCreated, baseUrl, token }) {
  const [activeTab, setActiveTab] = useState("new"); // 'new' | 'share'

  // 새 앨범 만들기 상태
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 공유 앨범 추가 상태
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          subTitle: subtitle.trim(),
          googlePhotoUrl: googlePhotoUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        onCreated?.(json.data);
        onClose();
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
      const res = await fetch(`${baseUrl}/record/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: shareUrl.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        onCreated?.(json.data);
        onClose();
      } else {
        console.error("Failed to add shared album:", json.message || json.detail);
        alert(json.detail || json.message || "공유 앨범 추가에 실패했습니다.");
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
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 탭 헤더 */}
        <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === "new"
                ? "bg-white text-black shadow"
                : "text-black/50 hover:text-black"
            }`}
            onClick={() => setActiveTab("new")}
          >
            새 앨범 만들기
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === "share"
                ? "bg-white text-black shadow"
                : "text-black/50 hover:text-black"
            }`}
            onClick={() => setActiveTab("share")}
          >
            공유 앨범 추가
          </button>
        </div>

        {/* 새 앨범 만들기 탭 */}
        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                앨범 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="앨범 제목을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-black"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                설명
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="앨범 설명을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-black"
              />
            </div>

            {/* Google Photo URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                Google Photo URL
              </label>
              <input
                type="url"
                value={googlePhotoUrl}
                onChange={(e) => setGooglePhotoUrl(e.target.value)}
                placeholder="https://photos.google.com/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-black"
              />
            </div>

            {/* Mybox URL (비활성화) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-black/40">
                Mybox URL
              </label>
              <input
                type="url"
                disabled
                placeholder="추후 지원 예정"
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-black/30"
              />
            </div>

            {/* iCloud URL (비활성화) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-black/40">
                iCloud URL
              </label>
              <input
                type="url"
                disabled
                placeholder="추후 지원 예정"
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-black/30"
              />
            </div>

            {/* 버튼 */}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-black transition hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="flex-1 rounded-lg bg-black py-2 font-medium text-white transition hover:bg-black/80 disabled:opacity-40"
              >
                {submitting ? "생성 중..." : "만들기"}
              </button>
            </div>
          </form>
        )}

        {/* 공유 앨범 추가 탭 */}
        {activeTab === "share" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-black/60">
              공유받은 전시 링크를 붙여넣으면 내 라이브러리에 앨범이 추가됩니다.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                공유 링크
              </label>
              <input
                type="text"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                placeholder="https://.../walk/xxxxxxxx-xxxx-..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-black"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-black transition hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleAddShared}
                disabled={sharing || !shareUrl.trim()}
                className="flex-1 rounded-lg bg-black py-2 font-medium text-white transition hover:bg-black/80 disabled:opacity-40"
              >
                {sharing ? "추가 중..." : "추가하기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
