// =========================
// 🌍 Configuration API_BASE
// =========================

let API_BASE;

// 1️⃣ Si une variable d'environnement Vite existe (définie dans .env)
if (import.meta.env && import.meta.env.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
}

// 2️⃣ Sinon, détection automatique selon l'environnement
if (!API_BASE) {
  const host = window.location.hostname;

  if (/^(localhost|127\.|::1)$/.test(host)) {
    // 🔹 En local → backend local (Railway tourne en dev sur port 8000)
    API_BASE = "http://localhost:8000/api/v1";
  } else {
    // 🔹 En production → backend Railway (plus Render)
    API_BASE = "https://skillvest-production.up.railway.app/api/v1";
  }
}

// 🔍 Log pour debug
console.log("🔌 API_BASE utilisé :", API_BASE);

// =========================
// 🧠 Fonctions API
// =========================

// Authentification utilisateur
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 indispensable pour cookies JWT
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur login: ${err}`);
  }

  return res.json();
}

// Inscription utilisateur
export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur signup: ${err}`);
  }

  return res.json();
}

// Vérification du token / session
export async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("❌ checkAuth error:", err);
    return { status: "error" };
  }
}

// Déconnexion
export async function logout() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("❌ logout error:", err);
    return { status: "error" };
  }
}
