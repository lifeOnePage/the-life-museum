"use client";

import Header from "../../Header";
import ProfileEdit from "../../ProfileEdit";
import LifestoryGuide from "../../LifestoryGuide";

export default function PannelProfileEdit({
  isLifestoryGuideMode,
  profile,
  hasChanges,
  lifestoryProgressData,
  onSaveProfile,
  onCancelProfile,
  onBack,
  onShowExitConfirm,
  onProfileChange,
  onStartLifestoryGuide,
  onExitLifestoryGuide,
  onApplyLifestory,
}) {
  // 생애문 가이드 모드
  if (isLifestoryGuideMode) {
    return (
      <div className="w-full h-full bg-black-100/20 backdrop-blur-2xl rounded-tl-[20px] rounded-tr-[20px] overflow-y-auto scrollbar-hide flex flex-col">
        <LifestoryGuide
          userName={profile?.name || "사용자"}
          onBack={onExitLifestoryGuide}
          onApply={onApplyLifestory}
          initialData={lifestoryProgressData}
        />
      </div>
    );
  }

  // 일반 프로필 뷰
  return (
    <div className="w-full h-full bg-black-100/20 backdrop-blur-2xl  rounded-tl-[20px] rounded-tr-[20px] flex flex-col">
      <Header
        mode="edit"
        hasChanges={hasChanges}
        onSave={onSaveProfile}
        onCancel={onCancelProfile}
        onBack={onBack}
        onShowExitConfirm={onShowExitConfirm}
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ProfileEdit
          profile={profile}
          onChange={onProfileChange}
          mode="edit"
          onStartLifestoryGuide={onStartLifestoryGuide}
        />
      </div>
    </div>
  );
}
