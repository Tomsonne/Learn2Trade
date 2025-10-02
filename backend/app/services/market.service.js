// app/services/market.service.js
import 'dotenv/config';

/* ==============================
 *  CONFIGURATION & CONSTANTES
 * ============================== */

// Endpoints publics des APIs utilisées
const CG_BASE = 'https://api.coingecko.com/api/v3';
const FX_BASE = 'https://api.frankfurter.app';

// Clé CoinGecko (demo) injectée par .env / Docker
const CG_KEY  = process.env.COINGECKO_API_KEY;

// Détermine le plan (demo) pour le  en-tête
const CG_HEADER_NAME = 'x-cg-demo-api-key';

// Mapping symboles → IDs CoinGecko (évite les fautes de frappe dans les URLs)
const COIN_IDS = { BTC: 'bitcoin', ETH: 'ethereum' };

/* ==============================
 *  HELPERS GÉNÉRIQUES
 * ============================== */

/**
 * Helper HTTP minimal pour récupérer du JSON.
 * - `url` : endpoint complet
 * - `headers` : en-têtes (ex: clés API)
 * Lève une erreur explicite si le statut HTTP n’est pas 2xx, avec un extrait de la réponse utile au debug.
 */
async function httpJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${url} ${txt ? `- ${txt.slice(0,120)}` : ''}`);
  }
  return res.json();
}

/* ==============================
 *  MINI-CACHE MÉMOIRE
 *  - Évite de surcharger CoinGecko (rate-limit plan demo gratuit)
 *  - Très simple : Map en mémoire (clé -> {ts, ttl, data})
 * ============================== */

const _cache = new Map();

/** Stocke une valeur avec TTL (en ms) */
const setCache = (key, data, ttlMs = 30_000) => _cache.set(key, { ts: Date.now(), ttl: ttlMs, data });

/** Récupère une valeur si encore fraîche, sinon null */
const getCache = (key) => {
  const v = _cache.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > v.ttl) {
    _cache.delete(key);
    return null;
  }
  return v.data;
};

/* ==============================
 *  FONCTIONS MÉTIER (EXPORTÉES)
 * ============================== */

/**
 * Retourne le prix spot BTC & ETH en USD et EUR (source : CoinGecko).
 * - Endpoint utilisé : /simple/price
 * - Pas de retry/backoff ici (simple), mais le mini-cache peut être ajouté si besoin.
 * @returns {Promise<{timestamp:string, prices:{BTC:{usd:number|null, eur:number|null}, ETH:{usd:number|null, eur:number|null}}, source:string}>}
 */
export async function getPrices () {
  // Sécurité : on force la présence d’une clé (plan demo)
  if (!CG_KEY) throw new Error('COINGECKO_API_KEY manquante dans .env');

  // Construction de l’URL avec les 2 ids et 2 devises
  const url = `${CG_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur`;
  const headers = { [CG_HEADER_NAME]: CG_KEY }; // ajoute x-cg-demo-api-key

  // Appel HTTP → JSON attendu: { bitcoin:{usd,eur}, ethereum:{usd,eur} }
  const data = await httpJson(url, headers);

  // Normalise la réponse pour le frontend
  return {
    timestamp: new Date().toISOString(),
    prices: {
      BTC: { usd: data.bitcoin?.usd ?? null,  eur: data.bitcoin?.eur ?? null },
      ETH: { usd: data.ethereum?.usd ?? null, eur: data.ethereum?.eur ?? null },
    },
    source: 'coingecko',
  };
}

/**
 * Retourne le taux USD→EUR (source : Frankfurter – pas de clé).
 * - Endpoint utilisé : /latest?from=USD&to=EUR
 * @returns {Promise<{timestamp:string, base:string, rates:{EUR:number|null}, source:string}>}
 */
export async function getForex() {
  const url = `${FX_BASE}/latest?from=USD&to=EUR`;

  // Appel HTTP → JSON attendu: { base:'USD', date:'YYYY-MM-DD', rates:{EUR:x.xx} }
  const data = await httpJson(url);

  // Normalise la réponse
  return {
    timestamp: new Date().toISOString(),
    base: data.base || 'USD',
    rates: { EUR: data.rates?.EUR ?? data.rates?.eur ?? null },
    source: 'frankfurter.app',
  };
}

/**
 * Récupère des chandeliers OHLC pour un actif donné (BTC/ETH) sur X jours.
 * - Endpoint utilisé : /coins/{id}/ohlc
 * - CoinGecko renvoie un tableau de tuples : [[timestamp_ms, open, high, low, close], ...]
 * - On mappe en objets { t, o, h, l, c } faciles à consommer côté front (bougies/candles).
 *
 * @param {string} symbol  - 'BTC' | 'ETH' (d’autres peuvent être ajoutés dans COIN_IDS)
 * @param {{vs?:string, days?:number}} [opts]
 *   - vs   : devise de contre-valeur (ex: 'usd')
 *   - days : fenêtre (1, 7, 14, 30, 90, 180, 365) – valeurs supportées par CoinGecko
 * @returns {Promise<Array<{t:number,o:number,h:number,l:number,c:number}>>}
 */
export async function getChartOHLC(symbol = 'BTC', { vs = 'usd', days = 30 } = {}) {
  if (!CG_KEY) throw new Error('COINGECKO_API_KEY manquante dans .env');

  // Valide et mappe le symbole en id CoinGecko
  const id = COIN_IDS[String(symbol).toUpperCase()];
  if (!id) throw new Error('SYMBOL_UNSUPPORTED');

  // Cache clé : dépend de l’actif, de la devise et de la fenêtre (days)
  const key = `ohlc:${id}:${vs}:${days}`;
  const cached = getCache(key);
  if (cached) return cached;

  // Ex: /coins/bitcoin/ohlc?vs_currency=usd&days=30
  const url = `${CG_BASE}/coins/${id}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${days}`;
  const headers = { [CG_HEADER_NAME]: CG_KEY };

  // Réponse brute → mapping en objets {t,o,h,l,c}
  const raw = await httpJson(url, headers);
  const ohlc = (raw || []).map(([t, o, h, l, c]) => ({ t, o, h, l, c }));

  // Met en cache 30s (ajuster timing selon besoin UX & rate-limit)
  setCache(key, ohlc, 30_000);
  return ohlc;
}

/**
 * Récupère prix/capitalisation/volume sur un intervalle précis (timestamps Unix SECONDES).
 * - Endpoint utilisé : /coins/{id}/market_chart/range
 * - Très utile pour zoomer sur une période custom (from/to) côté frontend.
 *
 * @param {string} symbol - 'BTC' | 'ETH'
 * @param {{vs?:string, from:number, to:number}} opts
 *   - vs   : devise de contre-valeur (ex: 'usd')
 *   - from : timestamp Unix en SECONDES (début)
 *   - to   : timestamp Unix en SECONDES (fin)
 * @returns {Promise<{prices:Array<[number,number]>, market_caps:Array<[number,number]>, total_volumes:Array<[number,number]>}>}
 *   - CoinGecko renvoie des timestamps en millisecondes dans les tableaux.
 */
export async function getMarketChartRange(symbol = 'BTC', { vs = 'usd', from, to } = {}) {
  if (!CG_KEY) throw new Error('COINGECKO_API_KEY manquante dans .env');

  // Valide et mappe le symbole
  const id = COIN_IDS[String(symbol).toUpperCase()];
  if (!id) throw new Error('SYMBOL_UNSUPPORTED');

  // Validation de l’intervalle (from/to en secondes Unix)
  if (typeof from !== 'number' || typeof to !== 'number' || from >= to) {
    throw new Error('INVALID_RANGE');
  }

  // Cache clé : dépend de l’actif, devise et borne from/to
  const key = `range:${id}:${vs}:${from}:${to}`;
  const cached = getCache(key);
  if (cached) return cached;

  // Ex: /coins/bitcoin/market_chart/range?vs_currency=usd&from=...&to=...
  const url = `${CG_BASE}/coins/${id}/market_chart/range?vs_currency=${encodeURIComponent(vs)}&from=${from}&to=${to}`;
  const headers = { [CG_HEADER_NAME]: CG_KEY };

  // Réponse brute : { prices:[[ms,price],...], market_caps:[[ms,cap],...], total_volumes:[[ms,vol],...] }
  const data = await httpJson(url, headers);

  // Cache 30s
  setCache(key, data, 30_000);
  return data;
}
