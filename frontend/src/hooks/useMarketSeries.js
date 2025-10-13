import { useEffect, useState } from "react";
import { SMA, RSI } from "technicalindicators";
import {
  resampleOHLC,
  bucketMsFromTf,
  H, DAY,
  daysFor,
  srcBucketMsFromDays,
} from "../utils/ohlc.js";

export function useMarketSeries({
  symbol,
  vs = "usd",
  tf = "1h",
  refreshMs = 60_000,
  spotPrice, // force la dernière close pour un prix identique sur toutes les TF
} = {}) {
  const [data, setData]   = useState([]);
  const [meta, setMeta]   = useState({ hasMA20: false, hasMA50: false });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const days = daysFor(tf);
  const url  = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=${days}`;

  useEffect(() => {
    const bucketMs   = bucketMsFromTf(tf);
    const srcBucketMs = srcBucketMsFromDays(days);

    let timer;
    const ctrl = new AbortController();
    let aborted = false;
    const normTs = (t) => (t < 2e10 ? t * 1000 : t);

    const load = async () => {
      try {
        setLoading(true); setError(null);

        const res = await fetch(url, { headers: { accept: "application/json" }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // normalisation OHLC
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

        // resample si cible > source
        let ohlc = bucketMs > srcBucketMs ? resampleOHLC(rows, bucketMs) : rows;

        // patch dernière bougie avec spotPrice (uniformise la dernière close entre TF)
        if (Number.isFinite(spotPrice) && ohlc.length) {
          const last = ohlc[ohlc.length - 1];
          const c = Number(spotPrice);
          ohlc = [...ohlc.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) }];
        }

        // indicateurs (seulement si assez de points)
        const closes  = ohlc.map(r => r.c).filter(Number.isFinite);
        const hasMA20 = closes.length >= 20;
        const hasMA50 = closes.length >= 50;

        const ma20Arr  = hasMA20 ? SMA.calculate({ period: 20, values: closes }) : [];
        const ma50Arr  = hasMA50 ? SMA.calculate({ period: 50, values: closes }) : [];
        const rsi14Arr = closes.length >= 14 ? RSI.calculate({ period: 14, values: closes }) : [];

        const out = ohlc.map((r, i) => ({
          ts: r.ts,
          time: Math.floor(r.ts / 1000),
          o: r.o, h: r.h, l: r.l, c: r.c,
          ma20: hasMA20 && i >= 19 ? ma20Arr[i - 19] : null,
          ma50: hasMA50 && i >= 49 ? ma50Arr[i - 49] : null,
          rsi:  i >= 14 ? (rsi14Arr[i - 14] ?? null) : null,
        }));

        if (!aborted) { setData(out); setMeta({ hasMA20, hasMA50 }); }
      } catch (e) {
        if (!aborted) setError(e.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    if (refreshMs > 0) timer = setInterval(load, refreshMs);
    return () => { aborted = true; ctrl.abort(); if (timer) clearInterval(timer); };
  }, [url, tf, symbol, vs, refreshMs, spotPrice, days]);

  return { data, loading, error, meta };
}
