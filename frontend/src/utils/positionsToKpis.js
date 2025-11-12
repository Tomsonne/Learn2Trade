// Attend un tableau comme ton JSON: { quantity, avg_price, value, unrealized_pnl_abs, ... }
const toNum = (v) =>
  v == null ? 0 : Number(String(v).replace(/\s/g, "").replace("€","").replace(",", "."));

export default function positionsToKpis(positions = [], cashUsd = 0) {
  const equity   = positions.reduce((s, p) => s + toNum(p.value), 0);
  const pnlAbs   = positions.reduce((s, p) => s + toNum(p.unrealized_pnl_abs), 0);
  const invested = positions.reduce((s, p) => s + toNum(p.avg_price) * toNum(p.quantity), 0);

  const balance = toNum(cashUsd) + equity;
  const pnlPct  = invested ? (pnlAbs / invested) * 100 : 0;

  return { balance, pnlAbs, pnlPct, cash: toNum(cashUsd), invested, equity };
}
