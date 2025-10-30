import { NextResponse } from "next/server";
import client from "@/app/client";

// 프리뷰: 필요한 최소 필드만 반환
export async function GET(_req, { params }) {
  const { identifier } = await params;
  console.log(identifier)
  try {
    const data = await client.reels.findUnique({
      where: { identifier },
      select: {
        identifier: true,
        name: true,
        birthDate: true,
        birthPlace: true,
        motto: true,
        profileImg: true,
        lifestory: { select: { result: true } },
        childhood: { select: { srcUrl: true } },
        memory: {
          select: {
            id: true,
            title: true,
            comment: true,
            WheelTexture: { select: { srcUrl: true } },
          },
        },
        relationship: {
          select: {
            id: true,
            name: true,
            relation: true,
            // 대표 이미지는 클라이언트에서 첫 번째로 처리 (DB에 필드 있으면 select에 추가)
            WheelTexture: { select: { srcUrl: true } },
          },
        },
      },
    });
    console.log(data)

    if (!data) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }

    // 클라이언트가 만들 링 프레임을 쉽게 구성할 수 있도록 정규화
    const payload = {
      profile: {
        name: data.name,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        motto: data.motto || "",
        profileImg: data.profileImg || "",
        story: data.lifestory?.result || "",
      },
      gallery: {
        childhood: (data.childhood || []).map((w) => w.srcUrl),
        experience: (data.memory || []).map((m) => ({
          id: m.id,
          title: m.title || "",
          description: m.comment || "",
          photos: (m.WheelTexture || []).map((w) => w.srcUrl),
        })),
        relationship: (data.relationship || []).map((r) => ({
          id: r.id,
          name: r.name || "",
          relation: r.relation || "",
          photos: (r.WheelTexture || []).map((w) => w.srcUrl),
        })),
      },
    };

    return NextResponse.json({ ok: true, item: payload });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
