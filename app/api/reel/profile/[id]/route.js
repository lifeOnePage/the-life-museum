import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/jwt";

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

  const data = await req.json();
  // const identifier = await data.identifier;
  // const name = await data.name;
  console.group("----api/reel/profile/[id]/route.js----");
  console.log("data: ", data);
  console.groupEnd();

  if (!data.name)
    return NextResponse.json(
      { ok: false, error: "invalid_name" },
      { status: 400 },
    );
  if (!data.birthDate)
    return NextResponse.json(
      { ok: false, error: "invalid_birthDate" },
      { status: 400 },
    );
  if (!data.birthPlace)
    return NextResponse.json(
      { ok: false, error: "invalid_birthPlace" },
      { status: 400 },
    );
  if (!data.motto)
    return NextResponse.json(
      { ok: false, error: "invalid_motto" },
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
      data,
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
