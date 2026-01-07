"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import FloatingToolbar from "@/app/components/edit/FloatingToolbar";
import ToastStack from "@/app/components/Toast";
import LifeRecordDesktop from "@/app/view/[identifier]/records/(views)/desktop/LifeRecordDesktop";
import LifeRecordMobile from "@/app/view/[identifier]/records/(views)/mobile/LifeRecordMobile";
import {
  fetchRecordDetails,
  updateRecordDetails,
  createRecordItem,
  updateRecordItem,
  deleteRecordItem,
  uploadRecordFile,
} from "./services/editApi";
import ImageAddModal from "./components/ImageAddModal";
import ImageCropOverlay from "./components/ImageCropOverlay";
import ToastStack from "@/app/components/Toast";
import "@/app/view/[identifier]/records/styles/cardPage.css";
import "@/app/view/[identifier]/records/styles/cardPage-mobile.css";

/**
 * Subscribes to window size changes.
 * 현재 window 크기를 구독합니다.
 * @returns {{ width: number, height: number }}
 */

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

/**
 * Record edit page.
 * 레코드 편집 페이지.
 * @returns {JSX.Element}
 */
export default function EditRecords() {
  const { width } = useWindowSize();
  const { username } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [isSaved, setIsSaved] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());

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

  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // 원본 데이터 저장
  const [recordId, setRecordId] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalItemId, setImageModalItemId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [navigateToItem, setNavigateToItem] = useState(null);
  // 크롭 기능 제거됨 - 항상 비활성화 상태로 유지
  const cropState = {
    isActive: false,
    imageFile: null,
    type: null,
    itemId: null,
    targetSlotIndex: null,
  };

  useEffect(() => {
    if (!token || !username) return;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchRecordDetails({
          token,
          identifier: username,
        });
        if (result?.ok && result?.item) {
          setRecordId(result.item.record.id);

          // 레코드의 userName을 사용 (제작할 대상의 성함)
          const userName =
            result.item.record.userName || user?.userName || "사용자";

          // 메인 레코드가 비어있으면 가이드라인 표시
          const isNewRecord =
            !result.item.record.name?.trim() &&
            !result.item.record.description?.trim() &&
            !result.item.record.coverUrl;

          const record = {
            ...result.item.record,
            name:
              result.item.record.name?.trim() ||
              (isNewRecord ? "나의 라이프 레코드" : `${userName}의 이야기`),
            description:
              result.item.record.description?.trim() ||
              (isNewRecord
                ? "일상의 작은 순간들을 관찰하고 기록하는 아티스트입니다.\n일상의 경험을 이야기로 엮어 자신만의 시간을 아카이브할 수 있도록 돕습니다."
                : "당신을 소개하는 문구를 작성해주세요! (예: 일상 속 작은 변화를 관찰하고 기록하는 것을 좋아한다. 배운 것을 가족과 이웃과 나누며, 오늘의 기록이 내일의 기억이 된다고 믿는다.)"),
            // 메인 커버 이미지가 없으면 기본 이미지 설정
            coverUrl:
              result.item.record.coverUrl || "/images/records/No image.png",
            // color가 없으면 기본값 설정
            color: result.item.record.color || "#121212",
          };

          // 타임라인 아이템이 없으면 기본 아이템 1개 생성 (새 레코드인 경우에만)
          let items = result.item.recordItems || [];
          console.log(
            "[LOAD] Fetched items:",
            items.map((it) => ({
              id: it.id,
              title: it.title,
              images: it.images,
              imagesLength: it.images?.length,
            })),
          );
          const originalName = result.item.record.name?.trim();
          const originalDescription = result.item.record.description?.trim();
          const originalCoverUrl = result.item.record.coverUrl;
          const createdAt = result.item.record.createdAt;
          const updatedAt = result.item.record.updatedAt;

          const timeDiff =
            createdAt && updatedAt
              ? new Date(updatedAt).getTime() - new Date(createdAt).getTime()
              : Infinity;
          const isNewlyCreated = timeDiff < 30000;

          const hasBeenSaved = !!(
            originalName ||
            originalDescription ||
            originalCoverUrl
          );

          // 새 레코드인 경우:
          // 1. name, description, coverUrl이 모두 비어있고
          // 2. 아이템도 없고
          // 3. 생성 후 거의 수정되지 않았고
          // 4. 한 번도 저장된 적이 없어야 함
          const isActuallyNewRecord =
            !originalName &&
            !originalDescription &&
            !originalCoverUrl &&
            items.length === 0 &&
            isNewlyCreated &&
            !hasBeenSaved;

          // 새 레코드인 경우에만 기본 아이템 생성
          // 사용자가 저장 후 모든 항목을 삭제한 경우에는 기본 아이템을 생성하지 않음
          if (isActuallyNewRecord) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateStr = `${year}.${month}.${day}`;

            // 초기 항목에도 임시 ID 부여 (key 중복 방지)
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            items = [
              {
                id: tempId, // 임시 ID 부여
                title: "첫 번째 순간(예:출생)",
                date: dateStr,
                location: "",
                description:
                  "기록할 만한 일들이 있나요? 작은 일들도 좋아요.\n일상의 경험을 이야기로 엮어 자신만의 시간을 아카이브해보세요.",
                color: "",
                isHighlight: false,
                coverUrl: null, // 더미 아이템은 coverUrl을 null로 설정
                images: [], // 더미 아이템은 images 배열도 빈 배열로 설정
              },
            ];
          }

          const initialData = {
            record,
            items,
          };
          setData(initialData);
          setOriginalData(JSON.parse(JSON.stringify(initialData)));
          setIsSaved(true);
        } else {
          throw new Error("데이터를 불러올 수 없습니다.");
        }
      } catch (e) {
        console.error("[edit records] load error:", e);
        setError(e.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, username, user]);

  // 페이지를 떠날 때 자동저장
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (!isSaved && !isSaving && data && originalData) {
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
  }, [isSaved, isSaving, data, originalData]);

  // 데이터 변경 시 자동저장 (debounce)
  useEffect(() => {
    // 편집 모드가 아니거나, 이미 저장 중이거나, 이미 저장된 상태면 자동저장하지 않음
    if (
      isPreview ||
      isSaving ||
      isSaved ||
      !data ||
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
  }, [data, isPreview, isSaving, isSaved, token, recordId, originalData]);

  const mypage = async () => {
    // 마이페이지로 이동하기 전에 자동저장
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

  const preview = async () => {
    // preview 모드로 전환하기 전에 자동저장
    if (!isSaved && !isSaving) {
      try {
        await save();
      } catch (e) {
        // 저장 실패해도 preview 모드로 전환
      }
    }
    setIsPreview((p) => !p);
  };

  const save = async () => {
    // 이미 저장 중이면 중복 실행 방지
    if (isSaving) {
      return;
    }

    if (!token || !recordId || !data || !originalData) {
      showToast("저장할 데이터가 없습니다.", { tone: "error" });
      return;
    }

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
        const currentValue = data.record[field];
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
      const existingItems = data.items.filter(
        (item) => item.id && typeof item.id === "number",
      );
      const newItems = data.items.filter(
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

      const updatedItems = [...data.items];
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
        ...data,
        items: updatedItems,
      };
      setData(newData);
      // 원본 데이터도 업데이트 (서버에서 처리된 형식으로 저장)
      setOriginalData(JSON.parse(JSON.stringify(newData)));

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

  const logout = () => {
    router.push("/login");
  };

  const addTimelineItem = () => {
    if (!data) return;

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

    const newItems = [...(data.items || []), emptyItem];

    setData({
      ...data,
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

  const handleImageModalSave = (images) => {
    if (!data || !imageModalItemId) return;

    const newItems = data.items.map((item) =>
      item.id === imageModalItemId
        ? {
            ...item,
            images: images,
            coverUrl: images.find((img) => img !== null) || null,
          }
        : item,
    );

    setData({
      ...data,
      items: newItems,
    });

    setIsSaved(false);
    setIsImageModalOpen(false);
    setImageModalItemId(null);
  };

  const handleDataChange = (newData) => {
    setData(newData);
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
          identifier: username,
        });
        if (result?.ok && result?.item) {
          // 레코드의 userName을 사용 (제작할 대상의 성함)
          const userName =
            result.item.record.userName || user?.userName || "사용자";

          // 메인 레코드가 비어있으면 가이드라인 표시
          const isNewRecord =
            !result.item.record.name?.trim() &&
            !result.item.record.description?.trim() &&
            !result.item.record.coverUrl;

          const record = {
            ...result.item.record,
            name:
              result.item.record.name?.trim() ||
              (isNewRecord ? "나의 라이프 레코드" : `${userName}의 이야기`),
            description:
              result.item.record.description?.trim() ||
              (isNewRecord
                ? "일상의 작은 순간들을 관찰하고 기록하는 아티스트입니다.\n일상의 경험을 이야기로 엮어 자신만의 시간을 아카이브할 수 있도록 돕습니다."
                : "당신을 소개하는 문구를 작성해보세요. (예: 일상 속 작은 변화를 관찰하고 기록하는 것을 좋아한다. 배운 것을 가족과 이웃과 나누며, 오늘의 기록이 내일의 기억이 된다고 믿는다.)"),
            coverUrl:
              result.item.record.coverUrl || "/images/records/No image.png",
            color: result.item.record.color || "#121212",
          };
          // 삭제 후에는 서버에서 반환된 그대로의 데이터를 사용
          // (삭제 후 기본 아이템을 자동 생성하지 않음)
          let items = result.item.recordItems || [];
          const newData = {
            record,
            items,
          };
          setData(newData);

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
        const deletedIndex = data.items.findIndex((item) => item.id === itemId);
        const newItems = data.items.filter((item) => item.id !== itemId);
        const newData = {
          ...data,
          items: newItems,
        };
        setData(newData);
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
    if (!data) return;

    // 활성화된 item이 main이면 record의 color 변경
    if (activeItem && activeItem.kind === "main") {
      setData({
        ...data,
        record: {
          ...data.record,
          color: color,
        },
      });
    } else if (activeItem && activeItem.kind === "year") {
      // 타임라인 항목의 color 변경 (임시 ID를 가진 새 항목도 포함)
      if (activeItem.id) {
        // 기존 항목 또는 임시 ID를 가진 항목: id로 찾아서 변경
        const newItems = data.items.map((item) =>
          item.id === activeItem.id ? { ...item, color: color } : item,
        );
        setData({
          ...data,
          items: newItems,
        });
      } else {
        // id가 없는 경우 (이론적으로는 발생하지 않아야 하지만 안전장치)
        // timeline 인덱스 또는 속성으로 찾기
        const itemIndex =
          activeItem.index !== undefined ? activeItem.index - 1 : -1;

        if (itemIndex >= 0 && itemIndex < data.items.length) {
          const newItems = data.items.map((item, idx) =>
            idx === itemIndex ? { ...item, color: color } : item,
          );
          setData({
            ...data,
            items: newItems,
          });
        } else {
          // 인덱스를 찾을 수 없는 경우, title과 date로 매칭
          const newItems = data.items.map((item) => {
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
          setData({
            ...data,
            items: newItems,
          });
        }
      }
    } else {
      // 기본적으로 record의 color 변경
      setData({
        ...data,
        record: {
          ...data.record,
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
        setData({
          ...data,
          record: {
            ...data.record,
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
        const newItems = data.items.map((item) => {
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
        setData({
          ...data,
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

  const handleCropComplete = async (croppedFile) => {
    // 크롭 기능 제거됨 - 사용되지 않음
  };

  const handleCropCancel = () => {
    // 크롭 기능 제거됨 - 사용되지 않음
  };

  const handleImageDelete = (itemId, imageIndex) => {
    if (!data || !itemId) return;

    const newItems = data.items.map((item) => {
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

    setData({
      ...data,
      items: newItems,
    });
    setIsSaved(false);
  };

  if (isLoading) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        불러오는 중…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        <div className="text-center">
          <p className="mb-4 text-xl">{error}</p>
          <p className="text-sm text-white/60">identifier: {username}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        <div className="text-center">
          <p className="mb-4 text-xl">데이터를 찾을 수 없습니다.</p>
          <p className="text-sm text-white/60">identifier: {username}</p>
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
      {/* {isSaving && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-blue-500/90 px-4 py-2 text-sm text-white">
          저장 중...
        </div>
      )} */}
      <ImageAddModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setImageModalItemId(null);
        }}
        onSave={handleImageModalSave}
        currentImages={
          imageModalItemId && data
            ? (() => {
                const item = data.items.find(
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
        logout={logout}
        addItem={addTimelineItem}
        onColorChange={handleColorChange}
        currentColor={activeItem?.color || data?.record?.color || "#121212"}
        onBgmChange={(bgmUrl) => {
          if (!data) return;
          setData({
            ...data,
            record: {
              ...data.record,
              bgm: bgmUrl,
            },
          });
          setIsSaved(false);
        }}
        currentBgm={data?.record?.bgm || ""}
        isSaved={isSaved}
        isPreview={isPreview}
        isSaving={isSaving}
      />
      {width <= 768 ? (
        <LifeRecordMobile
          data={data}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onImageDelete={isPreview ? undefined : handleImageDelete}
          onImageModalOpen={isPreview ? undefined : handleImageModalOpen}
          onActiveItemChange={setActiveItem}
          isUploadingImage={isUploadingImage}
          onNavigateToItem={navigateToItem}
          cropState={cropState}
          onCropComplete={handleCropComplete}
          onCropCancel={handleCropCancel}
          aspectRatio={1}
        />
      ) : (
        <LifeRecordDesktop
          data={data}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onImageDelete={isPreview ? undefined : handleImageDelete}
          onImageModalOpen={isPreview ? undefined : handleImageModalOpen}
          onActiveItemChange={setActiveItem}
          isUploadingImage={isUploadingImage}
          onNavigateToItem={navigateToItem}
          cropState={cropState}
          onCropComplete={handleCropComplete}
          onCropCancel={handleCropCancel}
          aspectRatio={1}
          width={width}
        />
      )}
    </>
  );
}
