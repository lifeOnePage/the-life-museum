"use client";

import { useEffect, useRef } from "react";

/**
 * 편집 화면 오른쪽 미리보기 패널용 메모리얼 프리뷰.
 * 실제 감상 페이지(/memorial/[id]?preview=1)를 iframe으로 임베드해
 * 원본 감상 인터랙션(인트로 탭 전환·미디어 링·방명록)을 그대로 제공한다.
 * 저장 전 편집 상태(제목·부제·포스터 설정·커버)는 postMessage로 실시간 주입
 * — 포스터 설정은 백엔드에 저장되지 않으므로 이 주입이 유일한 반영 경로다.
 */
export default function MemorialPreview({
  reloadKey = 0,
  albumTitle,
  albumSubtitle,
  posterStyle = "classic",
  posterTone = "dark",
  aspectRatio = "9:16",
  coverImageUrl = null,
  viewUrl = null,
}) {
  const iframeRef = useRef(null);
  const overridesRef = useRef({});
  overridesRef.current = {
    title: albumTitle ?? "",
    subtitle: albumSubtitle ?? "",
    posterStyle,
    posterTone,
    aspectRatio,
    coverImageUrl,
  };

  const postOverrides = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "tlm-memorial-preview", overrides: overridesRef.current },
      window.location.origin,
    );
  };

  // 편집 상태가 바뀔 때마다 iframe에 재전송
  useEffect(() => {
    postOverrides();
  }, [
    albumTitle,
    albumSubtitle,
    posterStyle,
    posterTone,
    aspectRatio,
    coverImageUrl,
  ]);

  // iframe 내부 앱이 마운트 완료를 알려오면 현재 상태 전송
  // (iframe onLoad 시점엔 리스너가 아직 없을 수 있어 ready 신호 기준으로 동기화)
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "tlm-memorial-preview-ready") postOverrides();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!viewUrl) return null;

  const isPortrait = aspectRatio !== "16:9";

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <div
        className="relative overflow-hidden"
        style={
          isPortrait
            ? { height: "100%", aspectRatio: "9 / 16", maxWidth: "100%" }
            : { width: "100%", aspectRatio: "16 / 9", maxHeight: "100%" }
        }
      >
        {/* key: 저장 시마다 리로드해 스토리·타임라인 등 저장 데이터 최신화 */}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={`${viewUrl}?preview=1`}
          title="추모 앨범 미리보기"
          scrolling="no"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
