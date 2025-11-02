"use client";
import { AnimatePresence, motion } from "framer-motion";
import ProfileCard from "../components/ProfileCard";
import VerticalNav from "../components/VerticalNav";
import Section from "../components/Section";
import HorizontalThumbs from "../components/HorizontalThumbs";
import IdentifierModal from "../components/IdentifierModal";
import ItemActionModal from "../components/ItemActionModal";
import PlanPlaceholder from "../components/PlanPlaceholder";

export default function DesktopLayout({
  user,
  form,
  setForm,
  editingProfile,
  setEditingProfile,
  onSaveProfile,
  reels,
  records,
  desktopNav,
  setDesktopNav,
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
    <div
      style={{
        display: "grid",
        gap:10,
        gridTemplateColumns: "3fr 7fr",
        marginTop: 20,
      }}
    >
      {/* 좌측: VerticalNav (Data / Plan) */}
      <VerticalNav active={desktopNav} onChange={setDesktopNav} />

      {/* 우측: 컨텐츠 */}
      <div style={{ display: "grid", gap: 18, width: "100%" }}>
        <AnimatePresence mode="wait" initial={false}>
          {desktopNav === "data" ? (
            <motion.div
              key="data-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                // padding:"0px 10px",
                boxSizing:"border-box",
                // background: "red",
                display: "flex",
                flexDirection:"column",
                gap: 18,
                width: "100%",
                overflow: "auto",
              }}
            >
              {/* 내 정보 */}
              <ProfileCard
                form={form}
                setForm={setForm}
                editing={editingProfile}
                onToggle={() =>
                  editingProfile ? onSaveProfile() : setEditingProfile(true)
                }
                onCancel={() => setEditingProfile(false)}
              />

              {/* Reels */}
              <Section title="Life-Reels">
                <HorizontalThumbs
                  items={reels}
                  label="Life-Reels"
                  onOpenCreate={() => onOpenCreate("reels")}
                  onOpenAction={(item) => onOpenAction("reels", item)}
                />
              </Section>

              {/* Records */}
              <Section title="Life-Records">
                <HorizontalThumbs
                  items={records}
                  label="Life-Records"
                  onOpenCreate={() => onOpenCreate("records")}
                  onOpenAction={(item) => onOpenAction("records", item)}
                />
              </Section>
            </motion.div>
          ) : (
            <motion.div
              key="plan-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <PlanPlaceholder />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
