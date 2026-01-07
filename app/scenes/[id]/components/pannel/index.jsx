"use client";

import { usePannelState } from "./hooks/usePannelState";
import { usePannelHandlers } from "./hooks/usePannelHandlers";
import { usePannelDnd } from "./hooks/usePannelDnd";
import PannelListView from "./components/PannelListView";
import PannelDetailEdit from "./components/PannelDetailEdit";
import PannelProfileEdit from "./components/PannelProfileEdit";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";

export default function Pannel({
  items,
  setItems,
  profile,
  setProfile,
  onItemClick,
  sceneId,
  onHasChangesChange,
}) {
  // 상태 관리
  const state = usePannelState({ items, onHasChangesChange });

  // DnD 로직
  const { sensors, handleDragEnd } = usePannelDnd({
    setItems,
    setListHasChanges: state.setListHasChanges,
  });

  // 핸들러 함수들
  const handlers = usePannelHandlers({
    state,
    items,
    setItems,
    profile,
    setProfile,
    onItemClick,
    sceneId,
  });

  // 툴팁 위치 계산
  const calculateNewItemTooltipPosition = (element, tooltipWidth = 250) => {
    if (!element) return { top: 0, left: 0 };
    const rect = element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;

    const tooltipLeft = elementCenterX - tooltipWidth / 2;
    const tooltipRight = elementCenterX + tooltipWidth / 2;

    let adjustedLeft = elementCenterX;

    if (tooltipLeft < 10) {
      adjustedLeft = tooltipWidth / 2 + 10;
    } else if (tooltipRight > window.innerWidth - 10) {
      adjustedLeft = window.innerWidth - tooltipWidth / 2 - 10;
    }

    return {
      top: rect.bottom + 8,
      left: adjustedLeft,
    };
  };

  const handleNewItemMouseEnter = (e) => {
    state.setNewItemTooltipPosition(calculateNewItemTooltipPosition(e.currentTarget));
    state.setShowNewItemTooltip(true);
  };

  const handleNewItemMouseLeave = () => {
    state.setShowNewItemTooltip(false);
  };

  // 프로필 뷰
  if (state.isProfileView) {
    return (
      <>
        <PannelProfileEdit
          isLifestoryGuideMode={state.isLifestoryGuideMode}
          profile={profile}
          hasChanges={state.hasChanges}
          lifestoryProgressData={state.lifestoryProgressData}
          onSaveProfile={handlers.handleSaveProfile}
          onCancelProfile={handlers.handleCancelProfileChanges}
          onBack={handlers.handleBack}
          onShowExitConfirm={handlers.handleShowExitConfirm}
          onProfileChange={handlers.handleProfileChange}
          onStartLifestoryGuide={handlers.handleStartLifestoryGuide}
          onExitLifestoryGuide={handlers.handleExitLifestoryGuide}
          onApplyLifestory={handlers.handleApplyLifestory}
        />

        {/* 모달 & 토스트 */}
        <ConfirmModal
          isOpen={state.confirmModal.isOpen}
          title={state.confirmModal.title}
          message={state.confirmModal.message}
          onConfirm={state.confirmModal.onConfirm}
          onCancel={() => state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
        />
        <Toast
          isOpen={state.toast.isOpen}
          message={state.toast.message}
          type={state.toast.type}
          onClose={() => state.setToast({ isOpen: false, message: "", type: "success" })}
        />
      </>
    );
  }

  // 아이템 상세 편집 뷰
  if (state.selectedItem) {
    return (
      <>
        <PannelDetailEdit
          editedData={state.editedData}
          hasChanges={state.hasChanges}
          isUploading={state.isUploading}
          detailEditRef={state.detailEditRef}
          onSave={handlers.handleSaveItem}
          onCancel={!state.selectedItem.isNew ? handlers.handleCancelDetailChanges : undefined}
          onBack={handlers.handleBack}
          onShowExitConfirm={handlers.handleShowExitConfirm}
          onChange={handlers.handleChange}
          onUploadStateChange={state.setIsUploading}
        />

        {/* 모달 & 토스트 */}
        <ConfirmModal
          isOpen={state.confirmModal.isOpen}
          title={state.confirmModal.title}
          message={state.confirmModal.message}
          onConfirm={state.confirmModal.onConfirm}
          onCancel={() => state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
        />
        <Toast
          isOpen={state.toast.isOpen}
          message={state.toast.message}
          type={state.toast.type}
          onClose={() => state.setToast({ isOpen: false, message: "", type: "success" })}
        />
      </>
    );
  }

  // 리스트 뷰 (기본)
  return (
    <>
      <PannelListView
        items={items}
        unsavedItemIds={state.unsavedItemIds}
        listHasChanges={state.listHasChanges}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onItemClick={handlers.handleItemClick}
        onDeleteItem={handlers.handleDeleteItem}
        onAddNew={handlers.handleAddNew}
        onSaveAll={handlers.handleSaveAll}
        onCancelListChanges={handlers.handleCancelListChanges}
        newItemButtonRef={state.newItemButtonRef}
        showNewItemTooltip={state.showNewItemTooltip}
        newItemTooltipPosition={state.newItemTooltipPosition}
        onNewItemMouseEnter={handleNewItemMouseEnter}
        onNewItemMouseLeave={handleNewItemMouseLeave}
      />

      {/* 모달 & 토스트 */}
      <ConfirmModal
        isOpen={state.confirmModal.isOpen}
        title={state.confirmModal.title}
        message={state.confirmModal.message}
        onConfirm={state.confirmModal.onConfirm}
        onCancel={() => state.setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
      />
      <Toast
        isOpen={state.toast.isOpen}
        message={state.toast.message}
        type={state.toast.type}
        onClose={() => state.setToast({ isOpen: false, message: "", type: "success" })}
      />
    </>
  );
}
