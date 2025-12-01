"use client";

import { useState } from "react";
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
import { dummy } from "../dummy";

export default function Pannel({
  type = "list",
  mode = "view",
  items,
  setItems,
  profile,
  setProfile,
  onItemClick
}) {
  const [savedItems, setSavedItems] = useState(items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [listHasChanges, setListHasChanges] = useState(false);
  const [unsavedItemIds, setUnsavedItemIds] = useState(new Set());
  const [isProfileView, setIsProfileView] = useState(false);

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

        return arrayMove(items, oldIndex, newIndex);
      });
      setListHasChanges(true);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setEditedData(item);
    setHasChanges(false);
    // 아이템 클릭 시 해당 아이템의 시작 미디어 인덱스로 이동
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleDeleteItem = (itemId) => {
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
    setHasChanges(false);
    setIsProfileView(false);
  };

  const handleProfileClick = () => {
    setIsProfileView(true);
    setSelectedItem(null);
    setEditedData(null);
    setHasChanges(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      if (isProfileView) {
        // 프로필은 자동 저장하지 않음
      } else if (selectedItem?.isNew) {
        // 새 아이템은 저장하지 않으면 버림
      } else if (selectedItem) {
        setUnsavedItemIds(prev => new Set([...prev, selectedItem.id]));
      }
    }
    setSelectedItem(null);
    setEditedData(null);
    setHasChanges(false);
    setIsProfileView(false);
  };

  const handleProfileChange = (newData) => {
    setProfile(newData);
    setHasChanges(true);
  };

  const handleSaveItem = () => {
    if (editedData) {
      if (selectedItem?.isNew) {
        // 새 아이템 추가
        const newItem = { ...editedData, isNew: false };
        setItems(prev => [newItem, ...prev]);
        setListHasChanges(true);
      } else if (selectedItem) {
        // 기존 아이템 업데이트
        const updatedItems = items.map((item) =>
          item.id === selectedItem.id ? { ...item, ...editedData } : item
        );
        setItems(updatedItems);
        setSavedItems(updatedItems);
        setUnsavedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedItem.id);
          return newSet;
        });
      }
      setHasChanges(false);
      setSelectedItem(null);
      setEditedData(null);
    }
  };

  const handleSaveAll = () => {
    setSavedItems(items);
    setListHasChanges(false);
    setUnsavedItemIds(new Set());
  };

  const handleChange = (newData) => {
    setEditedData(newData);
    setHasChanges(true);
  };

  if (isProfileView) {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] max-h-[400px] bg-black/20 backdrop-blur-md rounded-tl-[20px] rounded-tr-[20px] border border-white overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={hasChanges}
          onSave={() => {
            setListHasChanges(true);
            setHasChanges(false);
          }}
          onBack={handleBack}
        />
        <div className="flex-1 overflow-y-auto">
          <ProfileEdit profile={profile} onChange={handleProfileChange} mode={mode} />
        </div>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="fixed bottom-40 left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] max-h-[400px] bg-black/20 backdrop-blur-md rounded-[20px] border border-white overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={hasChanges}
          onSave={handleSaveItem}
          onBack={handleBack}
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

  if (type === "list") {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] max-h-[400px] bg-black/20 backdrop-blur-md rounded-tl-[20px] rounded-tr-[20px] border border-white overflow-hidden flex flex-col">
        <Header
          mode={mode}
          hasChanges={listHasChanges || unsavedItemIds.size > 0}
          onSave={handleSaveAll}
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
          <button
            onClick={handleProfileClick}
            className="flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/10"
          >
            <span className="text-white text-base">프로필</span>
          </button>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
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
