// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";


export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  const payload = token ? verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const user = await client.user.findUnique({ where: { id: payload.sub } });
  if (!user) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, user });
}
