// src/api.js

let API_BASE;

// 1️⃣ Si une variable d'environnement Vite existe
if (import.meta.env && import.meta.env.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
}

// 2️⃣ Sinon, détection automatique selon l'environnement
if (!API_BASE) {
  const host = window.location.hostname;

  if (/^(localhost|127\.|::1)$/.test(host)) {
    // En local → backend local
    API_BASE = "http://localhost:8000/api/v1";
  } else {
    // En production → backend Render
    API_BASE = "https://learn2trade.onrender.com/api/v1";
  }
}

console.log("🔌 API_BASE utilisé :", API_BASE);

// =========================
// 🧠 Fonctions API
// =========================

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 indispensable pour cookies JWT
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
