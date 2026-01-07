import { updateScene } from "../../../services/sceneService";

export function usePannelHandlers({
  state,
  items,
  setItems,
  profile,
  setProfile,
  onItemClick,
  sceneId,
}) {
  const {
    setSelectedItem,
    setEditedData,
    setOriginalData,
    setOriginalProfile,
    setHasChanges,
    setListHasChanges,
    setUnsavedItemIds,
    setIsProfileView,
    setIsLifestoryGuideMode,
    setLifestoryProgressData,
    setIsUploading,
    setSavedItems,
    detailEditRef,
  } = state;

  const handleItemClick = (item) => {
    // 프로필 아이템 클릭 시 - 편집 모드에서는 프로필 뷰로 이동
    if (item.isProfile) {
      setIsProfileView(true);
      setSelectedItem(null);
      setEditedData(null);
      setOriginalData(null);
      // 프로필 원본 저장
      setOriginalProfile(JSON.parse(JSON.stringify(profile)));
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

    // 삭제 확인 모달 표시
    state.setConfirmModal({
      isOpen: true,
      title: "정말 삭제하시겠습니까?",
      message: "이벤트 안의 사진과 내용이 모두 삭제됩니다.",
      onConfirm: async () => {
        try {
          // 삭제될 아이템을 제외한 나머지 아이템들
          const updatedItems = items.filter(item => item.id !== itemId);

          // DB에 즉시 저장
          const itemsToSave = updatedItems
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
            lifestoryProgress: state.lifestoryProgressData
          });

          // 로컬 state 업데이트
          setItems(updatedItems);
          setSavedItems(updatedItems);
          setUnsavedItemIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });

          // 모달 닫기
          state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });

          // 성공 토스트 표시
          state.setToast({
            isOpen: true,
            message: "삭제되었습니다.",
            type: "success",
          });
        } catch (error) {
          console.error("Failed to delete item:", error);

          // 모달 닫기
          state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });

          // 에러 토스트 표시
          state.setToast({
            isOpen: true,
            message: "삭제 중 오류가 발생했습니다.",
            type: "error",
          });
        }
      },
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

    // items 배열에 새 아이템 추가
    setItems(prev => [...prev, newItem]);

    setSelectedItem(newItem);
    setEditedData(newItem);
    setOriginalData(JSON.parse(JSON.stringify(newItem)));
    setHasChanges(false);
    setIsProfileView(false);
  };

  const handleBack = (discardChanges = false) => {
    // 새 아이템인 경우 items 배열에서 제거 (저장되지 않았으므로)
    if (state.selectedItem?.isNew) {
      setItems(prevItems =>
        prevItems.filter(item => item.id !== state.selectedItem.id)
      );
    }
    // 변경사항을 버리는 경우
    else if (discardChanges) {
      // 프로필 뷰인 경우 프로필 복원
      if (state.isProfileView && state.originalProfile) {
        setProfile(state.originalProfile);
      }
      // 일반 아이템인 경우
      else if (state.selectedItem) {
        setUnsavedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(state.selectedItem.id);
          return newSet;
        });

        // 원본 데이터로 복원
        if (state.originalData) {
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === state.selectedItem.id ? state.originalData : item
            )
          );
        }
      }
    }

    setSelectedItem(null);
    setEditedData(null);
    setOriginalData(null);
    setOriginalProfile(null);
    setHasChanges(false);
    setIsProfileView(false);
  };

  const handleShowExitConfirm = () => {
    state.setConfirmModal({
      isOpen: true,
      title: "나가시겠습니까?",
      message: "변경 내용이 저장되지 않습니다.",
      onConfirm: () => {
        // 모달 닫기
        state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        // 변경사항 버리고 나가기
        handleBack(true);
      },
    });
  };

  const handleProfileChange = (newData) => {
    setProfile(newData);
    setHasChanges(true);
  };

  const handleSaveItem = async () => {
    if (!state.editedData || !sceneId) {
      console.error("No editedData or sceneId");
      return;
    }

    try {
      setIsUploading(true);

      // 먼저 이미지 업로드 (새로 추가된 파일만 스토리지에 업로드)
      let finalEditedData = state.editedData;
      let uploadedUrls = [];

      if (detailEditRef.current?.uploadPendingImages) {
        try {
          // uploadPendingImages는 새 파일만 업로드하고, 전체 이미지 배열 반환 (기존 URL + 새 URL)
          const uploadedImages = await detailEditRef.current.uploadPendingImages();
          uploadedUrls = uploadedImages.map(img => img.url);
          finalEditedData = {
            ...state.editedData,
            img: uploadedUrls
          };
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setIsUploading(false);
          state.setToast({
            isOpen: true,
            message: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
            type: "error",
          });
          return;
        }
      } else {
        // detailEditRef가 없는 경우 (예: 이미 업로드된 URL만 있음)
        uploadedUrls = state.editedData._uploadedUrls ||
          (Array.isArray(state.editedData.img) ? state.editedData.img.filter(i => typeof i === 'string') : []);
        finalEditedData = {
          ...state.editedData,
          img: uploadedUrls
        };
      }

      let updatedItems;

      if (state.selectedItem?.isNew) {
        // 새 아이템 추가: 기존의 임시 아이템(isNew: true)을 실제 데이터로 교체
        updatedItems = items.map((item) => {
          if (item.id === state.selectedItem.id) {
            return {
              ...finalEditedData,
              id: item.id,
              isNew: false,
              _uploadedUrls: uploadedUrls
            };
          }
          return item;
        });
        setItems(updatedItems);
      } else if (state.selectedItem) {
        // 기존 아이템 업데이트
        updatedItems = items.map((item) =>
          item.id === state.selectedItem.id ? {
            ...item,
            ...finalEditedData,
            _uploadedUrls: uploadedUrls
          } : item
        );
        setItems(updatedItems);
      }

      // DB에 저장
      const itemsToSave = updatedItems
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
        lifestoryProgress: state.lifestoryProgressData
      });

      setSavedItems(updatedItems);
      setUnsavedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(state.selectedItem.id);
        return newSet;
      });
      setHasChanges(false);
      setIsUploading(false);

      // 저장 성공 토스트
      state.setToast({
        isOpen: true,
        message: "성공적으로 저장되었습니다.",
        type: "success",
      });

      // 상태 업데이트 (디테일 뷰에 머무름)
      const savedItem = {
        ...finalEditedData,
        isNew: false,
        _uploadedUrls: uploadedUrls
      };
      setSelectedItem(savedItem);
      setEditedData(savedItem);
      setOriginalData(JSON.parse(JSON.stringify(savedItem)));
    } catch (error) {
      console.error("Failed to save item:", error);
      setIsUploading(false);

      // 저장 실패 토스트
      state.setToast({
        isOpen: true,
        message: "저장 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const handleSaveAll = async () => {
    if (!sceneId) {
      console.error("No sceneId provided");
      return;
    }

    try {
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
        lifestoryProgress: state.lifestoryProgressData
      });

      setSavedItems(items);
      setListHasChanges(false);
      setUnsavedItemIds(new Set());

      // 저장 성공 토스트
      state.setToast({
        isOpen: true,
        message: "성공적으로 저장되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save:", error);

      // 저장 실패 토스트
      state.setToast({
        isOpen: true,
        message: "저장 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const handleCancelListChanges = () => {
    // savedItems로 items 복원
    setItems(state.savedItems);
    setListHasChanges(false);
    setUnsavedItemIds(new Set());
  };

  const handleCancelDetailChanges = () => {
    // 새 아이템이 아닌 경우에만 취소 가능
    if (!state.selectedItem?.isNew && state.originalData) {
      // DetailEdit의 내부 상태 강제 초기화
      if (detailEditRef.current?.resetFormData) {
        detailEditRef.current.resetFormData(state.originalData);
      }

      // 원본 데이터로 복원
      setEditedData(state.originalData);
      setHasChanges(false);

      // items 배열도 원본으로 복원
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === state.selectedItem.id ? state.originalData : item
        )
      );

      // unsavedItemIds에서 제거
      setUnsavedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(state.selectedItem.id);
        return newSet;
      });
    }
  };

  const handleCancelProfileChanges = () => {
    // 원본 프로필로 복원
    if (state.originalProfile) {
      setProfile(state.originalProfile);
      setHasChanges(false);
    }
  };

  const handleChange = (newData) => {
    setEditedData(newData);

    // 원본과 비교하여 실제 변경이 있는지 확인
    if (state.originalData) {
      const originalForCompare = {
        title: state.originalData.title || "",
        date: state.originalData.date || "",
        desc: state.originalData.desc || "",
        img: Array.isArray(state.originalData.img)
          ? state.originalData.img.filter(i => typeof i === 'string' || i.isUploaded).map(i => typeof i === 'string' ? i : i.url)
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
      if (state.selectedItem && !state.selectedItem.isNew) {
        if (hasActualChanges) {
          setUnsavedItemIds(prev => new Set([...prev, state.selectedItem.id]));
        } else {
          setUnsavedItemIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(state.selectedItem.id);
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
    if (progressData) {
      setLifestoryProgressData(progressData);
    }
    setIsLifestoryGuideMode(false);
  };

  const handleApplyLifestory = (generatedStory, progressData) => {
    setProfile(prev => ({ ...prev, biography: generatedStory }));
    if (progressData) {
      setLifestoryProgressData(progressData);
    }
    setIsLifestoryGuideMode(false);
    setHasChanges(true);
  };

  const handleSaveProfile = async () => {
    if (!sceneId) {
      console.error("No sceneId provided");
      return;
    }

    try {
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
        lifestoryProgress: state.lifestoryProgressData
      });

      setHasChanges(false);

      // 저장 성공 토스트
      state.setToast({
        isOpen: true,
        message: "성공적으로 저장되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);

      // 저장 실패 토스트
      state.setToast({
        isOpen: true,
        message: "저장 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  return {
    handleItemClick,
    handleDeleteItem,
    handleAddNew,
    handleBack,
    handleShowExitConfirm,
    handleProfileChange,
    handleSaveItem,
    handleSaveAll,
    handleCancelListChanges,
    handleCancelDetailChanges,
    handleCancelProfileChanges,
    handleChange,
    handleStartLifestoryGuide,
    handleExitLifestoryGuide,
    handleApplyLifestory,
    handleSaveProfile,
  };
}
