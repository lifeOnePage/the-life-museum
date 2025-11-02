"use client";
import { useState } from "react";
import AddTimelineModal from "@/app/view/[identifier]/records/components/AddTimelineModal";

export default function EditTimeline({ recordId, items, setItems, setIsSaved }) {
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
    if (confirm("이 타임라인 아이템을 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setIsSaved(false);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    setIsSaved(false);
  };

  const toggleHighlight = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHighlight: !item.isHighlight } : item
      )
    );
    setIsSaved(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">타임라인 아이템</h3>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
        >
          + 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          타임라인 아이템이 없습니다. 추가 버튼을 클릭하여 추가하세요.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-black-200 border border-white/20 rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "title", e.target.value)
                    }
                    className="text-lg font-bold w-full bg-transparent border-b border-white/30 pb-1 mb-2 focus:outline-none focus:border-white/60"
                    placeholder="제목"
                  />
                  <div className="flex gap-4 text-sm text-white/70">
                    <input
                      type="date"
                      value={
                        item.date
                          ? item.date.replace(/\./g, "-")
                          : ""
                      }
                      onChange={(e) => {
                        const dateStr = e.target.value ? e.target.value.replace(/-/g, ".") : "";
                        handleUpdateItem(item.id, "date", dateStr);
                      }}
                      className="bg-transparent border-b border-white/20 focus:outline-none focus:border-white/40 text-white/70"
                    />
                    <input
                      type="text"
                      value={item.location || ""}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "location", e.target.value)
                      }
                      className="bg-transparent border-b border-white/20 focus:outline-none focus:border-white/40"
                      placeholder="장소"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleHighlight(item.id)}
                    className={`p-2 rounded ${
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
                    className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
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
                className="w-full bg-black-300 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/40 resize-none"
                placeholder="설명을 입력하세요"
              />
              <div className="text-right text-xs text-white/60 mt-1">
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

