// backend/app/controllers/snapshot.controller.js
import {
  createPortfolioSnapshot,
  createAllSnapshots,
  getSnapshotHistory,
  calculatePortfolioMetrics,
} from "../services/snapshot.service.js";

/**
 * GET /api/v1/snapshots/history
 * Récupère l'historique des snapshots de l'utilisateur connecté
 */
export async function getMySnapshotHistory(req, res) {
  try {
    const userId = req.user.id; // Depuis le middleware d'auth
    const days = parseInt(req.query.days) || 30;

    const snapshots = await getSnapshotHistory(userId, days);

    return res.json({
      success: true,
      data: snapshots,
      count: snapshots.length,
    });
  } catch (error) {
    console.error("Error getting snapshot history:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve snapshot history",
      message: error.message,
    });
  }
}

/**
 * POST /api/v1/snapshots/create
 * Crée un snapshot manuel pour l'utilisateur connecté
 */
export async function createMySnapshot(req, res) {
  try {
    const userId = req.user.id;
    const snapshotDate = req.body.date ? new Date(req.body.date) : new Date();

    const snapshot = await createPortfolioSnapshot(userId, snapshotDate);

    return res.status(201).json({
      success: true,
      data: snapshot,
      message: "Snapshot created successfully",
    });
  } catch (error) {
    console.error("Error creating snapshot:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create snapshot",
      message: error.message,
    });
  }
}

/**
 * GET /api/v1/snapshots/metrics
 * Récupère les métriques actuelles du portfolio (sans créer de snapshot)
 */
export async function getMyPortfolioMetrics(req, res) {
  try {
    const userId = req.user.id;

    const metrics = await calculatePortfolioMetrics(userId);

    return res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error calculating metrics:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to calculate portfolio metrics",
      message: error.message,
    });
  }
}

/**
 * POST /api/v1/admin/snapshots/create-all
 * [ADMIN ONLY] Crée des snapshots pour tous les utilisateurs
 */
export async function createAllUsersSnapshots(req, res) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!req.user.is_admin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    const snapshotDate = req.body.date ? new Date(req.body.date) : new Date();

    const result = await createAllSnapshots(snapshotDate);

    return res.status(201).json({
      success: true,
      data: {
        snapshots_created: result.snapshots.length,
        errors: result.errors.length,
        error_details: result.errors,
      },
      message: `Created ${result.snapshots.length} snapshots`,
    });
  } catch (error) {
    console.error("Error creating all snapshots:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create snapshots",
      message: error.message,
    });
  }
}

export default {
  getMySnapshotHistory,
  createMySnapshot,
  getMyPortfolioMetrics,
  createAllUsersSnapshots,
};
