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
      file: file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      isFile: file instanceof File,
    });

    if (!file) {
      throw new Error("파일이 제공되지 않았습니다.");
    }

    if (!(file instanceof File)) {
      throw new Error("유효한 파일 객체가 아닙니다.");
    }

    if (!file.name || !file.type) {
      throw new Error(
        "유효하지 않은 파일입니다. 파일 이름과 타입이 필요합니다.",
      );
    }

    // 1) Presign URL 요청 (파일 메타데이터만 전송)
    console.log("[uploadRecordFile] Requesting presign URL...");
    let presignRes;
    try {
      presignRes = await fetch("/api/storage/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix,
          files: [{ name: file.name, type: file.type }],
        }),
      });
      console.log(
        "[uploadRecordFile] Presign response status:",
        presignRes.status,
      );
    } catch (fetchError) {
      console.error(
        "[uploadRecordFile] Fetch error during presign request:",
        fetchError,
      );
      throw new Error(
        `Presign 요청 실패: ${fetchError.message || "네트워크 오류"}`,
      );
    }

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
    console.log("[uploadRecordFile] presign response:", presignJson);

    if (
      !presignJson.ok ||
      !presignJson.items ||
      !Array.isArray(presignJson.items) ||
      presignJson.items.length === 0
    ) {
      throw new Error(presignJson.error || "Presign 응답 오류");
    }

    const firstItem = presignJson.items[0];
    if (!firstItem) {
      throw new Error("Presign 응답에 항목이 없습니다.");
    }

    const { uploadUrl, publicUrl, headers } = firstItem;

    if (!uploadUrl || !publicUrl) {
      console.error("[uploadRecordFile] Missing required fields:", {
        uploadUrl: !!uploadUrl,
        publicUrl: !!publicUrl,
        headers: !!headers,
        firstItem,
      });
      throw new Error("Presign 응답에 필수 필드가 없습니다.");
    }

    if (!headers || typeof headers !== "object") {
      console.error("[uploadRecordFile] Invalid headers:", headers);
      throw new Error("Presign 응답의 headers가 유효하지 않습니다.");
    }

    // 2) 클라이언트에서 직접 R2에 업로드 시도 (CORS 문제 시 서버를 통한 업로드로 폴백)
    console.log("[uploadRecordFile] Uploading to R2:", {
      uploadUrl: uploadUrl.substring(0, 100) + "...",
      hasHeaders: !!headers,
      fileSize: file.size,
    });

    let uploadRes;
    try {
      uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: headers,
        body: file,
      });
      console.log(
        "[uploadRecordFile] R2 upload response status:",
        uploadRes.status,
      );

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error(
          "[uploadRecordFile] R2 direct upload failed:",
          uploadRes.status,
          errorText,
        );
        throw new Error(`R2 직접 업로드 실패: ${uploadRes.status}`);
      }

      console.log(
        "[uploadRecordFile] Upload successful, publicUrl:",
        publicUrl,
      );
      return publicUrl;
    } catch (fetchError) {
      console.warn(
        "[uploadRecordFile] R2 direct upload failed, falling back to server upload:",
        fetchError,
      );

      // 폴백: 서버를 통한 업로드
      try {
        console.log("[uploadRecordFile] Using server upload fallback...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", prefix);

        // FormData를 사용할 때는 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary를 설정함
        const serverUploadRes = await authedFetch("/api/storage/upload", {
          token,
          method: "POST",
          headers: {}, // Content-Type을 명시적으로 설정하지 않음 (FormData가 자동 설정)
          body: formData,
        });

        if (!serverUploadRes.ok) {
          const errorText = await serverUploadRes.text();
          throw new Error(
            `서버 업로드 실패: ${serverUploadRes.status} - ${errorText}`,
          );
        }

        const serverUploadJson = await serverUploadRes.json();
        if (!serverUploadJson.ok || !serverUploadJson.publicUrl) {
          throw new Error(serverUploadJson.error || "서버 업로드 응답 오류");
        }

        console.log(
          "[uploadRecordFile] Server upload successful, publicUrl:",
          serverUploadJson.publicUrl,
        );
        return serverUploadJson.publicUrl;
      } catch (fallbackError) {
        console.error(
          "[uploadRecordFile] Fallback upload also failed:",
          fallbackError,
        );
        throw new Error(
          `업로드 실패: ${fetchError.message || "네트워크 오류"}. 폴백 업로드도 실패: ${fallbackError.message}`,
        );
      }
    }
  } catch (error) {
    console.error("[uploadRecordFile] error:", error);
    console.error("[uploadRecordFile] error name:", error.name);
    console.error("[uploadRecordFile] error message:", error.message);
    console.error("[uploadRecordFile] error stack:", error.stack);

    // TypeError인 경우 더 자세한 정보 제공
    if (error.name === "TypeError") {
      console.error("[uploadRecordFile] TypeError details:", {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    }

    throw error;
  }
}
