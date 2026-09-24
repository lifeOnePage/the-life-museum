// services/galleryService.js
// 업로드 & API 호출 유틸 (Storage 교체/확장 용이)
// uploadMediaFiles/inferSrcType은 app/lib/uploadMediaFiles.js로 이동 — 재수출 유지
export { uploadMediaFiles, inferSrcType } from "@/app/lib/uploadMediaFiles";

/**
 * 서버로 PATCH 호출
 * payload는 부분 업데이트 허용: { childhood?, memory?, relationship? }
 */
/**
 * Partially updates gallery sections via PATCH.
 * 갤러리 섹션을 PATCH로 부분 업데이트합니다.
 * @param {Object} params
 * @param {string} [params.token]
 * @param {string} params.reelId
 * @param {Object} params.payload
 * @returns {Promise<any>}
 */
export async function patchReelsGallery({ token, reelId, payload }) {
  console.log("payload:", payload);
  const res = await fetch(`/api/reel/gallery/${encodeURIComponent(reelId)}`, {
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
      `HTTP ${res.status}: ${json?.error || json?.message || "patch failed"}`,
    );
  }
  return json;
}

/**
 * 공통 저장 헬퍼들 (각 섹션 전용)
 */

// items: [{ id?, url?, file?, caption? }]
/**
 * Saves the childhood section.
 * childhood 섹션을 저장합니다.
 * @param {Object} params
 * @param {string} [params.token]
 * @param {string} params.reelId
 * @param {Array<Object>} params.items
 * @returns {Promise<any>}
 */
export async function saveChildhood({ token, reelId, items }) {
  // 1) 파일만 먼저 업로드해서 URL/타입 확보
  const fileIdx = []; // items에서 파일 항목들의 인덱스 기록
  const files = [];
  items.forEach((it, i) => {
    if (it.file) {
      fileIdx.push(i);
      files.push(it.file);
    }
  });

  let uploaded = [];
  if (files.length) {
    // [{ url, key, srcType }, ...]
    uploaded = await uploadMediaFiles(files, {
      prefix: `reel/${reelId}/childhood`,
    });
  }

  // 2) 업로드 결과를 원래 자리로 주입하고,
  //    서버가 기대하는 형태({ id?, data: { srcUrl, srcType, caption } })로 정규화
  let up = 0;
  const normalized = items.map((it) => {
    if (it.file) {
      const u = uploaded[up++];
      return {
        id: it.id,
        data: {
          srcUrl: u.url,
          srcType: u.srcType,
          caption: it.caption || "",
        },
      };
    }
    return {
      id: it.id,
      data: {
        srcUrl: it.url,
        srcType: inferSrcType(it.url),
        caption: it.caption || "",
      },
    };
  });

  // 3) 절대 `map(async ...)` 하지 마세요 — Promise 배열이 되면 JSON 직렬화가 망가집니다.
  //    순수 객체 배열을 payload로 보냅니다.
  return patchReelsGallery({
    token,
    reelId,
    payload: { childhood: normalized },
  });
}

// services/galleryService.js (수정본의 핵심 라인만)

/**
 * Saves the memory section.
 * memory 섹션을 저장합니다.
 * @param {Object} params
 * @param {string} [params.token]
 * @param {string} params.reelId
 * @param {Array<Object>} params.items
 * @returns {Promise<any>}
 */
export async function saveExperience({ token, reelId, items }) {
  // 1) 업로드 대상 추출
  const uploadTargets = [];
  items.forEach((mem, mi) => {
    mem.media.forEach((m, pi) => {
      if (m.file) uploadTargets.push({ mi, pi, file: m.file });
    });
  });

  // 2) presign + PUT (공통 prefix)
  let uploaded = [];
  if (uploadTargets.length) {
    uploaded = await uploadMediaFiles(
      uploadTargets.map((u) => u.file),
      { prefix: `reel/${reelId}/memory` } // ✅ prefix 통일
    );
  }

  // 3) 업로드 결과를 media에 주입 + 서버 기대 포맷({ id?, data: {...}, media: [...] })
  let upIdx = 0;
  const normalized = items.map((mem) => {
    const media = mem.media.map((m) => {
      if (m.file) {
        const { url, srcType } = uploaded[upIdx++];
        return { srcUrl: url, srcType, caption: m.caption || "" };
      }
      return { srcUrl: m.url, srcType: inferSrcType(m.url), caption: m.caption || "" };
    });
    return {
      id: mem.id,
      data: {
        title: mem.title ?? "",
        subTitle: mem.subTitle ?? null,
        date: mem.date ?? null,
        comment: mem.comment ?? null,
      },
      media,
    };
  });

  return patchReelsGallery({ token, reelId, payload: { memory: normalized } });
}

/**
 * Saves the relationship section.
 * relationship 섹션을 저장합니다.
 * @param {Object} params
 * @param {string} [params.token]
 * @param {string} params.reelId
 * @param {Array<Object>} params.items
 * @returns {Promise<any>}
 */
export async function saveRelationship({ token, reelId, items }) {
  const uploadTargets = [];
  items.forEach((rel, ri) => {
    rel.media.forEach((m, pi) => {
      if (m.file) uploadTargets.push({ ri, pi, file: m.file });
    });
  });

  let uploaded = [];
  if (uploadTargets.length) {
    uploaded = await uploadMediaFiles(
      uploadTargets.map((u) => u.file),
      { prefix: `reel/${reelId}/relationship` } // ✅ prefix 통일
    );
  }

  let upIdx = 0;
  const normalized = items.map((rel) => {
    const media = rel.media.map((m) => {
      if (m.file) {
        const { url, srcType } = uploaded[upIdx++];
        return { srcUrl: url, srcType, caption: m.caption || "" };
      }
      return { srcUrl: m.url, srcType: inferSrcType(m.url), caption: m.caption || "" };
    });
    return {
      id: rel.id,
      data: {
        name: rel.name ?? "",
        relation: rel.relation ?? "",
        comment: rel.comment ?? null,
      },
      media,
    };
  });

  return patchReelsGallery({ token, reelId, payload: { relationship: normalized } });
}
