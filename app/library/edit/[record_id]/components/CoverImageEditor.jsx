import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, RefreshCw, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const CoverImageEditor = ({
  onImageGenerated,
  onTitleChange,
  onArtistChange,
  albumTitle,
  artistName,
  frontCover,
  onSave,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const placeholders = [
        "../images/gif/1.gif",
        "../images/gif/2.gif",
        "../images/gif/3.gif",
      ];
      setGeneratedImages(placeholders);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!frontCover && !albumTitle.trim()) return;
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("app_token");
      const recordId = localStorage.getItem("record_id");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/record/${recordId}/cover/temp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coverImage: frontCover,
            albumTitle,
            artistName,
          }),
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
    onImageGenerated(null);
    onTitleChange("");
    onArtistChange("");
    setPrompt("");
    setGeneratedImages([]);
    setError("");
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
          앨범 제목
        </label>
        <Input
          value={albumTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="앨범 제목을 입력하세요"
          className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* <div>
        <label className="text-muted-foreground mb-2 block text-xs tracking-widest uppercase">
          아티스트 이름
        </label>
        <Input
          value={artistName}
          onChange={(e) => onArtistChange(e.target.value)}
          placeholder="아티스트 이름을 입력하세요"
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50"
        />
      </div> */}

      <div>
        <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
          <Sparkles className="mr-1 inline h-3 w-3" />
          AI 커버 이미지 생성
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="원하는 커버 이미지를 설명하세요... 예: 밤하늘 아래 피아노가 있는 풍경"
          className="min-h-20 resize-none border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="mt-3 w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> 이미지 생성
            </>
          )}
        </Button>
      </div>

      {generatedImages.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="mb-3 block text-xs tracking-widest text-gray-500 uppercase">
            생성된 이미지 선택
          </label>
          <div className="grid grid-cols-3 gap-3">
            {generatedImages.map((img, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onImageGenerated(img)}
                className="aspect-square overflow-hidden border-2 border-transparent transition-colors hover:border-gray-900"
              >
                <img
                  src={img}
                  alt={`생성 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
          <Upload className="mr-1 inline h-3 w-3" />
          직접 업로드
        </label>
        <label className="flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                onImageGenerated(url);
              }
            }}
          />
          <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
        </label>
      </div>

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
          disabled={isSaving || (!frontCover && !albumTitle.trim())}
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

export default CoverImageEditor;
