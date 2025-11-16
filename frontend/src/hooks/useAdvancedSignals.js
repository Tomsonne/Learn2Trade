// frontend/src/hooks/useAdvancedSignals.js
import { useMemo } from 'react';
import { useMarketSeries } from './useMarketSeries';
import {
  calculateFibonacciLevels,
  analyzeBollingerBands,
  analyzeFibonacciPosition,
  calculateConfluence,
} from '../utils/advancedIndicators';

/**
 * Hook pour calculer des signaux avancés basés sur Fibonacci, BB, RSI
 * @param {string} symbol - Symbole crypto (BTC, ETH, etc.)
 * @param {string} tf - Timeframe (1h, 4h, 1d)
 * @param {number} currentPrice - Prix actuel
 * @param {number} change24h - Variation 24h (%)
 * @returns {object} - { signal, confidence, reasons, indicators, loading }
 */
export function useAdvancedSignals(symbol, tf = '1h', currentPrice, change24h) {
  const { data: series, loading, error } = useMarketSeries({ symbol, tf });

  const analysis = useMemo(() => {
    if (!series || series.length === 0 || loading) {
      return {
        signal: 'HOLD',
        confidence: 0,
        reasons: [],
        indicators: {},
        loading: true,
      };
    }

    // 1. Calculer Fibonacci
    const fibonacci = calculateFibonacciLevels(series, 100);

    // 2. Analyser Bollinger Bands
    const bbSignal = analyzeBollingerBands(series, currentPrice);

    // 3. Analyser position Fibonacci
    const fibSignal = analyzeFibonacciPosition(currentPrice, fibonacci);

    // 4. Récupérer le dernier RSI
    const latest = series[series.length - 1];
    const rsi = latest?.rsi ?? null;

    // 5. Calculer le score de confluence
    const confluence = calculateConfluence({
      rsi,
      bbSignal,
      fibSignal,
      change24h,
    });

    return {
      signal: confluence.action,
      confidence: confluence.confidence,
      reasons: confluence.reasons,
      scores: confluence.scores,
      indicators: {
        rsi,
        fibonacci,
        bollingerBands: {
          upper: latest?.bbUpper,
          middle: latest?.bbMiddle,
          lower: latest?.bbLower,
        },
        sma20: latest?.ma20,
        sma50: latest?.ma50,
      },
      loading: false,
      error: null,
    };
  }, [series, loading, currentPrice, change24h]);

  return analysis;
}
