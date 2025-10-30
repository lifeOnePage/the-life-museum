import { makeDummyGalleryPayload, makeMixedPayloadWithIds } from "./dummyData";

export async function fetchReelsDetails({ token, identifier }) {
  console.group("fetchReelsDetails");
  console.log("identifier: ", identifier);
  console.groupEnd();
  const res = await fetch(`/api/reels/${identifier}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 500) throw new Error("get reels failed");
  const json = await res.json();
  if (!json.ok) throw new Error("update reel failed");
  return json;
}

export async function updateReelsDetails({ token, id, data }) {
  // // data 구조
  // const data = {
  //   reels: {},
  //   lifestory: {},
  //   childhood: {},
  //   memory: {},
  //   relationship: {},
  // };
  if (!data.birthDate) throw new Error("출생일을 입력해주세요.");
  if (!data.birthPlace) throw new Error("출생지를 입력해주세요.");
  if (!data.motto) throw new Error("한줄 소개를 입력해주세요.");
  const res = await fetch(`api/reels/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error("update record failed");
  return json;
}

export async function updateReelsGalleryDetails({ token, id, data }) {
  const payload = makeMixedPayloadWithIds({
    memory: [3],
    relationship: [4],
    childhood: [3],
  });
  console.group("updateReelsGalleryDetails");
  console.log("id: ", id);
  console.groupEnd();
  const res = await fetch(`/api/reels/gallery/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} – ${json?.error || json?.message || "patch failed"}`,
    );
  }
  return json;
}

export async function fetchLifestory({ token, id, edit = false }) {
  const url = `/api/reels/lifestory/${encodeURIComponent(id)}${edit ? "?edit=1" : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-edit-mode": edit ? "true" : "false",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "fetch failed");
  return json.item;
}

export async function saveLifestory({
  token,
  id,
  style,
  questions,
  answers,
  story,
}) {
  const res = await fetch(`/api/reels/lifestory/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ style, questions, answers, story }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "save failed");
  return json.item;
}

export async function generateStory({ token, style, messages, userName }) {
  const res = await fetch("/api/gpt-story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ style, messages, userName }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "generate failed");
  return json.story;
}
