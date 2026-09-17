"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { fetchGuestbook, postGuestbookEntry, FLOWER_TYPES } from "./guestbookApi";
import {
  SCENE_W,
  SCENE_H,
  SCENE_ASSETS,
  getFlowerAsset,
} from "./guestbookAssets";
import FlowerPot from "./FlowerPot";
import GuestbookSheet from "./GuestbookSheet";
import GuestbookListSheet from "./GuestbookListSheet";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

// ── 장면 좌표계 ───────────────────────────────────────────────────────────
// 목업(941×1672) 캔버스를 "스테이지"로 삼고, 모든 요소를 스테이지 % 로 배치한다.
// 스테이지는 뷰포트 안에서 가로를 꽉 채우되(세로로 긴 폰), 너무 길면 위아래를
// LETTERBOX 만큼만 잘라 여백은 블러 배경으로 메운다. 가로가 넓은 화면은 세로 맞춤.
const LETTERBOX = 0.86;

// 바닥 빛 링(ring.webp)의 타원 — 화분은 이 선 위에 앉는다
const RING_CX = 50;
const RING_CY = 60.8;
const RING_RX = 45.3;
const RING_RY = 6.0;

// 검은 프레임(사진 자리) — 목업 기준 위치·크기
const FRAME_TOP = 29.3;
const FRAME_W = 26.2;
const FRAME_ASPECT = "4 / 7";

// 정면 화분(scale 1)의 화분 몸통 폭 — 스테이지 폭 대비
const POT_WIDTH_RATIO = 0.052;

// 화분 슬롯 — 정면(90°) 은 방문자 몫(reserved). 채움 순서는 정면 양옆부터
// 좌우 번갈아 뒤로 퍼지며, 뒤로 갈수록 작아져 원근감을 준다.
const SLOT_OFFSETS = [0, 40, -40, 66, -66, 92, -92, 118, -118, 146, -146];
const SLOTS = SLOT_OFFSETS.map((off, k) => {
  const a = ((90 + off) * Math.PI) / 180;
  const depth = (Math.sin(a) + 1) / 2; // 1=정면, 0=뒤
  return {
    left: RING_CX + RING_RX * Math.cos(a),
    top: RING_CY + RING_RY * Math.sin(a),
    scale: 0.5 + 0.5 * depth,
    reserved: k === 0,
  };
});
const OPEN_SLOTS = SLOTS.filter((s) => !s.reserved);

