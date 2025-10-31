// components/gallery/EditGallery.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ChildhoodSection from "./ChildhoodSection";
import EntityGallerySection from "./EntityGallerySection";
import {
  saveChildhood,
  saveExperience,
  saveRelationship,
} from "../../services/editGalleryApi";
import NavHeader from "./EditGalleryNavHeader";
import { useAuth } from "@/app/contexts/AuthContext";

const tabs = [
  { key: "childhood", label: "유년시절" },
  { key: "experience", label: "소중한 기억" },
  { key: "relationship", label: "소중한 인연" }, // <- 오타 수정: 경험 → 인연
];

export default function EditGallery({ reelId, initial = {} }) {
  const [active, setActive] = useState(0);
  const { token } = useAuth();

  // 1) 빈 상태로 시작
  const [childhood, setChildhood] = useState([]);
  const [experience, setExperience] = useState([]);
  const [relationship, setRelationship] = useState([]);

  // 2) 초기 데이터 하이드레이션 플래그 (한 번만)
  const [hydrated, setHydrated] = useState(false);
  // 3) reelId & initial 준비되면 한 번만 주입
  useEffect(() => {
    if (!reelId) return;
    console.log("reelId:", reelId);
    console.log("initial: ", initial);
    // initial이 비어있는지 판단: 서버에서 오는 구조에 맞게 조건화
    const hasInitial =
      initial &&
      (initial.childhood?.length ||
        initial.memory?.length ||
        initial.relationship?.length);

    // if (!hasInitial || hydrated) return;

    // ---- 주입 ----
    setChildhood(
      (initial.childhood || []).map((it) => ({
        url: it.srcUrl,
        caption: it.caption ?? "",
      })),
    );

    setExperience(
      (initial.memory || []).map((m) => ({
        id: m.id,
        title: m.title || "",
        subTitle: m.subTitle || "",
        date: m.date || null,
        comment: m.comment || "",
        media: (m.WheelTexture || []).map((w) => ({
          url: w.srcUrl,
          caption: w.caption || "",
        })),
      })),
    );

    setRelationship(
      (initial.relationship || []).map((rel) => ({
        id: rel.id,
        name: rel.name || "",
        relation: rel.relation || "",
        comment: rel.comment || "",
        representative: 0,
        media: (rel.WheelTexture || []).map((w) => ({
          url: w.srcUrl,
          caption: w.caption || "",
        })),
      })),
    );

    setHydrated(true);
  }, [reelId, initial, hydrated]);

  // 4) 렌더 준비 완료 플래그
  const ready = Boolean(reelId && hydrated);

  // 변경 감지는 추후 dirty 플래그로 교체 권장
  const hasUnsavedChildhood = true;
  const hasUnsavedExperience = true;
  const hasUnsavedRelationship = true;

  const [saving, setSaving] = useState({ isSaving: false, progress: 0 });

  // 5) 안전 가드 + 저장 핸들러
  const handleSaveChildhood = async () => {
    if (!ready) return;
    console.group("save children");
    console.log("token: ", token);
    console.log("reelId: ", reelId);
    console.groupEnd;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveChildhood({ token, reelId, items: childhood });
      setSaving({ isSaving: false, progress: 100 });
      setActive(1);
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      alert(e.message);
    }
  };

  const handleSaveExperience = async () => {
    if (!ready) return;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveExperience({ token, reelId, items: experience });
      setSaving({ isSaving: false, progress: 100 });
      setActive(2);
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      alert(e.message);
    }
  };

  const handleSaveRelationship = async () => {
    if (!ready) return;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveRelationship({ token, reelId, items: relationship });
      setSaving({ isSaving: false, progress: 100 });
      // 마지막 섹션: 탭 유지
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      alert(e.message);
    }
  };

  // 6) 준비 전 UI 가드 (스켈레톤/로딩)
  if (!ready) {
    return (
      <div className="w-full text-white/70">
        <div className="mb-3 h-9 w-1/2 rounded bg-white/10" />
        <div className="space-y-3">
          <div className="h-36 rounded bg-white/5" />
          <div className="h-36 rounded bg-white/5" />
          <div className="h-36 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NavHeader items={tabs} active={active} setActive={setActive} />
      <div className="mt-5">
        {active === 0 && (
          <ChildhoodSection
            items={childhood}
            setItems={setChildhood}
            hasUnsavedChanges={hasUnsavedChildhood}
            onSave={handleSaveChildhood}
            savingState={saving}
          />
        )}

        {active === 1 && (
          <EntityGallerySection
            type="experience"
            items={experience}
            setItems={setExperience}
            hasUnsavedChanges={hasUnsavedExperience}
            onSave={handleSaveExperience}
            onSavedNext={() => setActive(2)}
            savingState={saving}
            maxCards={3}
            headerTitle="기억에 남는 경험"
            headerDesc="즐겁고 행복했던 일부터 힘들었던 순간까지 자유롭게 기록해 주세요."
            primaryFields={[
              { key: "title", placeholder: "경험 제목" },
              { key: "comment", placeholder: "설명(최대 60자) — 자유롭게" },
            ]}
            extraFields={[]}
            showRepresentative={false}
          />
        )}

        {active === 2 && (
          <EntityGallerySection
            type="relationship"
            items={relationship}
            setItems={setRelationship}
            hasUnsavedChanges={hasUnsavedRelationship}
            onSave={handleSaveRelationship}
            savingState={saving}
            maxCards={12}
            headerTitle="소중한 인연"
            headerDesc="사람/모임 등 기억하고 싶은 인연을 기록하세요."
            primaryFields={[
              { key: "name", placeholder: "이름(예: 홍길동)" },
              { key: "relation", placeholder: "관계(예: 친구/동료/가족)" },
            ]}
            extraFields={[
              { key: "comment", placeholder: "메모(선택)", kind: "textarea" },
            ]}
            showRepresentative={true}
          />
        )}
      </div>
    </div>
  );
}
