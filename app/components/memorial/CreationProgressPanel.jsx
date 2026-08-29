"use client";

// 추모 앨범 생성/전환 진행 상태 패널 — 생성 모달과 전환 모달이 공유.
export default function CreationProgressPanel({ phase, progress, timedOut }) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  let message = "앨범을 만들고 있어요...";
  let detail = null;
  if (phase === "uploading") {
    message = "사진을 업로드하는 중이에요";
    if (progress?.total) detail = `${progress.uploaded} / ${progress.total}`;
  } else if (phase === "registering") {
    message = "미디어를 등록하는 중이에요";
  } else if (phase === "processing") {
    message = "사진을 안전하게 옮기는 중이에요 — 잠시만 기다려주세요";
    if (progress?.total) {
      detail = `${progress.ready ?? 0} / ${progress.total}`;
      if (progress.failed > 0) detail += ` (실패 ${progress.failed})`;
    }
  }

  const pct =
    progress?.total > 0
      ? Math.round(
          (((phase === "uploading" ? progress.uploaded : progress.ready) ?? 0) /
            progress.total) *
            100,
        )
      : null;

  return (
    <div className="mt-4 rounded-lg border border-black/10 bg-black/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
        <div className="min-w-0 flex-1">
          <p className="text-sm">{message}</p>
          {detail && <p className="mt-0.5 text-xs opacity-60">{detail}</p>}
        </div>
      </div>
      {pct != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#3E5A81] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {timedOut && (
        <p className="mt-2 text-xs opacity-60">
          시간이 걸리고 있어요 — 백그라운드에서 계속 진행됩니다
        </p>
      )}
    </div>
  );
}
