// app/view/[identifier]/reels/ReelsView.jsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import ProfileCurtain from "@/app/view/[identifier]/reels/components/ProfileCurtain";
import RingSlider from "@/app/view/[identifier]/reels/components/RingSlider";
import LeftSprite from "@/app/view/[identifier]/reels/components/LeftSprite";
import { fetchPreview } from "@/app/view/[identifier]/reels/services/viewApi";
import { ChevronDown } from "lucide-react";

// 3D Ring (ssr off)
const Ring = dynamic(
  () => import("@/app/view/[identifier]/reels/components/Ring"),
  { ssr: false },
);

// ----------------- 도우미 -----------------
const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;
const inferKind = (url, type) => {
  if (typeof type === "number") return type === 1 ? "video" : "image";
  return VIDEO_EXT.test(String(url)) ? "video" : "image";
};
const toInt = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : f;
};
// 현재 인덱스가 어떤 섹션에 속하는지 찾아주는 헬퍼
function sectionByIndex(sections, idx) {
  if (!Array.isArray(sections)) return null;
  for (const s of sections) {
    if (s?.key === "all") continue;
    if (Number.isFinite(s?.start) && Number.isFinite(s?.end)) {
      if (idx >= s.start && idx <= s.end) return s;
    }
  }
  return null;
}

// --- buildAll: 미디어/슬롯/목차 구성 ---
function buildAll(preview) {
  const outMedia = [];
  const ranges = {};
  const sliderSections = [];

  let cursor = 0;

  const profileImg = preview?.profile?.profileImg || "";
  const storyText = preview?.profile?.story || "";
  const hasProfile = !!profileImg;
  const hasStory = !!storyText.trim();

  // 1) 프로필
  if (hasProfile) {
    outMedia.push({
      section: "profile",
      url: profileImg,
      kind: inferKind(profileImg),
      caption: "",
    });
    ranges.profile = [cursor, cursor];
    cursor += 1;
  }

  // 2) 유년시절
  const childhood = Array.isArray(preview?.gallery?.childhood)
    ? preview.gallery.childhood
    : [];
  if (childhood.length > 0) {
    const start = cursor;
    for (const m of childhood) {
      outMedia.push({
        section: "childhood",
        url: m?.url || "",
        kind: m?.kind || inferKind(m?.url),
        caption: m?.caption || "",
      });
      cursor++;
    }
    ranges.childhood = [start, cursor - 1];
  }

  // 3) 소중한 기억 (경험)
  const memories = Array.isArray(preview?.gallery?.experience)
    ? preview.gallery.experience
    : [];
  memories.forEach((mem, i) => {
    const photos = Array.isArray(mem?.photos) ? mem.photos : [];
    if (photos.length === 0) return;

    const start = cursor;
    const key = `memory:${mem?.id ?? i}`;
    const title = (mem?.title || "").trim() || `기억 ${i + 1}`;
    const description = mem?.description || "";
    const comment = mem?.comment || "";

    for (const p of photos) {
      outMedia.push({
        section: key,
        url: p?.url || "",
        kind: p?.kind || inferKind(p?.url),
        caption: p?.caption || "",
        _memoryMeta: { id: mem?.id ?? i, title, description, comment },
      });
      cursor++;
    }
    ranges[key] = [start, cursor - 1];
  });

  // 4) 소중한 인연
  const relationships = Array.isArray(preview?.gallery?.relationship)
    ? preview.gallery.relationship
    : [];
  relationships.forEach((rel, i) => {
    const photos = Array.isArray(rel?.photos) ? rel.photos : [];
    if (photos.length === 0) return;

    const start = cursor;
    const key = `relationship:${rel?.id ?? i}`;
    const name = (rel?.name || "").trim() || `인연 ${i + 1}`;
    const relation = rel?.relation || "";
    const comment = rel?.comment || "";

    for (const p of photos) {
      outMedia.push({
        section: key,
        url: p?.url || "",
        kind: p?.kind || inferKind(p?.url),
        caption: p?.caption || "",
        _relMeta: { id: rel?.id ?? i, name, relation, comment },
      });
      cursor++;
    }
    ranges[key] = [start, cursor - 1];
  });

  // 5) 전체 범위
  const totalMedia = outMedia.length;
  ranges.all = [0, Math.max(0, totalMedia - 1)];

  // 6) 슬롯(최소 100)
  const slotCount = Math.max(100, totalMedia);
  const slots = Array.from({ length: slotCount }, (_, i) =>
    i < totalMedia
      ? outMedia[i]
      : { section: "empty", kind: "empty", url: null, caption: "" },
  );

  // 7) 슬라이더 목차(실제 제목/이름 사용)
  sliderSections.push({
    key: "all",
    label: "전체",
    start: 0,
    end: Math.max(0, totalMedia - 1),
  });

  if (hasProfile) {
    sliderSections.push({
      key: "profile",
      label: "프로필 사진",
      start: ranges.profile[0],
      end: ranges.profile[1],
    });
  }
  if (hasStory) {
    const anchor = hasProfile ? ranges.profile[0] : 0;
    sliderSections.push({
      key: "lifestory",
      label: "생애문",
      start: anchor,
      end: anchor,
    });
  }
  if (ranges.childhood) {
    sliderSections.push({
      key: "childhood",
      label: "유년시절",
      start: ranges.childhood[0],
      end: ranges.childhood[1],
    });
  }

  Object.keys(ranges)
    .filter((k) => k.startsWith("memory:"))
    .sort((a, b) => ranges[a][0] - ranges[b][0])
    .forEach((key) => {
      const firstIdx = ranges[key][0];
      const m = outMedia[firstIdx]?._memoryMeta;
      const title = (m?.title || "").trim() || "소중한 기억";
      sliderSections.push({
        key,
        label: `${title}`,
        start: ranges[key][0],
        end: ranges[key][1],
      });
    });

  Object.keys(ranges)
    .filter((k) => k.startsWith("relationship:"))
    .sort((a, b) => ranges[a][0] - ranges[b][0])
    .forEach((key) => {
      const firstIdx = ranges[key][0];
      const m = outMedia[firstIdx]?._relMeta;
      const who = (m?.name || "").trim() || "소중한 인연";
      sliderSections.push({
        key,
        label: `${who}`,
        start: ranges[key][0],
        end: ranges[key][1],
      });
    });

  return { slots, ranges, sliderSections };
}

