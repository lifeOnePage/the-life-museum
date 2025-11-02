import { authedFetch } from "@/app/utils/authedFetch";

export async function fetchRecordDetails({ token, identifier }) {
  const res = await authedFetch(`/api/records/${identifier}`, {
    token,
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("get record failed");
  const json = await res.json();
  if (!json.ok) throw new Error("get record failed");
  return json;
}

export async function updateRecordDetails({ token, id, data }) {
  const res = await authedFetch(`/api/record/${id}`, {
    token,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error || "update record failed");
  return json;
}

export async function createRecordItem({ token, recordId, data }) {
  const res = await authedFetch(`/api/record/${recordId}`, {
    token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error || "create item failed");
  return json;
}

export async function updateRecordItem({ token, itemId, data }) {
  const res = await authedFetch(`/api/record/item/${itemId}`, {
    token,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error || "update item failed");
  return json;
}

export async function deleteRecordItem({ token, itemId }) {
  const res = await authedFetch(`/api/record/item/${itemId}`, {
    token,
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error || "delete item failed");
  return json;
}

export async function uploadRecordFile({ token, file, prefix }) {
  try {
    console.log("[uploadRecordFile] Starting upload:", { prefix, fileName: file.name, fileType: file.type, fileSize: file.size });
    
    if (!file || !file.name || !file.type) {
      throw new Error("유효하지 않은 파일입니다.");
    }
    
    // 서버 프록시를 통해 업로드 (CORS 문제 해결)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);

    const uploadRes = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    });

    console.log("[uploadRecordFile] Upload response status:", uploadRes.status);

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("[uploadRecordFile] upload failed:", uploadRes.status, errorText);
      let errorMessage = `업로드 실패: ${uploadRes.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const uploadJson = await uploadRes.json();
    console.log("[uploadRecordFile] Upload response:", uploadJson);

    if (!uploadJson.ok) {
      throw new Error(uploadJson.error || "업로드 실패");
    }

    if (!uploadJson.publicUrl) {
      throw new Error("업로드 응답에 URL이 없습니다.");
    }

    console.log("[uploadRecordFile] Upload successful, publicUrl:", uploadJson.publicUrl);
    return uploadJson.publicUrl;
  } catch (error) {
    console.error("[uploadRecordFile] error:", error);
    console.error("[uploadRecordFile] error name:", error.name);
    console.error("[uploadRecordFile] error message:", error.message);
    throw error;
  }
}

