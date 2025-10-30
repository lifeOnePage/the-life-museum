// utils/authedFetch.js
export async function authedFetch(url, { token, ...opts } = {}) {
  const headers = new Headers(opts.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...opts, headers });
}
