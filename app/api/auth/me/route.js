// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_token")?.value || null;

  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const user = await client.user.findUnique({
    where: { id: payload.sub },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, user });
}
