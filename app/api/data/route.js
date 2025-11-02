// app/api/me/reel/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export const runtime = "nodejs";

export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const items = await client.user.findUnique({
    where: { id: Number(payload.sub) },
    include: {
      reels: {
        select: {
          id: true,
          identifier: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          profileImg: true,
        },
      },
      records: {
        select: {
          id: true,
          identifier: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          coverUrl: true,
        },
      },
    },
  });
  return NextResponse.json({
    ok: true,
    items: { reels: items.reels, records: items.records },
  });
}
