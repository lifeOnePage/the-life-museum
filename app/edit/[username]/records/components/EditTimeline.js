"use client";
import { useState } from "react";
import AddTimelineModal from "@/app/view/[identifier]/records/components/AddTimelineModal";

export default function EditTimeline({
  recordId,
  items,
  setItems,
  setIsSaved,
}) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleCreateTimeline = (newItem) => {
    const timelineItem = {
      id: newItem.id || Date.now(),
      title: newItem.event || newItem.title || "",
      date: newItem.date || "",
      location: newItem.location || "",
      description: newItem.desc || "",
      coverUrl: newItem.cover || "",
      isHighlight: newItem.isHighlight || false,
      color: "",
    };
    setItems((prev) => [...prev, timelineItem]);
    setIsSaved(false);
    setAddModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    if (
      confirm(
        "해당 이벤트를 삭제하시겠습니까? 삭제한 내용은 복구할 수 없습니다.",
      )
    ) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setIsSaved(false);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
    setIsSaved(false);
  };

  const toggleHighlight = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHighlight: !item.isHighlight } : item,
      ),
    );
    setIsSaved(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">타임라인 아이템</h3>
        <button
          onClick={() => setAddModalOpen(true)}
          className="rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-white/90"
        >
          + 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-white/60">
          타임라인 아이템이 없습니다. 추가 버튼을 클릭하여 추가하세요.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-black-200 rounded-lg border border-white/20 p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "title", e.target.value)
                    }
                    className="mb-2 w-full border-b border-white/30 bg-transparent pb-1 text-lg font-bold focus:border-white/60 focus:outline-none"
                    placeholder="제목"
                  />
                  <div className="flex gap-4 text-sm text-white/70">
                    <input
                      type="date"
                      value={item.date ? item.date.replace(/\./g, "-") : ""}
                      onChange={(e) => {
                        const dateStr = e.target.value
                          ? e.target.value.replace(/-/g, ".")
                          : "";
                        handleUpdateItem(item.id, "date", dateStr);
                      }}
                      className="border-b border-white/20 bg-transparent text-white/70 focus:border-white/40 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.location || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "location", e.target.value)
                      }
                      className="border-b border-white/20 bg-transparent focus:border-white/40 focus:outline-none"
                      placeholder="장소"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleHighlight(item.id)}
                    className={`rounded p-2 ${
                      item.isHighlight
                        ? "bg-yellow-500/30 text-yellow-500"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    title="하이라이트"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="rounded bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <textarea
                value={item.description || ""}
                onChange={(e) =>
                  handleUpdateItem(item.id, "description", e.target.value)
                }
                rows={3}
                maxLength={150}
                className="bg-black-300 w-full resize-none rounded border border-white/20 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
                placeholder="설명을 입력하세요"
              />
              <div className="mt-1 text-right text-xs text-white/60">
                {(item.description || "").length}/150
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTimelineModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreate={handleCreateTimeline}
      />
    </div>
  );
}
