// backend/app/api/snapshot.routes.js
import { Router } from "express";
import {
  getMySnapshotHistory,
  createMySnapshot,
  getMyPortfolioMetrics,
  createAllUsersSnapshots,
} from "../controllers/snapshot.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes protégées (nécessitent authentification)
router.use(authenticate);

/**
 * GET /api/v1/snapshots/history?days=30
 * Récupère l'historique des snapshots
 */
router.get("/history", getMySnapshotHistory);

/**
 * GET /api/v1/snapshots/metrics
 * Récupère les métriques actuelles du portfolio
 */
router.get("/metrics", getMyPortfolioMetrics);

/**
 * POST /api/v1/snapshots/create
 * Crée un snapshot manuel
 * Body: { date?: "2025-01-16" }
 */
router.post("/create", createMySnapshot);

/**
 * POST /api/v1/admin/snapshots/create-all
 * [ADMIN ONLY] Crée des snapshots pour tous les utilisateurs
 * Body: { date?: "2025-01-16" }
 */
router.post("/admin/create-all", createAllUsersSnapshots);

export default router;
