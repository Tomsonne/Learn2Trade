// src/api.js

// =========================
// 🔧 Détection environnement (robuste Node + Vite)
// =========================
let API_BASE;

// 1) Vite (au build/serve)
if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
}

// 2) Node (scripts/tests) : variable d'env
if (!API_BASE && typeof process !== "undefined" && process.env && process.env.VITE_API_BASE) {
  API_BASE = process.env.VITE_API_BASE;
}

// 3) Navigateur : déduire selon le host
if (!API_BASE && typeof window !== "undefined") {
  const host = window.location.hostname;
  if (/^(localhost|127\.|::1)$/.test(host)) {
    API_BASE = "http://localhost:8000/api/v1";
  } else if (/^192\.168\./.test(host)) {
    API_BASE = `http://${host}:8000/api/v1`;
  }
}

// 4) Fallback conteneur (Docker)
if (!API_BASE) {
  API_BASE = "http://learn2trade_backend:8000/api/v1";
}

console.log("🔌 API_BASE utilisé :", API_BASE);

// =========================
// 🧠 Fonctions API
// =========================
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// (Optionnel) exporter pour tests Node
export { API_BASE };
