import User from './user.model.js';
import Asset from './asset.model.js';
import Position from './position.model.js';
import Strategy from './strategy.model.js';
import StrategySignal from './strategySignal.model.js';
import Trade from './trade.model.js';

export function applyAssociations() {
  /**
   * USER 1 → N POSITION
   * Un utilisateur peut avoir plusieurs positions ouvertes (portefeuille).
   * Une position appartient à un seul utilisateur.
   */
  User.hasMany(Position, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: 'positions',
  });
  Position.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    as: 'user',
  });

  /**
   * ASSET 1 → N POSITION
   * Un actif (ex: BTCUSD) peut apparaître dans les portefeuilles de plusieurs utilisateurs.
   * Une position correspond toujours à un seul actif.
   */
  Asset.hasMany(Position, {
    foreignKey: { name: 'asset_id', allowNull: false },
    onUpdate: 'CASCADE',
    as: 'positions',
  });
  Position.belongsTo(Asset, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'asset',
  });

  /**
   * USER 1 → N STRATEGY
   * Un utilisateur peut configurer plusieurs stratégies.
   * Une stratégie appartient toujours à un seul utilisateur.
   */
  User.hasMany(Strategy, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE',
    as: 'strategies',
  });
  Strategy.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    as: 'user',
  });

  /**
   * STRATEGY 1 → N STRATEGY_SIGNAL
   * Une stratégie peut générer plusieurs signaux.
   * Un signal est toujours lié à une seule stratégie.
   */
  Strategy.hasMany(StrategySignal, {
    foreignKey: { name: 'strategy_id', allowNull: false },
    onDelete: 'CASCADE',
    as: 'signals',
  });
  StrategySignal.belongsTo(Strategy, {
    foreignKey: { name: 'strategy_id', allowNull: false },
    as: 'strategy',
  });

  /**
   * ASSET 1 → N STRATEGY_SIGNAL
   * Un actif peut être concerné par plusieurs signaux.
   * Un signal concerne toujours un seul actif.
   */
  Asset.hasMany(StrategySignal, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'signals',
  });
  StrategySignal.belongsTo(Asset, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'asset',
  });

  /**
   * USER 1 → N TRADE
   * Un utilisateur peut exécuter plusieurs trades.
   * Un trade appartient toujours à un seul utilisateur.
   */
  User.hasMany(Trade, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE',
    as: 'trades',
  });
  Trade.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    as: 'user',
  });

  /**
   * STRATEGY 1 → N TRADE
   * Une stratégie peut générer plusieurs trades (ou aucun).
   * Un trade peut être lié à une stratégie ou rester NULL (trade manuel).
   */
  Strategy.hasMany(Trade, {
    foreignKey: { name: 'strategy_id', allowNull: true },
    onDelete: 'SET NULL',
    as: 'trades',
  });
  Trade.belongsTo(Strategy, {
    foreignKey: { name: 'strategy_id', allowNull: true },
    as: 'strategy',
  });

  /**
   * ASSET 1 → N TRADE
   * Un actif (BTCUSD, EURUSD…) peut apparaître dans plusieurs trades.
   * Un trade concerne toujours un seul actif.
   */
  Asset.hasMany(Trade, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'trades',
  });
  Trade.belongsTo(Asset, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'asset',
  });
}
