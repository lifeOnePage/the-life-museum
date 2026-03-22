import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const TimelineEditor = forwardRef(
  ({ record_id, timeline, onTimelineChange, initialTimeline }, ref) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (timeline.length === 0) return;
        setIsSaving(true);
        setError("");

        try {
          const apiUrl =
            "https://the-life-museum-backend-production.up.railway.app";

          const events = timeline.map((item) => {
            const [title, ...descParts] = item.event.split(" - ");
            const description = descParts.join(" - ");
            const timestamp = item.year ? item.year : null;

            return {
              title: title || "",
              timestamp,
              description: description || "",
            };
          });

          const response = await fetch(
            `${apiUrl}/api/v1/record/${record_id}/timeline`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("app_token")}`,
              },
              body: JSON.stringify({ events }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "저장에 실패했습니다");
          }

          return data;
        } catch (err) {
          setError(err.message);
          throw err;
        } finally {
          setIsSaving(false);
        }
      },
    }));

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

    const handleReset = () => {
      onTimelineChange(initialTimeline ? [...initialTimeline] : []);
      setError("");
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
            <p className="text-sm text-gray-400">
              타임라인 항목을 추가해보세요
            </p>
            <p className="mt-1 text-xs text-gray-300">
              주요 사건과 연도를 기록합니다
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" /> 저장 중...
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> 초기화
          </Button>
        </div>
      </div>
    );
  },
);

TimelineEditor.displayName = "TimelineEditor";

export default TimelineEditor;
