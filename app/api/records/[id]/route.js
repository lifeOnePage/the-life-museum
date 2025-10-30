// app/api/me/records/[id]/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  const { id } = params;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { identifier } = await req.json();
  const idf = String(identifier || "").trim();
  if (!/^[a-z0-9_-]{3,32}$/i.test(idf))
    return NextResponse.json({ ok: false, error: "invalid_identifier" }, { status: 400 });

  const target = await client.records.findUnique({ where: { id: Number(id) }, select: { userId: true } });
  if (!target || target.userId !== Number(payload.sub)) {
    return NextResponse.json({ ok: false, error: "not_found_or_forbidden" }, { status: 404 });
  }

  try {
    const item = await client.records.update({
      where: { id: Number(id) },
      data: { identifier: idf },
      select: { id: true, identifier: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "identifier_taken" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
