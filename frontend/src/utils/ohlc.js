// --- Time helpers ---
export const H   = 60 * 60 * 1000;
export const DAY = 24 * H;

// Map TF → taille de bucket en ms
export const TF = Object.freeze({
  "1h":  1 * H,
  "4h":  4 * H,
  "12h": 12 * H,
  "1d":  DAY,
});

// Taille de bucket depuis la TF
export function bucketMsFromTf(tf) {
  return TF[tf] ?? TF["1h"];
}

// Jours acceptés par /coins/{id}/ohlc (CoinGecko)
export const SUPPORTED_OHLC_DAYS = new Set([1, 7, 14, 30, 90, 180, 365]);

// Mapping TF -> days supportés (évite 400/503)
export function daysFor(tf) {
  switch (tf) {
    case "1h":  return 1;    // source 30m
    case "4h":  return 14;   // source 4h
    case "12h": return 14;   // source 4h (MA50 souvent indispo)
    case "1d":  return 365;// source 1d
    default:    return 7;
  }
}

// Granularité source attendue côté CoinGecko selon 'days'
export function srcBucketMsFromDays(days) {
  if (days === 1) return 30 * 60 * 1000; // 30 min
  if (days <= 14) return 4 * H;          // 4 h
  return DAY;                             // 1 j
}

// Regroupe des bougies source en bougies plus larges (Open/High/Low/Close)
export function resampleOHLC(rows, bucketMs) {
  const out = [];
  if (!rows?.length || !Number.isFinite(bucketMs) || bucketMs <= 0) return out;

  const src = rows
    .filter(r => Number.isFinite(+r?.ts))
    .map(r => ({
      ts: +r.ts,
      o: toNum(r.o),
      h: toNum(r.h),
      l: toNum(r.l),
      c: toNum(r.c),
      price: toNum(r.price),
    }))
    .sort((a, b) => a.ts - b.ts);

  let cur = null, curBucket = null;
  const push = () => { if (cur) out.push(cur); };

  for (const r of src) {
    const b = Math.floor(r.ts / bucketMs) * bucketMs;

    if (curBucket === null || b !== curBucket) {
      push();
      curBucket = b;
      const first = pickNum(r.o, r.c, r.price, r.h, r.l);
      cur = {
        ts: b,
        o: pickNum(r.o, first),
        h: pickNum(r.h, first),
        l: pickNum(r.l, first),
        c: pickNum(r.c, first),
      };
      continue;
    }

    const highs = [r.h, r.o, r.c, r.price].filter(Number.isFinite);
    const lows  = [r.l, r.o, r.c, r.price].filter(Number.isFinite);
    if (highs.length) cur.h = Math.max(cur.h, ...highs);
    if (lows.length)  cur.l = Math.min(cur.l, ...lows);

    const lastClose = pickNum(r.c, r.o, r.price);
    if (Number.isFinite(lastClose)) cur.c = lastClose;
  }

  push();
  return out;
}

function pickNum(...vals) { for (const v of vals) if (Number.isFinite(v)) return v; return NaN; }
function toNum(v) { return Number.isFinite(+v) ? +v : NaN; }
