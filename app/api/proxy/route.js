// app/api/proxy/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ ok: false, error: "missing url" }, { status: 400 });
  }

  try {
    const headers = new Headers();
    const range = req.headers.get("range");
    if (range) headers.set("range", range);

    const upstream = await fetch(raw, {
      headers,
      redirect: "follow",
      // 중요: 외부에서 캐시 가능하게 가져옵니다.
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const status = upstream.status;
    const acceptRanges = upstream.headers.get("accept-ranges") || "bytes";
    const contentRange = upstream.headers.get("content-range");
    const contentLength = upstream.headers.get("content-length");
    const cacheControl = upstream.headers.get("cache-control") || "public, max-age=3600";

    const resHeaders = new Headers();
    resHeaders.set("Content-Type", contentType);
    resHeaders.set("Cache-Control", cacheControl);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Accept-Ranges", acceptRanges);
    if (contentRange) resHeaders.set("Content-Range", contentRange);
    if (contentLength) resHeaders.set("Content-Length", contentLength);

    return new Response(upstream.body, { status, headers: resHeaders });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
