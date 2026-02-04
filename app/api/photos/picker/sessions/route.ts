import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const res = await fetch("https://photospicker.googleapis.com/v1/sessions", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: text },
      { status: res.status },
    );
  }

  const json = await res.json();
  // 문서 플로우: create session → pickerUri 제공 :contentReference[oaicite:9]{index=9}
  return NextResponse.json({ sessionId: json.id, pickerUri: json.pickerUri });
}
