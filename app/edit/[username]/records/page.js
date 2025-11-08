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
          if (items.length === 0) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateStr = `${year}.${month}.${day}`;

            items = [
              {
                id: null, // 새 항목
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
        },
      });

      // 2. RecordItems 업데이트 (기존 items와 새 items 비교)
      const existingItems = data.items.filter((item) => item.id);
      const newItems = data.items.filter((item) => !item.id);

      // 기존 items 업데이트
      for (const item of existingItems) {
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
          },
        });
      }

      // 새 items 생성
      for (const item of newItems) {
        await createRecordItem({
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
          },
        });
      }

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

    setData({
      ...data,
      items: [...(data.items || []), newItem],
    });
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
      // DB에 저장된 항목이면 API 호출
      if (itemId) {
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
            items = [
              {
                id: null,
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
        }
        setIsSaved(true);
      } else {
        // 새로 만든 항목(id가 없는)은 로컬에서만 제거
        const newItems = data.items.filter((item) => item.id !== itemId);
        setData({
          ...data,
          items: newItems,
        });
        setIsSaved(false);
      }
    } catch (e) {
      console.error("[delete item] error:", e);
      alert(`삭제 실패: ${e.message || "알 수 없는 오류"}`);
    }
  };

  const handleColorChange = (color) => {
    if (!data) return;

    // 활성화된 item이 main이면 record의 color 변경, 아니면 해당 item의 color 변경
    if (activeItem && activeItem.kind === "main") {
      setData({
        ...data,
        record: {
          ...data.record,
          color: color,
        },
      });
    } else if (activeItem && activeItem.id) {
      // 해당 item의 color 변경
      const newItems = data.items.map((item) =>
        item.id === activeItem.id ? { ...item, color: color } : item,
      );
      setData({
        ...data,
        items: newItems,
      });
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

  const handleImageChange = async (type, itemId, file) => {
    if (!token || !file) return;

    if (!recordId) {
      alert("레코드 ID를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }

    try {
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
        const newItems = data.items.map((item) =>
          item.id === itemId ? { ...item, coverUrl: uploadUrl } : item,
        );
        setData({
          ...data,
          items: newItems,
        });
      }
      setIsSaved(false);
    } catch (e) {
      console.error("[image upload] error:", e);
      alert(`이미지 업로드 실패: ${e.message || "알 수 없는 오류"}`);
    }
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
      />
      {width <= 768 ? (
        <LifeRecordMobile
          data={data}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onActiveItemChange={setActiveItem}
        />
      ) : (
        <LifeRecordDesktop
          data={data}
          isEditing={!isPreview}
          onDataChange={isPreview ? undefined : handleDataChange}
          onDeleteItem={isPreview ? undefined : handleDeleteItem}
          onImageChange={isPreview ? undefined : handleImageChange}
          onActiveItemChange={setActiveItem}
        />
      )}
    </>
  );
}
