"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Pannel from "./components/Pannel";
import SceneRing from "./components/SceneRing";
import RingSlider from "./components/RingSlider";
import { buildTextureData, ensureMinimumTextures } from "./utils/textureBuilder";
import { dummy } from "./dummy";

export default function ViewPage() {
  const { id } = useParams();
  const [mode, setMode] = useState("view");
  const [leftIndex, setLeftIndex] = useState(0);

  // items와 profile state 관리
  const [items, setItems] = useState(
    dummy.map((item, index) => ({
      id: `item-${index}`,
      ...item,
    }))
  );
  const [profile, setProfile] = useState({
    photo: "",
    name: "",
    birthDate: "",
    birthPlace: "",
    biography: "",
  });

  // 텍스쳐 데이터 빌드 - items와 profile 변경 시 리빌드
  const textureData = useMemo(() => {
    const { textures, itemRanges } = buildTextureData(profile, items);
    const paddedTextures = ensureMinimumTextures(textures, 100);

    return { textures: paddedTextures, itemRanges };
  }, [items, profile]);

  // 아이템 클릭 시 해당 아이템의 시작 미디어 인덱스로 이동
  const handleItemClick = (item) => {
    const itemRange = textureData.itemRanges[item.id];
    console.group('=== Item Click ===');
    console.log(`Clicked item: ${item.id} (${item.title})`);
    console.log('Item range:', itemRange);
    console.log('Current leftIndex:', leftIndex);
    if (itemRange) {
      console.log('Setting leftIndex to:', itemRange.start);
      setLeftIndex(itemRange.start);
    } else {
      console.log('No range found for item:', item.id);
    }
    console.groupEnd();
  };

  return (
    <div className="bg-gradient-to-br from-black-100 via-black-200 to-black-300 font-sans relative h-screen w-screen overflow-hidden text-white">
      {/* SceneRing - 중앙 배치 */}
      <div className="absolute inset-0 w-[280%] ">
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

      {/* 디버그 UI */}
      <div className="absolute top-5 left-5 z-10">
        <h1 className="text-xl mb-2">Scene: {id}</h1>
        <button
          onClick={() => setMode(mode === "view" ? "edit" : "view")}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
        >
          Mode: {mode}
        </button>
        <p className="mt-2 text-sm">Left Index: {leftIndex}</p>
        <p className="text-sm">Textures: {textureData.textures.length}</p>
      </div>

      {/* RingSlider - 하단 배치 */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <RingSlider
          items={items}
          textureData={textureData}
          leftIndex={leftIndex}
          onChangeLeftIndex={setLeftIndex}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Pannel - 하단 배치 (RingSlider 뒤에) */}
      {/* <Pannel
        type="list"
        mode={mode}
        items={items}
        setItems={setItems}
        profile={profile}
        setProfile={setProfile}
        onItemClick={handleItemClick}
      /> */}
    </div>
  );
}
