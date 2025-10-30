"use client";
import { useMemo } from "react";

/** p1(x,y) → p2(x,y)로 얇은 사각형 라인 그리기 */
function Line({ p1, p2, className = "" }) {
  const style = useMemo(() => {
    if (!p1 || !p2) return { display: "none" };
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return {
      position: "absolute",
      right: `${p1.x}px`,
      top: `${p1.y}px`,
      width: `${len}px`,
      height: "2px",
      transform: `rotate(${angle}deg)`,
      transformOrigin: "0 50%",
    };
  }, [p1, p2]);

  return <div className={`bg-white/70 ${className}`} style={style} />;
}

/** 큰 카드 + 연결선 */
export default function LeftSprite({ frame, leftScreenPos }) {
  // 큰 카드의 고정 앵커(좌측 상단 + 약간 아래)
  // 핵심만: cardLeft/cardTop/cardW로 이전 위치감 그대로 조절
const cardLeft = 14;   // ← 살짝만 보정
const cardTop  = 72;   // ← 살짝만 보정
const cardW    = 300;
  const cardAnchor = { x: cardLeft + cardW, y: cardTop + 60 }; // 카드 오른쪽 중간쯤

  return (
    <>
      <div
        className="pointer-events-none absolute z-20"
        style={{ right: cardLeft, top: cardTop, width: "90vw", maxWidth: 400 }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-black-200 shadow-xl">
          {frame?.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frame.url} alt="" className="block h-auto w-full object-cover" />
          ) : (
            <div className="p-4 text-sm leading-relaxed">
              <div className="mb-2 text-white/80">{frame?.label || "카드"}</div>
              <div className="whitespace-pre-wrap text-white/95">{frame?.text || ""}</div>
            </div>
          )}
        </div>
      </div>

      {/* 라인 2개: 스프라이트 → 3D 왼쪽 썸네일 투영점 */}
      {leftScreenPos && (
        <>
          <Line p1={cardAnchor} p2={leftScreenPos} />
          <Line
            p1={{ x: cardAnchor.x - 40, y: cardAnchor.y - 30 }}
            p2={{ x: leftScreenPos.x - 20, y: leftScreenPos.y - 10 }}
            className="bg-white/40"
          />
        </>
      )}
    </>
  );
}
