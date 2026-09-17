"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";
import { getProxiedUrl } from "@/app/lib/proxy";
import MediaMultiSelectGrid from "./MediaMultiSelectGrid";
import CreationProgressPanel from "./CreationProgressPanel";
import { useMemorialCreate } from "./useMemorialCreate";

const T = {
  ko: {
    title: "추모 앨범으로 전환",
    subtitle:
      "고인의 삶을 기리는 추모 앨범을 새로 만듭니다. 링크로 연결된 사진은 시간이 지나면 볼 수 없게 될 수 있으니, 오래 간직하고 싶은 사진을 골라 안전하게 보존해 드려요.",
    creditNotice: "원본 앨범은 그대로 유지되며, 앨범 생성권 1개가 사용됩니다.",
    selected: "선택",
    selectedTitle: "선택한 사진",
    emptySelected: "아직 선택한 사진이 없어요. 사진 목록에서 골라주세요.",
    deselectHint: "사진을 누르면 선택이 해제됩니다",
    submit: "추모 앨범 만들기",
    empty: "불러올 사진이 없습니다. 앨범 저장소 연결을 확인해주세요.",
    loading: "앨범 사진을 불러오는 중...",
  },
  en: {
    title: "Convert to Memorial Album",
    subtitle:
      "Create a new memorial album honoring their life. Linked photos may expire over time, so pick the ones you want to keep and we'll preserve them safely.",
    creditNotice: "Your original album stays untouched. Uses 1 album credit.",
    selected: "selected",
    selectedTitle: "Selected photos",
    emptySelected: "Nothing selected yet. Pick photos from the list.",
    deselectHint: "Tap a photo to deselect it",
    submit: "Create Memorial Album",
    empty: "No photos available. Check the album source connection.",
    loading: "Loading album photos...",
  },
};

