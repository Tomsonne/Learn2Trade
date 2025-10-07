import { useEffect, useState } from "react";
import { sma, rsi } from "../lib/indicators.js";

/**
 * Retourne des points { time, price, ma20, ma50, rsi } pour Recharts
 * - /market/ohlc?symbol=BTC&vs=usd&days=7  → {status:'ok', data:[{t,o,h,l,c}, ...]}
 * - /market/range?symbol=BTC&vs=usd&from=...&to=... → {status:'ok', data:{prices:[[ms,price], ...]}}
 */
export function useMarketSeries({
  symbol = "BTC",   // backend: 'BTC' | 'ETH'
  vs = "usd",
  range = "1d",     // "1d", "7d", "30d" → days
  refreshMs = 60_000,
  id,               // "bitcoin" | "ethereum" (optionnel → mappé vers symbol)
  preferOHLCFor1d = false,
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // -- helpers --
  const idToSymbol = (coinId) => {
    const m = String(coinId || "").toLowerCase();
    if (m === "bitcoin")  return "BTC";
    if (m === "ethereum") return "ETH";
    return undefined;
  };
  const parseRangeToDays = (r) => {
    const m = String(r).match(/(\d+)\s*d/i);
    return m ? Number(m[1]) : 1;
  };

  const finalSymbol = id ? (idToSymbol(id) || symbol) : symbol;

  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

  // Si 1d → on préfère la granularité minute via /market/range
  const is1d = String(range).toLowerCase() === "1d";
  let url = "";
  
  if (is1d && !preferOHLCFor1d) {
    // 1d → granularité minute via /range (prices[][])
    const nowSec  = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - 24 * 60 * 60;
    url = `${base}/market/range?symbol=${encodeURIComponent(finalSymbol)}&vs=${encodeURIComponent(vs)}&from=${fromSec}&to=${nowSec}`;
  } else {
    const days = parseRangeToDays(range);
    url = `${base}/market/ohlc?symbol=${encodeURIComponent(finalSymbol)}&vs=${encodeURIComponent(vs)}&days=${days}`;
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
        if (!res.ok) {
          let detail = "";
          try {
            const errJson = await res.json();
            detail = typeof errJson === "string" ? errJson : errJson?.message || errJson?.error || JSON.stringify(errJson);
          } catch {}
          throw new Error(`HTTP ${res.status}${detail ? ` – ${detail}` : ""}`);
        }

        const json = await res.json();

        // --- normalisation payload ---
        let rows = [];

        // /market/ohlc : {status:'ok', data:[{t,o,h,l,c}, ...]}
        if (json && json.status === "ok" && Array.isArray(json.data) && json.data.length) {
          if (typeof json.data[0] === "object" && !Array.isArray(json.data[0]) && "t" in json.data[0]) {
            rows = json.data.map(({ t, o, h, l, c }) => ({
              ts: t, price: c ?? o, o, h, l, c
            }));
          } else if (Array.isArray(json.data[0])) {
            rows = json.data.map(([ts, o, h, l, c]) => ({
              ts, price: (c ?? o), o, h, l, c
            }));
          }
        }
        // /market/range : {status:'ok', data:{prices:[[ms,price], ...]}}
        else if (json && json.status === "ok" && json.data?.prices && Array.isArray(json.data.prices)) {
          rows = json.data.prices.map(([ts, p]) => ({
            ts, price: p, o: null, h: null, l: null, c: null
          }));
        }
        // compat additionnelle
        else if (Array.isArray(json?.ohlc)) {
          rows = json.ohlc.map(([ts, o, h, l, c]) => ({ ts, price: c, o, h, l, c }));
        } else if (Array.isArray(json?.prices)) {
          rows = json.prices.map(([ts, p]) => ({ ts, price: p, o: null, h: null, l: null, c: null }));
        } else if (Array.isArray(json)) {
          if (json.length && typeof json[0] === "object" && !Array.isArray(json[0]) && "t" in json[0]) {
            rows = json.map(({ t, o, h, l, c }) => ({ ts: t, price: (c ?? o), o, h, l, c }));
          } else {
            rows = json.map(([ts, o, h, l, c]) => ({ ts, price: (c ?? o), o, h, l, c }));
          }
        } else {
          throw new Error("Payload inconnu");
        }
        // Indicateurs
        const close = rows.map((r) => r.price);
        const ma20  = sma(close, 20);
        const ma50  = sma(close, 50);
        const rsi14 = rsi(close, 14);

        const points = rows.map((r, i) => ({
          ts: r.ts, // <-- garde le timestamp en ms
          time: new Date(r.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          price: Number(r.price),
          // OHLC (si dispo, sinon null)
          o: r.o != null ? Number(r.o) : null,
          h: r.h != null ? Number(r.h) : null,
          l: r.l != null ? Number(r.l) : null,
          c: r.c != null ? Number(r.c) : null,
          // Indicateurs (utiles pour tes autres cartes)
          ma20: ma20[i] != null ? Number(ma20[i].toFixed(2)) : null,
          ma50: ma50[i] != null ? Number(ma50[i].toFixed(2)) : null,
          rsi:  rsi14[i] != null ? Math.max(0, Math.min(100, Number(rsi14[i].toFixed(2)))) : null,
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
    return () => { aborted = true; ctrl.abort(); if (timer) clearInterval(timer); };
  }, [url, refreshMs]);

  return { data, loading, error };
}
