// src/hooks/useMarketSeries.js
import { useEffect, useState } from "react";
import { SMA, RSI } from "technicalindicators";

// Regroupe des bougies source en bougies plus larges (Open/High/Low/Close)
function resampleOHLC(rows, bucketMs) {
  const out = [];
  if (!rows?.length) return out;
  const src = [...rows].sort((a, b) => +a.ts - +b.ts);
  let cur = null, curBucket = null;

  for (const r of src) {
    const ts = +r.ts;
    const b = Math.floor(ts / bucketMs) * bucketMs; // UTC
    if (curBucket === null || b !== curBucket) {
      if (cur) out.push(cur);
      curBucket = b;
      const first = r.c ?? r.o;
      cur = { ts: b, o: r.o ?? first, h: r.h ?? first, l: r.l ?? first, c: r.c ?? first };
    } else {
      cur.h = Math.max(cur.h, r.h ?? r.c ?? r.o);
      cur.l = Math.min(cur.l, r.l ?? r.c ?? r.o);
      cur.c = r.c ?? cur.c; // dernière valeur du seau
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * @param {Object} params
 * @param {string} params.symbol
 * @param {string} [params.vs='usd']
 * @param {'1h'|'4h'|'12h'|'1d'} [params.tf='1h']
 * @param {number} [params.refreshMs=60000]
 * @param {number} [params.spotPrice] - si fourni, patch la dernière bougie avec ce prix (close identique tous TF)
 */
export function useMarketSeries({
  symbol,
  vs = "usd",
  tf = "1h",
  refreshMs = 60_000,
  spotPrice, // 🔹 nouveau
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  // CoinGecko OHLC: 1d→30m, 7/14d→4h, >=30d→1d
  const daysByTf = { "1h": 1, "4h": 7, "12h": 14, "1d": 90 };
  const url = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=${daysByTf[tf] ?? 7}`;

  useEffect(() => {
    const H = 60 * 60 * 1000;
    const DAY = 24 * H;
    const bucketMs = tf === "1h" ? H : tf === "4h" ? 4 * H : tf === "12h" ? 12 * H : DAY;

    // Granularité source selon CoinGecko
    const srcBucketMs =
      daysByTf[tf] === 1 ? 30 * 60 * 1000 :
      daysByTf[tf] <= 14 ? 4 * H : DAY;

    let timer; const ctrl = new AbortController(); let aborted = false;
    const normTs = (t) => (t < 2e10 ? t * 1000 : t);

    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(url, { headers: { accept: "application/json" }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Normalise OHLC
        let rows = [];
        if (json?.status === "ok" && Array.isArray(json.data) && json.data.length) {
          rows = (Array.isArray(json.data[0])
            ? json.data.map(([t,o,h,l,c]) => ({ ts: normTs(t), o:+o, h:+h, l:+l, c:+c }))
            : json.data.map(({ t,o,h,l,c }) => ({ ts: normTs(t), o:+o, h:+h, l:+l, c:+c })));
        } else if (Array.isArray(json?.ohlc)) {
          rows = json.ohlc.map(([t,o,h,l,c]) => ({ ts: normTs(t), o:+o, h:+h, l:+l, c:+c }));
        } else {
          throw new Error("Payload OHLC inconnu");
        }

        // Resample si la cible > source
        let ohlc = (bucketMs > srcBucketMs) ? resampleOHLC(rows, bucketMs) : rows;

        // 🔹 Patch dernière bougie avec le spotPrice (close identique sur toutes les TF)
        if (Number.isFinite(spotPrice) && ohlc.length) {
          const last = ohlc[ohlc.length - 1];
          const c = Number(spotPrice);
          const h = Math.max(last.h, c);
          const l = Math.min(last.l, c);
          ohlc = [...ohlc.slice(0, -1), { ...last, c, h, l }];
        }

        // Indicateurs sur la CLOSE du TF
        const closes = ohlc.map(r => r.c);
        const sma20Arr = SMA.calculate({ period: 20, values: closes });
        const sma50Arr = SMA.calculate({ period: 50, values: closes });
        const rsi14Arr = RSI.calculate({ period: 14, values: closes });

        const out = ohlc.map((r, i) => ({
          ts: r.ts,
          time: Math.floor(r.ts / 1000), // seconds pour Lightweight-Charts
          o: r.o, h: r.h, l: r.l, c: r.c,
          ma20: i >= 19 ? sma20Arr[i - 19] : null,
          ma50: i >= 49 ? sma50Arr[i - 49] : null,
          rsi:  i >= 14 ? rsi14Arr[i - 14] : null,
        }));

        if (!aborted) setData(out);
      } catch (e) {
        if (!aborted) setError(e.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    if (refreshMs > 0) timer = setInterval(load, refreshMs);
    return () => { aborted = true; ctrl.abort(); if (timer) clearInterval(timer); };
  // 🔹 Recalcule aussi quand spotPrice change
  }, [url, tf, symbol, vs, refreshMs, spotPrice]);

  return { data, loading, error };
}
