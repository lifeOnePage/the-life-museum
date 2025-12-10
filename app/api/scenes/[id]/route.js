import { NextResponse } from "next/server";
import client from "@/app/client";

/**
 * GET /api/scenes/[id]
 * Scene 데이터 조회 (identifier 기준)
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const scene = await client.scene.findUnique({
      where: { identifier: id },
      include: {
        items: {
          include: {
            images: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!scene) {
      return NextResponse.json(
        { ok: false, error: "Scene not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, scene });
  } catch (error) {
    console.error("[GET /api/scenes/[id]]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scenes/[id]
 * Scene 전체 업데이트
 * body: { profile, items, lifestoryProgress }
 */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;;
    const body = await req.json();
    const { profile, items, lifestoryProgress } = body;

    // Scene 존재 확인
    const existingScene = await client.scene.findUnique({
      where: { identifier: id },
    });

    if (!existingScene) {
      return NextResponse.json(
        { ok: false, error: "Scene not found" },
        { status: 404 }
      );
    }

    // Transaction으로 전체 업데이트
    const updatedScene = await client.$transaction(async (tx) => {
      // 1. Scene 기본 정보 업데이트
      const scene = await tx.scene.update({
        where: { identifier: id },
        data: {
          profilePhoto: profile?.photo || null,
          profileName: profile?.name || null,
          profileBirthDate: profile?.birthDate || null,
          profileBirthPlace: profile?.birthPlace || null,
          profileBiography: profile?.biography || null,
          lifestoryProgress: lifestoryProgress || null,
        },
      });

      // 2. 기존 items 삭제 (CASCADE로 images도 삭제됨)
      await tx.sceneItem.deleteMany({
        where: { sceneId: scene.id },
      });

      // 3. 새 items 생성
      if (items && items.length > 0) {
        console.log("[PUT /api/scenes/[id]] Saving items:", JSON.stringify(items, null, 2));
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // 프로필 아이템은 건너뛰기
          if (item.isProfile) continue;

          const createdItem = await tx.sceneItem.create({
            data: {
              sceneId: scene.id,
              title: item.title || null,
              date: item.date || null,
              desc: item.desc || null,
              order: i,
            },
          });

          console.log(`[PUT /api/scenes/[id]] Created item ${createdItem.id}, images:`, item.img);

          // 이미지 추가
          if (item.img && Array.isArray(item.img) && item.img.length > 0) {
            console.log(`[PUT /api/scenes/[id]] Processing ${item.img.length} images for item ${createdItem.id}`);
            for (let j = 0; j < item.img.length; j++) {
              const imgUrl = typeof item.img[j] === "string"
                ? item.img[j]
                : item.img[j]?.url;

              console.log(`[PUT /api/scenes/[id]] Image ${j}: ${imgUrl}`);

              if (imgUrl) {
                const createdImage = await tx.sceneImage.create({
                  data: {
                    itemId: createdItem.id,
                    url: imgUrl,
                    order: j,
                  },
                });
                console.log(`[PUT /api/scenes/[id]] Created image ${createdImage.id}`);
              }
            }
          } else {
            console.log(`[PUT /api/scenes/[id]] No images for item ${createdItem.id}`);
          }
        }
      }

      return scene;
    });

    // 업데이트된 전체 데이터 반환
    const result = await client.scene.findUnique({
      where: { id: updatedScene.id },
      include: {
        items: {
          include: {
            images: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ ok: true, scene: result });
  } catch (error) {
    console.error("[PUT /api/scenes/[id]]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenes/[id]
 * Scene 삭제
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;;

    await client.scene.delete({
      where: { identifier: id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/scenes/[id]]", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
