// frontend/src/hooks/useSpotPrice.js
import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket.js";

export function useSpotPrice({ symbol = "BTC" } = {}) {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const { isConnected, subscribe, subscribeToSpotPrice } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Normalise le symbole (ex: ETHUSDT → ETH)
    const cleanSymbol = String(symbol).toUpperCase().replace(/(USDT|BUSD|USDC|USD)$/i, "");

    // Subscribe to price updates
    const unsubscribeFromMessages = subscribe('spotPrice', (data) => {
      if (data.symbol === cleanSymbol) {
        setPrice(data.data);
        setError(null);
      }
    });

    const unsubscribeFromSpotPrice = subscribeToSpotPrice(cleanSymbol);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromSpotPrice();
    };
  }, [symbol, isConnected, subscribe, subscribeToSpotPrice]);

  return { price, error };
}
