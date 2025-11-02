import { NextResponse } from "next/server";
import client from "@/app/client";

// 확장: 확실치 않을 때도 안전하게 select (caption/srcType이 없으면 제거하거나 나중에 추가)
export async function GET(_req, { params }) {
  const { identifier } = await params;

  try {
    const data = await client.reel.findUnique({
      where: { identifier },
      select: {
        identifier: true,
        name: true,
        birthDate: true,
        birthPlace: true,
        motto: true,
        profileImg: true,
        lifestory: { select: { result: true } },

        // 유년시절: 이미지 배열
        childhood: {
          select: {
            srcUrl: true,
            caption: true,   // optional
            srcType: true,   // optional (0=image,1=video)
          },
        },

        // 소중한 기억: 개별 카드 + 사진들
        memorys: {
          select: {
            id: true,
            title: true,
            comment: true, // description
            wheelTextures: {
              select: {
                srcUrl: true,
                caption: true, // optional
                srcType: true, // optional
              },
            },
          },
        },

        // 소중한 인연
        relationships: {
          select: {
            id: true,
            name: true,
            relation: true,
            wheelTextures: {
              select: {
                srcUrl: true,
                caption: true, // optional
                srcType: true, // optional
              },
            },
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }

    // kind 추론 (srcType 우선, 없으면 확장자로 추정)
    const inferKind = (url, type) => {
      if (typeof type === "number") return type === 1 ? "video" : "image";
      return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(String(url)) ? "video" : "image";
    };

    const normMedia = (arr = []) =>
      (arr || [])
        .map((m) => {
          const url = m?.srcUrl || "";
          if (!url) return null;
          return {
            url,
            kind: inferKind(url, m?.srcType),
            caption: m?.caption || "",
          };
        })
        .filter(Boolean);

    const payload = {
      profile: {
        name: data.name,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        motto: data.motto || "",
        profileImg: data.profileImg || "",
        story: data.lifestory?.result || "", // 생애문 텍스트
      },

      gallery: {
        // 단순 배열(각 item: {url, kind, caption})
        childhood: normMedia(data.childhood),

        // 경험(=소중한 기억): 각 항목에 title/description + photos[]
        experience: (data.memorys || []).map((m) => ({
          id: m.id,
          title: m.title || "",
          description: m.comment || "",
          photos: normMedia(m.wheelTextures),
        })),

        // 인연(=소중한 인연): 각 항목에 name/relation + photos[]
        relationship: (data.relationships || []).map((r) => ({
          id: r.id,
          name: r.name || "",
          relation: r.relation || "",
          photos: normMedia(r.wheelTextures),
        })),
      },
    };

    return NextResponse.json({ ok: true, item: payload });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
