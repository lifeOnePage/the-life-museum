import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";

// 인증된 페이로드 반환, 없으면 null
export async function requireAuthPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_token")?.value || null;

  const payload = token ? verifyJwt(token) : null;
  if (!payload) return null;

  return payload;
}
