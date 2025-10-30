// app/api/auth/verify-birth/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/api/_lib/jwt";
import client from "@/app/client";

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { birthDate } = await req.json();
  if (!birthDate) return NextResponse.json({ ok: false, error: "birthDate required" }, { status: 400 });

  const me = await client.user.findUnique({ where: { id: payload.sub } });
  if (!me) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const ok = (me.birthDate || "") === birthDate;
  return NextResponse.json({ ok, user: me });
}
