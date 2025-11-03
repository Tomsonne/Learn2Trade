// src/hooks/useMarketSeries.js
import { useEffect, useState, useCallback } from "react";
import { SMA, RSI } from "technicalindicators";

// Corrigé : détection auto backend
const API =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:8000/api/v1"
    : "https://skillvest-production.up.railway.app/api/v1");

// combien de bougies à charger par timeframe
const LIMIT_BY_TF = {
  '1m': 500, '3m': 500, '5m': 500, '15m': 500, '30m': 500,
  '1h': 500, '2h': 500, '4h': 500, '6h': 500, '8h': 500, '12h': 500,
  '1d': 200, '3d': 200, '1w': 200, '1M': 200,
};

// pad pour réaligner la longueur des indicateurs sur rows.length
const padToLen = (fullLen, arr) => {
  const pad = fullLen - arr.length;
  return (pad > 0 ? Array(pad).fill(null) : []).concat(arr);
};

export function useMarketSeries({
  symbol = "BTC",
  tf = "1h",
  refreshMs = 60_000,
  spotPrice = null,
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = LIMIT_BY_TF[tf] ?? 300;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API}/market/ohlc?symbol=${symbol}&interval=${tf}&limit=${limit}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.error?.message || "API_ERROR");

      const rows = json.data ?? [];                 // [{ t,o,h,l,c }]
      const closes = rows.map(r => r.c);

      // technicalindicators
      const ma20Arr = SMA.calculate({ period: 20, values: closes });
      const ma50Arr = SMA.calculate({ period: 50, values: closes });
      const rsiArr  = RSI.calculate({ period: 14, values: closes });

      // réaligne aux longueurs de rows
      const ma20 = padToLen(rows.length, ma20Arr);
      const ma50 = padToLen(rows.length, ma50Arr);
      const rsi  = padToLen(rows.length, rsiArr);

      const enriched = rows.map((r, i) => ({
        ts: r.t, o: r.o, h: r.h, l: r.l, c: r.c,
        ma20: ma20[i], ma50: ma50[i], rsi: rsi[i],
      }));

      // option : écraser le close de la dernière bougie avec le spot
      if (typeof spotPrice === "number" && enriched.length) {
        enriched[enriched.length - 1] = { ...enriched.at(-1), c: spotPrice };
      }

      setData(enriched);
      setError(null);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, [symbol, tf, limit, spotPrice]);

  // initial + changements de deps
  useEffect(() => { load(); }, [load]);

  // polling
  useEffect(() => {
    if (!refreshMs) return;
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [load, refreshMs]);

  return { data, loading, error };
}
