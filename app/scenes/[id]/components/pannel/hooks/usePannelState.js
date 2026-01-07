import { useState, useRef, useEffect } from "react";

export function usePannelState({ items, onHasChangesChange }) {
  const [savedItems, setSavedItems] = useState(items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [listHasChanges, setListHasChanges] = useState(false);
  const [unsavedItemIds, setUnsavedItemIds] = useState(new Set());
  const [isProfileView, setIsProfileView] = useState(false);
  const [isLifestoryGuideMode, setIsLifestoryGuideMode] = useState(false);
  const [lifestoryProgressData, setLifestoryProgressData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewItemTooltip, setShowNewItemTooltip] = useState(false);
  const [newItemTooltipPosition, setNewItemTooltipPosition] = useState({ top: 0, left: 0 });

  // 모달 상태
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // 토스트 상태
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success", // "success" | "error" | "info"
  });

  const detailEditRef = useRef(null);
  const newItemButtonRef = useRef(null);

  // hasChanges 상태 변경을 부모 컴포넌트에 전달
  useEffect(() => {
    if (onHasChangesChange) {
      const totalHasChanges = hasChanges || listHasChanges || unsavedItemIds.size > 0;
      onHasChangesChange(totalHasChanges);
    }
  }, [hasChanges, listHasChanges, unsavedItemIds, onHasChangesChange]);

  return {
    savedItems,
    setSavedItems,
    selectedItem,
    setSelectedItem,
    editedData,
    setEditedData,
    originalData,
    setOriginalData,
    originalProfile,
    setOriginalProfile,
    hasChanges,
    setHasChanges,
    listHasChanges,
    setListHasChanges,
    unsavedItemIds,
    setUnsavedItemIds,
    isProfileView,
    setIsProfileView,
    isLifestoryGuideMode,
    setIsLifestoryGuideMode,
    lifestoryProgressData,
    setLifestoryProgressData,
    isUploading,
    setIsUploading,
    showNewItemTooltip,
    setShowNewItemTooltip,
    newItemTooltipPosition,
    setNewItemTooltipPosition,
    confirmModal,
    setConfirmModal,
    toast,
    setToast,
    detailEditRef,
    newItemButtonRef,
  };
}
