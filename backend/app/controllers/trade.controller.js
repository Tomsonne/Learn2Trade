import Trade from "../models/trade.model.js";
import Asset from "../models/asset.model.js";
import * as tradeService from "../services/trade.service.js";


export async function getTradesByUser(req, res) {
  try {
    const { userId } = req.params;

    const trades = await Trade.findAll({
      where: { user_id: userId, is_closed: false },
      include: [{ model: Asset, as: "asset" }],
      order: [["opened_at", "DESC"]],
    });

    if (!trades.length) {
      return res.status(200).json([]); // pas d’erreur si vide
    }

    res.json(trades);
  } catch (err) {
    console.error("Erreur getTradesByUser:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}


export async function createTrade(req, res) {
  try {
    const { user_id, asset_id, side, quantity } = req.body;

    const trade = await tradeService.openTrade(user_id, { asset_id, side, quantity });

    res.status(201).json(trade);
  } catch (err) {
    console.error("Erreur createTrade:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}


export async function closeTrade(req, res) {
  try {
    const { tradeId } = req.params;
    const trade = await Trade.findByPk(tradeId, { include: [{ model: Asset, as: "asset" }] });

    if (!trade) return res.status(404).json({ error: "Trade non trouvé" });
    if (trade.is_closed) return res.status(400).json({ error: "Trade déjà fermé" });

    // On simule la fermeture au prix actuel de l’actif
    trade.is_closed = true;
    trade.close_price = trade.asset.price;
    trade.closed_at = new Date();
    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error("Erreur closeTrade:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
