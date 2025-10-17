// src/utils/cashFromTrades.js
const n = (v) => Number(v ?? 0);

/**
 * Long-only, pas de frais :
 * - À l'ouverture (BUY, is_closed=false) : cash -= qty * price_open
 * - À la clôture  (BUY, is_closed=true)  : cash -= qty * price_open puis cash += qty * price_close
 *    (donc sur une ligne fermée, on applique les deux mouvements)
 */
export function cashFromTradesSingleRow(trades = [], initialCashUsd = 0) {
  let cash = n(initialCashUsd);

  for (const t of trades) {
    if (t.side !== "BUY") continue; // schéma "tout en BUY"
    const qty   = n(t.quantity);
    const open  = n(t.price_open);
    cash -= qty * open; // toute ouverture consomme du cash
    if (t.is_closed) {
      const close = n(t.price_close);
      cash += qty * close; // restitution à la clôture
    }
  }
  return cash;
}
