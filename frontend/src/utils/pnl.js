// src/utils/pnl.js
const n = v => Number(v ?? 0);

/**
 * Agrège le portefeuille:
 * - Investi = somme des coûts encore ouverts (qty * price_open)
 * - ValeurCourante = somme (qty_ouvertes * lastPrice)
 * - Realized = somme des (qty * (price_close - price_open)) sur trades fermés
 * - Unrealized = ValeurCourante - Investi
 */
export function computePnL(trades = [], lastPrices = {}) {
  const openAgg = {};  // par symbole: { qty, cost }
  let realized = 0;

  for (const t of trades) {
    if (t.side !== "BUY") continue;

    const sym = t.symbol;
    const qty = n(t.quantity);
    const o   = n(t.price_open);

    if (t.is_closed) {
      const c = n(t.price_close);
      realized += qty * (c - o);
      // Rien à garder en "ouvert"
    } else {
      if (!openAgg[sym]) openAgg[sym] = { qty: 0, cost: 0 };
      openAgg[sym].qty  += qty;
      openAgg[sym].cost += qty * o;
    }
  }

  let invested = 0;
  let currentValue = 0;

  for (const [sym, { qty, cost }] of Object.entries(openAgg)) {
    invested += cost;
    const px = n(lastPrices[sym]);
    currentValue += qty * px;
  }

  const unrealized = currentValue - invested;
  const pnlTotal = realized + unrealized;

  return { invested, currentValue, realized, unrealized, pnlTotal };
}
