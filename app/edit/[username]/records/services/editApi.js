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
  if (!res.ok || !json.ok)
    throw new Error(json?.error || "update record failed");
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
    console.log("[uploadRecordFile] Starting upload:", {
      prefix,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    if (!file || !file.name || !file.type) {
      throw new Error("유효하지 않은 파일입니다.");
    }

    // 1) Presign URL 요청 (파일 메타데이터만 전송)
    const presignRes = await fetch("/api/storage/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prefix,
        files: [{ name: file.name, type: file.type }],
      }),
    });

    if (!presignRes.ok) {
      const errorText = await presignRes.text();
      console.error(
        "[uploadRecordFile] presign failed:",
        presignRes.status,
        errorText,
      );
      let errorMessage = `Presign 실패: ${presignRes.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const presignJson = await presignRes.json();
    if (
      !presignJson.ok ||
      !presignJson.items ||
      presignJson.items.length === 0
    ) {
      throw new Error(presignJson.error || "Presign 응답 오류");
    }

    const { uploadUrl, publicUrl, headers } = presignJson.items[0];

    // 2) 클라이언트에서 직접 R2에 업로드 (서버를 거치지 않음)
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: headers,
      body: file,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error(
        "[uploadRecordFile] upload failed:",
        uploadRes.status,
        errorText,
      );
      throw new Error(`업로드 실패: ${uploadRes.status}`);
    }

    console.log("[uploadRecordFile] Upload successful, publicUrl:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("[uploadRecordFile] error:", error);
    console.error("[uploadRecordFile] error name:", error.name);
    console.error("[uploadRecordFile] error message:", error.message);
    throw error;
  }
}
