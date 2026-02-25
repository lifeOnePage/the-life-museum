"use client";

import { useState } from "react";

export default function CreateAlbumModal({ onClose, onCreated, baseUrl }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    console.log("subtitle", subtitle);
    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dev-Key": "tlm2026",
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-black">새 앨범 만들기</h2>

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
      </div>
    </div>
  );
}
