import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/api/_lib/jwt";

/**
 * PATCH /api/scenes/[id]/identifier
 * Scene identifier와 이름 업데이트
 * body: { identifier, name }
 */
export async function PATCH(req, { params }) {
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

    const { id } = await params;;
    const body = await req.json();
    const { identifier, name } = body;

    // 기존 Scene 조회 (권한 확인)
    const existingScene = await client.scene.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingScene) {
      return NextResponse.json(
        { ok: false, error: "Scene not found" },
        { status: 404 }
      );
    }

    if (existingScene.userId !== Number(payload.sub)) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // identifier 중복 체크 (자신 제외)
    if (identifier && identifier !== existingScene.identifier) {
      const duplicate = await client.scene.findUnique({
        where: { identifier },
      });

      if (duplicate) {
        return NextResponse.json(
          { ok: false, error: "identifier already exists" },
          { status: 409 }
        );
      }
    }

    // 업데이트
    const updateData = {};
    if (identifier !== undefined) updateData.identifier = identifier;
    if (name !== undefined) updateData.profileName = name;

    const scene = await client.scene.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ ok: true, item: scene });
  } catch (error) {
    console.error("[PATCH /api/scenes/[id]/identifier]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
