"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import FloatingToolbar from "@/app/components/edit/FloatingToolbar";
import LifeRecordDesktop from "@/app/view/[identifier]/records/components/LifeRecordDesktop";
import LifeRecordMobile from "@/app/view/[identifier]/records/components/LifeRecordMobile";
import {
  fetchRecordDetails,
  updateRecordDetails,
  createRecordItem,
  updateRecordItem,
  deleteRecordItem,
  uploadRecordFile,
} from "./services/editApi";
import AddTimelineModal from "./components/AddTimelineModal";
import ImageCropOverlay from "./components/ImageCropOverlay";
import "@/app/view/[identifier]/records/styles/cardPage.css";
import "@/app/view/[identifier]/records/styles/cardPage-mobile.css";

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

  const [data, setData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

          const userName = user?.userName || "사용자";

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

          // 타임라인 아이템이 없으면 기본 아이템 1개 생성
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
          if (items.length === 0) {
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
                coverUrl: "/images/records/No image.png",
              },
            ];
          }

          setData({
            record,
            items,
          });
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

  const mypage = () => {
    if (!isSaved) {
      if (!confirm("저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?")) {
        return;
      }
    }
    router.push("/mypage");
  };

  const preview = () => {
    setIsPreview((p) => !p);
  };

  const save = async () => {
    // 이미 저장 중이면 중복 실행 방지
    if (isSaving) {
      return;
    }

    if (!token || !recordId || !data) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // 1. Record 업데이트
      await updateRecordDetails({
        token,
        id: recordId,
        data: {
          identifier: data.record.identifier,
          coverUrl: data.record.coverUrl,
          name: data.record.name,
          subName: data.record.subName,
          description: data.record.description,
          bgm: data.record.bgm,
          color: data.record.color,
          birthDate: data.record.birthDate,
          displayMode: data.record.displayMode,
        },
      });

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

      // 기존 items 업데이트
      for (const item of existingItems) {
        console.log("[SAVE] Updating item:", item.id, {
          title: item.title,
          images: item.images,
          imagesLength: item.images?.length,
        });
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
            images: item.images || [], // images 배열 추가
          },
        });
        console.log("[SAVE] Item updated successfully:", item.id);
      }

      // 새 items 생성 및 임시 ID를 실제 ID로 교체
      const updatedItems = [...data.items];
      for (const item of newItems) {
        const result = await createRecordItem({
          token,
          recordId,
          data: {
            title: item.title,
            date: item.date,
            location: item.location,
            description: item.description,
            color: item.color,
            isHighlight: item.isHighlight,
            coverUrl: item.coverUrl,
            images: item.images || [], // images 배열 추가
          },
        });

        // 생성된 항목의 실제 ID로 교체
        if (result?.ok && result?.id) {
          const tempIdIndex = updatedItems.findIndex((i) => i.id === item.id);
          if (tempIdIndex !== -1) {
            updatedItems[tempIdIndex] = {
              ...updatedItems[tempIdIndex],
              id: result.id,
            };
          }
        }
      }

      // 업데이트된 items로 상태 갱신
      setData({
        ...data,
        items: updatedItems,
      });

      // 삭제된 items 제거 (필요시 구현)
      // 삭제는 별도로 처리하거나, handleDataChange에서 관리

      setIsSaved(true);
      alert("저장되었습니다.");
    } catch (e) {
      console.error("[edit records] save error:", e);
      setError(e.message || "저장 중 오류가 발생했습니다.");
      alert(`저장 실패: ${e.message || "알 수 없는 오류"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    router.push("/login");
  };

  const addTimelineItem = () => {
    setIsAddModalOpen(true);
  };

  const handleAddTimelineItem = (newItem) => {
    if (!data) return;

    // 새 항목에 임시 고유 ID 부여 (DB에 저장되기 전까지 사용)
    // 음수나 문자열로 생성하여 DB ID와 구분
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const itemWithTempId = {
      ...newItem,
      id: tempId, // null 대신 임시 ID 사용
    };

    const newItems = [...(data.items || []), itemWithTempId];

    // timeline 배열과 동일한 정렬 로직으로 정렬하여 인덱스 계산
    const sortedItems = [...newItems].map((item) => {
      const [y] = (item.date || "").split(".");
      const year = y ? parseInt(y, 10) : 0;
      return { ...item, year };
    });

    // 연도 순서대로 정렬 (오름차순: 오래된 것부터)
    sortedItems.sort((a, b) => {
      if (!a.year && !b.year) return 0;
      if (!a.year) return 1;
      if (!b.year) return -1;
      return a.year - b.year;
    });

    // 정렬된 배열에서 생성된 항목의 인덱스 찾기
    const createdItemIndex = sortedItems.findIndex(
      (item) => item.id === tempId,
    );

    setData({
      ...data,
      items: newItems,
    });

    if (createdItemIndex !== -1) {
      const targetIndex = createdItemIndex + 1;
      setTimeout(() => {
        setNavigateToItem(targetIndex);
        setTimeout(() => setNavigateToItem(null), 100);
      }, 100);
    }

    setIsSaved(false);
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
          const userName = user?.userName || "사용자";

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
          let items = result.item.recordItems || [];
          if (items.length === 0) {
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
                title: "첫 번째 기록(예: 출생)",
                date: dateStr,
                location: "",
                description:
                  "기록할 만한 일들이 있나요? 작은 일들도 좋아요.\n일상의 경험을 이야기로 엮어 자신만의 시간을 아카이브해보세요.",
                color: "",
                isHighlight: false,
                coverUrl: "/images/records/No image.png",
              },
            ];
          }
          setData({
            record,
            items,
          });

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
        setData({
          ...data,
          items: newItems,
        });

        // 삭제된 항목이 마지막이 아니면 직전 항목으로 이동
        // main이 첫 번째이므로, 타임라인 항목의 인덱스는 deletedIndex + 1 (main 포함)
        // 삭제 후에는 deletedIndex + 1이 되므로, Math.max(0, deletedIndex)로 설정
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
      } else if (type === "item" && itemId) {
        uploadUrl = await uploadRecordFile({
          token,
          file,
          prefix: `records/${recordId}/timeline`,
        });
        const newItems = data.items.map((item) => {
          if (item.id === itemId) {
            // 기존 images 배열이 있으면 사용, 없으면 coverUrl로 초기화
            let currentImages = item.images || [];
            console.log("[UPLOAD] Before update - itemId:", itemId, {
              currentImages,
              currentImagesLength: currentImages.length,
              targetSlotIndex,
              uploadUrl,
            });

            // images 배열이 비어있고 coverUrl이 있으면 첫 번째 요소로 추가
            if (currentImages.length === 0 && item.coverUrl) {
              currentImages = [item.coverUrl];
            }

            // targetSlotIndex가 지정되어 있으면 해당 슬롯에 추가
            if (
              targetSlotIndex !== null &&
              targetSlotIndex >= 0 &&
              targetSlotIndex < 5
            ) {
              // 배열이 충분히 길지 않으면 확장
              while (currentImages.length <= targetSlotIndex) {
                currentImages.push(null);
              }
              currentImages[targetSlotIndex] = uploadUrl;
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

            // 최대 5개로 제한
            while (currentImages.length < 5) {
              currentImages.push(null);
            }
            currentImages = currentImages.slice(0, 5);

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
      }
      setIsSaved(false);
    } catch (e) {
      console.error("[image upload] error:", e);
      alert(`이미지 업로드 실패: ${e.message || "알 수 없는 오류"}`);
    } finally {
      setIsUploadingImage(false);
    }
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
        // 해당 인덱스의 이미지를 null로 변경
        const updatedImages = [...currentImages];
        updatedImages[imageIndex] = null;

        // 첫 번째 유효한 이미지를 coverUrl로도 유지 (하위 호환성)
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
      {error && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-red-500/90 px-4 py-2 text-sm text-white">
          ⚠️ {error}
        </div>
      )}
      {isSaving && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-blue-500/90 px-4 py-2 text-sm text-white">
          저장 중...
        </div>
      )}
      <AddTimelineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTimelineItem}
      />
      <FloatingToolbar
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
          onActiveItemChange={setActiveItem}
          isUploadingImage={isUploadingImage}
          onNavigateToItem={navigateToItem}
          cropState={cropState}
          onCropComplete={handleCropComplete}
          onCropCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </>
  );
}
