"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";
import { isNativeApp } from "@/app/utils/platform";

// 파일당 업로드 상한 (presign PUT 일반 한도에 맞춤)
const MAX_FILE_BYTES = 200 * 1024 * 1024;

/**
 * 생성 모달의 "추모 앨범" 소스 섹션 —
 * [Google Photos에서 선택] / [직접 업로드] + 선택 결과 표시.
 * 두 소스는 상호 배타 (한쪽을 시작하면 다른 쪽 초기화).
 *
 * 다크 모달(#1e1a14) 톤에 맞춘 스타일.
 */
export default function MemorialSourceSection({
  picker, // useGooglePhotosPicker 인스턴스
  files,
  setFiles,
  disabled,
}) {
  const fileRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const native = isNativeApp();

  // 파일 썸네일 objectURL 관리 (revoke on change/unmount)
  useEffect(() => {
    const urls = files.map((f) =>
      f.type.startsWith("image") ? URL.createObjectURL(f) : null,
    );
    setPreviews(urls);
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [files]);

  const handleFilesChosen = (e) => {
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    if (chosen.length === 0) return;
    picker.reset(); // 상호 배타
    const valid = chosen.filter(
      (f) =>
        (f.type.startsWith("image") || f.type.startsWith("video")) &&
        f.size <= MAX_FILE_BYTES,
    );
    if (valid.length < chosen.length) {
      alert("이미지/영상 파일만, 파일당 200MB까지 올릴 수 있어요");
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MEMORIAL_MAX_MEDIA));
  };

  const startPicker = () => {
    setFiles([]); // 상호 배타
    picker.start();
  };

  const pickerBusy = ["authorizing", "creating_session", "polling", "fetching_items"].includes(
    picker.phase,
  );

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#c4b49a]">
        미디어 업로드 (최대 {MEMORIAL_MAX_MEDIA}개)
      </label>

      {/* 소스 카드 */}
      <div className="mb-3 flex gap-2">
        {!native && (
          <button
            type="button"
            disabled={disabled || pickerBusy}
            onClick={startPicker}
            className={`flex-1 rounded-lg border px-2 py-3 text-xs font-medium transition-all ${
              picker.result
                ? "border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
                : "border-white/15 text-[#9b8b7a] hover:border-white/25"
            } disabled:opacity-40`}
          >
            Google Photos에서 선택
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className={`flex-1 rounded-lg border px-2 py-3 text-xs font-medium transition-all ${
            files.length > 0
              ? "border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
              : "border-white/15 text-[#9b8b7a] hover:border-white/25"
          } disabled:opacity-40`}
        >
          <span className="inline-flex items-center gap-1">
            <ImagePlus size={13} /> 직접 업로드
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFilesChosen}
        />
      </div>

      {/* 피커 상태 */}
      {picker.phase === "authorizing" && (
        <p className="text-xs text-[#9b8b7a]">구글 계정 연결 중...</p>
      )}
      {picker.phase === "creating_session" && (
        <p className="text-xs text-[#9b8b7a]">선택 세션 준비 중...</p>
      )}
      {picker.phase === "awaiting_user" && (
        <button
          type="button"
          onClick={picker.openPicker}
          className="w-full rounded-lg bg-[#c4b49a] py-2.5 text-sm font-medium text-[#1a1510]"
        >
          Google Photos 열기
        </button>
      )}
      {picker.phase === "polling" && (
        <p className="text-xs text-[#9b8b7a]">
          구글포토 창에서 선택을 완료하면 자동으로 이어집니다...
        </p>
      )}
      {picker.phase === "fetching_items" && (
        <p className="text-xs text-[#9b8b7a]">선택 항목을 가져오는 중...</p>
      )}
      {picker.phase === "done" && picker.result && (
        <div className="flex items-center justify-between rounded-lg border border-[#c4b49a]/30 bg-[#c4b49a]/10 px-3 py-2">
          <span className="text-sm text-[#c4b49a]">
            {picker.result.items.length}개 선택됨
          </span>
          <button
            type="button"
            onClick={startPicker}
            className="text-xs text-[#9b8b7a] underline underline-offset-2"
          >
            다시 선택
          </button>
        </div>
      )}
      {picker.phase === "error" && (
        <div className="flex items-center justify-between rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2">
          <span className="text-xs text-red-300">
            {picker.error?.message || "구글포토 연결에 실패했습니다"}
          </span>
          <button
            type="button"
            onClick={startPicker}
            className="ml-2 shrink-0 text-xs text-[#c4b49a] underline underline-offset-2"
          >
            <RefreshCw size={12} className="mr-1 inline" />
            재시도
          </button>
        </div>
      )}

      {/* 업로드 파일 스트립 */}
      {files.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="relative h-14 w-14 overflow-hidden rounded-md bg-white/5"
              >
                {previews[i] ? (
                  <img
                    src={previews[i]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] text-[#9b8b7a]">
                    영상
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5"
                  aria-label="제거"
                >
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-[#9b8b7a]">
            {files.length} / {MEMORIAL_MAX_MEDIA}
          </p>
        </div>
      )}
    </div>
  );
}
