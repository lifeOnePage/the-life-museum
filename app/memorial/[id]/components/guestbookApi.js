// 방명록 API 헬퍼 — 감상 페이지에서 인증 없이 호출한다.
// (useRecordData.js의 API_BASE는 모듈 비공개라 재선언)
const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

export const FLOWER_TYPES = ["chrysanthemum", "lily", "carnation"];

export const FLOWER_LABELS = {
  chrysanthemum: "흰색 국화",
  lily: "흰색 백합",
  carnation: "흰색 카네이션",
};

export async function fetchGuestbook(recordId, { limit = 50, offset = 0 } = {}) {
  const res = await fetch(
    `${API_BASE}/api/v1/record/${recordId}/guestbook?limit=${limit}&offset=${offset}`,
  );
  if (!res.ok) throw new Error(`방명록을 불러오지 못했습니다 (${res.status})`);
  const result = await res.json();
  if (!result.ok || !result.data) throw new Error("방명록 데이터가 없습니다");
  return result.data; // { entries, total }
}

export async function postGuestbookEntry(recordId, payload) {
  const res = await fetch(`${API_BASE}/api/v1/record/${recordId}/guestbook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 404) throw new Error("존재하지 않는 앨범입니다");
  if (!res.ok) throw new Error("잠시 후 다시 시도해주세요");
  const result = await res.json();
  if (!result.ok || !result.data) throw new Error("잠시 후 다시 시도해주세요");
  return result.data; // { entry, total }
}
