// frontend/src/utils/advancedIndicators.js
// Utilities pour calculer les signaux avancés (Fibonacci, Bollinger Bands, etc.)

/**
 * Calcule les niveaux de Fibonacci basés sur les swing high/low récents
 * @param {Array} series - Données de marché (OHLC)
 * @param {number} lookback - Nombre de bougies à analyser (défaut: 100)
 * @returns {object} - { trend, levels, swingHigh, swingLow }
 */
export function calculateFibonacciLevels(series, lookback = 100) {
  if (!series || series.length < 50) {
    return { trend: null, levels: [], swingHigh: null, swingLow: null };
  }

  const recentData = series.slice(-lookback);

  let maxPrice = -Infinity;
  let minPrice = Infinity;
  let maxIndex = -1;
  let minIndex = -1;

  recentData.forEach((candle, i) => {
    const high = candle.h;
    const low = candle.l;

    if (high > maxPrice) {
      maxPrice = high;
      maxIndex = i;
    }
    if (low < minPrice) {
      minPrice = low;
      minIndex = i;
    }
  });

  // Tendance : max après min = haussière
  const isUptrend = maxIndex > minIndex;
  const range = maxPrice - minPrice;

  const fibRatios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
  const levels = fibRatios.map(ratio => {
    return isUptrend
      ? maxPrice - range * ratio  // Retracement depuis le haut
      : minPrice + range * ratio; // Extension depuis le bas
  });

  return {
    trend: isUptrend ? 'UPTREND' : 'DOWNTREND',
    levels,
    swingHigh: maxPrice,
    swingLow: minPrice,
    goldenRatio: levels[4], // 61.8%
  };
}

/**
 * Analyse les Bollinger Bands pour détecter les signaux
 * @param {Array} series - Données avec BB (bbUpper, bbMiddle, bbLower)
 * @param {number} currentPrice - Prix actuel
 * @returns {object} - Signal BB { signal, strength, reason }
 */
export function analyzeBollingerBands(series, currentPrice) {
  if (!series || series.length === 0) {
    return { signal: null, strength: 0, reason: null };
  }

  // Prendre les dernières données
  const latest = series[series.length - 1];
  const { bbUpper, bbMiddle, bbLower } = latest;

  if (!bbUpper || !bbMiddle || !bbLower) {
    return { signal: null, strength: 0, reason: null };
  }

  const price = currentPrice || latest.c;
  const bandwidth = bbUpper - bbLower;
  const position = (price - bbLower) / bandwidth; // 0 = bas, 1 = haut

  // Signaux
  if (position < 0.1) {
    // Prix proche de la bande inférieure = survente
    return {
      signal: 'BUY',
      strength: Math.min(100, (0.1 - position) * 1000),
      reason: `Prix proche BB inférieure (${(position * 100).toFixed(1)}%) - Survente`,
    };
  } else if (position > 0.9) {
    // Prix proche de la bande supérieure = surachat
    return {
      signal: 'SELL',
      strength: Math.min(100, (position - 0.9) * 1000),
      reason: `Prix proche BB supérieure (${(position * 100).toFixed(1)}%) - Surachat`,
    };
  } else if (position >= 0.45 && position <= 0.55) {
    // Prix au milieu = neutre
    return {
      signal: 'HOLD',
      strength: 30,
      reason: `Prix près de BB moyenne (${(position * 100).toFixed(1)}%) - Zone neutre`,
    };
  }

  return { signal: null, strength: 0, reason: null };
}

/**
 * Calcule un score de confluence technique
 * Combine RSI, BB, Fibonacci pour un signal plus robuste
 * @param {object} params - { rsi, bbSignal, fibSignal, change24h }
 * @returns {object} - { action, confidence, reasons }
 */
export function calculateConfluence({ rsi, bbSignal, fibSignal, change24h }) {
  const reasons = [];
  let buyScore = 0;
  let sellScore = 0;

  // 1. RSI (30 points max)
  if (rsi) {
    if (rsi < 30) {
      buyScore += 25;
      reasons.push(`RSI oversold (${rsi.toFixed(1)})`);
    } else if (rsi > 70) {
      sellScore += 25;
      reasons.push(`RSI overbought (${rsi.toFixed(1)})`);
    } else if (rsi >= 45 && rsi <= 55) {
      reasons.push(`RSI neutre (${rsi.toFixed(1)})`);
    }
  }

  // 2. Bollinger Bands (30 points max)
  if (bbSignal && bbSignal.signal) {
    if (bbSignal.signal === 'BUY') {
      buyScore += Math.min(30, bbSignal.strength);
      reasons.push(bbSignal.reason);
    } else if (bbSignal.signal === 'SELL') {
      sellScore += Math.min(30, bbSignal.strength);
      reasons.push(bbSignal.reason);
    }
  }

  // 3. Fibonacci (20 points max)
  if (fibSignal && fibSignal.signal) {
    if (fibSignal.signal === 'BUY') {
      buyScore += 20;
      reasons.push(fibSignal.reason);
    } else if (fibSignal.signal === 'SELL') {
      sellScore += 20;
      reasons.push(fibSignal.reason);
    }
  }

  // 4. Momentum 24h (20 points max)
  if (typeof change24h === 'number') {
    const absChange = Math.abs(change24h);
    if (change24h > 5) {
      buyScore += Math.min(20, absChange * 2);
      reasons.push(`Fort momentum haussier (+${change24h.toFixed(1)}%)`);
    } else if (change24h < -5) {
      sellScore += Math.min(20, absChange * 2);
      reasons.push(`Fort momentum baissier (${change24h.toFixed(1)}%)`);
    }
  }

  // Déterminer l'action
  let action = 'HOLD';
  let confidence = 50;

  if (buyScore > sellScore && buyScore > 40) {
    action = 'BUY';
    confidence = Math.min(95, 50 + buyScore);
  } else if (sellScore > buyScore && sellScore > 40) {
    action = 'SELL';
    confidence = Math.min(95, 50 + sellScore);
  }

  return {
    action,
    confidence: Math.round(confidence),
    reasons,
    scores: { buy: Math.round(buyScore), sell: Math.round(sellScore) },
  };
}

/**
 * Analyse la position du prix par rapport aux niveaux de Fibonacci
 * @param {number} currentPrice - Prix actuel
 * @param {object} fibonacci - Résultat de calculateFibonacciLevels
 * @returns {object} - { signal, reason }
 */
export function analyzeFibonacciPosition(currentPrice, fibonacci) {
  if (!fibonacci || !fibonacci.levels || fibonacci.levels.length === 0) {
    return { signal: null, reason: null };
  }

  const { trend, levels, goldenRatio } = fibonacci;
  const tolerance = 0.02; // 2% de tolérance

  // Vérifier si le prix est proche du golden ratio (61.8%)
  const priceRatio = Math.abs(currentPrice - goldenRatio) / goldenRatio;

  if (priceRatio < tolerance) {
    if (trend === 'UPTREND') {
      return {
        signal: 'BUY',
        reason: `Prix au niveau Fibonacci 61.8% (support clé)`,
      };
    } else {
      return {
        signal: 'SELL',
        reason: `Prix au niveau Fibonacci 61.8% (résistance clé)`,
      };
    }
  }

  // Vérifier 38.2% (niveau secondaire)
  const fib38 = levels[2];
  const price38Ratio = Math.abs(currentPrice - fib38) / fib38;

  if (price38Ratio < tolerance) {
    if (trend === 'UPTREND') {
      return {
        signal: 'BUY',
        reason: `Prix au niveau Fibonacci 38.2% (support)`,
      };
    }
  }

  return { signal: null, reason: null };
}
