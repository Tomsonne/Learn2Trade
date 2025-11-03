// app/services/market.service.js
import 'dotenv/config';

/* ==============================
 *  CONFIG
 * ============================== */

const BINANCE_BASE = process.env.BINANCE_BASE || 'https://api.binance.com';
const FX_BASE      = process.env.FOREX_BASE   || 'https://api.frankfurter.app';
const TIMEOUT_MS   = Number(process.env.BINANCE_TIMEOUT_MS || process.env.HTTP_TIMEOUT_MS || 10_000);
const CACHE_TTL_MS = Number(process.env.BINANCE_CACHE_TTL_MS || 30_000);

// Paires par défaut (modifiable via .env)
const PAIRS = {
  BTC: process.env.BTC_PAIR || 'BTCUSDT',
  ETH: process.env.ETH_PAIR || 'ETHUSDT',
  BNB: process.env.BNB_PAIR || 'BNBUSDT',
  SOL: process.env.SOL_PAIR || 'SOLUSDT',
  ADA: process.env.ADA_PAIR || 'ADAUSDT',
  XRP: process.env.XRP_PAIR || 'XRPUSDT',
  DOGE: process.env.DOGE_PAIR || 'DOGEUSDT',
  DOT: process.env.DOT_PAIR || 'DOTUSDT',
};

/* ==============================
 *  HTTP helper (avec timeout)
 * ============================== */

async function httpJson(url, headers = {}, timeoutMs = TIMEOUT_MS) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers, signal: ctl.signal });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error(`HTTP ${r.status} on ${url}${txt ? ` - ${txt.slice(0,120)}` : ''}`);
    }
    return r.json();
  } finally {
    clearTimeout(t);
  }
}

/* ==============================
 *  Mini-cache mémoire
 * ============================== */

const _cache = new Map();
const setCache = (key, data, ttl = CACHE_TTL_MS) => _cache.set(key, { ts: Date.now(), ttl, data });
const getCache = (key) => {
  const v = _cache.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > v.ttl) { _cache.delete(key); return null; }
  return v.data;
};

/* ==============================
 *  Forex USD→EUR (Frankfurter)
 * ============================== */

export async function getForex() {
  const key = 'fx:USD:EUR';
  const cached = getCache(key);
  if (cached) return cached;

  const data = await httpJson(`${FX_BASE}/latest?from=USD&to=EUR`);
  const out = {
    timestamp: new Date().toISOString(),
    base: data.base || 'USD',
    rates: { EUR: data?.rates?.EUR ?? null },
    source: 'frankfurter.app',
  };
  setCache(key, out, Number(process.env.FX_CACHE_TTL_MS || 60_000));
  return out;
}

/* ==============================
 *  Prix spot (Binance)
 * ============================== */

export async function getPrices() {
  const key = 'prices:spot';
  const cached = getCache(key);
  if (cached) return cached;

  const symbols = Object.keys(PAIRS);
  const [fx, ...priceData] = await Promise.all([
    getForex().catch(() => null),
    ...symbols.map(sym => httpJson(`${BINANCE_BASE}/api/v3/ticker/price?symbol=${PAIRS[sym]}`)),
  ]);

  const eurRate = fx?.rates?.EUR ?? null;
  const prices = {};

  symbols.forEach((sym, idx) => {
    const usdPrice = Number(priceData[idx]?.price ?? NaN);
    prices[sym] = {
      usd: usdPrice,
      eur: eurRate ? +(usdPrice * eurRate).toFixed(2) : null,
    };
  });

  const out = {
    timestamp: new Date().toISOString(),
    prices,
    source: 'binance+frankfurter',
  };
  setCache(key, out);
  return out;
}

/* ==============================
 *  Klines (OHLCV) — Binance
 * ============================== */

const INTERVALS = new Set(['1m','3m','5m','15m','30m','1h','2h','4h','6h','8h','12h','1d','3d','1w','1M']);

/**
 * @param {string} symbol 'BTC' | 'ETH' ...
 * @param {{ interval?:string, limit?:number, start?:number, end?:number }} opts
 *  - interval ex: '1h', '1d'...
 *  - limit 1..1000
 *  - start/end en ms (openTime), optionnels
 * @returns {Promise<Array<{t:number,o:number,h:number,l:number,c:number,v:number}>>}
 */
export async function getKlines(symbol = 'BTC', { interval = '1h', limit = 500, start, end } = {}) {
  const pair = PAIRS[String(symbol).toUpperCase()];
  if (!pair) throw new Error('SYMBOL_UNSUPPORTED');
  if (!INTERVALS.has(interval)) throw new Error('INTERVAL_UNSUPPORTED');

  const lim = Math.min(Math.max(Number(limit) || 1, 1), 1000);
  const q = new URLSearchParams({ symbol: pair, interval, limit: String(lim) });
  if (typeof start === 'number') q.set('startTime', String(start));
  if (typeof end   === 'number') q.set('endTime',   String(end));

  const cacheKey = `klines:${pair}:${interval}:${q.get('startTime') ?? 'na'}:${q.get('endTime') ?? 'na'}:${lim}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const raw = await httpJson(`${BINANCE_BASE}/api/v3/klines?${q.toString()}`);
  const rows = raw.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));

  setCache(cacheKey, rows);
  return rows;
}

/* ==============================
 *  Facades compatibles front
 * ============================== */

/** OHLC pour charts (par défaut 1D x 30) */
export async function getChartOHLC(symbol = 'BTC', { interval = '1d', limit = 30, format = 'raw' } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 1, 1), 1000);
  const ks = await getKlines(symbol, { interval, limit: lim });
  // garde le format historique {t,o,h,l,c}
  if (format === 'lw') {
    return ks.map(k => ({ time: Math.floor(k.t/1000), open: k.o, high: k.h, low: k.l, close: k.c }));
  }
  return ks.map(({ t, o, h, l, c }) => ({ t, o, h, l, c }));
}

/**
 * Range précis (from/to en SECONDES) avec heuristique d'interval
 * Retourne un objet compatible avec l'ancien front (prices [[t,c],...])
 */
export async function getMarketChartRange(symbol = 'BTC', { from, to, interval } = {}) {
  if (typeof from !== 'number' || typeof to !== 'number' || from >= to) {
    throw new Error('INVALID_RANGE');
  }
  const MS = 1000, DAY = 24 * 3600 * MS;
  const startMs = from * MS, endMs = to * MS;
  const span = endMs - startMs;

  const pick = (ms) => {
    if (ms <= 2 * DAY) return '5m';
    if (ms <= 7 * DAY) return '15m';
    if (ms <= 30 * DAY) return '1h';
    if (ms <= 180 * DAY) return '4h';
    return '1d';
  };
  const intv = interval || pick(span);

  // pagination simple >1000 si besoin
  const page = 1000;
  const all = [];
  let cursor = startMs;

  while (cursor < endMs) {
    const batch = await getKlines(symbol, { interval: intv, start: cursor, end: endMs, limit: page });
    if (!batch.length) break;
    all.push(...batch);
    const last = batch[batch.length - 1]?.t;
    const next = (last ?? cursor) + 1;
    if (next <= cursor) break;
    cursor = next;
  }

  // dédup & clamp
  const seen = new Set();
  const rows = all.filter(k => {
    if (seen.has(k.t)) return false;
    seen.add(k.t);
    return k.t <= endMs;
  });

  return {
    prices: rows.map(k => [k.t, k.c]),
    market_caps: [],
    total_volumes: [],
    source: `binance:${intv}`,
  };
}
