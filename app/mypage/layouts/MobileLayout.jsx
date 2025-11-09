"use client";
import { AnimatePresence, motion } from "framer-motion";
import ProfileCard from "../components/ProfileCard";
import MobileTabs from "../components/MobileTabs";
import HorizontalThumbs from "../components/HorizontalThumbs";
import IdentifierModal from "../components/IdentifierModal";
import ItemActionModal from "../components/ItemActionModal";
import PlanPlaceholder from "../components/PlanPlaceholder";
import TabPlanePictogram from "@/app/components/TabPlanePictogram";
import RingPictogram from "@/app/components/RingPictogram";

export default function MobileLayout({
  user,
  form,
  setForm,
  editingProfile,
  setEditingProfile,
  onSaveProfile,
  reels,
  records,
  activeTab,
  setActiveTab,
  onOpenCreate,
  onOpenAction,
  onSaveIdentifier,
  onOpenEditor,
  createModal,
  actionModal,
  closeCreate,
  closeAction,
  onConfirmCreate,
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <ProfileCard
        form={form}
        setForm={setForm}
        editing={editingProfile}
        onToggle={() =>
          editingProfile ? onSaveProfile() : setEditingProfile(true)
        }
        onCancel={() => setEditingProfile(false)}
      />

      <MobileTabs active={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait" initial={false}>
        {activeTab === "reels" && (
          <motion.div
            key="tab-reels"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            style={{ marginTop: 12 }}
          >
            {/* <RingPictogram /> */}
            <div className="gap-3 my-4">
              <div className=" text-white text-sm/loose font">
                Life-Reels는 소중한 관계와 순간을 영화처럼 이어붙인 디지털
                아카이브입니다. 시간의 흐름 속에서 움직이는 추억을 담아내어,
                당신만의 이야기를 감각적으로 기록하고 나눕니다.
              </div>
              <div className="mt-4 text-white-100 text-sm/loose">
                원하는 대상의 Reels를 새로 제작하거나, 기존 Reels를 클릭하여
                [편집하기]를 눌러 내용을 수정할 수 있어요.
              </div>
            </div>
            <HorizontalThumbs
              items={reels}
              label="Life-Reels"
              onOpenCreate={() => onOpenCreate("reels")}
              onOpenAction={(item) => onOpenAction("reels", item)}
            />
          </motion.div>
        )}

        {activeTab === "records" && (
          <motion.div
            key="tab-records"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            style={{ marginTop: 12 }}
          >
            {/* <TabPlanePictogram size={100} /> */}
            <div className="gap-3 my-4">
              <div className=" text-white text-sm/loose font">
                Life-Records는 당신의 삶에서 소중한 순간들을 레코드로 기록하는 디지털 아카이브입니다. 이름과 출생 정보, 내용, 연도별 타임라인, 사진을 기록하고, 링크로 쉽게 공유합니다.
              </div>
              <div className="mt-4 text-white-100 text-sm/loose">
                원하는 대상의 Records를 새로 제작하거나, 기존 Records를 클릭하여
                [편집하기]를 눌러 내용을 수정할 수 있어요.
              </div>
            </div>
            <HorizontalThumbs
              items={records}
              label="Life-Records"
              onOpenCreate={() => onOpenCreate("records")}
              onOpenAction={(item) => onOpenAction("records", item)}
            />
          </motion.div>
        )}

        {activeTab === "plan" && (
          <motion.div
            key="tab-plan"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            style={{ marginTop: 12 }}
          >
            <PlanPlaceholder size={100} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모달들 */}
      <IdentifierModal
        open={createModal.open}
        title={
          createModal.type === "reels"
            ? "새 Life-Reels"
            : createModal.type === "records"
              ? "새 Life-Records"
              : ""
        }
        contentType={createModal.type === "records" ? "records" : "reels"}
        onClose={closeCreate}
        onConfirm={onConfirmCreate}
      />
      <ItemActionModal
        open={actionModal.open}
        type={actionModal.type}
        item={actionModal.item}
        onClose={closeAction}
        onSaveIdentifier={onSaveIdentifier}
        onOpenEditor={onOpenEditor}
      />
    </div>
  );
}
