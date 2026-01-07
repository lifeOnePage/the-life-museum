import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

export function usePannelDnd({ setItems, setListHasChanges }) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
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

  return {
    sensors,
    handleDragEnd,
  };
}
