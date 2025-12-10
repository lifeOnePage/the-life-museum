"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ItemBlock from "./ItemBlock";
import Header from "./Header";
import DetailView from "./DetailView";
import DetailEdit from "./DetailEdit";
import ProfileEdit from "./ProfileEdit";
import LifestoryGuide from "./LifestoryGuide";
import { dummy } from "../dummy";

import { updateScene } from "../services/sceneService";

export default function Pannel({
  type = "list",
  mode = "view",
  items,
  setItems,
  profile,
  setProfile,
  onItemClick,
  onToggleMode,
  sceneId,
  currentItem
}) {
  const [savedItems, setSavedItems] = useState(items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // 원본 데이터 저장
  const [hasChanges, setHasChanges] = useState(false);
  const [listHasChanges, setListHasChanges] = useState(false);
  const [unsavedItemIds, setUnsavedItemIds] = useState(new Set());
  const [isProfileView, setIsProfileView] = useState(false);
  const [isLifestoryGuideMode, setIsLifestoryGuideMode] = useState(false);
  const [lifestoryProgressData, setLifestoryProgressData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const detailEditRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // 프로필 아이템이 관련된 경우 드래그 방지
        if (items[oldIndex]?.isProfile || items[newIndex]?.isProfile) {
          return items;
        }

        const newItems = arrayMove(items, oldIndex, newIndex);

        // 프로필 아이템이 항상 첫 번째에 있도록 보장
        const profileIndex = newItems.findIndex(item => item.isProfile);
        if (profileIndex > 0) {
          const profile = newItems[profileIndex];
          newItems.splice(profileIndex, 1);
          newItems.unshift(profile);
        }

        return newItems;
      });
      setListHasChanges(true);
    }
  };

  const handleItemClick = (item) => {
    // 프로필 아이템 클릭 시 프로필 뷰로 이동
    if (item.isProfile) {
      setIsProfileView(true);
      setSelectedItem(null);
      setEditedData(null);
      setOriginalData(null);
      setHasChanges(false);
      return;
    }

    setSelectedItem(item);
    setEditedData(item);
    // 원본 데이터 저장 (비교용)
    setOriginalData(JSON.parse(JSON.stringify(item)));
    setHasChanges(false);
    // 아이템 클릭 시 해당 아이템의 시작 미디어 인덱스로 이동
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleDeleteItem = (itemId) => {
    // 프로필 아이템은 삭제 불가
    if (itemId === "profile") return;

    setItems(prev => prev.filter(item => item.id !== itemId));
    setListHasChanges(true);
    setUnsavedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleAddNew = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: "",
      date: "",
      desc: "",
      img: [],
      isNew: true,
    };
    setSelectedItem(newItem);
    setEditedData(newItem);
    setOriginalData(JSON.parse(JSON.stringify(newItem)));
    setHasChanges(false);
    setIsProfileView(false);
  };

  const handleBack = () => {
    // hasChanges는 handleChange에서 이미 정확하게 계산되었으므로
    // 여기서는 추가로 unsavedItemIds를 설정하지 않음
    // (handleChange에서 이미 처리함)
    setSelectedItem(null);
    setEditedData(null);
    setOriginalData(null);
    setHasChanges(false);
    setIsProfileView(false);
  };

  // 슬라이더로 이벤트가 변경될 때 자동으로 패널 업데이트 (보기 모드 + 상세보기 중일 때만)
  useEffect(() => {
    // 편집 모드이거나, 상세보기가 아니거나, currentItem이 없으면 무시
    if (mode === "edit" || !selectedItem || !currentItem || isProfileView) {
      return;
    }

    // 프로필 아이템은 무시
    if (currentItem.isProfile) {
      return;
    }

    // 현재 선택된 아이템과 슬라이더의 currentItem이 다르면 자동 전환
    if (selectedItem.id !== currentItem.id) {
      setSelectedItem(currentItem);
      setEditedData(currentItem);
      setOriginalData(JSON.parse(JSON.stringify(currentItem)));
      setHasChanges(false);
    }
  }, [currentItem, selectedItem, mode, isProfileView]);

  const handleProfileChange = (newData) => {
    setProfile(newData);
    setHasChanges(true);
  };

  const handleSaveItem = async () => {
    if (!editedData || !sceneId) {
      console.error("No editedData or sceneId");
      return;
    }

    try {
      setIsUploading(true);

      // 먼저 이미지 업로드
      let finalEditedData = editedData;
      let uploadedUrls = [];

      if (detailEditRef.current?.uploadPendingImages) {
        try {
          const uploadedImages = await detailEditRef.current.uploadPendingImages();
          uploadedUrls = uploadedImages.map(img => img.url);
          finalEditedData = {
            ...editedData,
            img: uploadedUrls
          };
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
          setIsUploading(false);
          return;
        }
      } else {
        // detailEditRef가 없거나 uploadPendingImages가 없는 경우, editedData._uploadedUrls 사용
        uploadedUrls = editedData._uploadedUrls ||
          (Array.isArray(editedData.img) ? editedData.img.filter(i => typeof i === 'string') : []);
        finalEditedData = {
          ...editedData,
          img: uploadedUrls
        };
      }

      let updatedItems;

      if (selectedItem?.isNew) {
        // 새 아이템 추가
        const newItem = {
          ...finalEditedData,
          id: finalEditedData.id || selectedItem.id, // id 유지
          isNew: false,
          // _uploadedUrls 명시적으로 설정
          _uploadedUrls: uploadedUrls
        };
        updatedItems = items.map(item =>
          item.isProfile ? item : item
        );
        // 프로필 다음에 새 아이템 추가
        const profileIndex = updatedItems.findIndex(item => item.isProfile);
        updatedItems.splice(profileIndex + 1, 0, newItem);
        setItems(updatedItems);
      } else if (selectedItem) {
        // 기존 아이템 업데이트
        updatedItems = items.map((item) =>
          item.id === selectedItem.id ? {
            ...item,
            ...finalEditedData,
            // _uploadedUrls 명시적으로 설정
            _uploadedUrls: uploadedUrls
          } : item
        );
        setItems(updatedItems);
      }

      console.log("[Pannel.handleSaveItem] finalEditedData:", finalEditedData);
      console.log("[Pannel.handleSaveItem] updatedItems:", updatedItems);

      // DB에 저장 - 업로드된 URL만 사용
      const itemsToSave = updatedItems
        .filter(item => !item.isProfile)
        .map(item => ({
          title: item.title || "",
          date: item.date || "",
          desc: item.desc || "",
          // _uploadedUrls가 있으면 사용, 없으면 img 사용 (하위 호환성)
          img: item._uploadedUrls || (Array.isArray(item.img) ? item.img.filter(i => typeof i === 'string') : [])
        }));

      console.log("[Pannel.handleSaveItem] Items to save:", JSON.stringify(itemsToSave, null, 2));

      await updateScene(sceneId, {
        profile: {
          photo: profile.photo || "",
          name: profile.name || "",
          birthDate: profile.birthDate || "",
          birthPlace: profile.birthPlace || "",
          biography: profile.biography || ""
        },
        items: itemsToSave,
        lifestoryProgress: lifestoryProgressData
      });

      setSavedItems(updatedItems);
      setUnsavedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedItem.id);
        return newSet;
      });
      setHasChanges(false);
      setSelectedItem(null);
      setEditedData(null);
      setOriginalData(null);
      setIsUploading(false);

      console.log("[Pannel.handleSaveItem] Items after save:", updatedItems.map(i => ({ id: i.id, title: i.title, isProfile: i.isProfile })));

      alert("저장되었습니다.");
    } catch (error) {
      console.error("Failed to save item:", error);
      setIsUploading(false);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleSaveAll = async () => {
    if (!sceneId) {
      console.error("No sceneId provided");
      return;
    }

    try {
      // items에서 프로필 제외하고 전송
      const itemsToSave = items
        .filter(item => !item.isProfile)
        .map(item => ({
          title: item.title || "",
          date: item.date || "",
          desc: item.desc || "",
          img: item._uploadedUrls || (Array.isArray(item.img) ? item.img.filter(i => typeof i === 'string') : [])
        }));

      await updateScene(sceneId, {
        profile: {
          photo: profile.photo || "",
          name: profile.name || "",
          birthDate: profile.birthDate || "",
          birthPlace: profile.birthPlace || "",
          biography: profile.biography || ""
        },
        items: itemsToSave,
        lifestoryProgress: lifestoryProgressData
      });

      setSavedItems(items);
      setListHasChanges(false);
      setUnsavedItemIds(new Set());
      alert("저장되었습니다.");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleChange = (newData) => {
    setEditedData(newData);

    // 원본과 비교하여 실제 변경이 있는지 확인
    if (originalData) {
      // _uploadedUrls와 _hasPendingImages는 비교에서 제외
      const originalForCompare = {
        title: originalData.title || "",
        date: originalData.date || "",
        desc: originalData.desc || "",
        img: Array.isArray(originalData.img)
          ? originalData.img.filter(i => typeof i === 'string' || i.isUploaded).map(i => typeof i === 'string' ? i : i.url)
          : []
      };

      const newForCompare = {
        title: newData.title || "",
        date: newData.date || "",
        desc: newData.desc || "",
        img: newData._uploadedUrls ||
          (Array.isArray(newData.img)
            ? newData.img.filter(i => typeof i === 'string' || i?.isUploaded).map(i => typeof i === 'string' ? i : i?.url || i)
            : [])
      };

      const hasActualChanges = JSON.stringify(originalForCompare) !== JSON.stringify(newForCompare) || newData._hasPendingImages;
      setHasChanges(hasActualChanges);

      // unsavedItemIds 업데이트
      if (selectedItem && !selectedItem.isNew) {
        if (hasActualChanges) {
          setUnsavedItemIds(prev => new Set([...prev, selectedItem.id]));
        } else {
          setUnsavedItemIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedItem.id);
            return newSet;
          });
        }
      }
    } else {
      setHasChanges(true);
    }
  };

  const handleStartLifestoryGuide = () => {
    setIsLifestoryGuideMode(true);
  };

  const handleExitLifestoryGuide = (progressData) => {
    // 진행 상황 저장
    if (progressData) {
      setLifestoryProgressData(progressData);
    }
    setIsLifestoryGuideMode(false);
  };

  const handleApplyLifestory = (generatedStory, progressData) => {
    // 생성된 생애문을 profile의 biography에 적용
    setProfile(prev => ({ ...prev, biography: generatedStory }));
    // 진행 상황 저장
    if (progressData) {
      setLifestoryProgressData(progressData);
    }
    setIsLifestoryGuideMode(false);
    setHasChanges(true);
  };

  if (isProfileView) {
    // 생애문 가이드 모드
    if (isLifestoryGuideMode) {
      return (
        <div className="w-full max-h-[540px] bg-black-100/20 backdrop-blur-2xl rounded-tl-[20px] rounded-tr-[20px] overflow-y-auto flex flex-col">
          <LifestoryGuide
            userName={profile?.name || "사용자"}
            onBack={handleExitLifestoryGuide}
            onApply={handleApplyLifestory}
            initialData={lifestoryProgressData}
          />
        </div>
      );
    }

    // 일반 프로필 뷰
    return (
      <div className="w-full max-h-[540px] bg-black-100/20 backdrop-blur-2xl  rounded-tl-[20px] rounded-tr-[20px]  overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={hasChanges}
          onSave={async () => {
            if (!sceneId) {
              console.error("No sceneId provided");
              return;
            }

            try {
              // 프로필만 저장
              const itemsToSave = items
                .filter(item => !item.isProfile)
                .map(item => ({
                  title: item.title || "",
                  date: item.date || "",
                  desc: item.desc || "",
                  img: item._uploadedUrls || (Array.isArray(item.img) ? item.img.filter(i => typeof i === 'string') : [])
                }));

              await updateScene(sceneId, {
                profile: {
                  photo: profile.photo || "",
                  name: profile.name || "",
                  birthDate: profile.birthDate || "",
                  birthPlace: profile.birthPlace || "",
                  biography: profile.biography || ""
                },
                items: itemsToSave,
                lifestoryProgress: lifestoryProgressData
              });

              setHasChanges(false);
              alert("프로필이 저장되었습니다.");
            } catch (error) {
              console.error("Failed to save profile:", error);
              alert("저장 중 오류가 발생했습니다.");
            }
          }}
          onBack={handleBack}
          onToggleMode={onToggleMode}
        />
        <div className="flex-1 overflow-y-auto">
          <ProfileEdit
            profile={profile}
            onChange={handleProfileChange}
            mode={mode}
            onStartLifestoryGuide={handleStartLifestoryGuide}
          />
        </div>
      </div>
    );
  }

  if (selectedItem && (mode === "view")) {
    return (
      <div className="w-full rounded-[20px] overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={hasChanges}
          onSave={handleSaveItem}
          onBack={handleBack}
          onToggleMode={onToggleMode}
        />
        <div className="flex-1 overflow-y-auto">
          {mode === "view" ? (
            <DetailView item={selectedItem} />
          ) : (
            <DetailEdit item={editedData} onChange={handleChange} />
          )}
        </div>
      </div>
    );
  }

  if (selectedItem && (mode !== "view")) {
    return (
      <div className="w-full max-h-[600px] bg-black-100/20 backdrop-blur-2xl rounded-[20px] overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={hasChanges}
          onSave={handleSaveItem}
          onBack={handleBack}
          onToggleMode={onToggleMode}
          isDisabled={isUploading}
        />
        <div className="flex-1 overflow-y-auto">
          {mode === "view" ? (
            <DetailView item={selectedItem} />
          ) : (
            <DetailEdit
              ref={detailEditRef}
              item={editedData}
              onChange={handleChange}
              onUploadStateChange={setIsUploading}
            />
          )}
        </div>
      </div>
    );
  }

  if (type === "list"&& (mode === "view")) {
    return (
      <div className="w-full max-h-[240px] rounded-[20px] overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={listHasChanges || unsavedItemIds.size > 0}
          onSave={handleSaveAll}
          onToggleMode={onToggleMode}
        />
        <div className="flex flex-col flex-1 overflow-y-auto">
          {mode === "edit" && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 5V15M5 10H15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-white text-base">새로 만들기</span>
            </button>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => {
                console.log("[Pannel View Mode] Item ID:", item.id, "isProfile:", item.isProfile, "title:", item.title);
                return item.id;
              })}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {items.map((item) => (
                  <ItemBlock
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    date={item.date}
                    mode={mode}
                    hasUnsavedChanges={unsavedItemIds.has(item.id)}
                    onClick={() => handleItemClick(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                    isProfile={item.isProfile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    );
  }

    if (type === "list"&& (mode !== "view")) {
    return (
      <div className="w-full max-h-[400px] bg-black-100/20 backdrop-blur-2xl rounded-[20px] overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={listHasChanges || unsavedItemIds.size > 0}
          onSave={handleSaveAll}
          onToggleMode={onToggleMode}
        />
        <div className="flex flex-col flex-1 overflow-y-auto">
          {mode === "edit" && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 5V15M5 10H15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-white text-base">새로 만들기</span>
            </button>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => {
                console.log("[Pannel Edit Mode] Item ID:", item.id, "isProfile:", item.isProfile, "title:", item.title);
                return item.id;
              })}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {items.map((item) => (
                  <ItemBlock
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    date={item.date}
                    mode={mode}
                    hasUnsavedChanges={unsavedItemIds.has(item.id)}
                    onClick={() => handleItemClick(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                    isProfile={item.isProfile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-transparent text-white">
      <p>Type: {type}</p>
      <p>Mode: {mode}</p>
    </div>
  );
}
