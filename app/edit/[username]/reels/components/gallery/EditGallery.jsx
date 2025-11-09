"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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
  { key: "relationship", label: "소중한 인연" },
];

function EditGalleryInner(
  { onToast, reelId, initial = {}, onDirtyAnyChange },
  ref,
) {
  const { token } = useAuth();
  const [active, setActive] = useState(0);

  // 섹션별 상태
  const [childhood, setChildhood] = useState([]);
  const [experience, setExperience] = useState([]);
  const [relationship, setRelationship] = useState([]);

  // 하이드레이션
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!reelId) return;
    // 초기 주입
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
        media: (m.wheelTextures || []).map((w) => ({
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
        media: (rel.wheelTextures || []).map((w) => ({
          url: w.srcUrl,
          caption: w.caption || "",
        })),
      })),
    );
    setHydrated(true);
  }, [reelId, initial]);

  // 더티 상태 (간단 모드: set 함수가 호출되면 true)
  const [dirty, setDirty] = useState({ child: false, exp: false, rel: false });
  useEffect(() => {
    onDirtyAnyChange?.(dirty.child || dirty.exp || dirty.rel);
  }, [dirty, onDirtyAnyChange]);

  const [saving, setSaving] = useState({ isSaving: false, progress: 0 });

  // 저장 핸들러 (기존 로직 호출)
  const handleSaveChildhood = async () => {
    if (!reelId) return;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveChildhood({ token, reelId, items: childhood });
      setDirty((d) => ({ ...d, child: false }));
      setSaving({ isSaving: false, progress: 100 });
      onToast?.("저장되었습니다.", { tone: "success" });
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      onToast?.("저장 중 오류가 발생했어요.", { tone: "error" });
      throw e;
    }
  };
  const handleSaveExperience = async () => {
    if (!reelId) return;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveExperience({ token, reelId, items: experience });
      setDirty((d) => ({ ...d, exp: false }));
      setSaving({ isSaving: false, progress: 100 });
      onToast?.("저장되었습니다.", { tone: "success" });
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      onToast?.("저장 중 오류가 발생했어요.", { tone: "error" });
      throw e;
    }
  };
  const handleSaveRelationship = async () => {
    if (!reelId) return;
    try {
      setSaving({ isSaving: true, progress: 10 });
      await saveRelationship({ token, reelId, items: relationship });
      setDirty((d) => ({ ...d, rel: false }));
      setSaving({ isSaving: false, progress: 100 });
      onToast?.("저장되었습니다.", { tone: "success" });
    } catch (e) {
      setSaving({ isSaving: false, progress: 0 });
      onToast?.("저장 중 오류가 발생했어요.", { tone: "error" });
      throw e;
    }
  };

  // 외부 호출용 API
  useImperativeHandle(ref, () => ({
    hasUnsaved: () => dirty.child || dirty.exp || dirty.rel,
    saveAll: async () => {
      // 더티인 섹션만 순차 저장
      if (dirty.child) await handleSaveChildhood();
      if (dirty.exp) await handleSaveExperience();
      if (dirty.rel) await handleSaveRelationship();
      return true;
    },
  }));

  if (!hydrated) {
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
            setItems={(updater) => {
              setChildhood(typeof updater === "function" ? updater : updater);
              setDirty((d) => ({ ...d, child: true }));
            }}
            hasUnsavedChanges={dirty.child}
            onSave={handleSaveChildhood}
            savingState={saving}
          />
        )}

        {active === 1 && (
          <EntityGallerySection
            type="experience"
            items={experience}
            setItems={(updater) => {
              setExperience(typeof updater === "function" ? updater : updater);
              setDirty((d) => ({ ...d, exp: true }));
            }}
            hasUnsavedChanges={dirty.exp}
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
            setItems={(updater) => {
              setRelationship(
                typeof updater === "function" ? updater : updater,
              );
              setDirty((d) => ({ ...d, rel: true }));
            }}
            hasUnsavedChanges={dirty.rel}
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

export default forwardRef(EditGalleryInner);
