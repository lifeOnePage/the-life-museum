// utils/authedFetch.js

const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

/** Decode JWT payload without a library */
function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token, marginSec = 60) {
  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp - marginSec;
}

// Mutex: only one refresh at a time
let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = localStorage.getItem("app_refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const json = await res.json();
  // Backend returns { ok, data: { access_token, refresh_token, token_type } }
  const data = json.data ?? json;
  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;

  localStorage.setItem("app_token", newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem("app_refresh_token", newRefreshToken);
  }

  return newAccessToken;
}

async function ensureValidToken() {
  const token = localStorage.getItem("app_token");
  if (!token) return null;

  if (!isTokenExpiringSoon(token)) return token;

  // Token expired or expiring soon — refresh
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch {
    forceLogout();
    return null;
  }
}

function forceLogout() {
  localStorage.removeItem("app_token");
  localStorage.removeItem("app_refresh_token");
  localStorage.removeItem("app_user");
  window.dispatchEvent(new Event("auth:logout"));
}

/**
 * Authenticated fetch wrapper.
 * - Automatically injects Bearer token from localStorage
 * - Proactively refreshes token if expiring soon
 * - Retries once on 401 (reactive refresh)
 */
export async function authedFetch(url, opts = {}) {
  const token = await ensureValidToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    // Try one more refresh (token might have expired between check and request)
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(url, { ...opts, headers });
    } catch {
      forceLogout();
      return res;
    }
  }

  return res;
}
