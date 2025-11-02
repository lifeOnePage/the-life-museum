// app/api/records/[id]/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export const runtime = "nodejs";

// GET: identifier로 record 조회 (인증 필요)
export async function GET(req, { params }) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const payload = token ? verifyJwt(token) : null;
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const identifier = String(id || "").trim();

    // identifier로 record 찾기 (본인 소유만)
    const record = await client.record.findFirst({
      where: {
        identifier,
        userId: Number(payload.sub),
      },
      select: {
        id: true,
        identifier: true,
        coverUrl: true,
        name: true,
        subName: true,
        description: true,
        bgm: true,
        color: true,
        recordItems: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
            color: true,
            isHighlight: true,
            coverUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      item: {
        record: {
          id: record.id,
          identifier: record.identifier,
          coverUrl: record.coverUrl,
          name: record.name,
          subName: record.subName,
          description: record.description,
          bgm: record.bgm,
          color: record.color,
        },
        recordItems: (record.recordItems || []).map((item) => ({
          id: item.id,
          title: item.title || "",
          date: item.date || "",
          location: item.location || "",
          description: item.description || "",
          color: item.color || "",
          isHighlight: item.isHighlight || false,
          coverUrl: item.coverUrl || "",
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (e) {
    console.error("[records:GET]", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const { identifier } = await req.json();
  const idf = String(identifier || "").trim();
  if (!/^[a-z0-9_-]{3,32}$/i.test(idf))
    return NextResponse.json(
      { ok: false, error: "invalid_identifier" },
      { status: 400 },
    );

  const target = await client.record.findFirst({
    where: { identifier: id, userId: Number(payload.sub) },
    select: { id: true, userId: true },
  });
  if (!target || target.userId !== Number(payload.sub)) {
    return NextResponse.json(
      { ok: false, error: "not_found_or_forbidden" },
      { status: 404 },
    );
  }

  try {
    const item = await client.record.update({
      where: { id: target.id },
      data: { identifier: idf },
      select: { id: true, identifier: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "identifier_taken" },
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
