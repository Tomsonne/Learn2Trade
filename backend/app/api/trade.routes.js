//buy/sell virtuels, historique des trades.
// app/api/trade.routes.js
import express from "express";
import { openTrade, closeTrade, getTrades } from "../controllers/trade.controller.js";

const router = express.Router();

// Créer un trade
router.post("/", openTrade);

// Fermer un trade
router.put("/:id/close", closeTrade);

// Liste des trades utilisateur
router.get("/", getTrades);

export default router;
