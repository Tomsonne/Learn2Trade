
const n = (v) => Number(v ?? 0);

/**
 * Recompose les quantités nettes encore ouvertes par pair.
 * - Pour chaque trade BUY: +qty
 * - Si is_closed: -qty (la ligne est clôturée)
 * @returns {Record<string, number>} ex: { "BTC/USD": 0.25, "ETH/USD": 1.2 }
 */
export function positionsFromTradesSingleRow(trades = []) {
  const byPair = {};
  for (const t of trades) {
    if ((t.side || "BUY") !== "BUY") continue;        // modèle tout en BUY
    const pair = t.pair || t.symbol || t.ticker;
    if (!pair) continue;
    const qty = n(t.quantity);
    byPair[pair] = (byPair[pair] || 0) + qty;
    if (t.is_closed) byPair[pair] -= qty;
  }
  // Nettoie les zéros/negatifs résiduels
  Object.keys(byPair).forEach((k) => {
    if (!byPair[k] || byPair[k] <= 0) delete byPair[k];
  });
  return byPair;
}

export function positionsMapToArray(map) {
  return Object.entries(map).map(([pair, quantity]) => ({ pair, quantity }));
}
