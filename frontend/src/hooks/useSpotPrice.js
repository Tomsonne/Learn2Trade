// frontend/src/hooks/useSpotPrice.js
import { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:8000/api/v1"
    : "https://skillvest-production.up.railway.app/api/v1");

export function useSpotPrice({ symbol = "BTC", refreshMs = 60_000 } = {}) {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/market/prices`);
        const json = await res.json();
        if (json.status !== "ok") throw new Error(json.error?.message || "API_ERROR");

        // 🔧 Normalise le symbole (ex: ETHUSDT → ETH)
        // Important: on utilise $ pour matcher seulement à la fin de la chaîne
        const sym = String(symbol).toUpperCase().replace(/(USDT|BUSD|USDC|USD)$/i, "");

        console.log('🔍 useSpotPrice:', { symbol, sym, prices: json.data?.prices });

        // 🔍 Récupère le prix dans l'objet renvoyé par le backend
        const value =
          json.data?.prices?.[sym]?.usd ??
          json.data?.prices?.[symbol]?.usd ??
          null;

        console.log('💰 Price found:', { symbol, sym, value });

        setPrice(value);
        setError(null);
      } catch (e) {
        console.error('❌ useSpotPrice error:', e);
        setError(String(e.message || e));
      }
    }

    load();

    if (!refreshMs) return;
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [symbol, refreshMs]);

  return { price, error };
}
