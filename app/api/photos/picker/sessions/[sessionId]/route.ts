import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } },
) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const res = await fetch(
    `https://photospicker.googleapis.com/v1/sessions/${encodeURIComponent(params.sessionId)}`,
    {
      headers: { Authorization: auth },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: text },
      { status: res.status },
    );
  }

  const json = await res.json();
  // mediaItemsSet = true 되면 선택 완료 :contentReference[oaicite:10]{index=10}
  return NextResponse.json({
    sessionId: json.id,
    mediaItemsSet: Boolean(json.mediaItemsSet),
  });
}
