import { useState, forwardRef, useImperativeHandle } from "react";
import { Sparkles, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

const STYLE_OPTIONS = [
  { value: "진중한", label: "진중한" },
  { value: "낭만적인", label: "낭만적인" },
  { value: "재치있는", label: "재치있는" },
  { value: "신비로운", label: "신비로운" },
];

const BioEditor = forwardRef(
  ({ record_id, bio, onBioChange, initialBio }, ref) => {
    const [userName, setUserName] = useState("");
    const [keywords, setKeywords] = useState("");
    const [style, setStyle] = useState("진중한");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!bio.trim()) return;
        setIsSaving(true);
        setError("");

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(
            `${apiUrl}/api/v1/record/${record_id}/lifestory`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Dev-Key": "tlm2026",
              },
              body: JSON.stringify({
                qaList: [
                  {
                    question: "성함과 관계",
                    answer: userName,
                  },
                  {
                    question: "키워드",
                    answer: keywords,
                  },
                ],
                mood: style,
                result: bio,
              }),
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

    const handleGenerate = async () => {
      if (!userName.trim() || !keywords.trim()) return;
      setIsGenerating(true);
      setError("");

      try {
        const token = localStorage.getItem("app_token");
        const messages = [{ sender: "user", text: keywords }];

        const response = await fetch("/api/gpt-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages,
            style,
            userName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "생성에 실패했습니다");
        }

        onBioChange(data.story);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
    };

    const handleReset = () => {
      onBioChange(initialBio);
      setUserName("");
      setKeywords("");
      setError("");
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
            <Sparkles className="mr-1 inline h-3 w-3" />
            AI 생애문 생성
          </label>

          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="mb-3 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
          />

          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="키워드를 입력하세요... 예: 피아니스트, 서울, 음악을 사랑함"
            className="mb-3 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
          />

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !userName.trim() || !keywords.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> 생애문 생성
              </>
            )}
          </Button>
        </div>

        <div>
          <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
            생애문 편집
          </label>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="생애문을 직접 작성하거나 AI로 생성하세요..."
            className="min-h-[200px] resize-none border border-gray-300 bg-white leading-relaxed text-gray-900 placeholder:text-gray-400"
          />
          <p className="mt-2 text-xs text-gray-400">{bio.length}자</p>
        </div>

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

BioEditor.displayName = "BioEditor";

export default BioEditor;
