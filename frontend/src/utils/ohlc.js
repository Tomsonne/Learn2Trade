// /src/utils/ohlc.js

// --- Timeframe helpers ---
export const H   = 60 * 60 * 1000;
export const DAY = 24 * H;

// Map TF → taille de bucket en ms
export const TF = Object.freeze({
  "1h":  1 * H,
  "4h":  4 * H,
  "12h": 12 * H,
  "1d":  DAY,
});

// Petit helper pratique
export function bucketMsFromTf(tf) {
  return TF[tf] ?? TF["1h"];
}

// Regroupe des bougies source en bougies plus larges (Open/High/Low/Close)
export function resampleOHLC(rows, bucketMs) {
  const out = [];
  if (!rows?.length) return out;

  // Assure tri par timestamp croissant
  const src = [...rows].sort((a, b) => +a.ts - +b.ts);

  let bStart = Math.floor(+src[0].ts / bucketMs) * bucketMs;
  let cur = null;

  const flush = () => { if (cur) { out.push(cur); cur = null; } };

  for (const r of src) {
    const ts = +r.ts;
    const b = Math.floor(ts / bucketMs) * bucketMs;
    if (cur === null || b !== bStart) {
      flush();
      bStart = b;
      const first = r.c ?? r.price ?? r.o; // valeur de repli robuste
      cur = { ts: b, o: first, h: first, l: first, c: first };
    } else {
      const hi = r.h ?? r.price ?? r.c ?? r.o;
      const lo = r.l ?? r.price ?? r.c ?? r.o;
      const cl = r.c ?? r.price ?? r.o;
      cur.h = Math.max(cur.h, hi);
      cur.l = Math.min(cur.l, lo);
      cur.c = cl; // dernière valeur du bucket
    }
  }
  flush();
  return out;
}
