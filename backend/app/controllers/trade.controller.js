//exécution et suivi des ordres.
// app/controllers/trade.controller.js
import * as TradeService from "../services/trade.service.js";

export async function openTrade(req, res) {
  try {
    // Utilise le user_id du body (tant qu’il n’y a pas d’auth)
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
    const trade = await TradeService.closeTrade(tradeId); // 👈 on ne passe plus de close_price ici
    res.status(200).json(trade);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}


export async function getTrades(req, res) {
  try {
    const userId = req.user?.id || 1;
    const trades = await TradeService.getTradesByUser(userId);
    res.status(200).json(trades);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

