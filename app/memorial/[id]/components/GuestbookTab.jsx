"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { TONE_STYLES } from "./introPosterStyles";
import { fetchGuestbook, postGuestbookEntry } from "./guestbookApi";
import FlowerPot from "./FlowerPot";
import GuestbookSheet from "./GuestbookSheet";
import GuestbookListSheet from "./GuestbookListSheet";

function mediaSrc(item) {
  return item?.original_url || item?.thumbnail_url || "";
}

// 화분 슬롯 — 프레임을 두르는 타원 링 위에 원형 배치.
// 정면 아래(90°)가 방문자 몫(reserved)이고, 채움 순서는 정면 양옆부터
// 좌우 번갈아 뒤쪽으로 퍼진다. 뒤쪽 화분은 프레임 뒤로 가려진다(z-0).
const RING_CX = 50; // 타원 중심 x (%)
const RING_CY = 51; // 타원 중심 y (%)
const RING_RX = 34; // 가로 반지름 (%)
const RING_RY = 11; // 세로 반지름 (%) — 납작한 원근 타원
const SLOT_COUNT = 12;

const SLOTS = (() => {
  const slots = [];
  const stepDeg = 360 / SLOT_COUNT;
  for (let k = 0; k < SLOT_COUNT; k++) {
    // k=0은 정면(90°=화면 아래), 이후 +1,-1,+2,-2... 순으로 벌어짐
    const side = k === 0 ? 0 : Math.ceil(k / 2) * (k % 2 === 1 ? 1 : -1);
    const a = ((90 + side * stepDeg) * Math.PI) / 180;
    const depth = (Math.sin(a) + 1) / 2; // 1=정면, 0=뒤
    slots.push({
      left: RING_CX + RING_RX * Math.cos(a),
      top: RING_CY + RING_RY * Math.sin(a),
      scale: 0.55 + 0.45 * depth,
      reserved: k === 0,
    });
  }
  return slots;
})();
const OPEN_SLOTS = SLOTS.filter((s) => !s.reserved);
const POT_BASE_WIDTH = "min(13vw, 9vh)";

/**
 * "방명록" 탭 — 추모 공간 시각화(왜곡 프레임 + 화분들) + 작성/목록 바텀시트.
 * 제출 인터랙션: 시트 하강 → 선택한 꽃이 떠오르며 페이드아웃 → 빈 화분 자리에
 * 화분 페이드인 → 카운터 갱신.
 */
