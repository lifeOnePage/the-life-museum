import { NextResponse } from "next/server";
import prisma from "@/app/generated/prisma";

/**
 * POST /api/scenes/[id]/items
 * 새 아이템 추가
 * body: { title, date, images: [url] }
 */
export async function POST(req, { params }) {
  try {
    const { id } = await params;;
    const body = await req.json();
    const { title, date, images } = body;

    // Scene 조회
    const scene = await prisma.scene.findUnique({
      where: { identifier: id },
      include: {
        items: true,
      },
    });

    if (!scene) {
      return NextResponse.json(
        { ok: false, error: "Scene not found" },
        { status: 404 }
      );
    }

    // 새로운 order 값 (마지막 + 1)
    const maxOrder = scene.items.length > 0
      ? Math.max(...scene.items.map(item => item.order))
      : -1;

    // 아이템 생성
    const item = await prisma.sceneItem.create({
      data: {
        sceneId: scene.id,
        title: title || null,
        date: date || null,
        order: maxOrder + 1,
        images: {
          create: images && Array.isArray(images)
            ? images.map((url, index) => ({
                url,
                order: index,
              }))
            : [],
        },
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("[POST /api/scenes/[id]/items]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
