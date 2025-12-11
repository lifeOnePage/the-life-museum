import { NextResponse } from "next/server";
import prisma from "@/app/generated/prisma";

/**
 * PATCH /api/scenes/[id]/lifestory
 * 생애문 진행 상황 저장
 * body: { progressData }
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;;
    const body = await req.json();
    const { progressData } = body;

    const scene = await prisma.scene.update({
      where: { identifier: id },
      data: {
        lifestoryProgress: progressData,
      },
    });

    return NextResponse.json({ ok: true, scene });
  } catch (error) {
    console.error("[PATCH /api/scenes/[id]/lifestory]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