// 영어 라벨 + 서브라벨
function computeLabels(slideKey, slot) {
  let main = "Others";
  if (slideKey === "profile") main = "Profile";
  else if (slideKey === "lifestory") main = "Lifestory";
  else if (slideKey === "childhood") main = "Childhood";
  else if (slideKey?.startsWith("memory:")) main = "Memory";
  else if (slideKey?.startsWith("relationship:")) main = "People";

  let sub = "";
  if (slideKey?.startsWith("memory:") && slot?._memoryMeta)
    sub = slot._memoryMeta.title || "";
  else if (slideKey?.startsWith("relationship:") && slot?._relMeta)
    sub = slot._relMeta.name || "";

  return { main, sub };
}

// ----------------- 재사용 가능한 뷰 컴포넌트 -----------------
export default function ReelsView({ identifier, initialData = null }) {
  const [loading, setLoading] = useState(!initialData);
  const [err, setErr] = useState("");
  const [data, setData] = useState(initialData);

  const [slots, setSlots] = useState([]);
  const [ranges, setRanges] = useState({});
  const [sliderSections, setSliderSections] = useState([]);

  const [activeKey, setActiveKey] = useState("all");
  const [leftIndex, setLeftIndex] = useState(0);
  const [leftSnap, setLeftSnap] = useState(0);

  const [curtainOpen, setCurtainOpen] = useState(true);

  // 초기 로드 (initialData 없을 때만 fetch)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!initialData) {
          setLoading(true);
          const res = await fetchPreview({ identifier });
          if (!mounted) return;
          setData(res);

          const built = buildAll(res);
          console.log(built);
          setSlots(built.slots);
          setRanges(built.ranges);
          setSliderSections(built.sliderSections);

          const [start] = built.ranges.all || [0, 0];
          setActiveKey("all");
          setLeftIndex(start);
          setLoading(false);
        } else {
          // initialData로 즉시 세팅
          const built = buildAll(initialData);
          setSlots(built.slots);
          setRanges(built.ranges);
          setSliderSections(built.sliderSections);

          const [start] = built.ranges.all || [0, 0];
          setActiveKey("all");
          setLeftIndex(start);
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setErr("미리보기 불러오기 실패");
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [identifier, initialData]);

  // 현재 섹션 범위
  const currentRange = useMemo(() => {
    const max = Math.max(0, (slots?.length ?? 1) - 1);
    const sec = sliderSections.find((s) => s.key === activeKey);
    if (sec) {
      const a = toInt(sec.start, 0);
      const b = toInt(sec.end, max);
      return [Math.min(a, b), Math.max(a, b)];
    }
    const r = ranges?.[activeKey];
    if (Array.isArray(r) && r.length >= 2) {
      const a = toInt(r[0], 0);
      const b = toInt(r[1], max);
      return [Math.min(a, b), Math.max(a, b)];
    }
    return [0, max];
  }, [sliderSections, ranges, activeKey, slots?.length]);

  // 섹션 변경
  const handleChangeSection = (key) => {
    setActiveKey(key);
    const max = Math.max(0, (slots?.length ?? 1) - 1);
    const sec = sliderSections.find((s) => s.key === key);
    const start = Number.isFinite(sec?.start)
      ? toInt(sec.start, 0)
      : Array.isArray(ranges?.[key]) && ranges[key].length >= 2
        ? toInt(ranges[key][0], 0)
        : 0;
    setLeftIndex(Math.min(Math.max(start, 0), max));
  };

  // 인덱스 변경(슬라이더/버튼)
  const handleChangeLeftIndex = (next) => {
    const max = Math.max(0, (slots?.length ?? 1) - 1);
    const [a, b] = Array.isArray(currentRange) ? currentRange : [0, max];
    const v = Math.min(Math.max(toInt(next, a), a), b);
    setLeftIndex(v);
  };

  // ‘전체’일 때도 현재 사진의 실제 섹션 라벨을 표시
  const effectiveKeyForLabels = useMemo(() => {
    if (activeKey !== "all") return activeKey;
    const sec = sectionByIndex(sliderSections, leftSnap);
    return sec?.key ?? "all";
  }, [activeKey, sliderSections, leftSnap]);

  const currentSlot = slots[leftSnap] || null;
  const { main: mainLabel, sub: subLabel } = computeLabels(
    effectiveKeyForLabels,
    currentSlot,
  );
  const caption = currentSlot?.caption || "";
  const lifestoryText = data?.profile?.story || "";

  if (loading) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        불러오는 중…
      </div>
    );
  }
  if (err) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-red-400">
        {err}
      </div>
    );
  }

  const totalSlots = toInt(slots?.length ?? 0, 0);

  return (
    <div className="bg-black-100 relative h-screen w-screen overflow-hidden text-white">
      {/* 상단 프로필 커튼 */}
      <ProfileCurtain
        open={curtainOpen}
        onClose={() => setCurtainOpen(false)}
        profile={data?.profile}
      />
      {/* 커튼 다시 열기 버튼 */}
      <button
        onClick={() => setCurtainOpen(true)}
        className=" flex gap-2 absolute top-4 left-4 z-40 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur-md active:scale-95"
      >
        <ChevronDown className=" h-4 w-4" />
        프로필 보기
      </button>

      {/* 상단 LeftSprite(3D) */}
      <div className="absolute inset-x-0 top-16 z-20 mx-auto h-[50vh] w-[94vw] max-w-[680px]">
        <LeftSprite
          item={currentSlot}
          activeKey={effectiveKeyForLabels}
          lifestory={lifestoryText}
          mainLabel={mainLabel}
          subLabel={subLabel}
          caption={caption}
        />
      </div>

      {/* 하단 Ring (모바일 기준 오른쪽 반 잘린 위치 유지) */}
      <div className="absolute inset-0 top-[420px] h-[50vh] w-[220vw]">
        <Ring
          slots={slots}
          leftIndex={leftIndex}
          onLeftmostChange={setLeftSnap}
          snapSpeed={12}
        />
      </div>

      {/* 하단 슬라이더 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3">
        <div className="pointer-events-auto">
          <RingSlider
            totalSlots={totalSlots}
            leftIndex={leftIndex}
            onChangeLeftIndex={handleChangeLeftIndex}
            sections={sliderSections}
            activeKey={activeKey}
            onChangeSection={handleChangeSection}
            snapSoundUrl="/sounds/paper.mp3"
          />
        </div>
      </div>
    </div>
  );
}
