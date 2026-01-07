import { authedFetch } from "@/app/utils/authedFetch";

/**
 * Fetches current user info from /api/auth/me.
 * /api/auth/me에서 현재 유저 정보를 조회합니다.
 * @param {Object} params
 * @param {string} params.token
 * @returns {Promise<any>}
 */
export async function fetchMe({ token }) {
  const res = await authedFetch("/api/auth/me", {
    token,
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "fetch me failed");
  }
  return json.user;
}
