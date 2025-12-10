"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Pannel from "./components/Pannel";
import SceneRing from "./components/SceneRing";
import RingSlider from "./components/RingSlider";
import ProfileCurtain from "./components/ProfileCurtain";
import {
  buildTextureData,
  ensureMinimumTextures,
} from "./utils/textureBuilder";
import { getScene } from "./services/sceneService";

export default function ViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [mode, setMode] = useState("view");
  const [leftIndex, setLeftIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileCurtainOpen, setIsProfileCurtainOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // items와 profile state 관리
  const [items, setItems] = useState([
    // 프로필 아이템을 첫 번째로 고정
    {
      id: "profile",
      title: "프로필",
      date: "",
      isProfile: true,
    },
    // 기본 이벤트 아이템 하나 추가
    {
      id: "item-0",
      title: "첫 번째 이벤트",
      date: "",
      img: [],
    },
  ]);
  const [profile, setProfile] = useState({
    photo: "",
    name: "",
    birthDate: "",
    birthPlace: "",
    biography: "",
  });

  // Scene 데이터 로드 및 소유자 확인
  useEffect(() => {
    const loadScene = async () => {
      try {
        setLoading(true);
        const sceneData = await getScene(id);

        // 소유자 확인: sceneData.userId와 현재 로그인한 user.id 비교
        if (user && sceneData.userId && user.id === sceneData.userId) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }

        // 프로필 데이터 설정
        setProfile({
          photo: sceneData.profilePhoto || "",
          name: sceneData.profileName || "",
          birthDate: sceneData.profileBirthDate || "",
          birthPlace: sceneData.profileBirthPlace || "",
          biography: sceneData.profileBiography || "",
        });

        // 아이템 데이터가 있으면 설정, 없으면 기본 아이템 유지
        if (sceneData.items && sceneData.items.length > 0) {
          setItems([
            {
              id: "profile",
              title: "프로필",
              date: "",
              isProfile: true,
            },
            ...sceneData.items.map((item) => ({
              id: `item-${item.id}`,
              title: item.title || "",
              date: item.date || "",
              desc: item.desc || "",
              img: item.images?.map((img) => img.url) || [],
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to load scene:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadScene();
    }
  }, [id, user]);

  // 텍스쳐 데이터 빌드 - items와 profile 변경 시 리빌드
  const textureData = useMemo(() => {
    const { textures, itemRanges } = buildTextureData(profile, items);
    const paddedTextures = ensureMinimumTextures(textures, 100);

    return { textures: paddedTextures, itemRanges };
  }, [items, profile]);

  // 아이템 클릭 시 해당 아이템의 시작 미디어 인덱스로 이동
  const handleItemClick = (item) => {
    const itemRange = textureData.itemRanges[item.id];
    console.group("=== Item Click ===");
    console.log(`Clicked item: ${item.id} (${item.title})`);
    console.log("Item range:", itemRange);
    console.log("Current leftIndex:", leftIndex);
    if (itemRange) {
      console.log("Setting leftIndex to:", itemRange.start);
      setLeftIndex(itemRange.start);
    } else {
      console.log("No range found for item:", item.id);
    }
    console.groupEnd();
  };

  if (loading) {
    return (
      <div className="from-black-100 via-black-200 to-black-300 flex h-screen w-screen items-center justify-center bg-gradient-to-br font-sans text-white">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-black-100 via-black-200 to-black-300 relative h-screen w-screen overflow-hidden bg-gradient-to-br font-sans text-white">
      {/* 모바일 레이아웃 (< 700px) */}
      <div className="h-full w-full lg:hidden">
        {/* SceneRing - 중앙 배치 */}
        <div className="absolute inset-0 w-[220%]">
          <SceneRing
            slots={textureData.textures}
            leftIndex={leftIndex}
            onLeftmostChange={setLeftIndex}
            snapSpeed={10}
            popMode="band"
            popSpanSlots={1.2}
            bulge={1.2}
          />
        </div>

        {/* RingSlider - 하단 배치 */}
        <div className="absolute right-0 bottom-0 left-0 z-20">
          <RingSlider
            items={items}
            textureData={textureData}
            leftIndex={leftIndex}
            onChangeLeftIndex={setLeftIndex}
            onItemClick={handleItemClick}
            isPanelOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
            isDesktop={false}
            onOpenProfileCurtain={() => setIsProfileCurtainOpen(true)}
          />
        </div>

        {/* Pannel - 슬라이드 애니메이션과 함께 배치 */}
        <div
          className="absolute left-1/2 z-10 w-[92%] max-w-[450px] -translate-x-1/2 transition-all duration-500 ease-in-out"
          style={{
            bottom: isPanelOpen ? "170px" : "-600px",
          }}
        >
          <Pannel
            type="list"
            mode={mode}
            items={items}
            setItems={setItems}
            profile={profile}
            setProfile={setProfile}
            onItemClick={handleItemClick}
            onToggleMode={isOwner ? () => setMode(mode === "view" ? "edit" : "view") : null}
            sceneId={id}
          />
        </div>
      </div>

      {/* 데스크탑 레이아웃 (>= 700px) */}
      <div className="hidden h-full w-full items-end justify-center lg:flex">
        <div className="flex h-full w-full max-w-[700px] flex-col items-stretch justify-end overflow-hidden bg-transparent">
          {/* 링 + 패널 영역 */}
          <div className="relative mb-10 flex flex-1 items-end">
            {/* 패널 - 왼쪽 */}
            <div className="relative z-20 w-[350px] shrink-0 pl-4">
              <Pannel
                type="list"
                mode={mode}
                items={items}
                setItems={setItems}
                profile={profile}
                setProfile={setProfile}
                onItemClick={handleItemClick}
                onToggleMode={isOwner ? () => setMode(mode === "view" ? "edit" : "view") : null}
                sceneId={id}
              />
            </div>

            {/* 링 - 오른쪽 (넓게 표시하여 반만 보이게) */}
            <div
              className="absolute bottom-0 z-10 overflow-hidden"
              style={{
                // right: 'calc((100vw - 700px) / 2)',
                top:200,
                width: "200%",
                height: "100%",
              }}
            >
              <SceneRing
                slots={textureData.textures}
                leftIndex={leftIndex}
                onLeftmostChange={setLeftIndex}
                snapSpeed={10}
                popMode="band"
                popSpanSlots={1.2}
                bulge={1.2}
              />
            </div>
          </div>

          {/* 슬라이더 - 하단 */}
          <div className="z-20 w-full">
            <RingSlider
              items={items}
              textureData={textureData}
              leftIndex={leftIndex}
              onChangeLeftIndex={setLeftIndex}
              onItemClick={handleItemClick}
              isPanelOpen={true}
              onTogglePanel={() => {}}
              isDesktop={true}
              onOpenProfileCurtain={() => setIsProfileCurtainOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* 프로필 커튼 - 모바일과 데스크탑 모두 */}
      <ProfileCurtain
        open={isProfileCurtainOpen}
        onClose={() => setIsProfileCurtainOpen(false)}
        profile={profile}
      />
    </div>
  );
}
