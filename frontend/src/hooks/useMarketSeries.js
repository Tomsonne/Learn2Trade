// src/hooks/useMarketSeries.js
import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket.js";

export function useMarketSeries({
  symbol = "BTC",
  tf = "1h",
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected, subscribe, subscribeToMarketSeries } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Normalise le symbole
    const cleanSymbol = String(symbol).toUpperCase().replace(/(USDT|BUSD|USDC|USD)$/i, "");

    setLoading(true);

    // Subscribe to market series updates
    const unsubscribeFromMessages = subscribe('marketSeries', (message) => {
      if (message.symbol === cleanSymbol && message.tf === tf) {
        setData(message.data || []);
        setError(null);
        setLoading(false);
      }
    });

    const unsubscribeFromMarketSeries = subscribeToMarketSeries(cleanSymbol, tf);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromMarketSeries();
    };
  }, [symbol, tf, isConnected, subscribe, subscribeToMarketSeries]);

  return { data, loading, error };
}
