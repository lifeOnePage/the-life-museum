// app/api/records/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/jwt";

export const runtime = "nodejs";

export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const items = await client.record.findMany({
    where: { userId: Number(payload.sub) || undefined },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      identifier: true,
      name: true,
      userName: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ ok: true, items: items });
}

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const payload = token ? verifyJwt(token) : null;

    if (!payload?.sub) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, identifier } = body || {};

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "identifier is required" },
        { status: 400 },
      );
    }

    // 사용자 이름 가져오기
    const userId = Number(payload.sub);
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const created = await client.record.create({
      data: {
        identifier,
        name: name ?? null,
        userName: user?.name || null,
        userId: userId,
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (e) {
    // unique 위반 등
    if (e?.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "identifier_taken" },
        { status: 409 },
      );
    }
    console.error("[records:POST]", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 },
    );
  }
}
