// app/api/record/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const payload = token ? verifyJwt(token) : null;
    if (!payload?.userId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, identifier } = body || {};

    if (!identifier) {
      return NextResponse.json({ ok: false, error: "identifier is required" }, { status: 400 });
    }

    const created = await client.record.create({
      data: {
        identifier,
        name: name ?? null,
        userId: payload.userId,
      },
      select: { id: true, identifier: true },
    });

    return NextResponse.json({ ok: true, id: created.id, identifier: created.identifier }, { status: 201 });
  } catch (e) {
    // unique 위반 등
    console.error("[record:POST]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
