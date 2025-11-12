import models from "../models/index.js";
import Decimal from "decimal.js";
import { ValidationError } from "../utils/errors.js";
import binance from "binance-api-node";
import sequelize from "../core/db.js";

const client = binance.default();
const { Trade, User, Asset } = models;

// ===========================
//  Récupère le prix marché
// ===========================
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

// ===========================
//  Ouvre un trade
// ===========================
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
    const priceOpen = await getMarketPriceDecimal(symbol);
    const notional = priceOpen.mul(qty);
    const userCash = new Decimal(user.cash || "0");

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
        price_open: priceOpen.toString(),
        quantity: qty.toString(),
        opened_at: new Date(),
        is_closed: false,
      },
      { transaction: tx }
    );

    return trade;
  });
}

// ===========================
//  Ferme (partiellement ou totalement) un trade
// ===========================
export async function closeTrade(tradeId, quantityToClose) {
  if (!tradeId) throw new ValidationError("tradeId manquant");

  return sequelize.transaction(async (tx) => {
    // Récupère le trade d’origine
    const trade = await Trade.findByPk(tradeId, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });
    if (!trade) throw new ValidationError("Trade introuvable");
    if (trade.is_closed) throw new ValidationError("Trade déjà clôturé");

    const asset = await Asset.findByPk(trade.asset_id, { transaction: tx });
    const user = await User.findByPk(trade.user_id, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!asset) throw new ValidationError("Actif introuvable");
    if (!user) throw new ValidationError("Utilisateur introuvable");

    // Quantité à fermer
    const fullQty = new Decimal(trade.quantity);
    const closeQty = new Decimal(quantityToClose || trade.quantity);
    if (closeQty.lte(0) || closeQty.gt(fullQty))
      throw new ValidationError("Quantité invalide pour la fermeture");

    // Prix marché
    const symbol = asset.symbol || "BTCUSDT";
    const priceClose = await getMarketPriceDecimal(symbol);
    const priceOpen = new Decimal(trade.price_open);

    // Calcul du PnL
    const pnlPerUnit =
      trade.side === "BUY"
        ? priceClose.minus(priceOpen)
        : priceOpen.minus(priceClose);
    const pnl = pnlPerUnit.mul(closeQty);

    // Crédit utilisateur
    const credit = priceClose.mul(closeQty);
    user.cash = new Decimal(user.cash || "0").plus(credit).toString();
    await user.save({ transaction: tx });

    // Crée la ligne fermée (historique)
    const closedTrade = await Trade.create(
      {
        user_id: trade.user_id,
        asset_id: trade.asset_id,
        side: trade.side,
        quantity: closeQty.toString(),
        price_open: priceOpen.toString(),
        price_close: priceClose.toString(),
        pnl: pnl.toString(),
        is_closed: true,
        opened_at: trade.opened_at,
        closed_at: new Date(),
      },
      { transaction: tx }
    );

    // Met à jour ou supprime le trade d'origine
    const remainingQty = fullQty.minus(closeQty);
    if (remainingQty.lte(0)) {
      // Fermeture totale → on supprime le trade d’origine
      await trade.destroy({ transaction: tx });
    } else {
      // Fermeture partielle → on met à jour la quantité restante
      trade.quantity = remainingQty.toString();
      await trade.save({ transaction: tx });
    }

    return {
      message: remainingQty.lte(0)
        ? "Trade entièrement fermé"
        : `Fermeture partielle (${closeQty.toString()}) effectuée`,
      closed_trade: closedTrade,
      remaining_quantity: remainingQty.toString(),
    };
  });
}

// ===========================
//  Récupère les trades d’un user
// ===========================
export async function getTradesByUser({ userId, is_closed, assetId }) {
  if (!userId) throw new Error("userId requis");
  const where = { user_id: userId };
  if (typeof is_closed !== "undefined")
    where.is_closed = is_closed === true || is_closed === "true";
  if (assetId) where.asset_id = Number(assetId);

  const trades = await Trade.findAll({
    where,
    order: [["opened_at", "DESC"]],
    include: [{ model: Asset, as: "asset", attributes: ["id", "symbol"] }],
  });

  // Ajoute ici le calcul du PnL %
  for (const t of trades) {
    const entry = parseFloat(t.price_open);
    const qty = parseFloat(t.quantity);
    const pnl = parseFloat(t.pnl);

    if (!Number.isFinite(entry) || !Number.isFinite(qty) || !Number.isFinite(pnl)) {
      t.setDataValue("pnl_pct", 0);
      continue;
    }

    const invested = entry * qty;
    const pct = invested !== 0 ? (pnl / invested) * 100 : 0;
    t.setDataValue("pnl_pct", Number(pct.toFixed(2))); // stocké virtuellement dans la réponse
  }

  return trades;
}
