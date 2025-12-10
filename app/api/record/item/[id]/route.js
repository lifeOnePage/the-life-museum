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
  "images",
];

const pick = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(([k]) => keys.includes(k)),
  );

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
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { ok: false, error: "invalid id" },
        { status: 400 },
      );
    }

    const userId = Number(payload.sub);
    if (!(await ensureItemOwnedBy(userId, id))) {
      return NextResponse.json(
        { ok: false, error: "record item not found" },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => ({}));
    console.log("[API] PATCH request body:", JSON.stringify(body, null, 2));
    const data = pick(body, ALLOWED_ITEM_FIELDS);
    console.log("[API] Picked data:", JSON.stringify(data, null, 2));
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { ok: false, error: "no updatable fields" },
        { status: 400 },
      );
    }

    // images 배열이 있으면 null/빈 값 필터링 및 최대 5개로 제한
    if (data.images && Array.isArray(data.images)) {
      console.log("[API] Before filtering images:", data.images);
      // null, undefined, 빈 문자열을 필터링하고 최대 5개로 제한
      data.images = data.images
        .filter((img) => img !== null && img !== undefined && img !== "")
        .slice(0, 5);
      console.log("[API] After filtering images:", data.images);
    } else if (!data.images) {
      // images가 없으면 빈 배열로 설정
      data.images = [];
      console.log("[API] No images field, setting to empty array");
    }

    console.log("[API] Final data to update:", JSON.stringify(data, null, 2));
    await client.recordItem.update({ where: { id }, data });
    console.log("[API] Update successful for item:", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recordItem:PATCH]", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
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

    const id = Number(params?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { ok: false, error: "invalid id" },
        { status: 400 },
      );
    }

    const userId = Number(payload.sub);
    if (!(await ensureItemOwnedBy(userId, id))) {
      return NextResponse.json(
        { ok: false, error: "record item not found" },
        { status: 404 },
      );
    }

    await client.recordItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recordItem:DELETE]", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 },
    );
  }
}
