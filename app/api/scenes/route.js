import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/api/_lib/jwt";

/**
 * GET /api/scenes
 * 내 Scene 목록 조회
 */
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { ok: false, error: "No authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyJwt(token);

    if (!payload?.sub) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const scenes = await client.scene.findMany({
      where: { userId: Number(payload.sub) },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        identifier: true,
        profileName: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, items: scenes });
  } catch (error) {
    console.error("[GET /api/scenes]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenes
 * 새 Scene 생성
 * body: { identifier, name }
 */
export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { ok: false, error: "No authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyJwt(token);

    if (!payload?.sub) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { identifier, name } = body;

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "identifier is required" },
        { status: 400 }
      );
    }

    // identifier 중복 체크
    const existing = await client.scene.findUnique({
      where: { identifier },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "identifier already exists" },
        { status: 409 }
      );
    }

    // Scene 생성
    const scene = await client.scene.create({
      data: {
        identifier,
        profileName: name || null,
        userId: Number(payload.sub),
      },
    });

    return NextResponse.json({ ok: true, item: scene });
  } catch (error) {
    console.error("[POST /api/scenes]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