export default function GuestbookTab({ recordId, profileItem, tone = "dark" }) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.dark;
  const isDark = tone !== "white";

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState("loading"); // loading | error | ready
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // idle → flying(꽃 상승·페이드아웃) → revealing(화분 페이드인) → done
  const [phase, setPhase] = useState("idle");
  const [flyRect, setFlyRect] = useState(null);
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
      setFlyRect(rect);
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
    setFlyRect(null);
    setPhase("revealing");
  };

  const potFilled = myEntry != null;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${toneStyle.bg}`}
      style={{ paddingBottom: "calc(8vh + env(safe-area-inset-bottom))" }}
    >
      {/* 헤딩 */}
      <div className="pointer-events-none absolute top-[3.5vh] left-1/2 z-20 w-full -translate-x-1/2 text-center">
        <h2 className="font-serif text-[2.6vh] font-medium tracking-wide">
          추모의 기록
        </h2>
        <p className={`mt-[0.8vh] text-[1.35vh] ${toneStyle.subText}`}>
          우리들의 따뜻한 마음이 오래도록 기억될 수 있습니다
        </p>
      </div>

      {/* 왜곡된 사각 프레임 속 인물 사진 */}
      <div
        className="absolute top-[12vh] left-1/2 z-10 -translate-x-1/2"
        style={{ perspective: "700px" }}
      >
        <div
          className={`overflow-hidden rounded-sm border ${toneStyle.frameBorder}`}
          style={{
            width: "min(50vw, 26vh)",
            aspectRatio: "3 / 4",
            transform: "rotateX(6deg) rotateY(-14deg)",
            boxShadow: isDark
              ? "0 0 48px 8px rgba(255,255,255,0.10)"
              : "0 14px 40px rgba(0,0,0,0.18)",
          }}
        >
          {mediaSrc(profileItem) ? (
            <img
              src={mediaSrc(profileItem)}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      </div>

      {/* 화분들 — 래퍼가 스태킹 컨텍스트를 만들어 슬롯 zIndex가 시트(z-50)를
          넘보지 못하게 한다. z-0이라 뒤쪽 화분은 프레임(z-10) 뒤로 가려진다.
          빈 영역 터치를 막지 않도록 pointer-events 제어 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {SLOTS.map((slot, i) => {
        const zIndex = Math.round(slot.top);
        const style = {
          left: `${slot.left}%`,
          top: `${slot.top}%`,
          transform: "translateX(-50%)",
          zIndex,
        };

        if (slot.reserved) {
          // 방문자 몫의 빈 자리 — 제출 완료 시 화분이 페이드인
          if (potFilled || phase === "revealing") {
            return (
              // 포지셔닝(translateX)은 바깥 div가, 애니메이션은 안쪽 motion.div가
              // 담당 — framer-motion이 transform을 덮어쓰기 때문에 분리 필수
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
                  <FlowerPot width={`calc(${POT_BASE_WIDTH} * ${slot.scale})`} />
                </motion.div>
              </div>
            );
          }
          // 빈 자리 표시(바닥 마커) — 탭하면 작성 시트 열림
          return (
            <button
              key="reserved"
              type="button"
              onClick={() => setSheetOpen(true)}
              className="pointer-events-auto absolute"
              style={style}
              aria-label="추모의 글 남기기"
            >
              <div
                className={`rounded-full border ${
                  isDark ? "border-white/25" : "border-black/20"
                }`}
                style={{
                  width: `calc(${POT_BASE_WIDTH} * 0.8)`,
                  height: "1.6vh",
                  transform: "translateY(5.5vh)",
                }}
              />
            </button>
          );
        }

        const entryIdx = OPEN_SLOTS.indexOf(slot);
        const entry = entries[entryIdx];
        if (!entry) return null;
        return (
          <div key={entry.id} className="absolute" style={style}>
            <FlowerPot width={`calc(${POT_BASE_WIDTH} * ${slot.scale})`} />
          </div>
        );
        })}
      </div>

      {/* 날아가는 꽃 — 시트 퇴장(0.3s) 동안 제자리, 이후 떠오르며 페이드아웃 */}
      {phase === "flying" && flyRect && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <motion.img
            src="/images/memorial/flower.png"
            alt=""
            style={{
              position: "fixed",
              left: flyRect.left,
              top: flyRect.top,
              width: flyRect.width,
              height: flyRect.height,
              objectFit: "contain",
            }}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -140, opacity: 0, scale: 0.85 }}
            transition={{ delay: 0.3, duration: 1.0, ease: "easeOut" }}
            onAnimationComplete={handleFlyDone}
          />
        </div>
      )}

      {/* 카운터 + 목록 버튼 + CTA — absolute는 padding을 무시하므로 탭바 높이만큼 올림 */}
      <div
        className="absolute right-0 left-0 z-20 flex flex-col items-center gap-[1.4vh] px-[6%]"
        style={{ bottom: "calc(9.5vh + env(safe-area-inset-bottom))" }}
      >
        {loadState === "error" ? (
          <button
            type="button"
            onClick={load}
            className={`text-[1.4vh] underline underline-offset-4 ${toneStyle.subText}`}
          >
            방명록을 불러오지 못했습니다 — 다시 시도
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <p className={`text-[1.4vh] tracking-wide ${toneStyle.subText}`}>
              {loadState === "loading"
                ? "방명록을 불러오는 중..."
                : total > 0
                  ? `지금까지 ${total.toLocaleString()}분께서 추모의 기록을 남겼습니다`
                  : "첫 번째 추모의 기록을 남겨보세요"}
            </p>
            {loadState === "ready" && total > 0 && (
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className={`flex h-[3vh] w-[3vh] items-center justify-center rounded-full ${
                  isDark
                    ? "bg-white/10 text-white/70"
                    : "bg-black/10 text-black/60"
                }`}
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
          className={`w-full max-w-sm rounded-full py-[1.7vh] text-[1.6vh] font-medium ${
            isDark ? "bg-white text-black" : "bg-[#1a1510] text-white"
          }`}
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
