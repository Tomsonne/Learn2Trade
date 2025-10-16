// app/services/position.service.js
import Decimal from "decimal.js";
import binance from "binance-api-node";
import models from "../models/index.js";
import { fn, col, literal } from "sequelize";

const { Trade, Asset } = models;
const client = binance.default(); // endpoints publics

// Agrège les TRADES ouverts -> positions + last price + PnL latent
export async function listPositionsWithMarket(userId) {
  if (!userId) return [];

  // 1) Agrégation DB : somme qty et notional (qty * price_open) par asset_id
  const grouped = await Trade.findAll({
    where: { user_id: userId, is_closed: false },
    attributes: [
      "asset_id",
      [fn("SUM", col("quantity")), "quantity"],
      [fn("SUM", literal("quantity * price_open")), "notional"],
    ],
    group: ["asset_id"],
    order: [["asset_id", "ASC"]],
    raw: true,
  });

  if (!grouped.length) return [];

  // 2) Assets pour récupérer les symbols Binance
  const assetIds = grouped.map(g => g.asset_id);
  const assets = await Asset.findAll({
    where: { id: assetIds },
    attributes: ["id", "symbol"],
    raw: true,
  });
  const assetMap = new Map(assets.map(a => [a.id, a]));

  // 3) Prix marché (tickers) — on prend tous puis on filtre les nécessaires
  const symbols = [...new Set(assets.map(a => a.symbol).filter(Boolean))];
  const tickers = await client.prices({});
  const lastBySymbol = {};
  for (const s of symbols) if (tickers[s]) lastBySymbol[s] = new Decimal(tickers[s]);

  // 4) Compose la réponse
  return grouped.map(r => {
    const a = assetMap.get(r.asset_id);
    const symbol = a?.symbol;
    const qty = new Decimal(r.quantity || "0");
    const notional = new Decimal(r.notional || "0");
    const avg = qty.eq(0) ? new Decimal(0) : notional.div(qty);
    const last = symbol && lastBySymbol[symbol] ? lastBySymbol[symbol] : new Decimal(0);

    const value = last.mul(qty);
    const pnlAbs = last.minus(avg).mul(qty);
    const pnlPct = avg.eq(0) ? new Decimal(0) : last.minus(avg).div(avg).mul(100);

    return {
      asset_id: r.asset_id,
      symbol,
      name: symbol, // fallback
      quantity: qty.toString(),
      avg_price: avg.toFixed(8),
      last_price: last.toString(),
      value: value.toString(),
      unrealized_pnl_abs: pnlAbs.toString(),
      unrealized_pnl_pct: pnlPct.toFixed(2),
    };
  });
}
