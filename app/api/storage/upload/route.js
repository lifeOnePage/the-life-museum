// app/api/storage/upload/route.js
// CORS 문제를 피하기 위해 서버에서 직접 업로드하는 프록시 API
import { NextResponse } from "next/server";
import { r2, R2_BUCKET, randomKey, publicUrlForKey } from "@/app/api/_lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// 파일명 안전 처리
function safeName(name = "") {
  return name.replace(/[^\w.\-~]+/g, "_").slice(0, 180);
}

/**
 * POST /api/storage/upload
 * body: FormData { file: File, prefix: string }
 * return: { ok: true, publicUrl: string }
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const prefix = formData.get("prefix") || "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "no file" },
        { status: 400 },
      );
    }

    // 파일 키 생성
    const key = `${randomKey(prefix)}-${safeName(file.name)}`;

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // R2에 직접 업로드
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    });

    await r2.send(command);

    // 퍼블릭 URL 반환
    const publicUrl = publicUrlForKey(key);

    return NextResponse.json({ ok: true, publicUrl });
  } catch (e) {
    console.error("[upload] error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
