// app/api/me/reel/[id]/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization") || "";
  const token = (await auth.startsWith("Bearer ")) ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  try {
    // 예: Prisma client = client
    const reel = await client.reel.findUnique({
      where: { identifier: id },
      include: {
        childhood: true, // Reels에 직접 붙은 WheelTexture[]
        memorys: {
          include: {
            wheelTextures: true, // ✅ Memory별 첨부 미디어까지
          },
          orderBy: { id: "asc" }, // 선택
        },
        relationships: {
          include: {
            wheelTextures: true, // ✅ Relationship별 첨부 미디어까지
          },
          orderBy: { id: "asc" }, // 선택
        },
        lifestory: true,
      },
    });

    console.group(`api/reels/${id}`)
    console.log(reel)
    console.groupEnd()
    if (!reel) {
      // 404 처리
    }

    const { childhood, memorys, relationships, lifestory } = reel;
    // memory[i].WheelTexture, relationship[i].WheelTexture 로 접근 가능

    const item = { reel, childhood, memorys, relationships, lifestory };
    console.group("get reel detail");
    console.log("item: ", item);
    console.groupEnd();
    if (!item) throw new Error(`No reel found id: ${identifier}`);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization") || "";
  const token = (await auth.startsWith("Bearer ")) ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const { identifier, name } = await req.json();
  // const identifier = await data.identifier;
  // const name = await data.name;
  console.group("----api/reel/[id]/route.js----");
  console.log("identifier: ", identifier);
  console.log("name: ", name);
  console.groupEnd();
  const idf = String(identifier || "").trim();
  const n = String(name || "").trim();
  if (!/^[a-z0-9_-]{3,32}$/i.test(idf))
    return NextResponse.json(
      { ok: false, error: "invalid_identifier" },
      { status: 400 },
    );
  if (!name)
    return NextResponse.json(
      { ok: false, error: "invalid_name" },
      { status: 400 },
    );
  // 소유권 확인
  const target = await client.reel.findUnique({
    where: { id: Number(id) },
    select: { userId: true },
  });
  if (!target || target.userId !== Number(payload.sub)) {
    return NextResponse.json(
      { ok: false, error: "not_found_or_forbidden" },
      { status: 404 },
    );
  }

  try {
    const item = await client.reel.update({
      where: { id: Number(id) },
      data: { identifier: idf, name: n },
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
