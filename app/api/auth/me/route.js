// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { getMeServer } from "@/app/lib/auth/me.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getMeServer();
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    if (e.message === "unauthorized")
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    if (e.message === "not_found")
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
