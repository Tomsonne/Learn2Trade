import { Router } from "express";
import marketRoutes from "./market.routes.js";
import newsRoutes from "./news.routes.js";
import authRoutes from "./auth.routes.js";
import positionRoutes from "./position.routes.js"
import tradeRoutes from"./trade.routes.js"
import assetRoutes from "./asset.route.js";
import snapshotRoutes from "./snapshot.routes.js";

const router = Router();

// Routes principales
router.use("/market", marketRoutes); // prix, forex, etc.
router.use("/news", newsRoutes);
router.use("/auth", authRoutes);
router.use("/position", positionRoutes);
router.use("/trade", tradeRoutes);
router.use("/assets", assetRoutes);
router.use("/snapshots", snapshotRoutes);


export default router;