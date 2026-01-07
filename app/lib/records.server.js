import client from "@/app/client"; // prisma
import { verifyJwt } from "@/app/lib/jwt";

export async function getRecordDetailsServer({ token, identifier }) {
  const payload = verifyJwt(token); // { sub: userId, ... }

  if (!payload?.sub) {
    throw new Error("unauthorized");
  }

  const record = await client.record.findFirst({
    where: {
      identifier,
      userId: payload.sub,
    },
    include: {
      // 필요한 관계들
    },
  });

  if (!record) {
    throw new Error("record not found");
  }

  return {
    ok: true,
    item: {
      record,
    },
  };
}