// 컨테이너 크기에서 스테이지 사각형(px) 계산
function useStageRect(ref) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      const scale =
        W / H < SCENE_W / SCENE_H
          ? Math.max(W / SCENE_W, (H * LETTERBOX) / SCENE_H)
          : H / SCENE_H;
      const width = SCENE_W * scale;
      const height = SCENE_H * scale;
      setRect({
        width,
        height,
        left: (W - width) / 2,
        top: (H - height) / 2,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return rect;
}

/**
 * "방명록" 탭 — 추모 공간 장면(노을 배경 + 추모객 실루엣 + 빛 링 + 사진 프레임 +
 * 화분들) + 작성/목록 바텀시트.
 * 제출 인터랙션: 시트 하강 → 선택한 꽃이 떠오르며 페이드아웃 → 정면의 빈 자리에
 * 그 꽃의 화분이 페이드인 → 안내 문구 갱신.
 */
export default function GuestbookTab({ recordId, profileItem, tone = "dark" }) {
  const rootRef = useRef(null);
  const stage = useStageRect(rootRef);

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState("loading"); // loading | error | ready
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // idle → flying(꽃 상승·페이드아웃) → revealing(화분 페이드인) → done
  const [phase, setPhase] = useState("idle");
  const [fly, setFly] = useState(null); // { rect, flowerType }
  const [myEntry, setMyEntry] = useState(null);
  const pendingRef = useRef(null); // POST 응답 { entry, total } — reveal 시점에 반영

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const data = await fetchGuestbook(recordId, {
        limit: OPEN_SLOTS.length,
      });
      setEntries(data.entries);
      setTotal(data.total);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [recordId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await fetchGuestbook(recordId, {
          limit: OPEN_SLOTS.length,
        });
        if (ignore) return;
        setEntries(data.entries);
        setTotal(data.total);
        setLoadState("ready");
      } catch {
        if (!ignore) setLoadState("error");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [recordId]);

  // 시트가 측정한 꽃 위치(rect)와 함께 호출 — 실패 시 throw하여 시트가 에러 표시
  const handleSubmit = async (payload, rect) => {
    const data = await postGuestbookEntry(recordId, payload);
    pendingRef.current = data;
    setSheetOpen(false);
    if (rect) {
      setFly({ rect, flowerType: payload.flowerType });
      setPhase("flying");
    } else {
      // 위치 측정 실패 시 비행 생략하고 바로 화분 등장
      applyPending();
      setPhase("revealing");
    }
  };

  const applyPending = () => {
    const pending = pendingRef.current;
    if (pending) {
      setMyEntry(pending.entry);
      setTotal(pending.total);
      // 초기 목록 로드가 실패했더라도 작성은 성공했으므로 카운터를 살린다
      setLoadState((s) => (s === "error" ? "ready" : s));
      pendingRef.current = null;
    }
  };

  const handleFlyDone = () => {
    applyPending();
    setFly(null);
    setPhase("revealing");
  };

  const potFilled = myEntry != null;
  const potBase = stage ? stage.width * POT_WIDTH_RATIO : 0;
  // 스테이지가 컨테이너보다 작게 들어간 축(위아래 or 좌우)의 가장자리를 블러 배경으로 녹인다
  const edgeMask = stage
    ? stage.top > 0.5
      ? "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)"
      : stage.left > 0.5
        ? "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)"
        : null
    : null;

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden bg-[#dfe3ea] text-[#2b2521]"
    >
      {/* 블러 배경 — 스테이지 바깥 여백(레터박스)을 같은 색감으로 채운다 */}
      <img
        src={SCENE_ASSETS.bg}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
        style={{ filter: "blur(28px)", transform: "scale(1.12)" }}
      />

      {/* 스테이지 — 목업 캔버스 좌표계. z-0으로 스태킹 컨텍스트를 만들어 안쪽의
          프레임/화분 zIndex가 헤딩(z-20)·시트(z-50)를 넘보지 못하게 한다 */}
      {stage && (
        <div
          className="pointer-events-none absolute z-0"
          style={{
            left: stage.left,
            top: stage.top,
            width: stage.width,
            height: stage.height,
          }}
        >
          <img
            src={SCENE_ASSETS.bg}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full select-none"
            style={
              edgeMask
                ? { WebkitMaskImage: edgeMask, maskImage: edgeMask }
                : undefined
            }
          />
          <img
            src={SCENE_ASSETS.figures}
            alt=""
            draggable={false}
            className="absolute inset-0 z-[1] h-full w-full select-none"
          />
          <img
            src={SCENE_ASSETS.ring}
            alt=""
            draggable={false}
            className="absolute inset-0 z-[2] h-full w-full select-none"
          />

          {/* 검은 프레임(사진) + 대리석 받침 — 링 중앙 뒤에 서 있다 */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: "50%",
              top: `${FRAME_TOP}%`,
              width: `${FRAME_W}%`,
              transform: "translateX(-50%)",
              zIndex: 100 + Math.round((FRAME_TOP + 25.8) * 10),
              perspective: stage.width * 1.6,
            }}
          >
            <div
              className="w-full overflow-hidden bg-[#070707]"
              style={{
                aspectRatio: FRAME_ASPECT,
                transform: "rotateY(9deg)",
                transformOrigin: "50% 100%",
                borderLeft: `${Math.max(2, stage.width * 0.007)}px solid #e6e3df`,
                borderTop: `${Math.max(1.5, stage.width * 0.004)}px solid #f3f1ee`,
                boxShadow:
                  "0 18px 40px rgba(40,32,26,0.28), 0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              {mediaSrc(profileItem) ? (
                <img
                  src={mediaSrc(profileItem)}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "50% 30%" }}
                />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
            {/* 받침 */}
            <div
              className="rounded-[2px]"
              style={{
                width: "110%",
                height: stage.height * 0.014,
                background: "linear-gradient(180deg,#f4f2ef 0%,#dcd9d5 70%,#cbc7c2 100%)",
                boxShadow: "0 3px 8px rgba(40,32,26,0.22)",
              }}
            />
            {/* 바닥 반사 */}
            <div
              style={{
                width: "100%",
                height: stage.height * 0.09,
                background:
                  "linear-gradient(to bottom, rgba(45,38,32,0.30), rgba(45,38,32,0.08) 55%, rgba(45,38,32,0))",
                filter: "blur(3px)",
              }}
            />
          </div>

          {/* 화분들 — 앞쪽(top 큰 값)일수록 위에 그려진다 */}
          {SLOTS.map((slot, i) => {
            const style = {
              left: `${slot.left}%`,
              top: `${slot.top}%`,
              zIndex: 100 + Math.round(slot.top * 10),
            };
            const potWidth = potBase * slot.scale;

            if (slot.reserved) {
              // 방문자 몫의 자리 — 제출 완료 시 선택한 꽃의 화분이 페이드인
              if (potFilled || phase === "revealing") {
                return (
                  // 포지셔닝은 바깥 div가, 애니메이션은 안쪽 motion.div가 담당 —
                  // framer-motion이 transform을 덮어쓰기 때문에 분리 필수
                  <div key="reserved" className="absolute" style={style}>
                    <motion.div
                      initial={
                        phase === "revealing"
                          ? { opacity: 0, y: 10, scale: 0.7 }
                          : false
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      onAnimationComplete={() =>
                        phase === "revealing" && setPhase("done")
                      }
                    >
                      <FlowerPot
                        type={myEntry?.flowerType}
                        potWidth={potWidth}
                      />
                    </motion.div>
                  </div>
                );
              }
              // 빈 자리 — 화분 없이 바닥 빛만 두고, 탭하면 작성 시트 열림
              return (
                <div key="reserved" className="absolute" style={style}>
                  {/* 바닥의 은은한 빛 — "여기에 남길 수 있다"는 힌트 */}
                  <div
                    className="absolute animate-pulse rounded-full"
                    style={{
                      width: potWidth * 2.6,
                      height: potWidth * 0.9,
                      transform: "translate(-50%, -50%)",
                      background:
                        "radial-gradient(ellipse, rgba(255,236,210,0.85) 0%, rgba(255,236,210,0) 70%)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="pointer-events-auto absolute rounded-full"
                    style={{
                      width: Math.max(48, potWidth * 2),
                      height: Math.max(48, potWidth * 2),
                      transform: "translate(-50%, -70%)",
                    }}
                    aria-label="추모의 글 남기기"
                  />
                </div>
              );
            }

            // 방명록이 없어도 공간을 두르는 장식 화분은 항상 놓는다 —
            // 정면(reserved) 자리만 방문자의 제출을 기다리며 비워둔다
            const entryIdx = OPEN_SLOTS.indexOf(slot);
            const entry = entries[entryIdx];
            const type =
              entry?.flowerType ?? FLOWER_TYPES[entryIdx % FLOWER_TYPES.length];
            return (
              <div
                key={entry?.id ?? `deco-${i}`}
                className="absolute"
                style={style}
              >
                <FlowerPot type={type} potWidth={potWidth} />
              </div>
            );
          })}
        </div>
      )}

      {/* 헤딩 */}
      <div className="pointer-events-none absolute top-[3.5vh] left-1/2 z-20 w-full -translate-x-1/2 text-center">
        <h2 className="font-serif text-[2.6vh] font-bold tracking-wide">
          추모의 기록
        </h2>
        <p className="mt-[0.8vh] text-[1.35vh] font-bold text-[#2b2521]/65">
          우리들의 따뜻한 마음이 오래도록 기억될 수 있습니다
        </p>
      </div>

      {/* 날아가는 꽃 — 시트 퇴장(0.3s) 동안 제자리, 이후 떠오르며 페이드아웃 */}
      {phase === "flying" && fly && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <motion.img
            src={getFlowerAsset(fly.flowerType).flower}
            alt=""
            style={{
              position: "fixed",
              left: fly.rect.left,
              top: fly.rect.top,
              width: fly.rect.width,
              height: fly.rect.height,
              objectFit: "contain",
            }}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -140, opacity: 0, scale: 0.85 }}
            transition={{ delay: 0.3, duration: 1.0, ease: "easeOut" }}
            onAnimationComplete={handleFlyDone}
          />
        </div>
      )}

      {/* 안내 문구(기록 유무만 안내, 인원수 미표시) + 목록 버튼 + CTA — 탭바 높이만큼 올림 */}
      <div
        className="absolute right-0 left-0 z-20 flex flex-col items-center gap-[1.4vh] px-[6%]"
        style={{ bottom: "calc(9.5vh + env(safe-area-inset-bottom))" }}
      >
        {loadState === "error" ? (
          <button
            type="button"
            onClick={load}
            className="text-[1.4vh] text-[#2b2521]/70 underline underline-offset-4"
          >
            방명록을 불러오지 못했습니다 — 다시 시도
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-[1.4vh] font-bold tracking-wide text-[#2b2521]/70">
              {loadState === "loading"
                ? "방명록을 불러오는 중..."
                : total > 0
                  ? "따뜻한 추모의 기록이 남겨져 있습니다"
                  : "첫 번째 추모의 기록을 남겨보세요"}
            </p>
            {loadState === "ready" && total > 0 && (
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="flex h-[3vh] w-[3vh] items-center justify-center rounded-full bg-[#2b2521]/10 text-[#2b2521]/70"
                aria-label="방명록 목록 보기"
              >
                <MoreHorizontal size={13} />
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full max-w-sm rounded-full bg-[#1a1510] py-[1.7vh] text-[1.6vh] font-medium text-white shadow-[0_8px_24px_rgba(40,32,26,0.25)]"
        >
          추모의 글 남기기
        </button>
      </div>

      <GuestbookSheet
        open={sheetOpen}
        tone={tone}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
      />
      <GuestbookListSheet
        open={listOpen}
        tone={tone}
        recordId={recordId}
        onClose={() => setListOpen(false)}
      />
    </div>
  );
}
