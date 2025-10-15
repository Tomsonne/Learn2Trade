// app/services/position.service.js
import Decimal from "decimal.js";
import binance from "binance-api-node";
import models from "../models/index.js";

const { Position, Asset } = models;
const client = binance.default();

export async function listPositionsWithMarket(userId) {
  const positions = await Position.findAll({
    where: { user_id: userId },
    order: [["asset_id", "ASC"]],
  });
  if (!positions.length) return [];

  const assetIds = [...new Set(positions.map(p => p.asset_id))];

  // ⬇️ ne demande plus "name"
  const assets = await Asset.findAll({
    where: { id: assetIds },
    attributes: ["id", "symbol"], // <-- seulement colonnes existantes
  });
  const assetMap = new Map(assets.map(a => [a.id, a]));

  const symbols = [...new Set(assets.map(a => a.symbol).filter(Boolean))];
  const prices = await client.prices({});
  const lastBySymbol = {};
  for (const s of symbols) if (prices[s]) lastBySymbol[s] = new Decimal(prices[s]);

  return positions.map(p => {
    const a = assetMap.get(p.asset_id);
    const symbol = a?.symbol;
    const label = symbol; // ⬅️ fallback: pas de "name" → on affiche le symbol
    const qty = new Decimal(p.quantity);
    const avg = new Decimal(p.avg_price);
    const last = symbol && lastBySymbol[symbol] ? lastBySymbol[symbol] : new Decimal(0);

    const value = last.mul(qty);
    const pnlAbs = last.minus(avg).mul(qty);
    const pnlPct = avg.eq(0) ? new Decimal(0) : last.minus(avg).div(avg).mul(100);

    return {
      asset_id: p.asset_id,
      symbol,
      name: label,                 // ⬅️ renvoyé pour le front, = symbol
      quantity: qty.toString(),
      avg_price: avg.toString(),
      last_price: last.toString(),
      value: value.toString(),
      unrealized_pnl_abs: pnlAbs.toString(),
      unrealized_pnl_pct: pnlPct.toFixed(2),
    };
  });
}
