// app/api/trade.routes.js
import { Router } from "express";
import * as tradeController from "../controllers/trade.controller.js";
import { verifyAuth } from "./middlewares/auth.middleware.js";

const router = Router();

// 🟢 Récupère toutes les positions de l'utilisateur connecté
router.get("/user/:userId", verifyAuth, tradeController.getTradesByUser);

// 🟣 Crée un nouveau trade
router.post("/", verifyAuth, tradeController.createTrade);

// 🔴 Ferme un trade existant
router.put("/:tradeId/close", verifyAuth, tradeController.closeTrade);

export default router;
