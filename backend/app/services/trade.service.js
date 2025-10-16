// app/services/trade.service.js
import models from "../models/index.js";
import Decimal from "decimal.js";
import { ValidationError } from "../utils/errors.js";
import binance from "binance-api-node";
import sequelize from "../core/db.js";

const client = binance.default(); // endpoints publics

async function getMarketPriceDecimal(symbol) {
  try {
    const prices = await client.prices({ symbol });
    const p = prices?.[symbol];
    if (!p) throw new Error(`no price for ${symbol}`);
    return new Decimal(p);
  } catch {
    throw new ValidationError(`Impossible de récupérer le prix du marché (${symbol})`);
  }
}

const { Trade, User, Asset } = models;

/** Ouvre un trade (BUY ou SELL) — gère le cash si BUY */
export async function openTrade(userId, { asset_id, side, quantity }) {
  if (!userId || !asset_id || !side || !quantity) throw new ValidationError("Champs manquants");
  const qty = new Decimal(quantity);
  if (qty.lte(0)) throw new ValidationError("quantity doit être > 0");
  if (!["BUY", "SELL"].includes(side)) throw new ValidationError("side invalide");

  return sequelize.transaction(async (tx) => {
    const user = await User.findByPk(userId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!user) throw new ValidationError("Utilisateur introuvable");

    const asset = await Asset.findByPk(asset_id, { transaction: tx });
    if (!asset) throw new ValidationError("Actif introuvable");

    const symbol = asset.symbol || "BTCUSDT";
    const priceOpen = await getMarketPriceDecimal(symbol); // Decimal
    // Le notional représente la valeur totale de la position sur le marché.
    const notional = priceOpen.mul(qty);                   // Decimal
    const userCash = new Decimal(user.cash || "0");

    // Gestion du cash: on débite seulement pour BUY; (pour SELL à nu, on ne débite pas)
    if (side === "BUY") {
      if (userCash.lt(notional)) throw new ValidationError("Solde insuffisant");
      user.cash = userCash.minus(notional).toString();
      await user.save({ transaction: tx });
    }

    const trade = await Trade.create(
      {
        user_id: userId,
        asset_id,
        side,
        price_open: priceOpen.toString(), // stocker en string pour DECIMAL SQL
        quantity: qty.toString(),
        opened_at: new Date(),
        is_closed: false,
      },
      { transaction: tx }
    );

    return trade;
  });
}

/** Clôture un trade — crédite le cash pour BUY; calcule le PnL; marque fermé */
// app/services/trade.service.js
export async function closeTrade(tradeId) {
  if (!tradeId) throw new ValidationError("tradeId manquant");

  return sequelize.transaction(async (tx) => {
    // 1) Lock UNIQUEMENT la ligne Trade (pas d'include ici)
    const trade = await Trade.findByPk(tradeId, {
      transaction: tx,
      lock: tx.LOCK.UPDATE, // lock sur Trade uniquement
    });
    if (!trade) throw new ValidationError("Trade introuvable");
    if (trade.is_closed) throw new ValidationError("Trade déjà clôturé");

    // 2) Récupère l'asset sans lock/join
    const asset = await models.Asset.findByPk(trade.asset_id, { transaction: tx });

    // 3) Lock l'utilisateur séparément
    const user = await User.findByPk(trade.user_id, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });
    if (!user) throw new ValidationError("Utilisateur introuvable");

    // 4) Prix marché
    const symbol = asset?.symbol || "BTCUSDT";
    const priceClose = await getMarketPriceDecimal(symbol);

    const priceOpen = new Decimal(trade.price_open);
    const qty = new Decimal(trade.quantity);

    const pnl =
      trade.side === "BUY"
        ? priceClose.minus(priceOpen).mul(qty)
        : priceOpen.minus(priceClose).mul(qty);

    // Créditer le cash à la clôture (produit de la vente)
    const credit = priceClose.mul(qty);
    user.cash = new Decimal(user.cash || "0").plus(credit).toString();
    await user.save({ transaction: tx });

    trade.price_close = priceClose.toString();
    trade.pnl = pnl.toString();
    trade.is_closed = true;
    trade.closed_at = new Date();
    await trade.save({ transaction: tx });

    return trade;
  });
}


export async function getTradesByUser({ userId, is_closed, assetId }) {
  const { Trade, Asset } = (await import("../models/index.js")).default;
  if (!userId) throw new Error("userId requis");
  const where = { user_id: userId };
  if (typeof is_closed !== "undefined") where.is_closed = is_closed === true || is_closed === "true";
  if (assetId) where.asset_id = Number(assetId);

  return Trade.findAll({
    where,
    order: [["opened_at", "DESC"]],
    include: [{ model: Asset, as: "asset", attributes: ["id", "symbol"] }],
  });
}
