// =========================
//  Configuration API_BASE
// =========================

let API_BASE;

// Si une variable d'environnement Vite existe (.env ou Vercel)
if (import.meta.env?.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
}

// Sinon, détection automatique selon l'environnement
if (!API_BASE) {
  const host = window.location.hostname;

  if (/^(localhost|127\.|::1)$/.test(host)) {
    //  En local → backend Railway local
    API_BASE = "http://localhost:8000/api/v1";
  } else {
    //  En production → backend hébergé sur Railway
    API_BASE = "https://skillvest-production.up.railway.app/api/v1";
  }
}

//  Log utile pour debug (supprimable en prod)
console.log("API_BASE utilisé :", API_BASE);

// =========================
//  Fonctions API
// =========================

// --- Connexion utilisateur ---
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // cookies JWT
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur login: ${err}`);
  }

  return res.json();
}

// --- Inscription utilisateur ---
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

// --- Vérifie la session / token actif ---
export async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("checkAuth error:", err);
    return { status: "error" };
  }
}

// --- Déconnexion utilisateur ---
export async function logout() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("logout error:", err);
    return { status: "error" };
  }
}
