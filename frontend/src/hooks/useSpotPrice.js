// src/hooks/useSpotPrice.js
import { useEffect, useRef, useState } from "react";

export function useSpotPrice({ symbol, vs = "usd", refreshMs = 60_000 } = {}) {
  const [price, setPrice] = useState(null);
  const lastGoodRef = useRef(null);

  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const url = `${base}/market/ohlc?symbol=${encodeURIComponent(symbol)}&vs=${encodeURIComponent(vs)}&days=1`;

  useEffect(() => {
    let timer; const ctrl = new AbortController(); let aborted = false;
    const normTs = (t) => (t < 2e10 ? t * 1000 : t);

    const load = async () => {
      try {
        const res = await fetch(url, { headers: { accept: "application/json" }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        let rows = [];
        if (json?.status === "ok" && Array.isArray(json.data) && json.data.length) {
          rows = (Array.isArray(json.data[0])
            ? json.data.map(([t, , , , c]) => ({ ts: normTs(t), c: +c }))
            : json.data.map(({ t, c }) => ({ ts: normTs(t), c: +c })));
        } else if (Array.isArray(json?.ohlc)) {
          rows = json.ohlc.map(([t, , , , c]) => ({ ts: normTs(t), c: +c }));
        }

        const last = rows.at(-1)?.c;
        const next = Number.isFinite(last) ? last : lastGoodRef.current ?? null;
        lastGoodRef.current = next;
        if (!aborted) setPrice(next);
      } catch {
        if (!aborted) setPrice(lastGoodRef.current ?? null);
      }
    };

    load();
    if (refreshMs > 0) timer = setInterval(load, refreshMs);
    return () => { aborted = true; ctrl.abort(); if (timer) clearInterval(timer); };
  }, [url, refreshMs, symbol, vs]);

  return { price };
}
