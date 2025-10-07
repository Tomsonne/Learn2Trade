import { Router } from "express";
import marketRoutes from "./market.routes.js";
import newsRoutes from "./news.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// Routes principales
router.use("/market", marketRoutes); // prix, forex, etc.
router.use("/news", newsRoutes);
router.use("/auth", authRoutes);

export default router;
