// app/api/record/item/[id]/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/auth";

const ALLOWED_ITEM_FIELDS = [
  "title",
  "date",
  "location",
  "description",
  "color",
  "isHighlight",
  "coverUrl",
];

const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

async function ensureItemOwnedBy(userId, itemId) {
  const item = await client.recordItem.findUnique({
    where: { id: itemId },
    select: { record: { select: { userId: true } } },
  });
  if (!item || item.record.userId !== userId) return false;
  return true;
}

export async function PATCH(req, { params }) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const payload = token ? verifyJwt(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    const userId = Number(payload.sub);
    if (!(await ensureItemOwnedBy(userId, id))) {
      return NextResponse.json({ ok: false, error: "record item not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data = pick(body, ALLOWED_ITEM_FIELDS);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "no updatable fields" }, { status: 400 });
    }

    await client.recordItem.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recordItem:PATCH]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const payload = token ? verifyJwt(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    const userId = Number(payload.sub);
    if (!(await ensureItemOwnedBy(userId, id))) {
      return NextResponse.json({ ok: false, error: "record item not found" }, { status: 404 });
    }

    await client.recordItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recordItem:DELETE]", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
