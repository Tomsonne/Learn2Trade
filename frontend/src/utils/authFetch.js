// src/utils/authFetch.js
export async function authFetch(url, { token, ...opts } = {}) {
  const headers = {
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": opts.body ? "application/json" : (opts.headers?.["Content-Type"] || undefined),
  };

  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  return res;
}
