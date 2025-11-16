// src/hooks/useNews.js
import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket.js";

export function useNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected, subscribe } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to news updates
    const unsubscribe = subscribe('news', (data) => {
      // data.data contains the news array
      const list = Array.isArray(data.data) ? data.data : [];
      setItems(list);
      setError(null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, subscribe]);

  return { items, loading, error };
}
