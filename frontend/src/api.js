// src/api.js

let API_BASE;

if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
}

if (!API_BASE && typeof process !== "undefined" && process.env && process.env.VITE_API_BASE) {
  API_BASE = process.env.VITE_API_BASE;
}

if (!API_BASE && typeof window !== "undefined") {
  const host = window.location.hostname;
  if (/^(localhost|127\.|::1)$/.test(host)) {
    API_BASE = "http://localhost:8000/api/v1";
  } else if (/^192\.168\./.test(host)) {
    API_BASE = `http://${host}:8000/api/v1`;
  }
}

if (!API_BASE) {
  API_BASE = "http://learn2trade_backend:8000/api/v1";
}

console.log("🔌 API_BASE utilisé :", API_BASE);

// =========================
// 🧠 Fonctions API
// =========================

// ✅ ajout credentials pour cookie
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 indispensable pour que le cookie soit envoyé/reçu
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ✅ ajout pour déconnexion
// api.js
export async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("checkAuth error", err);
    return { status: "error" };
  }
}

export async function logout() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("logout error", err);
  }
}
