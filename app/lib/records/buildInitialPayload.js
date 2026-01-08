/**
 * 처음 생성하는건지 판단한 후,
 * 기본값을 세팅한다.
 */
import { INIT_RECORD_DATA } from "@/app/constants/records/initRecordData";
import { date2String } from "@/app/utils/date2String";

export function buildInitialPayload(item) {
  //기본값 준비
  const trimmedName = item.name?.trim() ?? "";
  const trimmedDescription = item.description?.trim() ?? "";
  const record = {
    ...item,
    name: trimmedName || INIT_RECORD_DATA.name,
    description: trimmedDescription || INIT_RECORD_DATA.description,
    coverUrl: item.coverUrl || INIT_RECORD_DATA.coverUrl,
    color: item.color || INIT_RECORD_DATA.color,
  };

  const itemsFromServer = item.recordItems ?? [];

  //새 레코드인지 판단

  const isRecordEmpty = !(trimmedName && trimmedDescription && item.coverUrl);

  const createdAt = new Date(item.createdAt).getTime();
  const updatedAt = new Date(item.updatedAt).getTime();
  const isNewlyCreated = createdAt === updatedAt;
  // 새 레코드인 경우:
  // 1. name, description, coverUrl이 모두 비어있고
  // 2. 생성시간과 수정시간이 동일할 때
  // 3. items가 비어있을 때
  const isActuallyNewRecord =
    itemsFromServer.length === 0 && isNewlyCreated && isRecordEmpty;
  // 새 레코드인 경우에만 기본 아이템 생성
  const items = isActuallyNewRecord
    ? [
        {
          id: `${crypto.randomUUID()}`,
          title: INIT_RECORD_DATA.items[0].title,
          date: date2String(new Date()),
          location: "",
          description: INIT_RECORD_DATA.items[0].description,
          color: "",
          isHighlight: false,
          coverUrl: null,
          images: [],
        },
      ]
    : itemsFromServer;

  return {
    record,
    items,
    meta: {
      isActuallyNewRecord,
    },
  };
}
