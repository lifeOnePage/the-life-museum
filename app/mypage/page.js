"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import TopProgress from "@/app/components/loading/TopProgress";
import FullscreenBusy from "@/app/components/loading/FullscreenBusy";
import SmartButton from "@/app/components/loading/SmartButton";
import {
  fetchMyReels,
  fetchMyRecords,
  createReel,
  createRecord,
  updateReelIdentifier,
  updateRecordIdentifier,
  updateMyProfile,
  fetchMyDatas,
} from "./services/mypageApi";

import MobileLayout from "./layouts/MobileLayout";
import DesktopLayout from "./layouts/DesktopLayout";

export default function Mypage() {
  const { user, token, signinWithToken } = useAuth();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");

  // 데이터
  const [reels, setReels] = useState([]);
  const [records, setRecords] = useState([]);

  // 모바일 탭: reels | records | plan
  const [mobileTab, setMobileTab] = useState("reels");

  // 데스크탑 왼쪽 VerticalNav: data | plan
  const [desktopNav, setDesktopNav] = useState("data");

  // 생성/액션 모달
  const [createModal, setCreateModal] = useState({ type: null, open: false }); // type: 'reels'|'records'
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    item: null,
  });
  console.group("mypage");
  console.log(actionModal)
  console.groupEnd()

  // 프로필 폼
  const [editingProfile, setEditingProfile] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
  });

  const [busy, setBusy] = useState({ active: false, message: "" });

  // 공용 래퍼: 메시지와 함께 busy on/off
  const withBusy =
    (message, fn) =>
    async (...args) => {
      setBusy({ active: true, message });
      try {
        return await fn(...args);
      } finally {
        setBusy({ active: false, message: "" });
      }
    };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // user 바뀌면 폼 동기화
    setForm({
      name: user?.name || "",
      mobile: user?.mobile || "",
      email: user?.email || "",
    });
  }, [user?.name, user?.mobile, user?.email]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // const [r1, r2] = await Promise.all([
        //   fetchMyReels(token),
        //   fetchMyRecords(token),
        // ]);
        // setReels(r1.items || []);
        // setRecords(r2.items || []);
        const items = await fetchMyDatas({ token });
        setReels(items.items.reels)
        setRecords(items.items.records)
      } catch (e) {
        console.error(e);
        setError("데이터를 불러오는 중 문제가 발생했어요.");
      }
    })();
  }, [token]);

  // 공통 핸들러
  const openCreate = (type) => setCreateModal({ type, open: true });
  const closeCreate = () => setCreateModal({ type: null, open: false });

  const openAction = (type, item) => setActionModal({ open: true, type, item });
  const closeAction = () =>
    setActionModal({ open: false, type: null, item: null });

  const onConfirmCreate = withBusy(
    "생성 중...",
    async ({ identifier, name }) => {
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }
      try {
        if (createModal.type === "reels") {
          const res = await createReel(token, identifier, name);
          setReels((arr) => [res.item, ...arr]);
        } else {
          const res = await createRecord(token, identifier, name);
          setRecords((arr) => [res.item, ...arr]);
        }
        closeCreate();
      } catch (e) {
        console.error(e);
        setError(
          e?.message?.includes("409")
            ? "이미 존재하는 identifier예요."
            : e?.message || "생성 중 오류가 발생했어요.",
        );
      }
    },
  );

  const onSaveIdentifier = withBusy(
    "저장 중...",
    async (type, id, nextIdentifier, nextName) => {
      try {
        if (type === "reels") {
          const r = await updateReelIdentifier(
            token,
            id,
            nextIdentifier,
            nextName,
          );
          setReels((arr) =>
            arr.map((x) =>
              x.id === id
                ? {
                    ...x,
                    identifier: r.item.identifier,
                    name: r.item.name,
                    updatedAt: r.item.updatedAt,
                  }
                : x,
            ),
          );
        } else {
          const r = await updateRecordIdentifier(token, id, nextIdentifier);
          setRecords((arr) =>
            arr.map((x) =>
              x.id === id
                ? {
                    ...x,
                    identifier: r.item.identifier,
                    updatedAt: r.item.updatedAt,
                  }
                : x,
            ),
          );
        }
        closeAction();
      } catch (e) {
        console.error(e);
        setError(
          e?.message?.includes("409")
            ? "이미 존재하는 identifier예요."
            : "수정 중 오류가 발생했어요.",
        );
      }
    },
  );

  const onSaveProfile = withBusy("저장 중...", async () => {
    setError("");
    try {
      const saved = await updateMyProfile(token, {
        name: form.name?.trim(),
        mobile: form.mobile?.trim(),
        email: form.email?.trim() || null,
      });
      await signinWithToken(token, saved.user); // 컨텍스트 갱신
      setEditingProfile(false);
    } catch (e) {
      console.error(e);
      setError("프로필 저장에 실패했어요.");
    }
  });

  const goEditPage = (type, item) =>
    router.push(`/edit/${item.identifier}/${type}`); // 블랙박스 라우팅

  const pageStyle = {
    fontFamily:
      "pretendard, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif",
    width: "100vw",
    height: "100vh",
    overflow: "scroll",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "#fff",
    background:
      "linear-gradient(135deg, #37393bff 0%, #1e1f21ff 50%, #000 100%)",
  };
  const shellStyle = {
    width: "100vw",
    maxWidth: 768,
    boxSizing: "border-box",
    padding: isMobile ? "80px 24px" : "100px 40px",
  };

  return (
    <>
      {/* 상단 진행바: 가벼운 시각 피드백 */}
      <TopProgress active={busy.active} />
      <div style={pageStyle}>
        <div style={shellStyle}>
          <motion.p
            style={{
              color: "#fff",
              fontSize: isMobile ? "1.5rem" : "2rem",
              margin: 0,
              paddingBottom: 16,
              borderBottom: "2px solid #555",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            반가워요, <strong>{user?.name || "회원"}</strong>님
          </motion.p>

          {isMobile ? (
            <MobileLayout
              user={user}
              form={form}
              setForm={setForm}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              onSaveProfile={onSaveProfile}
              reels={reels}
              records={records}
              activeTab={mobileTab}
              setActiveTab={setMobileTab}
              onOpenCreate={openCreate}
              onOpenAction={openAction}
              onSaveIdentifier={onSaveIdentifier}
              onOpenEditor={goEditPage}
              createModal={createModal}
              actionModal={actionModal}
              closeCreate={closeCreate}
              closeAction={closeAction}
              onConfirmCreate={onConfirmCreate}
            />
          ) : (
            <DesktopLayout
              user={user}
              form={form}
              setForm={setForm}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              onSaveProfile={onSaveProfile}
              reels={reels}
              records={records}
              desktopNav={desktopNav}
              setDesktopNav={setDesktopNav}
              onOpenCreate={openCreate}
              onOpenAction={openAction}
              onSaveIdentifier={onSaveIdentifier}
              onOpenEditor={goEditPage}
              createModal={createModal}
              actionModal={actionModal}
              closeCreate={closeCreate}
              closeAction={closeAction}
              onConfirmCreate={onConfirmCreate}
            />
          )}

          {/* 공통 에러 토스트 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "fixed",
                  left: 20,
                  right: 20,
                  bottom: 30,
                  background: "#ff7d7d11",
                  color: "#ff7d7dff",
                  fontSize: 14,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #ff7d7d",
                  maxWidth: 640,
                  margin: "0 auto",
                }}
                onClick={() => setError("")}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* 오래 걸릴 때 전체 오버레이 */}
      <FullscreenBusy show={busy.active} message={busy.message} />
    </>
  );
}
