import client from "@/app/client"; // prisma
import { verifyJwt } from "@/app/lib/jwt";
import { cookies } from "next/headers";

// 레코드 상세 조회
export async function getRecordDetailsServer({ identifier }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_token")?.value;
  if (!token) {
    throw new Error("unauthorized");
  }
  const payload = verifyJwt(token);

  if (!payload?.sub) {
    throw new Error("unauthorized");
  }
  const viewerId = Number(payload?.sub);
  if (!Number.isFinite(viewerId)) throw new Error("unauthorized");

  const records = await client.record.findFirst({
    where: {
      identifier,
      userId: Number(payload.sub),
    },
    select: {
      id: true,
      identifier: true,
      coverUrl: true,
      name: true,
      subName: true,
      description: true,
      pageTitle: true,
      pageSubtitle: true,
      bgm: true,
      color: true,
      birthDate: true,
      displayMode: true,
      userName: true,
      createdAt: true,
      updatedAt: true,
      recordItems: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          description: true,
          color: true,
          isHighlight: true,
          coverUrl: true,
          images: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return { ok: true, item: records };
}
