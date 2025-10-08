// src/hooks/useMarketSeries.js
import { useEffect, useState } from "react";
import { sma, rsi } from "../lib/indicators.js";

const DAYS_BY_TF = {
  '1h':  7,   // on utilisera /ohlc (7 jours → 30 min)
  '4h':  30,
  '12h': 30,
  '1d':  30,  // ajuste si tu veux
};

export function useMarketSeries({
  symbol,
  vs = "usd",
  tf = "1h",
  refreshMs = 60_000,
  preferOHLCFor1d = false, // garde l’option si besoin
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const days = DAYS_BY_TF[tf] ?? 1;

  // 1h → /ohlc (7 jours = bougies 30 min). Sinon → /ohlc (days)
  let url = "";
  let dayss;

  if (tf === "1h") {
    // On récupère 7 jours de données en bougies 30 min
    dayss = 7;
    url = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=${dayss}`;
  } else if (tf === "4h" || tf === "12h") {
    // On garde 30 jours pour les TF plus larges (bougies quotidiennes)
    dayss = 30;
    url = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=${dayss}`;
  } else {
    // pour 1d on peut aller plus loin
    dayss = 30;
    url = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=${dayss}`;
  }

  useEffect(() => {
    let timer;
    const ctrl = new AbortController();
    let aborted = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { headers: { accept: "application/json" }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        let rows = [];

        // /market/ohlc → {status:'ok', data:[{t,o,h,l,c}, ...]} ou [[t,o,h,l,c],...]
        if (json?.status === "ok" && Array.isArray(json.data) && json.data.length) {
          if (!Array.isArray(json.data[0])) {
            rows = json.data.map(({ t, o, h, l, c }) => ({
              ts: t,
              o: +o,
              h: +h,
              l: +l,
              c: +c,
              price: +(c ?? o),
            }));
          } else {
            rows = json.data.map(([t, o, h, l, c]) => ({
              ts: t,
              o: +o,
              h: +h,
              l: +l,
              c: +c,
              price: +(c ?? o),
            }));
          }
        }
        // /market/range → {status:'ok', data:{prices:[[ms,price], ...]}}
        else if (json?.status === "ok" && Array.isArray(json.data?.prices)) {
          rows = json.data.prices.map(([ts, p]) => ({ ts, o: null, h: null, l: null, c: null, price: +p }));
        }
        // compat
        else if (Array.isArray(json?.ohlc)) {
          rows = json.ohlc.map(([t, o, h, l, c]) => ({
            ts: t,
            o: +o,
            h: +h,
            l: +l,
            c: +c,
            price: +(c ?? o),
          }));
        } else if (Array.isArray(json?.prices)) {
          rows = json.prices.map(([ts, p]) => ({ ts, o: null, h: null, l: null, c: null, price: +p }));
        } else {
          throw new Error("Payload inconnu");
        }

        // Indicateurs (sur price = close)
        const close = rows.map((r) => r.price);
        const ma20 = sma(close, 20);
        const ma50 = sma(close, 50);
        const rsi14 = rsi(close, 14);

        const points = rows.map((r, i) => ({
          ts: r.ts,
          time: new Date(r.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          price: r.price, // <-- TOUJOURS la close
          o: r.o,
          h: r.h,
          l: r.l,
          c: r.c,
          ma20: ma20[i] ?? null,
          ma50: ma50[i] ?? null,
          rsi: rsi14[i] ?? null,
        }));

        if (!aborted) setData(points);
      } catch (e) {
        if (!aborted) setError(e.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    if (refreshMs > 0) timer = setInterval(load, refreshMs);
    return () => {
      aborted = true;
      ctrl.abort();
      if (timer) clearInterval(timer);
    };
  }, [url, refreshMs, symbol, vs, tf]);

  return { data, loading, error };
}
