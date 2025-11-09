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
import ViewPage from "@/app/view/[identifier]/reels/page";
import ReelsView from "./components/preview/ReelsView";

function useIsDesktop(min = 1024) {
  // lg 기준
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
  const { user, token, signinWithToken } = useAuth();
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [desktopShowMenu, setDesktopShowMenu] = useState(0);

  const [reel, setReel] = useState(null);
  const [childhood, setChildhood] = useState(null);
  const [memory, setMemory] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [lifestory, setLifestory] = useState(null);

  // ---------- Toast 상태/함수 ----------
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

  const [section, setSection] = useState([
    {
      kor: "프로필",
      eng: "Profile",
      editComponent: null,
    },
    {
      kor: "생애문",
      eng: "Lifestory",
      editComponent: null,
    },
    {
      kor: "갤러리",
      eng: "Gallery",
      editComponent: null,
    },
  ]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        console.group("editReels useEffect");
        console.log("token:", token);
        console.log("username:", username);
        console.groupEnd();
        const data = await fetchReelsDetails({ token, identifier: username });

        console.group("---fetch reel details---");
        console.log(data.item.reel);
        console.groupEnd();

        setReel(data.item.reel);
        setChildhood(data.item.childhood);
        setMemory(data.item.memory);
        setRelationship(data.item.relationship);
        setLifestory(data.item.lifestory);

        setSection([
          {
            kor: "프로필",
            eng: "Profile",
            editComponent: (
              <EditProfile
                reel={data.item.reel}
                onSaveReelProfile={handleSaveReelProfile}
                childhood={childhood}
                memory={memory}
                relationship={relationship}
                lifestory={lifestory}
                onToast={showToast}
              />
            ),
          },
          {
            kor: "생애문",
            eng: "Lifestory",
            editComponent: (
              <LifestorySection
                reelId={data.item.reel.id}
                userName={data.item.reel.name}
                isPreview={isPreview}
                onToast={showToast}
              />
            ),
          },
          {
            kor: "갤러리",
            eng: "Gallery",
            editComponent: (
              <EditGallery
                reelId={data.item.reel.id}
                reel={reel}
                initial={{
                  childhood: data.item.childhood,
                  memory: data.item.memorys,
                  relationship: data.item.relationships,
                }}
                onToast={showToast}
              />
            ),
          },
        ]);
      } catch (e) {
        console.error(e);
        setError("릴스 데이터를 불러오는 중 문제가 발생했어요.");
      }
    })();
  }, [token, username]);

  const handleSaveGallery = async () => {
    // 1) 기본 더미(신규 create 위주)로 테스트
    await updateReelsGalleryDetails({
      token, // 없으면 생략 가능 (백엔드가 인증 요구하면 반드시 넣기)
      id: reel?.identifier, // Reels.identifier
    });
  };

  const handleSaveReelProfile = async ({ img, item }) => {
    console.log(item);
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

  const mypage = () => {
    console.group("[onClick mypage] edit/[username]/page ");
    console.log("clicked");
    console.groupEnd();
    if (!isSaved) {
      // alert 열기
    }
    router.push("/mypage");
  };
  const preview = () => setIsPreview((p) => !p);
  const save = () => {};
  const logout = () => {};
  if (isPreview)
    return (
      <div className="bg-black-100 relative h-screen w-screen overflow-hidden justify-around text-white">
        <ReelsView identifier={username} />
        <div className="relative flex h-full w-full max-w-5xl items-stretch md:min-h-[calc(100vh-(--spacing(20))*2)]">
          {/* sticky Toolbar 래퍼는 그대로 */}
          <div className="pointer-events-none sticky top-[calc(100vh-80px)] z-1000">
            <div className="pointer-events-auto">
              <Toolbar
                mypage={mypage}
                preview={preview}
                save={save}
                logout={logout}
              />
            </div>
          </div>
        </div>
        
      </div>
    );
  return (
    <div className="bg-black-100 relative flex min-h-screen w-screen justify-around py-20 text-white">
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      <div className="relative flex h-full w-full max-w-5xl items-stretch md:min-h-[calc(100vh-(--spacing(20))*2)]">
        {/* sticky Toolbar 래퍼는 그대로 */}
        <div className="pointer-events-none sticky top-[calc(100vh-80px)] z-1000">
          <div className="pointer-events-auto">
            <Toolbar
              mypage={mypage}
              preview={preview}
              save={save}
              logout={logout}
            />
          </div>
        </div>

        {/* 드로어: 고정폭 + md에서 가용 높이를 최소 높이로 */}
        <div className="hidden w-64 shrink-0 md:block md:min-h-[calc(100vh-(--spacing(20))*2)]">
          <EditNavDrawer
            section={section}
            desktopShowMenu={desktopShowMenu}
            setDesktopShowMenu={setDesktopShowMenu}
          />
        </div>

        {/* 오른쪽 콘텐츠: 남은 공간 전부 + 같은 min-h */}
        <div className="flex min-w-0 flex-1 flex-col md:min-h-[calc(100vh-(--spacing(20))*2)]">
          {!reel ? (
            <div className="px-5 opacity-70">불러오는 중…</div>
          ) : (
            section.map((it, i) => {
              const toShow = i === desktopShowMenu || !isDesktop;
              console.log("section map: ", it.editComponent, i, toShow);
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
