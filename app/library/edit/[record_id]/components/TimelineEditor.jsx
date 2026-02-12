import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Save, X, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const TimelineEditor = ({ timeline, onTimelineChange, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const addItem = () => {
    onTimelineChange([...timeline, { year: "", event: "" }]);
  };

  const updateItem = (index, field, value) => {
    const updated = timeline.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onTimelineChange(updated);
  };

  const removeItem = (index) => {
    onTimelineChange(timeline.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (timeline.length === 0) return;
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("app_token");
      const recordId = localStorage.getItem("record_id");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/record/${recordId}/timeline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ timeline }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다");
      }

      onSave?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onTimelineChange([]);
    setError("");
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-widest text-gray-500 uppercase">
          타임라인 항목
        </label>
        <span className="text-xs text-gray-400">{timeline.length}개</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-start gap-2"
            >
              <div className="cursor-grab pt-2.5 text-gray-300">
                <GripVertical className="h-4 w-4" />
              </div>
              <Input
                value={item.year}
                onChange={(e) => updateItem(index, "year", e.target.value)}
                placeholder="연도"
                className="w-24 border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400"
              />
              <Input
                value={item.event}
                onChange={(e) => updateItem(index, "event", e.target.value)}
                placeholder="사건을 입력하세요..."
                className="flex-1 border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        onClick={addItem}
        variant="outline"
        className="w-full border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900"
      >
        <Plus className="mr-2 h-4 w-4" /> 항목 추가
      </Button>

      {timeline.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">타임라인 항목을 추가해보세요</p>
          <p className="mt-1 text-xs text-gray-300">
            주요 사건과 연도를 기록합니다
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 border-t border-gray-200 pt-6">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="flex-1 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900"
        >
          <X className="mr-2 h-4 w-4" /> 취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || timeline.length === 0}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 저장
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TimelineEditor;