// 선택된 미디어 그리드 — 데스크탑 좌측 패널과 모바일 바텀시트가 공유.
// 타일을 누르면 선택 해제된다.
function SelectedMediaGrid({ items, onDeselect, disabled, gridClass }) {
  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {items.map((media, i) => {
        const key = media.original_url;
        return (
          <button
            key={key || i}
            type="button"
            disabled={disabled}
            onClick={() => onDeselect(media, key)}
            className="group relative aspect-square overflow-hidden rounded-md bg-black/10"
          >
            <img
              src={getProxiedUrl(media.thumbnail_url || media.original_url)}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3E5A81] text-[10px] font-semibold text-white">
              {i + 1}
            </span>
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white transition-colors group-hover:bg-black/75">
              <X size={11} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * 기존 앨범 → 추모 앨범 전환 모달.
 * 좌우 이분할: 왼쪽은 선택된 미디어(누르면 해제), 오른쪽은 전체 미디어.
 * lg 미만 뷰포트에서는 선택된 미디어가 접을 수 있는 바텀시트로 표시된다.
 */
export default function MemorialConvertModal({
  open,
  onClose,
  recordId,
  albumTitle,
  albumSubtitle,
  photoMedia = [],
  isLoading = false,
  onRefresh,
  locale = "ko",
}) {
  const t = T[locale] || T.ko;
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(true);
  const { phase, progress, error, timedOut, busy, convert } =
    useMemorialCreate();

  // is_cover(대표사진 중복) 제외 — 감상 화면들과 동일 기준
  const items = useMemo(
    () => photoMedia.filter((m) => !m.is_cover),
    [photoMedia],
  );
  const byKey = useMemo(
    () => new Map(items.map((m) => [m.original_url, m])),
    [items],
  );
  const selectedItems = useMemo(
    () => selectedKeys.map((k) => byKey.get(k)).filter(Boolean),
    [selectedKeys, byKey],
  );

  const handleToggle = (media, key) => {
    setSelectedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length >= MEMORIAL_MAX_MEDIA
          ? prev
          : [...prev, key],
    );
  };

  const handleSubmit = async () => {
    const selectedPayload = selectedItems.map((m) => ({
      url: m.original_url,
      thumbnailUrl: m.thumbnail_url || null,
      type: m.type,
    }));
    try {
      const newRecord = await convert({
        sourceRecordId: recordId,
        title: albumTitle,
        subTitle: albumSubtitle,
        items: selectedPayload,
      });
      if (newRecord) {
        router.push(`/library/edit/${newRecord.id}`);
      }
    } catch {
      // 에러는 훅의 error 상태로 표시됨
    }
  };

  const handleClose = () => {
    if (busy) {
      const ok = window.confirm(
        "앨범을 만드는 중이에요. 창을 닫아도 생성은 계속됩니다. 닫을까요?",
      );
      if (!ok) return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#f7f4ef] text-[#1a1510]"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="font-serif text-xl font-medium tracking-wide">
                {t.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-black/70">
                {t.subtitle}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-black/55">
                {t.creditNotice}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={busy}
                  className="rounded-full p-2 text-black/50 hover:bg-black/5"
                  aria-label="새로고침"
                >
                  <RefreshCw size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-black/50 hover:bg-black/5"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 본문: 좌(선택된 미디어) / 우(전체 미디어) 이분할 */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* 데스크탑 좌측 패널 — lg 미만에서는 바텀시트로 대체 */}
            <aside className="hidden w-80 shrink-0 flex-col border-r border-black/10 bg-black/[0.03] lg:flex">
              <div className="px-4 pt-4 pb-2">
                <p className="text-sm font-medium">
                  {t.selectedTitle}{" "}
                  <span className="text-black/50">
                    {selectedKeys.length} / {MEMORIAL_MAX_MEDIA}
                  </span>
                </p>
                {selectedItems.length > 0 && (
                  <p className="mt-0.5 text-[11px] text-black/45">
                    {t.deselectHint}
                  </p>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                {selectedItems.length === 0 ? (
                  <p className="py-10 text-center text-xs leading-relaxed text-black/40">
                    {t.emptySelected}
                  </p>
                ) : (
                  <SelectedMediaGrid
                    items={selectedItems}
                    onDeselect={handleToggle}
                    disabled={busy}
                    gridClass="grid-cols-3"
                  />
                )}
              </div>
            </aside>

            {/* 전체 미디어 */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <p className="py-16 text-center text-sm text-black/50">
                  {t.loading}
                </p>
              ) : items.length === 0 ? (
                <p className="py-16 text-center text-sm text-black/50">
                  {t.empty}
                </p>
              ) : (
                <MediaMultiSelectGrid
                  items={items}
                  selectedKeys={selectedKeys}
                  onToggle={handleToggle}
                  disabled={busy}
                />
              )}
              {error && (
                <p className="mt-4 text-center text-sm text-red-500">{error}</p>
              )}
              <CreationProgressPanel
                phase={phase}
                progress={progress}
                timedOut={timedOut}
              />
            </div>
          </div>

          {/* 모바일 바텀시트: 선택된 미디어 그리드 (스크롤 가능, 접기 지원) */}
          {selectedItems.length > 0 && (
            <div className="rounded-t-2xl border-t border-black/10 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
              <button
                type="button"
                onClick={() => setSheetOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-3"
              >
                <span className="text-sm font-medium">
                  {t.selectedTitle}{" "}
                  <span className="text-black/50">
                    {selectedKeys.length} / {MEMORIAL_MAX_MEDIA}
                  </span>
                </span>
                {sheetOpen ? (
                  <ChevronDown size={16} className="text-black/50" />
                ) : (
                  <ChevronUp size={16} className="text-black/50" />
                )}
              </button>
              {sheetOpen && (
                <div className="max-h-[30vh] overflow-y-auto px-5 pb-4">
                  <p className="mb-2 text-[11px] text-black/45">
                    {t.deselectHint}
                  </p>
                  <SelectedMediaGrid
                    items={selectedItems}
                    onDeselect={handleToggle}
                    disabled={busy}
                    gridClass="grid-cols-4 sm:grid-cols-6"
                  />
                </div>
              )}
            </div>
          )}

          {/* 스티키 푸터 */}
          <div className="border-t border-black/10 bg-[#f7f4ef] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-black/60">
                {selectedKeys.length} / {MEMORIAL_MAX_MEDIA} {t.selected}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedKeys.length === 0 || busy}
                className="rounded-full bg-[#1a1510] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {busy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" />
                ) : (
                  t.submit
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
