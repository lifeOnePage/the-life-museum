// services/galleryService.js
// 업로드 & API 호출 유틸 (Storage 교체/확장 용이)

export function inferSrcType(fileOrUrl) {
  // 0 = image, 1 = video
  const isFile = typeof fileOrUrl !== "string";
  if (isFile) return fileOrUrl.type?.startsWith("video") ? 1 : 0;
  const url = String(fileOrUrl).toLowerCase();
  return url.match(/\.(mp4|mov|webm|m4v|avi)$/) ? 1 : 0;
}

export async function uploadMediaFiles(files, { prefix }) {
  // 1) 프리사인 URL들 요청
  const res = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prefix, // 예: `reels/${identifier}/childhood`
      files: files.map((f) => ({ name: f.name, type: f.type })),
    }),
  });
  const { items } = await res.json();
  if (!res.ok) throw new Error("presign failed");

  // 2) 각각 PUT 업로드
  //   fetch는 업로드 진행률 콜백이 없어 필요하면 axios/XHR 사용
  await Promise.all(
    items.map((it, i) =>
      fetch(it.uploadUrl, {
        method: "PUT",
        headers: it.headers,
        body: files[i],
      }).then((r) => {
        if (!r.ok) throw new Error(`upload failed: ${files[i].name}`);
      }),
    ),
  );

  // 3) 최종 URL 반환 (DB에 저장할 값)
  return items.map((it, i) => ({
    url: it.publicUrl, // 여기 저장
    key: it.key, // 필요 시 보관(삭제/이동용)
    srcType: inferSrcType(files[i]),
  }));
}

/**
 * 서버로 PATCH 호출
 * payload는 부분 업데이트 허용: { childhood?, memory?, relationship? }
 */
export async function patchReelsGallery({ token, reelsId, payload }) {
  console.log("payload:", payload);
  const res = await fetch(`/api/reels/gallery/${encodeURIComponent(reelsId)}`, {
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
export async function saveChildhood({ token, reelsId, items }) {
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
      prefix: `reels/${reelsId}/childhood`,
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
    reelsId,
    payload: { childhood: normalized },
  });
}

// services/galleryService.js (수정본의 핵심 라인만)

export async function saveExperience({ token, reelsId, items }) {
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
      { prefix: `reels/${reelsId}/memory` } // ✅ prefix 통일
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

  return patchReelsGallery({ token, reelsId, payload: { memory: normalized } });
}

export async function saveRelationship({ token, reelsId, items }) {
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
      { prefix: `reels/${reelsId}/relationship` } // ✅ prefix 통일
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

  return patchReelsGallery({ token, reelsId, payload: { relationship: normalized } });
}
