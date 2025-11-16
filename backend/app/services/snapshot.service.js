// backend/app/services/snapshot.service.js
// Service pour créer et gérer les snapshots du portfolio

import models from "../models/index.js";
import { Op } from "sequelize";

const { User, Position, Trade, PortfolioSnapshot, PositionHistory, Asset } = models;

/**
 * Calcule les métriques du portfolio pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Date} snapshotDate - Date du snapshot (défaut: aujourd'hui)
 * @returns {Object} Métriques du portfolio
 */
export async function calculatePortfolioMetrics(userId, snapshotDate = new Date()) {
  // Récupérer l'utilisateur
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const cash = parseFloat(user.cash);
  const initialBalance = parseFloat(user.initial_balance || user.cash);

  // Récupérer toutes les positions ouvertes
  const positions = await Position.findAll({
    where: { user_id: userId, quantity: { [Op.gt]: 0 } },
    include: [{ model: Asset, as: "asset" }],
  });

  // Calculer l'equity (valeur des positions)
  // Note: Pour l'instant on utilise avg_price, il faudrait les prix actuels du marché
  let equity = 0;
  const positionDetails = [];

  for (const position of positions) {
    const quantity = parseFloat(position.quantity);
    const avgPrice = parseFloat(position.avg_price);
    // TODO: Récupérer le prix actuel du marché via une API
    const currentPrice = avgPrice; // Approximation pour le MVP

    const marketValue = quantity * currentPrice;
    const unrealizedPnl = (currentPrice - avgPrice) * quantity;
    const unrealizedPnlPercent = avgPrice !== 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

    equity += marketValue;

    positionDetails.push({
      asset_id: position.asset_id,
      symbol: position.asset?.symbol,
      quantity,
      avg_price: avgPrice,
      current_price: currentPrice,
      market_value: marketValue,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
    });
  }

  const totalValue = cash + equity;

  // Calculer le PnL réalisé (trades fermés)
  const closedTrades = await Trade.findAll({
    where: {
      user_id: userId,
      is_closed: true,
      closed_at: { [Op.ne]: null },
    },
  });

  const realizedPnl = closedTrades.reduce((sum, trade) => {
    return sum + parseFloat(trade.pnl || 0);
  }, 0);

  // Calculer le PnL non réalisé (positions ouvertes)
  const unrealizedPnl = positionDetails.reduce((sum, pos) => {
    return sum + pos.unrealized_pnl;
  }, 0);

  const totalPnl = realizedPnl + unrealizedPnl;

  // Calculer le rendement total en %
  const totalReturnPercent = initialBalance !== 0 ? ((totalValue - initialBalance) / initialBalance) * 100 : 0;

  // Calculer le win rate
  const winningTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
  const totalTrades = closedTrades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Calculer le daily PnL (différence avec le snapshot précédent)
  const previousDate = new Date(snapshotDate);
  previousDate.setDate(previousDate.getDate() - 1);

  const previousSnapshot = await PortfolioSnapshot.findOne({
    where: {
      user_id: userId,
      snapshot_date: previousDate.toISOString().split('T')[0],
    },
  });

  let dailyPnl = 0;
  let dailyPnlPercent = 0;

  if (previousSnapshot) {
    const prevTotalValue = parseFloat(previousSnapshot.total_value);
    dailyPnl = totalValue - prevTotalValue;
    dailyPnlPercent = prevTotalValue !== 0 ? (dailyPnl / prevTotalValue) * 100 : 0;
  }

  // Calculer le max drawdown (simplifié - sur les snapshots existants)
  const allSnapshots = await PortfolioSnapshot.findAll({
    where: { user_id: userId },
    order: [['snapshot_date', 'ASC']],
  });

  let maxDrawdown = 0;
  let peak = initialBalance;

  for (const snapshot of allSnapshots) {
    const value = parseFloat(snapshot.total_value);
    if (value > peak) {
      peak = value;
    }
    const drawdown = peak !== 0 ? ((peak - value) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Vérifier si le drawdown actuel est plus important
  if (totalValue > peak) {
    peak = totalValue;
  }
  const currentDrawdown = peak !== 0 ? ((peak - totalValue) / peak) * 100 : 0;
  if (currentDrawdown > maxDrawdown) {
    maxDrawdown = currentDrawdown;
  }

  return {
    cash,
    equity,
    total_value: totalValue,
    realized_pnl: realizedPnl,
    unrealized_pnl: unrealizedPnl,
    total_pnl: totalPnl,
    daily_pnl: dailyPnl,
    daily_pnl_percent: dailyPnlPercent,
    total_return_percent: totalReturnPercent,
    win_rate: winRate,
    total_trades: totalTrades,
    winning_trades: winningTrades,
    max_drawdown: maxDrawdown,
    sharpe_ratio: null, // TODO: Calculer le Sharpe ratio (nécessite plus d'historique)
    positions: positionDetails,
  };
}

/**
 * Crée un snapshot du portfolio pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Date} snapshotDate - Date du snapshot (défaut: aujourd'hui)
 * @returns {Object} Le snapshot créé
 */
export async function createPortfolioSnapshot(userId, snapshotDate = new Date()) {
  const dateOnly = snapshotDate.toISOString().split('T')[0];

  // Vérifier si un snapshot existe déjà pour cette date
  const existing = await PortfolioSnapshot.findOne({
    where: {
      user_id: userId,
      snapshot_date: dateOnly,
    },
  });

  if (existing) {
    console.log(`Snapshot already exists for user ${userId} on ${dateOnly}`);
    return existing;
  }

  // Calculer les métriques
  const metrics = await calculatePortfolioMetrics(userId, snapshotDate);

  // Créer le snapshot
  const snapshot = await PortfolioSnapshot.create({
    user_id: userId,
    snapshot_date: dateOnly,
    cash: metrics.cash,
    equity: metrics.equity,
    total_value: metrics.total_value,
    realized_pnl: metrics.realized_pnl,
    unrealized_pnl: metrics.unrealized_pnl,
    total_pnl: metrics.total_pnl,
    daily_pnl: metrics.daily_pnl,
    daily_pnl_percent: metrics.daily_pnl_percent,
    total_return_percent: metrics.total_return_percent,
    win_rate: metrics.win_rate,
    total_trades: metrics.total_trades,
    winning_trades: metrics.winning_trades,
    max_drawdown: metrics.max_drawdown,
    sharpe_ratio: metrics.sharpe_ratio,
  });

  // Créer les snapshots de positions individuelles
  for (const posDetail of metrics.positions) {
    await PositionHistory.create({
      user_id: userId,
      asset_id: posDetail.asset_id,
      snapshot_date: dateOnly,
      quantity: posDetail.quantity,
      avg_price: posDetail.avg_price,
      current_price: posDetail.current_price,
      market_value: posDetail.market_value,
      unrealized_pnl: posDetail.unrealized_pnl,
      unrealized_pnl_percent: posDetail.unrealized_pnl_percent,
    });
  }

  console.log(`✅ Snapshot created for user ${userId} on ${dateOnly}`);
  return snapshot;
}

/**
 * Crée des snapshots pour tous les utilisateurs actifs
 * @param {Date} snapshotDate - Date du snapshot (défaut: aujourd'hui)
 * @returns {Array} Liste des snapshots créés
 */
export async function createAllSnapshots(snapshotDate = new Date()) {
  const users = await User.findAll({
    where: { is_active: true },
  });

  const snapshots = [];
  const errors = [];

  for (const user of users) {
    try {
      const snapshot = await createPortfolioSnapshot(user.id, snapshotDate);
      snapshots.push(snapshot);
    } catch (error) {
      console.error(`Error creating snapshot for user ${user.id}:`, error);
      errors.push({ userId: user.id, error: error.message });
    }
  }

  console.log(`✅ Created ${snapshots.length} snapshots, ${errors.length} errors`);

  return { snapshots, errors };
}

/**
 * Récupère l'historique des snapshots pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} days - Nombre de jours à récupérer (défaut: 30)
 * @returns {Array} Liste des snapshots
 */
export async function getSnapshotHistory(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snapshots = await PortfolioSnapshot.findAll({
    where: {
      user_id: userId,
      snapshot_date: { [Op.gte]: startDate.toISOString().split('T')[0] },
    },
    order: [['snapshot_date', 'ASC']],
  });

  return snapshots;
}

export default {
  calculatePortfolioMetrics,
  createPortfolioSnapshot,
  createAllSnapshots,
  getSnapshotHistory,
};
