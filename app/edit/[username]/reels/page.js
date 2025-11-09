"use client";

import { useParams, useRouter } from "next/navigation";
import {
  fetchReelsDetails,
  updateReelsDetails,
  updateReelsGalleryDetails,
} from "../editApi";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Toolbar from "@/app/components/edit/ToolBar";
import TitleBlock from "./components/TitleBlock";
import EditProfile from "./components/EditProfile";
import EditGallery from "./components/gallery/EditGallery";
import EditNavDrawer from "./components/EditNavDrawer";
import LifestorySection from "./components/lifestory/LifestorySection";
import ToastStack from "@/app/components/Toast";
import ReelsView from "./components/preview/ReelsView";

// 화면 폭 체크(기존 그대로)
function useIsDesktop(min = 1024) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(min-width: ${min}px)`);
    const on = () => setOk(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [min]);
  return ok;
}

export default function EditReels() {
  const isDesktop = useIsDesktop(768);
  const { username } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [error, setError] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [desktopShowMenu, setDesktopShowMenu] = useState(0);

  // 데이터
  const [reel, setReel] = useState(null);
  const [childhood, setChildhood] = useState(null);
  const [memory, setMemory] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [lifestory, setLifestory] = useState(null);

  // Toast
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  };
  const showToast = (message, { tone = "success", duration = 2400 } = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, tone, duration }]);
    if (duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration + 120);
      timersRef.current.set(id, timer);
    }
  };
  useEffect(() => () => timersRef.current.forEach((t) => clearTimeout(t)), []);

  // 더티 상태 & ref
  const profileRef = useRef(null);
  const galleryRef = useRef(null);
  const lifestoryRef = useRef(null);
  const [dirty, setDirty] = useState({
    profile: false,
    gallery: false,
    lifestory: false,
  });
  const isSaved = !(dirty.profile || dirty.gallery || dirty.lifestory);

  // 섹션 탭 데이터
  const [section, setSection] = useState([
    { kor: "프로필", eng: "Profile", editComponent: null },
    { kor: "생애문", eng: "Lifestory", editComponent: null },
    { kor: "갤러리", eng: "Gallery", editComponent: null },
  ]);

  // 초기 로딩
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await fetchReelsDetails({ token, identifier: username });

        setReel(data.item.reel);
        setChildhood(data.item.childhood);
        setMemory(data.item.memory);
        setRelationship(data.item.relationship);
        setLifestory(data.item.lifestory);

        // 섹션 컴포넌트 주입 (ref/더티 콜백만 추가)
        setSection([
          {
            kor: "프로필",
            eng: "Profile",
            editComponent: (
              <EditProfile
                ref={profileRef}
                reel={data.item.reel}
                onSaveReelProfile={handleSaveReelProfile}
                onToast={showToast}
                onDirtyChange={(v) =>
                  setDirty((d) => ({ ...d, profile: !!v }))
                }
              />
            ),
          },
          {
            kor: "생애문",
            eng: "Lifestory",
            editComponent: (
              <LifestorySection
                ref={lifestoryRef}
                reelId={data.item.reel.id}
                userName={data.item.reel.name}
                isPreview={isPreview}
                onToast={showToast}
                onDirtyChange={(v) =>
                  setDirty((d) => ({ ...d, lifestory: !!v }))
                }
              />
            ),
          },
          {
            kor: "갤러리",
            eng: "Gallery",
            editComponent: (
              <EditGallery
                ref={galleryRef}
                reelId={data.item.reel.id}
                reel={data.item.reel}
                initial={{
                  childhood: data.item.childhood,
                  memory: data.item.memorys, // 기존 소스 그대로
                  relationship: data.item.relationships, // 기존 소스 그대로
                }}
                onToast={showToast}
                onDirtyAnyChange={(v) =>
                  setDirty((d) => ({ ...d, gallery: !!v }))
                }
              />
            ),
          },
        ]);
      } catch (e) {
        console.error(e);
        setError("릴스 데이터를 불러오는 중 문제가 발생했어요.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, username, isPreview]);

  // 프로필 개별 저장(기존 로직 유지)
  const handleSaveReelProfile = async ({ img, item }) => {
    const id = item.id;
    const profile = {
      profileImg: img,
      name: item.name,
      birthDate: item.birthDate,
      birthPlace: item.birthPlace,
      motto: item.motto,
    };
    await updateReelsDetails({ token, id, data: profile });
  };

  // ---- 통합 Save 구현 ----
  const save = async () => {
    try {
      const tasks = [];
      console.log(profileRef.current)
      console.log(galleryRef.current)
      console.log(lifestoryRef.current)
      // 프로필
      if (profileRef.current?.hasUnsaved?.()) {
        tasks.push(profileRef.current.save());
      }
      // 갤러리(3섹션 내부적으로 모두 저장)
      if (galleryRef.current?.hasUnsaved?.()) {
        tasks.push(galleryRef.current.saveAll());
      }
      // 생애문(섹션 내부 저장 메서드 노출)
      if (lifestoryRef.current?.hasUnsaved?.()) {
        tasks.push(lifestoryRef.current.save());
      }

      await Promise.all(tasks);
      setDirty({ profile: false, gallery: false, lifestory: false });
      showToast("모든 변경사항이 저장되었습니다.", { tone: "success" });
      return true;
    } catch (e) {
      console.error(e);
      showToast("저장 중 오류가 발생했어요.", { tone: "error" });
      return false;
    }
  };

  // ---- 네비게이션 가드(미저장 경고) ----
  const mypage = async () => {
    if (isSaved) {
      router.push("/mypage");
      return;
    }
    const wantSave = window.confirm(
      "저장되지 않은 변경사항이 있습니다. 저장하시겠어요?"
    );
    if (!wantSave) return;

    const ok = await save();
    if (!ok) return;

    const go = window.confirm("저장되었습니다. 마이페이지로 이동할까요?");
    if (go) router.push("/mypage");
  };

  const logout = async () => {
    if (isSaved) {
      router.push("/"); // 요구사항: 루트로
      return;
    }
    const wantSave = window.confirm(
      "저장되지 않은 변경사항이 있습니다. 저장하시겠어요?"
    );
    if (!wantSave) return;

    const ok = await save();
    if (!ok) return;

    const go = window.confirm("저장되었습니다. 로그아웃하시겠어요?");
    if (go) router.push("/");
  };

  const preview = () => setIsPreview((p) => !p);

  if (isPreview) {
    return (
      <div className="bg-black-100 relative h-screen w-screen overflow-hidden justify-around text-white">
        <ReelsView identifier={username} />
        <div className="relative flex h-full w-full max-w-5xl items-stretch md:min-h-[calc(100vh-(--spacing(20))*2)]">
          <div className="pointer-events-none sticky top-[calc(100vh-80px)] z-1000">
            <div className="pointer-events-auto">
              <Toolbar mypage={mypage} preview={preview} save={save} logout={logout} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black-100 relative flex min-h-screen w-screen justify-around py-20 text-white">
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      <div className="relative flex h-full w-full max-w-5xl items-stretch md:min-h-[calc(100vh-(--spacing(20))*2)]">
        <div className="pointer-events-none sticky top-[calc(100vh-80px)] z-1000">
          <div className="pointer-events-auto">
            <Toolbar mypage={mypage} preview={preview} save={save} logout={logout} />
          </div>
        </div>

        <div className="hidden w-64 shrink-0 md:block md:min-h-[calc(100vh-(--spacing(20))*2)]">
          <EditNavDrawer
            section={section}
            desktopShowMenu={desktopShowMenu}
            setDesktopShowMenu={setDesktopShowMenu}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col md:min-h-[calc(100vh-(--spacing(20))*2)]">
          {!reel ? (
            <div className="px-5 opacity-70">불러오는 중…</div>
          ) : (
            section.map((it, i) => {
              const toShow = i === desktopShowMenu || !isDesktop;
              return (
                toShow && (
                  <div key={i} className="h-full w-full px-5">
                    {!isDesktop && <TitleBlock kor={it.kor} eng={it.eng} />}
                    <div className="h-full w-full">{it.editComponent}</div>
                  </div>
                )
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
