import { useState, forwardRef, useImperativeHandle } from "react";
import { Sparkles, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { authedFetch } from "@/app/utils/authedFetch";

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
          const apiUrl =
            "https://the-life-museum-backend-production.up.railway.app";
          const response = await authedFetch(
            `${apiUrl}/api/v1/record/${record_id}/lifestory`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
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
        const messages = [{ sender: "user", text: keywords }];
        const response = await authedFetch("/api/gpt-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          <label className="mb-2 block text-xs tracking-widest text-[#9b8b7a] uppercase">
            <Sparkles className="mr-1 inline h-3 w-3" />
            AI 생애문 생성
          </label>

          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="mb-3 border border-white/10 bg-[#2e2720] text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
          />

          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="키워드를 입력하세요... 예: 피아니스트, 서울, 음악을 사랑함"
            className="mb-3 border border-white/10 bg-[#2e2720] text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
          />

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="mb-3 w-full rounded-md border border-white/10 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7]"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

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
          <label className="mb-2 block text-xs tracking-widest text-[#9b8b7a] uppercase">
            생애문 편집
          </label>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            maxLength={250}
            placeholder="우리의 첫만남은 따뜻한 봄날이었다. 그때의 미소와 설렘은 지금도 잊히지 않는다. 사랑은 일상의 작은 순간들 속에서 자라났고, 함께한 계절마다 우리만의 추억이 쌓여갔다."
            className="min-h-[200px] resize-none border border-white/10 bg-[#2e2720] leading-relaxed text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
          />
          <p className="mt-2 text-xs text-[#9b8b7a]">{bio.length} / 250자</p>
        </div>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-[#9b8b7a]">
            <RefreshCw className="h-4 w-4 animate-spin" /> 저장 중...
          </div>
        )}

        <div className="border-t border-white/10 pt-6">
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> 초기화
          </Button>
        </div>
      </div>
    );
  },
);

BioEditor.displayName = "BioEditor";

export default BioEditor;
