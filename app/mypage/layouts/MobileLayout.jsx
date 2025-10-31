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
            <RingPictogram />
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
            <TabPlanePictogram size={100} />
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
