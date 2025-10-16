import { Router } from "express";
import marketRoutes from "./market.routes.js";
import newsRoutes from "./news.routes.js";
import authRoutes from "./auth.routes.js";
import assetRoutes from "./asset.route.js";
import tradeRoutes from "./trade.routes.js";

const router = Router();

router.use("/market", marketRoutes);
router.use("/news", newsRoutes);
router.use("/auth", authRoutes);
router.use("/assets", assetRoutes);
router.use("/trades", tradeRoutes);

export default router;
