"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import FloatingToolbar from "@/app/components/edit/FloatingToolbar";
import ToastStack from "@/app/components/Toast";
import LifeRecordDesktop from "@/app/records/(common)/views/desktop/LifeRecordDesktop";
import LifeRecordMobile from "@/app/records/(common)/views/mobile/LifeRecordMobile";
import {
  fetchRecordDetails,
  updateRecordDetails,
  createRecordItem,
  updateRecordItem,
  deleteRecordItem,
  uploadRecordFile,
} from "./services/editApi";
import ImageAddModal from "./components/ImageAddModal";
import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import useWindowSize from "@/app/hooks/useWindowSize";

export default function Temp({ identifier, initialData, fetchedUserData }) {
  const { width } = useWindowSize();
  const recordId = initialData.id;
  const { token } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());
  const [isDirty, setIsDirty] = useState(false);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  };

  const showToast = (
    message,
    { tone = "success", duration = 2400, showProgress = false } = {},
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, message, tone, duration, showProgress },
    ]);
    if (duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration + 120);
      toastTimers.current.set(id, timer);
    }
    return id;
  };

  const updateToast = (
    id,
    { message, tone = "success", duration = 2400, showProgress = false } = {},
  ) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, message, tone, duration, showProgress } : t,
      ),
    );
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    if (duration > 0) {
      const newTimer = setTimeout(() => removeToast(id), duration + 120);
      toastTimers.current.set(id, newTimer);
    }
  };

  const [currentData, setCurrentData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // 원본 데이터 저장
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalItemId, setImageModalItemId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [navigateToItem, setNavigateToItem] = useState(null);

  // 데이터 초기화
  useEffect(() => {
    if (!initialData) return;

    setCurrentData(initialData);

    // 자동 저장 시 비교를 위해 원본 데이터도 저장
    setOriginalData(structuredClone(initialData));
    setIsSaved(true);
  }, [initialData?.id]);

  // 페이지를 떠날 때 자동저장
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (!isSaved && !isSaving && currentData && originalData) {
        // 비동기 저장은 beforeunload에서 완료할 수 없으므로 경고만 표시
        e.preventDefault();
        e.returnValue =
          "저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaved, isSaving, currentData, originalData]);

  // 데이터 변경 시 자동저장 (debounce)
  useEffect(() => {
    // 편집 모드가 아니거나, 이미 저장 중이거나, 이미 저장된 상태면 자동저장하지 않음
    if (
      isPreview ||
      isSaving ||
      isSaved ||
      !currentData ||
      !originalData ||
      !token ||
      !recordId
    ) {
      return;
    }

    // debounce: 3초 후에 자동저장
    const autoSaveTimer = setTimeout(async () => {
      try {
        await save();
        // save 함수 내부에서 이미 "저장되었습니다." 토스트를 표시함
      } catch (e) {
        // 자동저장 실패는 조용히 처리 (사용자에게 알리지 않음)
      }
    }, 3000); // 3초 대기

    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [currentData, isPreview, isSaving, isSaved, token, originalData]);

  // 마이페이지로 이동하기 전에 자동저장
  const mypage = async () => {
    if (!isSaved && !isSaving) {
      try {
        await save();
      } catch (e) {
        // 저장 실패해도 이동 가능하도록 (사용자가 선택할 수 있게)
        if (
          !confirm("저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?")
        ) {
          return;
        }
      }
    }
    router.push("/mypage");
  };

  // preview 모드로 전환하기 전에 자동저장
  const preview = async () => {
    if (!isSaved && !isSaving) {
      try {
        await save();
      } catch (e) {
        // 저장 실패해도 preview 모드로 전환
      }
    }
    setIsPreview((p) => !p);
  };

  //저장하는 함수
  const save = async (overrideData = null) => {
    // 이미 저장 중이면 중복 실행 방지
    if (isSaving) {
      return;
    }

    //데이터를 넣지 않았으면 currentData 사용
    const workingData = overrideData || currentData;

    try {
      setIsSaving(true);
      setError(null);

      const toastId = showToast("저장 중...", {
        tone: "neutral",
        duration: 0,
        showProgress: true,
      });

      // 1. Record 업데이트 - 변경된 필드만 추출
      const recordFields = [
        "coverUrl",
        "name",
        "subName",
        "description",
        "pageTitle",
        "pageSubtitle",
        "bgm",
        "color",
        "birthDate",
        "displayMode",
      ];

      const changedRecordFields = {};

      recordFields.forEach((field) => {
        const currentValue = workingData.record[field];
        const originalValue = originalData.record[field];
        // null과 undefined를 동일하게 처리
        const current = currentValue === undefined ? null : currentValue;
        const original = originalValue === undefined ? null : originalValue;
        // 배열이나 객체인 경우 깊은 비교
        if (JSON.stringify(current) !== JSON.stringify(original)) {
          // null 값도 명시적으로 포함 (Prisma가 null을 처리할 수 있도록)
          changedRecordFields[field] = current;
        }
      });

      // 변경된 필드가 있을 때만 업데이트
      if (Object.keys(changedRecordFields).length > 0) {
        await updateRecordDetails({
          token,
          id: recordId,
          data: changedRecordFields,
        });
      }

      // 2. RecordItems 업데이트 (기존 items와 새 items 비교)
      // 임시 ID는 문자열로 시작하므로 숫자 ID만 기존 항목으로 간주
      const existingItems = workingData.items.filter(
        (item) => item.id && typeof item.id === "number",
      );

      const newItems = workingData.items.filter(
        (item) =>
          !item.id ||
          (typeof item.id === "string" && item.id.startsWith("temp-")),
      );

      // 기존 items 업데이트 - 변경된 필드만 추출
      for (const item of existingItems) {
        const originalItem = originalData.items.find(
          (orig) => orig.id === item.id,
        );
        if (!originalItem) {
          // 원본에 없는 항목은 전체 업데이트
          console.log("[SAVE] Updating item (new):", item.id);
          await updateRecordItem({
            token,
            itemId: item.id,
            data: {
              title: item.title,
              date: item.date,
              location: item.location,
              description: item.description,
              color: item.color,
              isHighlight: item.isHighlight,
              coverUrl: item.coverUrl,
              images: item.images || [],
            },
          });
          continue;
        }

        // 변경된 필드만 추출
        const itemFields = [
          "title",
          "date",
          "location",
          "description",
          "color",
          "isHighlight",
          "coverUrl",
          "images",
        ];
        const changedItemFields = {};
        itemFields.forEach((field) => {
          const currentValue = item[field];
          const originalValue = originalItem[field];
          // null과 undefined를 동일하게 처리
          const current = currentValue === undefined ? null : currentValue;
          const original = originalValue === undefined ? null : originalValue;
          // 배열인 경우 깊은 비교
          if (Array.isArray(current) || Array.isArray(original)) {
            // images 배열의 경우 null, undefined, 빈 문자열 제거 후 비교
            let normalizedCurrent = current || [];
            let normalizedOriginal = original || [];
            if (field === "images") {
              normalizedCurrent = normalizedCurrent.filter(
                (img) => img !== null && img !== undefined && img !== "",
              );
              normalizedOriginal = normalizedOriginal.filter(
                (img) => img !== null && img !== undefined && img !== "",
              );
            }
            if (
              JSON.stringify(normalizedCurrent) !==
              JSON.stringify(normalizedOriginal)
            ) {
              changedItemFields[field] = normalizedCurrent;
            }
          } else if (current !== original) {
            // null 값도 명시적으로 포함
            changedItemFields[field] = current;
          }
        });

        // 변경된 필드가 있을 때만 업데이트
        if (Object.keys(changedItemFields).length > 0) {
          console.log("[SAVE] Updating item:", item.id, {
            changedFields: Object.keys(changedItemFields),
            title: item.title,
            images: item.images,
            imagesLength: item.images?.length,
          });
          await updateRecordItem({
            token,
            itemId: item.id,
            data: changedItemFields,
          });
          console.log("[SAVE] Item updated successfully:", item.id);
        } else {
          console.log("[SAVE] Item unchanged, skipping:", item.id);
        }
      }

      const updatedItems = [...workingData.items];
      for (const item of newItems) {
        let images = [];
        if (item.images && Array.isArray(item.images)) {
          images = item.images
            .filter((img) => img !== null && img !== undefined && img !== "")
            .slice(0, 5);
        }

        const result = await createRecordItem({
          token,
          recordId,
          data: {
            title: item.title || null,
            date: item.date || null,
            location: item.location || null,
            description: item.description || null,
            color: item.color || null,
            isHighlight: item.isHighlight || false,
            coverUrl: item.coverUrl || null,
            images: images,
          },
        });

        // 생성된 항목의 실제 ID로 교체하고 서버에서 처리된 images 배열로 업데이트
        if (result?.ok && result?.id) {
          const tempIdIndex = updatedItems.findIndex((i) => i.id === item.id);
          if (tempIdIndex !== -1) {
            // 서버에서 저장된 형식에 맞춰 images 배열 정리 (null 제거된 빈 배열)
            updatedItems[tempIdIndex] = {
              ...updatedItems[tempIdIndex],
              id: result.id,
              images: images, // 서버에 전송한 정리된 images 배열 사용
            };
          }
        }
      }

      // 업데이트된 items로 상태 갱신
      const newData = {
        ...workingData,
        items: updatedItems,
      };
      setCurrentData(newData);
      // 원본 데이터도 업데이트 (서버에서 처리된 형식으로 저장)
      setOriginalData(structuredClone(newData));

      // 삭제된 items 제거 (필요시 구현)
      // 삭제는 별도로 처리하거나, handleDataChange에서 관리

      setIsSaved(true);
      updateToast(toastId, {
        message: "저장되었습니다.",
        tone: "success",
        duration: 2000,
        showProgress: false,
      });
    } catch (e) {
      console.error("[edit records] save error:", e);
      setError(e.message || "저장 중 오류가 발생했습니다.");
      updateToast(toastId, {
        message: `저장 실패: ${e.message || "알 수 없는 오류"}`,
        tone: "error",
        duration: 3000,
        showProgress: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTimelineItem = () => {
    if (!currentData) return;

    // 빈 아이템 생성 (null 값)
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const emptyItem = {
      id: tempId,
      title: "",
      date: "",
      location: "",
      description: "",
      coverUrl: null,
      images: Array(5).fill(null),
      color: "",
      isHighlight: false,
    };

    const newItems = [...(currentData.items || []), emptyItem];

    setCurrentData({
      ...currentData,
      items: newItems,
    });

    setIsSaved(false);

    // 새로 추가된 아이템으로 이동
    setTimeout(() => {
      const timeline = [
        { id: "Home", kind: "main" },
        ...newItems.map((item) => ({ id: item.id, kind: "year" })),
      ];
      const targetIndex = timeline.findIndex((item) => item.id === tempId);
      if (targetIndex !== -1) {
        setNavigateToItem(targetIndex);
        setTimeout(() => {
          setNavigateToItem(null);
        }, 1000);
      }
    }, 300);
  };

  const handleImageModalOpen = (itemId) => {
    setImageModalItemId(itemId);
    setIsImageModalOpen(true);
  };

  const handleImageModalSave = async (images) => {
    if (!currentData || !imageModalItemId) return;

    const newItems = currentData.items.map((item) =>
      item.id === imageModalItemId
        ? {
            ...item,
            images: images,
            coverUrl: images.find((img) => img !== null) || null,
          }
        : item,
    );

    const newData = {
      ...currentData,
      items: newItems,
    };

    setIsSaved(false);
    setImageModalItemId(null);
    setIsUploadingImage(true);
    setCurrentData(newData);
    try {
      await save(newData);
    } finally {
      setIsUploadingImage(false);
      setIsImageModalOpen(false);
    }
  };

  const handleDataChange = (newData) => {
    setCurrentData(newData);
    setIsSaved(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (
      !confirm(
        "이 이벤트를 삭제하시겠습니까? 삭제한 내용은 복구할 수 없습니다.",
      )
    ) {
      return;
    }

    try {
      // 현재 활성화된 항목의 인덱스 저장 (삭제 후 이동용)
      const currentIndex = activeItem?.index || 0;

      // DB에 저장된 항목(숫자 ID)이면 API 호출
      // 임시 ID(문자열)는 로컬에서만 제거
      if (itemId && typeof itemId === "number") {
        await deleteRecordItem({ token, itemId });

        // 삭제 후 DB에서 최신 데이터 다시 불러오기
        const result = await fetchRecordDetails({
          token,
          identifier,
        });
        if (result?.ok && result?.item) {
          // 메인 레코드가 비어있으면 가이드라인 표시
          const isNewRecord =
            !result.item.name?.trim() &&
            !result.item.description?.trim() &&
            !result.item.coverUrl;

          const record = {
            ...result.item,
            name:
              result.item.name?.trim() ||
              (isNewRecord
                ? "나의 라이프 레코드"
                : `${recordUserName}의 이야기`),
            description:
              result.item.description?.trim() ||
              (isNewRecord
                ? "일상의 작은 순간들을 관찰하고 기록하는 아티스트입니다.\n일상의 경험을 이야기로 엮어 자신만의 시간을 아카이브할 수 있도록 돕습니다."
                : "당신을 소개하는 문구를 작성해보세요. (예: 일상 속 작은 변화를 관찰하고 기록하는 것을 좋아한다. 배운 것을 가족과 이웃과 나누며, 오늘의 기록이 내일의 기억이 된다고 믿는다.)"),
            coverUrl: result.item.coverUrl || "/images/records/No image.png",
            color: result.item.color || "#121212",
          };
          // 삭제 후에는 서버에서 반환된 그대로의 데이터를 사용
          // (삭제 후 기본 아이템을 자동 생성하지 않음)
          let items = result.item.recordItems || [];
          const newData = {
            record,
            items,
          };
          setCurrentData(newData);

          setOriginalData(JSON.parse(JSON.stringify(newData)));

          // 삭제된 항목이 마지막이 아니면 직전 항목으로 이동 (인덱스는 main 포함이므로 -1)
          // main이 첫 번째이므로, 타임라인 항목의 인덱스는 currentIndex - 1
          const targetIndex = Math.max(0, currentIndex - 1);
          setTimeout(() => {
            setNavigateToItem(targetIndex);
            setTimeout(() => setNavigateToItem(null), 100);
          }, 100);
        }
        setIsSaved(true);
      } else {
        // 임시 ID를 가진 항목은 로컬에서만 제거
        const deletedIndex = currentData.items.findIndex(
          (item) => item.id === itemId,
        );
        const newItems = currentData.items.filter((item) => item.id !== itemId);
        const newData = {
          ...currentData,
          items: newItems,
        };
        setCurrentData(newData);
        setOriginalData(JSON.parse(JSON.stringify(newData)));
        const targetIndex = Math.max(0, deletedIndex);
        setTimeout(() => {
          setNavigateToItem(targetIndex);
          setTimeout(() => setNavigateToItem(null), 100);
        }, 100);
        setIsSaved(false);
      }
    } catch (e) {
      console.error("[delete item] error:", e);
      alert(`삭제 실패: ${e.message || "알 수 없는 오류"}`);
    }
  };

  const handleColorChange = (color) => {
    if (!currentData) return;

    // 활성화된 item이 main이면 record의 color 변경
    if (activeItem && activeItem.kind === "main") {
      setCurrentData({
        ...currentData,
        record: {
          ...currentData.record,
          color: color,
        },
      });
    } else if (activeItem && activeItem.kind === "year") {
      // 타임라인 항목의 color 변경 (임시 ID를 가진 새 항목도 포함)
      if (activeItem.id) {
        // 기존 항목 또는 임시 ID를 가진 항목: id로 찾아서 변경
        const newItems = currentData.items.map((item) =>
          item.id === activeItem.id ? { ...item, color: color } : item,
        );
        setCurrentData({
          ...currentData,
          items: newItems,
        });
      } else {
        // id가 없는 경우 (이론적으로는 발생하지 않아야 하지만 안전장치)
        // timeline 인덱스 또는 속성으로 찾기
        const itemIndex =
          activeItem.index !== undefined ? activeItem.index - 1 : -1;

        if (itemIndex >= 0 && itemIndex < currentData.items.length) {
          const newItems = currentData.items.map((item, idx) =>
            idx === itemIndex ? { ...item, color: color } : item,
          );
          setCurrentData({
            ...currentData,
            items: newItems,
          });
        } else {
          // 인덱스를 찾을 수 없는 경우, title과 date로 매칭
          const newItems = currentData.items.map((item) => {
            if (
              (!item.id ||
                (typeof item.id === "string" && item.id.startsWith("temp-"))) &&
              activeItem.event &&
              item.title === activeItem.event &&
              activeItem.date &&
              item.date === activeItem.date
            ) {
              return { ...item, color: color };
            }
            return item;
          });
          setCurrentData({
            ...currentData,
            items: newItems,
          });
        }
      }
    } else {
      // 기본적으로 record의 color 변경
      setCurrentData({
        ...currentData,
        record: {
          ...currentData.record,
          color: color,
        },
      });
    }
    setIsSaved(false);
  };

  const handleImageChange = async (
    type,
    itemId,
    file,
    targetSlotIndex = null,
  ) => {
    if (!token || !file) return;

    if (!recordId) {
      alert("레코드 ID를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }

    console.log(
      "[handleImageChange] Received targetSlotIndex:",
      targetSlotIndex,
    );

    // 크롭 없이 바로 업로드
    await uploadImageFile(type, itemId, file, targetSlotIndex);
  };

  const uploadImageFile = async (
    type,
    itemId,
    file,
    targetSlotIndex = null,
  ) => {
    if (!token || !file || !recordId) return;

    try {
      setIsUploadingImage(true);
      let uploadUrl;
      if (type === "main") {
        uploadUrl = await uploadRecordFile({
          token,
          file,
          prefix: `records/${recordId}/main`,
        });
        setCurrentData({
          ...currentData,
          record: {
            ...currentData.record,
            coverUrl: uploadUrl,
          },
        });

        // UI가 업데이트되고 이미지가 화면에 표시될 때까지 기다림
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 이미지가 실제로 DOM에 렌더링되고 로드될 때까지 추가 대기
              setTimeout(() => {
                resolve();
              }, 200);
            });
          });
        });

        setIsSaved(false);
      } else if (type === "item" && itemId) {
        uploadUrl = await uploadRecordFile({
          token,
          file,
          prefix: `records/${recordId}/timeline`,
        });
        const newItems = currentData.items.map((item) => {
          if (item.id === itemId) {
            // 기존 images 배열을 깊은 복사 (원본 배열 수정 방지)
            let currentImages = Array.isArray(item.images)
              ? [...item.images]
              : [];
            console.log("[UPLOAD] Before update - itemId:", itemId, {
              originalImages: item.images,
              currentImages,
              currentImagesLength: currentImages.length,
              targetSlotIndex,
              uploadUrl,
            });

            // images 배열이 비어있고 coverUrl이 있으면 첫 번째 요소로 추가
            if (currentImages.length === 0 && item.coverUrl) {
              currentImages = [item.coverUrl];
            }

            // 배열을 항상 5개로 확장 (null로 채움)
            while (currentImages.length < 5) {
              currentImages.push(null);
            }
            // 5개를 초과하면 자르기
            if (currentImages.length > 5) {
              currentImages = currentImages.slice(0, 5);
            }

            // targetSlotIndex가 지정되어 있으면 해당 슬롯에 교체
            const slotIdx =
              targetSlotIndex !== null && targetSlotIndex !== undefined
                ? typeof targetSlotIndex === "string"
                  ? parseInt(targetSlotIndex, 10)
                  : targetSlotIndex
                : null;

            console.log("[UPLOAD] targetSlotIndex check:", {
              targetSlotIndex,
              slotIdx,
              type: typeof targetSlotIndex,
              condition1: targetSlotIndex !== null,
              condition2: slotIdx !== null,
              condition3: slotIdx >= 0,
              condition4: slotIdx < 5,
            });

            if (
              slotIdx !== null &&
              !isNaN(slotIdx) &&
              slotIdx >= 0 &&
              slotIdx < 5
            ) {
              console.log(
                "[UPLOAD] Replacing image at index:",
                slotIdx,
                "Before:",
                currentImages[slotIdx],
              );
              currentImages[slotIdx] = uploadUrl;
              console.log("[UPLOAD] After replacement:", currentImages);
            } else {
              // targetSlotIndex가 없으면 첫 번째 빈 슬롯에 추가
              const firstNullIndex = currentImages.findIndex((img) => !img);
              if (firstNullIndex !== -1) {
                currentImages[firstNullIndex] = uploadUrl;
              } else {
                // 빈 슬롯이 없고 이미 5개가 있으면 경고
                const validImageCount = currentImages.filter(
                  (img) => img,
                ).length;
                if (validImageCount >= 5) {
                  alert("이미지는 최대 5장까지 추가할 수 있습니다.");
                  setIsUploadingImage(false);
                  return;
                }
                // 빈 슬롯이 없으면 끝에 추가
                currentImages.push(uploadUrl);
              }
            }

            // 첫 번째 유효한 이미지를 coverUrl로도 유지 (하위 호환성)
            const firstValidImage =
              currentImages.find((img) => img) || uploadUrl;

            console.log("[UPLOAD] After update - itemId:", itemId, {
              currentImages,
              currentImagesLength: currentImages.length,
              validImages: currentImages.filter((img) => img),
            });

            return {
              ...item,
              coverUrl: firstValidImage,
              images: currentImages,
            };
          }
          return item;
        });
        setCurrentData({
          ...currentData,
          items: newItems,
        });
        console.log("[UPLOAD] Data updated, newItems:", newItems);
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                resolve();
              }, 200);
            });
          });
        });
      }
      setIsSaved(false);
    } catch (e) {
      console.error("[image upload] error:", e);
      alert(`이미지 업로드 실패: ${e.message || "알 수 없는 오류"}`);
      setIsUploadingImage(false);
      return;
    }
    setIsUploadingImage(false);
  };

  const handleImageDelete = (itemId, imageIndex) => {
    if (!currentData || !itemId) return;

    const newItems = currentData.items.map((item) => {
      if (item.id === itemId) {
        const currentImages = item.images || [];

        const updatedImages = currentImages.filter(
          (_, idx) => idx !== imageIndex,
        );
        while (updatedImages.length < 5) {
          updatedImages.push(null);
        }

        const firstValidImage = updatedImages.find((img) => img) || null;

        return {
          ...item,
          coverUrl: firstValidImage,
          images: updatedImages,
        };
      }
      return item;
    });

    setCurrentData({
      ...currentData,
      items: newItems,
    });
    setIsSaved(false);
  };

  if (error && !currentData) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        <div className="text-center">
          <p className="mb-4 text-xl">{error}</p>
          <p className="text-sm text-white/60">identifier: {identifier}</p>
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        <div className="text-center">
          <p className="mb-4 text-xl">데이터를 찾을 수 없습니다.</p>
          <p className="text-sm text-white/60">identifier: {identifier}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {error && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-red-500/90 px-4 py-2 text-sm text-white">
          ⚠️ {error}
        </div>
      )}
      <ImageAddModal
        isLoading={isUploadingImage}
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setImageModalItemId(null);
        }}
        onSave={handleImageModalSave}
        currentImages={
          imageModalItemId && currentData
            ? (() => {
                const item = currentData.items.find(
                  (item) => item.id === imageModalItemId,
                );
                if (!item) return Array(5).fill(null);

                // images 배열이 있으면 사용, 없으면 coverUrl을 첫 번째로 사용
                let images = Array.isArray(item.images) ? [...item.images] : [];

                // images가 비어있고 coverUrl이 있으면 coverUrl을 첫 번째로 추가
                if (images.length === 0 && item.coverUrl) {
                  images = [item.coverUrl];
                }

                // 5개로 패딩
                while (images.length < 5) {
                  images.push(null);
                }

                return images.slice(0, 5);
              })()
            : Array(5).fill(null)
        }
      />
      <FloatingToolbar
        width={width}
        mypage={mypage}
        preview={preview}
        save={save}
        addItem={addTimelineItem}
        onColorChange={handleColorChange}
        currentColor={
          activeItem?.color || currentData?.record?.color || "#121212"
        }
        onBgmChange={(bgmUrl) => {
          if (!currentData) return;
          setCurrentData({
            ...currentData,
            record: {
              ...currentData.record,
              bgm: bgmUrl,
            },
          });
          setIsSaved(false);
        }}
        currentBgm={currentData?.record?.bgm || ""}
        isSaved={isSaved}
        isPreview={isPreview}
        isSaving={isSaving}
      />
      {width <= 768 ? (
        <LifeRecordMobile
          data={currentData}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onImageDelete={isPreview ? undefined : handleImageDelete}
          onImageModalOpen={isPreview ? undefined : handleImageModalOpen}
          onActiveItemChange={setActiveItem}
          isUploadingImage={isUploadingImage}
          onNavigateToItem={navigateToItem}
        />
      ) : (
        <LifeRecordDesktop
          data={currentData}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onImageDelete={isPreview ? undefined : handleImageDelete}
          onImageModalOpen={isPreview ? undefined : handleImageModalOpen}
          onActiveItemChange={setActiveItem}
          isUploadingImage={isUploadingImage}
          onNavigateToItem={navigateToItem}
          width={width}
        />
      )}
    </>
  );
}
