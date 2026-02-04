import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "missing sessionId" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: auth } },
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: text },
      { status: res.status },
    );
  }

  const json = await res.json();
  // list picked items endpoint :contentReference[oaicite:11]{index=11}
  return NextResponse.json({
    mediaItems: json.mediaItems ?? [],
    nextPageToken: json.nextPageToken,
  });
}
