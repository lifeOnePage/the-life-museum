// app/api/me/records/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export const runtime = "nodejs";

export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );

  const items = await client.records.findMany({
    where: { userId: Number(payload.sub) || undefined },
    orderBy: { updatedAt: "desc" },
    select: { id: true, identifier: true, name:true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );

  const { identifier, name } = await req.json();
  const idf = String(identifier || "").trim();
  const n = String(name || "").trim();
  if (!/^[a-z0-9_-]{3,32}$/i.test(idf))
    return NextResponse.json(
      { ok: false, error: "invalid_identifier" },
      { status: 400 }
    );
  if (!name)
    return NextResponse.json(
      { ok: false, error: "invalid_name" },
      { status: 400 }
    );
  try {
    const item = await client.records.create({
      data: {
        identifier: idf,
        name: n, // 필수 필드라 임시로 비워 생성
        birthDate: new Date(), // DateTime 필수 → 일단 현재로 생성(이후 편집에서 수정)
        userId: Number(payload.sub),
      },
      select: { id: true, identifier: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "identifier_taken" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
