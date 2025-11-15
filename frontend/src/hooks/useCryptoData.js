import { useState, useEffect } from 'react';

/**
 * Hook pour récupérer les données crypto en temps réel depuis Binance API
 * Retourne: prix, variation 24h, volume pour chaque crypto
 */
export function useCryptoData(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT']) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Fetch 24h ticker data from Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const allTickers = await response.json();

        // Filter only the symbols we want
        const filteredData = allTickers
          .filter(ticker => symbols.includes(ticker.symbol))
          .reduce((acc, ticker) => {
            const symbol = ticker.symbol.replace('USDT', '');
            acc[symbol] = {
              price: parseFloat(ticker.lastPrice),
              change24h: parseFloat(ticker.priceChangePercent),
              volume: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice), // volume en USD
              high24h: parseFloat(ticker.highPrice),
              low24h: parseFloat(ticker.lowPrice),
            };
            return acc;
          }, {});

        setData(filteredData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur fetch Binance API:', err);
        setError(err);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCryptoData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(interval);
  }, [symbols.join(',')]);

  return { data, loading, error };
}
