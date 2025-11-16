import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_API_BASE?.replace(/^https?/, 'ws').replace('/api/v1', '/ws') ||
               (window.location.hostname === 'localhost' ? 'ws://localhost:8000/ws' : 'wss://learn2trade-production.up.railway.app/ws');

console.log('WebSocket URL:', WS_URL);

/**
 * Hook pour gérer une connexion WebSocket
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoConnect - Se connecter automatiquement au montage
 * @param {number} options.reconnectInterval - Intervalle de reconnexion en ms (défaut: 3000)
 * @param {number} options.maxReconnectAttempts - Nombre max de tentatives de reconnexion (défaut: 10)
 */
export function useWebSocket({
  autoConnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10
} = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messageHandlersRef = useRef(new Map());
  const subscriptionsRef = useRef(new Map()); // key -> subscription object

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Re-subscribe to all previous subscriptions
        subscriptionsRef.current.forEach((subscription) => {
          ws.send(JSON.stringify(subscription));
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            connect();
          }, reconnectInterval);
        } else {
          setError('Max reconnection attempts reached');
        }
      };

      ws.onerror = (event) => {
        // Only log errors if we're supposed to be connected
        // Ignore errors during Strict Mode double-mounting
        if (reconnectAttemptsRef.current > 0) {
          console.error('WebSocket error:', event);
        }
        setError('WebSocket connection error');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Call all registered handlers for this message type
          const handlers = messageHandlersRef.current.get(data.type) || [];
          handlers.forEach(handler => handler(data));
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(err.message);
    }
  }, [reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    // Only log warning for subscribe messages, not unsubscribe during cleanup
    if (data.type && !data.type.startsWith('unsubscribe')) {
      console.warn('WebSocket not connected, cannot send message');
    }
    return false;
  }, []);

  const subscribe = useCallback((type, handler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, []);
    }
    messageHandlersRef.current.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }, []);

  const subscribeToSpotPrice = useCallback((symbol) => {
    const subscriptionKey = `spotPrice:${symbol}`;
    const subscription = { type: 'subscribe:spotPrice', payload: { symbol } };
    subscriptionsRef.current.set(subscriptionKey, subscription);

    // Try to send immediately if connected, otherwise will be sent on connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      send(subscription);
    }

    return () => {
      const unsubscription = { type: 'unsubscribe:spotPrice', payload: { symbol } };
      subscriptionsRef.current.delete(subscriptionKey);
      send(unsubscription);
    };
  }, [send]);

  const subscribeToMarketSeries = useCallback((symbol, tf) => {
    const subscriptionKey = `marketSeries:${symbol}:${tf}`;
    const subscription = { type: 'subscribe:marketSeries', payload: { symbol, tf } };
    subscriptionsRef.current.set(subscriptionKey, subscription);

    // Try to send immediately if connected, otherwise will be sent on connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      send(subscription);
    }

    return () => {
      const unsubscription = { type: 'unsubscribe:marketSeries', payload: { symbol, tf } };
      subscriptionsRef.current.delete(subscriptionKey);
      send(unsubscription);
    };
  }, [send]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send,
    subscribe,
    subscribeToSpotPrice,
    subscribeToMarketSeries,
  };
}
