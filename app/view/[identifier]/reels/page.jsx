"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchPreview } from "./services/viewApi";
// app/view/[identifier]/page.tsx
import dynamic from "next/dynamic";
const ImageRing3D = dynamic(() => import("./components/ImageRing3D"), {
  ssr: false,
});

import ProfileCurtain from "./components/ProfileCurtain";
import LeftSprite from "./components/LeftSprite";
import RingHUD from "./components/RingHUD";
import { useParams } from "next/navigation";

export default function ViewPage() {
  const { identifier } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 링 프레임(이미지/텍스트 카드) 풀
  const [frames, setFrames] = useState([]);
  // 선택/스냅 제어
  // page (혹은 상위)
  const [index, setIndex] = useState(0); // 슬라이더 스냅 정수
  const [leftIdx, setLeftIdx] = useState(0); // 왼쪽 썸네일(실제 프레임 인덱스)
  const [leftPos, setLeftPos] = useState(null); // DOM 좌표
  const [chooseIdx, setChooseIdx] = useState(0);
  const [choosePos, setChoosePos] = useState(null);
  const [range, setRange] = useState([0, 0]); // [min, max]
  const [categoryMap, setCategoryMap] = useState([]); // [{label,start,end}]

  // 프로필 커튼(최상단 카드) 노출 상태
  const [curtainOpen, setCurtainOpen] = useState(true);
  // 왼쪽 상단 큰 스프라이트에 표시할 경로(이미지/텍스처 키)
  const [leftKey, setLeftKey] = useState(null);
  const [leftScreenPos, setLeftScreenPos] = useState(null);
  const [pickIdx, setPickIdx] = useState(0);
  const [pickPos, setPickPos] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null); // 선택 안 하면 null
  const audioRef = useRef(null);
  const playClick = () => {
    try {
      if (!audioRef.current) {
        const a = new Audio();
        a.src =
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACAgCEAAAA/////wAAAP///wAAAP///wAAAP7+/v4=";
        audioRef.current = a;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch {}
  };

  useEffect(() => {
    (async () => {
      try {
        const item = await fetchPreview(identifier);
        setData(item);

        // 1) 프레임 풀 구성: [프로필 카드, 생애문 카드, 유년/경험/인연 사진들]
        const out = [];
        // 텍스트(생애문) 카드는 'text:' 키로 구분
        if (item.profile?.profileImg) {
          out.push({
            kind: "image",
            url: item.profile.profileImg,
            label: "프로필",
          });
        } else {
          out.push({
            kind: "text",
            text: item.profile?.name || "Profile",
            label: "프로필",
          });
        }
        out.push({
          kind: "text",
          text: item.profile?.story || "아직 작성된 생애문이 없어요.",
          label: "생애문",
          multiline: true,
        });

        const childStart = out.length;
        (item.gallery?.childhood || []).forEach((u) =>
          out.push({ kind: "image", url: u, label: "유년시절" }),
        );
        const childEnd = out.length - 1;

        const expStarts = [];
        (item.gallery?.experience || []).forEach((exp) => {
          const start = out.length;
          exp.photos.forEach((u) =>
            out.push({
              kind: "image",
              url: u,
              label: exp.title || "소중한 기억",
            }),
          );
          const end = out.length - 1;
          expStarts.push({
            label: `기억 · ${exp.title || "제목 없음"}`,
            start,
            end,
          });
        });

        const relStarts = [];
        (item.gallery?.relationship || []).forEach((rel) => {
          const start = out.length;
          rel.photos.forEach((u) =>
            out.push({
              kind: "image",
              url: u,
              label: rel.name || "소중한 인연",
            }),
          );
          const end = out.length - 1;
          relStarts.push({ label: `인연 · ${rel.name}`, start, end });
        });

        setFrames(out);

        // 2) 하단 카테고리 맵(슬라이더 범위용)
        const cats = [
          { label: "프로필", start: 0, end: 0 },
          { label: "생애문", start: 1, end: 1 },
        ];
        if (childStart <= childEnd)
          cats.push({ label: "유년시절", start: childStart, end: childEnd });
        cats.push(...expStarts, ...relStarts);
        cats.push({
          label: "전체",
          start: 0,
          end: Math.max(out.length - 1, 0),
        });
        setCategoryMap(cats);

        // 기본 범위 = 전체
        setRange([0, Math.max(out.length - 1, 0)]);
        setIndex(0);
        setLeftKey(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [identifier]);

  // index가 바뀔 때 큰 사진/카드 갱신 + 딸깍 소리
  useEffect(() => {
    if (!loading) {
      setLeftKey(index);
      playClick();
    }
  }, [index, loading]);

  if (loading || !data) {
    return (
      <div className="bg-black-100 grid h-screen w-screen place-items-center text-white/80">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="bg-black-100 relative h-screen w-screen overflow-hidden text-white">
      {/* 1) 처음: 프로필 커튼 (위에서 슬라이드 인, 클릭/드래그로 닫기) */}
      <ProfileCurtain
        open={curtainOpen}
        onClose={() => setCurtainOpen(false)}
        profile={data.profile}
      />

      {/* 2) 상단 좌측: 커튼 다시 내리기 버튼 */}
      {!curtainOpen && (
        <button
          onClick={() => setCurtainOpen(true)}
          className="bg-black-200/70 hover:bg-black-300/70 absolute top-3 left-3 z-30 rounded-full border border-white/30 px-3 py-1 text-xs"
        >
          프로필 보기
        </button>
      )}

      {/* 3) 왼쪽 큰 스프라이트 (현재 leftKey) */}

      <ImageRing3D
        frames={frames} // [{url, cat: 'childhood' | 'memory/...' | 'relationship/...'}]
        index={index}
        onChooseIndex={setLeftIdx}
        onProjectChoose={setLeftPos}
        minSlots={100}
        chooseSide="left"
        activeCategory={activeCategory}
      />
      <LeftSprite frame={frames[chooseIdx]} leftScreenPos={choosePos} />

      <RingHUD
        index={index}
        setIndex={setIndex}
        range={range}
        setRange={setRange}
        categories={categoryMap}
        onClickSound={playClick}
      />
    </div>
  );
}
