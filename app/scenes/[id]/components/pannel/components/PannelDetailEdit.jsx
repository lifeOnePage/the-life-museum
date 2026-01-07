"use client";

import Header from "../../Header";
import DetailEdit from "../../DetailEdit";

export default function PannelDetailEdit({
  editedData,
  hasChanges,
  isUploading,
  detailEditRef,
  onSave,
  onCancel,
  onBack,
  onShowExitConfirm,
  onChange,
  onUploadStateChange,
}) {
  return (
    <div className="w-full h-full bg-black-100/20 backdrop-blur-2xl overflow-hidden flex flex-col">
      <Header
        mode="edit"
        hasChanges={hasChanges}
        onSave={onSave}
        onCancel={onCancel}
        onBack={onBack}
        onShowExitConfirm={onShowExitConfirm}
        isDisabled={isUploading}
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <DetailEdit
          ref={detailEditRef}
          item={editedData}
          onChange={onChange}
          onUploadStateChange={onUploadStateChange}
        />
      </div>
    </div>
  );
}
