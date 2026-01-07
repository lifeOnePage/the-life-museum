"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ItemBlock from "../../ItemBlock";
import Header from "../../Header";
import NewItemButton from "./NewItemButton";

export default function PannelListView({
  items,
  unsavedItemIds,
  listHasChanges,
  sensors,
  onDragEnd,
  onItemClick,
  onDeleteItem,
  onAddNew,
  onSaveAll,
  onCancelListChanges,
  newItemButtonRef,
  showNewItemTooltip,
  newItemTooltipPosition,
  onNewItemMouseEnter,
  onNewItemMouseLeave,
}) {
  return (
    <div className="w-full h-full bg-black-100 backdrop-blur-2xl overflow-hidden flex flex-col">
      <Header
        mode="edit"
        hasChanges={listHasChanges || unsavedItemIds.size > 0}
        onSave={onSaveAll}
        onCancel={onCancelListChanges}
      />
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide">
        <NewItemButton
          buttonRef={newItemButtonRef}
          onClick={onAddNew}
          showTooltip={showNewItemTooltip}
          tooltipPosition={newItemTooltipPosition}
          onMouseEnter={onNewItemMouseEnter}
          onMouseLeave={onNewItemMouseLeave}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
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
                  mode="edit"
                  hasUnsavedChanges={unsavedItemIds.has(item.id)}
                  onClick={() => onItemClick(item)}
                  onDelete={() => onDeleteItem(item.id)}
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
