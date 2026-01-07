// app/api/auth/verify-birth/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/api/_lib/jwt";
import client from "@/app/client";
import { requireAuthPayload } from "@/app/lib/auth.server";

export async function POST(req) {
  const payload = await requireAuthPayload();
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const { birthDate } = await req.json();
  if (!birthDate)
    return NextResponse.json(
      { ok: false, error: "birthDate required" },
      { status: 400 },
    );
  console.log(birthDate);

  const me = await client.user.findUnique({ where: { id: payload.sub } });
  console.log(me.birthDate);

  if (!me)
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  console.log(me.birthDate);

  const ok = (me.birthDate || "") === birthDate;
  return NextResponse.json({ ok, user: me });
}
