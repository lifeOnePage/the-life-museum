"use client";
import { useState } from "react";

export default function EditRecordInfo({ record, setRecord, setIsSaved }) {
  const [formData, setFormData] = useState({
    name: record?.name || "",
    subName: record?.subName || "",
    description: record?.description || "",
    color: record?.color || "#121212",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
    setRecord((prev) => ({ ...prev, [field]: value }));
  };

  const BG_THEME_PALETTE = [
    { name: "Coal", bg: "#121212", text: "#F2F2F2" },
    { name: "Rose", bg: "#aa747dff", text: "#ffffffff" },
    { name: "Olive", bg: "#7B7341", text: "#f2f2f2ff" },
    { name: "Warm Gray", bg: "#746F6F", text: "#F2F2F2" },
    { name: "Blue", bg: "#6C8E98", text: "#F2F2F2" },
    { name: "BlackPink", bg: "#12121268", text: "#aa747dff" },
    { name: "Parchment", bg: "#F5F1E6", text: "#111111" },
    { name: "Cloud", bg: "#ECECEC", text: "#111111" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">레코드 이름</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full px-4 py-2 bg-black-200 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          placeholder="레코드 이름을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">서브 타이틀</label>
        <input
          type="text"
          value={formData.subName}
          onChange={(e) => handleChange("subName", e.target.value)}
          className="w-full px-4 py-2 bg-black-200 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          placeholder="서브 타이틀을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={6}
          maxLength={300}
          className="w-full px-4 py-2 bg-black-200 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
          placeholder="레코드에 대한 설명을 입력하세요"
        />
        <div className="text-right text-xs text-white/60 mt-1">
          {formData.description.length}/300
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">배경 테마</label>
        <div className="grid grid-cols-4 gap-3">
          {BG_THEME_PALETTE.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => handleChange("color", theme.bg)}
              className={`aspect-square rounded-lg border-2 transition-all ${
                formData.color === theme.bg
                  ? "border-white scale-110"
                  : "border-white/30 hover:border-white/60"
              }`}
              style={{
                background: theme.bg,
                color: theme.text,
              }}
              title={theme.name}
            >
              A
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

