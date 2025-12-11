import { NextResponse } from "next/server";
import prisma from "@/app/generated/prisma";

/**
 * PATCH /api/scenes/[id]/profile
 * 프로필 정보만 업데이트
 * body: { photo, name, birthDate, birthPlace, biography }
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;;
    const body = await req.json();

    const scene = await prisma.scene.update({
      where: { identifier: id },
      data: {
        profilePhoto: body.photo !== undefined ? body.photo : undefined,
        profileName: body.name !== undefined ? body.name : undefined,
        profileBirthDate: body.birthDate !== undefined ? body.birthDate : undefined,
        profileBirthPlace: body.birthPlace !== undefined ? body.birthPlace : undefined,
        profileBiography: body.biography !== undefined ? body.biography : undefined,
      },
    });

    return NextResponse.json({ ok: true, scene });
  } catch (error) {
    console.error("[PATCH /api/scenes/[id]/profile]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
