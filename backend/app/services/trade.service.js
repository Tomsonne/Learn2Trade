// app/services/trade.service.js
import models from "../models/index.js";
import Decimal from "decimal.js";
import { ValidationError } from "../utils/errors.js";
import binance from "binance-api-node";
const client = binance.default(); // ✅ pour ESM



const { Trade, User } = models;

export async function openTrade(userId, { asset_id, side, quantity }) {
  const user = await User.findByPk(userId);
  if (!user) throw new ValidationError("Utilisateur introuvable");

  const asset = await models.Asset.findByPk(asset_id);
  if (!asset) throw new ValidationError("Actif introuvable");

  // 💹 Récupère le prix réel du marché via Binance
  const symbol = asset.symbol || "BTCUSDT";
  const ticker = await client.prices({ symbol });
  const marketPrice = parseFloat(ticker[symbol]);
  if (!marketPrice) throw new ValidationError("Impossible de récupérer le prix du marché");

  const cost = new Decimal(marketPrice).mul(quantity);

  if (side === "BUY" && new Decimal(user.cash).lt(cost)) {
    throw new ValidationError("Solde insuffisant");
  }

  if (side === "BUY") {
    user.cash = new Decimal(user.cash).minus(cost);
    await user.save();
  }

  const trade = await Trade.create({
    user_id: userId,
    asset_id,
    side,
    price_open: marketPrice, // ✅ prix réel du marché
    quantity,
    opened_at: new Date(),
    is_closed: false
  });

  return trade;
}



export async function closeTrade(tradeId) {
  const trade = await Trade.findByPk(tradeId, {
    include: [{ model: models.Asset, as: "asset" }], // ✅ alias ajouté
  });
  if (!trade) throw new ValidationError("Trade introuvable");
  if (trade.is_closed) throw new ValidationError("Trade déjà clôturé");

  const symbol = trade.asset?.symbol || "BTCUSDT";
  const ticker = await client.prices({ symbol });
  const marketPrice = parseFloat(ticker[symbol]);
  if (!marketPrice) throw new ValidationError("Impossible de récupérer le prix du marché");

  const priceOpen = new Decimal(trade.price_open);
  const priceClose = new Decimal(marketPrice);
  const quantity = new Decimal(trade.quantity);

  const pnl =
    trade.side === "BUY"
      ? priceClose.minus(priceOpen).mul(quantity)
      : priceOpen.minus(priceClose).mul(quantity);

  trade.price_close = marketPrice;
  trade.pnl = pnl;
  trade.is_closed = true;
  trade.closed_at = new Date();

  await trade.save();

  console.log(`🔹 Trade ${trade.id} fermé à ${marketPrice} (${symbol}) — PnL: ${pnl.toFixed(2)}`);

  return trade;
}
