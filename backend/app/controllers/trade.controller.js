// app/controllers/trade.controller.js
import * as TradeService from "../services/trade.service.js"; //chemin + .js

export async function openTrade(req, res) {
  try {
    const userId = req.body.user_id; // ou req.user?.id plus tard
    const trade = await TradeService.openTrade(userId, req.body);
    res.status(201).json(trade);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

export async function closeTrade(req, res) {
  try {
    const tradeId = req.params.id;
    const trade = await TradeService.closeTrade(tradeId);
    res.status(200).json(trade);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

//  getTradesByUser attend un objet : { userId, is_closed?, assetId? }
export async function getTrades(req, res) {
  try {
    const userId = req.query.userId || req.user?.id; // lisible via query
    const { is_closed, assetId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    const trades = await TradeService.getTradesByUser({ userId, is_closed, assetId });
    res.status(200).json({ data: trades });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}