// src/utils/ohlc.js
export const TF = {
  '1h': 3600,
  '4h': 3600 * 4,
  '12h': 3600 * 12,
  '1d': 3600 * 24,
};

/**
 * @param {Array<{ts:number,o:number,h:number,l:number,c:number}>} rows
 * @param {number} bucketSec
 * @returns {Array<{ts:number,o:number,h:number,l:number,c:number}>}
 */
export function resampleOHLC(rows = [], bucketSec) {
  const out = new Map(); // key: bucket(secondes), value: ohlc

  for (const r of rows) {
    if (r?.o == null || r?.h == null || r?.l == null || r?.c == null || r?.ts == null) continue;

    const sec = Math.floor(Number(r.ts) / 1000);
    const bucket = Math.floor(sec / bucketSec) * bucketSec; // secondes entières
    const cur = out.get(bucket);

    if (!cur) {
      out.set(bucket, { ts: bucket * 1000, o: +r.o, h: +r.h, l: +r.l, c: +r.c });
    } else {
      cur.h = Math.max(cur.h, +r.h);
      cur.l = Math.min(cur.l, +r.l);
      cur.c = +r.c; // on garde le dernier close du bucket
    }
  }

  return Array.from(out.values()).sort((a, b) => a.ts - b.ts);
}