
import { Router } from "express";
import { openTrade, closeTrade, getTrades } from "../controllers/trade.controller.js";

const router = Router();

// GET /api/v1/trade?userId=... [&is_closed=true|false&assetId=2]
router.get("/", getTrades);

// POST /api/v1/trade/open
router.post("/open", openTrade);

// POST /api/v1/trade/:id/close
router.post("/:id/close", closeTrade);

export default router;
