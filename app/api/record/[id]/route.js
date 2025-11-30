// app/api/record/[id]/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/auth";

const ALLOWED_RECORD_FIELDS = [
  "identifier",
  "coverUrl",
  "name",
  "subName",
  "description",
  "bgm",
  "color",
  "birthDate",
  "displayMode",
];

const ALLOWED_ITEM_FIELDS = [
  "title",
  "date",
  "location",
  "description",
  "color",
  "isHighlight",
  "coverUrl",
  "images",
];

const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

async function getAuthedUser(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = token ? verifyJwt(token) : null;
  if (!payload?.sub) return null;
  return { userId: Number(payload.sub) };
}

function toRecordResponse(rec) {
  if (!rec) return null;
  return {
    identifier: rec.identifier,
    coverUrl: rec.coverUrl,
    name: rec.name,
    subName: rec.subName,
    description: rec.description,
    bgm: rec.bgm,
    color: rec.color,
    birthDate: rec.birthDate || null,
    displayMode: rec.displayMode || "year",
    recordItems: (rec.recordItems || []).map((it) => ({
      id: it.id,
      title: it.title,
      date: it.date,
      location: it.location,
      description: it.description,
      color: it.color,
      isHighlight: it.isHighlight,
      coverUrl: it.coverUrl,
      images: it.images || [],
    })),
  };
}

export async function GET(req, { params }) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    // 본인 소유만 허용
    const rec = await client.record.findFirst({
      where: { id, userId: user.userId },
      select: {
        id: true,
        identifier: true,
        coverUrl: true,
        name: true,
        subName: true,
        description: true,
        bgm: true,
        color: true,
        birthDate: true,
        displayMode: true,
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
            images: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!rec) {
      return NextResponse.json({ ok: false, error: "record not found" }, { status: 404 });
    }

    return NextResponse.json({ status: 200, record: toRecordResponse(rec) });
  } catch (e) {
    console.error("[record:GET]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const data = pick(body, ALLOWED_RECORD_FIELDS);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "no updatable fields" }, { status: 400 });
    }

    // 소유권 체크
    const owned = await client.record.findFirst({ where: { id, userId: user.userId }, select: { id: true } });
    if (!owned) {
      return NextResponse.json({ ok: false, error: "record not found" }, { status: 404 });
    }

    await client.record.update({ where: { id }, data });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[record:PATCH]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

// createRecordItem
export async function POST(req, { params }) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const data = pick(body, ALLOWED_ITEM_FIELDS);

    // 소유권 체크
    const owned = await client.record.findFirst({ where: { id, userId: user.userId }, select: { id: true } });
    if (!owned) {
      return NextResponse.json({ ok: false, error: "record not found" }, { status: 404 });
    }

    const created = await client.recordItem.create({
      data: { ...data, recordId: id },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e) {
    console.error("[recordItem:POST]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
