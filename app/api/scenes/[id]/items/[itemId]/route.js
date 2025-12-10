import { NextResponse } from "next/server";
import prisma from "@/app/generated/prisma";

/**
 * PATCH /api/scenes/[id]/items/[itemId]
 * 아이템 업데이트
 * body: { title, date, images }
 */
export async function PATCH(req, { params }) {
  try {
    const { itemId } = await params;;
    const body = await req.json();
    const { title, date, images } = body;

    // 아이템 업데이트
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;

    await prisma.sceneItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
    });

    // 이미지 업데이트 (있는 경우)
    if (images !== undefined && Array.isArray(images)) {
      // 기존 이미지 삭제
      await prisma.sceneImage.deleteMany({
        where: { itemId: parseInt(itemId) },
      });

      // 새 이미지 생성
      if (images.length > 0) {
        await prisma.sceneImage.createMany({
          data: images.map((url, index) => ({
            itemId: parseInt(itemId),
            url: typeof url === "string" ? url : url.url,
            order: index,
          })),
        });
      }
    }

    // 업데이트된 아이템 반환
    const item = await prisma.sceneItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("[PATCH /api/scenes/[id]/items/[itemId]]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenes/[id]/items/[itemId]
 * 아이템 삭제
 */
export async function DELETE(req, { params }) {
  try {
    const { itemId } = await params;;

    await prisma.sceneItem.delete({
      where: { id: parseInt(itemId) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/scenes/[id]/items/[itemId]]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
