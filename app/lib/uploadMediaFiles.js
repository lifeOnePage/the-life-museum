// presign → R2 직접 PUT 업로드 유틸.
// (app/edit/[username]/reels/services/editGalleryApi.js에서 이동 — 그 파일은 재수출)

/**
 * Infers media type from a file or URL.
 * 파일/URL에서 미디어 타입을 추론합니다.
 * @param {File|string} fileOrUrl
 * @returns {number} 0=image, 1=video
 */
export function inferSrcType(fileOrUrl) {
  // 0 = image, 1 = video
  const isFile = typeof fileOrUrl !== "string";
  if (isFile) return fileOrUrl.type?.startsWith("video") ? 1 : 0;
  const url = String(fileOrUrl).toLowerCase();
  return url.match(/\.(mp4|mov|webm|m4v|avi)$/) ? 1 : 0;
}

/**
 * Uploads files via presigned URLs and returns upload results.
 * presign 후 PUT 업로드를 수행하고 업로드 결과를 반환합니다.
 * @param {File[]} files
 * @param {Object} options
 * @param {string} options.prefix
 * @param {(doneCount: number) => void} [options.onFileDone] 파일 1개 완료마다 호출
 * @returns {Promise<Array<{url: string, key: string, srcType: number}>>}
 */
export async function uploadMediaFiles(files, { prefix, onFileDone }) {
  // 1) 프리사인 URL들 요청
  const res = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prefix,
      files: files.map((f) => ({ name: f.name, type: f.type })),
    }),
  });
  const { items } = await res.json();
  if (!res.ok) throw new Error("presign failed");

  // 2) 각각 PUT 업로드
  //   fetch는 업로드 진행률 콜백이 없어 파일 단위 완료 카운트만 제공
  let done = 0;
  await Promise.all(
    items.map((it, i) =>
      fetch(it.uploadUrl, {
        method: "PUT",
        headers: it.headers,
        body: files[i],
      }).then((r) => {
        if (!r.ok) throw new Error(`upload failed: ${files[i].name}`);
        done += 1;
        onFileDone?.(done);
      }),
    ),
  );

  // 3) 최종 URL 반환 (DB에 저장할 값)
  return items.map((it, i) => ({
    url: it.publicUrl,
    key: it.key,
    srcType: inferSrcType(files[i]),
  }));
}
