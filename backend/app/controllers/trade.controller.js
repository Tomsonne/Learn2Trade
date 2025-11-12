import * as TradeService from "../services/trade.service.js";

export async function openTrade(req, res) {
  try {
    const userId = req.body.user_id;
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
    const { quantity } = req.body; // permet la fermeture partielle
    const result = await TradeService.closeTrade(tradeId, quantity);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

export async function getTrades(req, res) {
  try {
    const userId = req.query.userId || req.user?.id;
    const { is_closed, assetId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    const trades = await TradeService.getTradesByUser({ userId, is_closed, assetId });
    res.status(200).json({ data: trades });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
