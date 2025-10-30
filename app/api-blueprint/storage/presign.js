// app/api/storage/presign/route.js
import { NextResponse } from "next/server";
import { r2, R2_BUCKET, randomKey, publicUrlForKey } from "@/app/api/_lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 파일명 안전 처리(선택)
function safeName(name = "") {
  return name.replace(/[^\w.\-~]+/g, "_").slice(0, 180);
}

/**
 * POST /api/storage/presign
 * body: { prefix?: string, files: [{ name: string, type: string }] }
 * return: [{ key, uploadUrl, publicUrl, headers }]
 */
export async function POST(req) {
  try {
    const { prefix = "", files = [] } = await req.json();
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "no files" }, { status: 400 });
    }

    const out = [];
    for (const f of files) {
      const key = `${randomKey(prefix)}-${safeName(f.name)}`;
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: f.type || "application/octet-stream",
        // 캐시 최적화 (다운로드 많은 워크로드용)
        CacheControl: "public, max-age=31536000, immutable",
      });

      const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 5 }); // 5분 유효
      out.push({
        key,
        uploadUrl,
        publicUrl: publicUrlForKey(key),
        headers: {
          "Content-Type": f.type || "application/octet-stream",
          // 프리사인시에 지정한 Cache-Control은 서명에 포함되므로
          // PUT 시 같은 헤더를 다시 보내는 게 안전합니다.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json({ ok: true, items: out });
  } catch (e) {
    console.error("[presign] error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
