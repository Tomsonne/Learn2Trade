// =========================
// 🔧 Détection environnement
// =========================

// Valeur injectée par Docker/Vite
let API_BASE = import.meta.env.VITE_API_BASE;

// Si on est dans un navigateur (window défini)
if (typeof window !== "undefined") {
  const host = window.location.hostname;

  // 🌍 Si on accède à l’app via localhost (navigateur dev)
  if (/^(localhost|127\.|::1)$/.test(host)) {
    API_BASE = "http://localhost:8000/api/v1";
  }

  // 🧭 Si on accède depuis un réseau local (192.168.* par ex.)
  else if (/^192\.168\./.test(host)) {
    API_BASE = `http://${host}:8000/api/v1`;
  }
}

// 🔁 Fallback Docker (utile seulement quand code exécuté DANS le conteneur)
if (!API_BASE) {
  API_BASE = "http://learn2trade_backend:8000/api/v1";
}

console.log("🔌 API_BASE utilisé :", API_BASE);

// =========================
// 🧠 Fonctions API
// =========================

/**
 * Authentification - Connexion
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/**
 * Authentification - Inscription
 */
export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/**
 * Données marché (OHLC)
 */
export async function getMarketData(symbol = "BTC", vs = "usd", days = 1) {
  const res = await fetch(
    `${API_BASE}/market/ohlc?symbol=${symbol}&vs=${vs}&days=${days}`
  );

  return res.json();
}
