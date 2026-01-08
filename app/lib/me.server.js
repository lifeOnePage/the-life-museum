import { cookies } from "next/headers";
import { verifyJwt } from "./auth";
import client from "../client";

export async function getMeServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_token")?.value || null;

  const payload = token ? verifyJwt(token) : null;
  if (!payload?.sub) throw new Error("unauthorized");

  const id = Number(payload.sub);
  if (!Number.isFinite(id)) throw new Error("unauthorized");

  const user = await client.user.findUnique({ where: { id } });
  if (!user) throw new Error("not_found");

  return user;
}
