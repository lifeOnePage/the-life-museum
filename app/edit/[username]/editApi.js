import { makeDummyGalleryPayload, makeMixedPayloadWithIds } from "./dummyData";

export async function fetchReelsDetails({ token, identifier }) {
  console.group("fetchReelsDetails");
  console.log("identifier: ", identifier);
  console.groupEnd();
  const res = await fetch(`/api/reel/${identifier}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 500) throw new Error("get reel failed");
  const json = await res.json();
  if (!json.ok) throw new Error("update reel failed");
  return json;
}

// ===== drop-in replacement =====
export async function updateReelsDetails({ token, id, data }) {
  // data: { profileImg?, name?, birthDate?, birthPlace?, motto? }

  // 헬퍼: blob/data URL이면 업로드, 아니면 null 반환(스킵)
  async function maybeUploadProfileToR2(profileUrl) {
    if (!profileUrl) return null;

    const isBlobLike =
      typeof profileUrl === "string" &&
      (profileUrl.startsWith("blob:") || profileUrl.startsWith("data:"));

    if (!isBlobLike) return null; // 기존 공개 URL이면 업로드 스킵

    // 1) 로컬 blob/data URL을 Blob으로 변환
    const resp = await fetch(profileUrl);
    if (!resp.ok) throw new Error("failed to read local blob url");
    const blob = await resp.blob();

    // 2) presign 요청 (경로: reels/{id}/profile)
    const ext =
      (blob.type && blob.type.split("/")[1]) ? blob.type.split("/")[1] : "bin";
    const filename = `profile-${Date.now()}.${ext}`;

    const presignRes = await fetch(`/api/storage/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prefix: `reel/${id}/profile`,
        files: [{ name: filename, type: blob.type || "application/octet-stream" }],
      }),
    });

    const presignJson = await presignRes.json().catch(() => ({}));
    if (!presignRes.ok || !presignJson?.items?.[0]) {
      throw new Error(
        `presign failed: ${presignJson?.error || presignRes.status}`,
      );
    }

    const { uploadUrl, publicUrl, headers } = presignJson.items[0];

    // 3) 실제 업로드 (PUT)
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: headers || { "Content-Type": blob.type || "application/octet-stream" },
      body: blob,
    });
    if (!putRes.ok) {
      throw new Error(`upload failed: HTTP ${putRes.status}`);
    }

    // 4) 업로드 완료된 공개 URL 반환
    return publicUrl;
  }

  // 업로드가 필요한 경우만 업로드
  let nextPayload = { ...data };
  if (data?.profileImg) {
    const uploadedUrl = await maybeUploadProfileToR2(data.profileImg);
    if (uploadedUrl) {
      nextPayload.profileImg = uploadedUrl; // 새 URL로 교체
    } else {
      // blob/data URL이 아니라면(= 기존 URL) 서버로 그대로 보내거나,
      // 변경이 아니라면 굳이 보낼 필요 없음. 원하면 주석 해제해서 제거 가능.
      // delete nextPayload.profileImg;
    }
  }

  // PATCH 호출
  const res = await fetch(`/api/reel/profile/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(nextPayload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new Error(`update failed: ${json?.error || res.status}`);
  }
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
  const res = await fetch(`/api/reel/gallery/${encodeURIComponent(id)}`, {
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
  const url = `/api/reel/lifestory/${encodeURIComponent(id)}${edit ? "?edit=1" : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-edit-mode": edit ? "true" : "false",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "fetch failed");
  return json.item; // { style, questions, answers, story, tokenUsage, ... }
}
export async function saveLifestory({ token, id, data }) {
  const res = await fetch(`/api/reel/lifestory/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "save failed");
  return json.item;
}

/** 사용량 +1 전용 */
export async function incrementLifestoryUsage({ token, id }) {
  return saveLifestory({ token, id, data: { incUsage: true } });
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
