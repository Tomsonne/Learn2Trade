// backend/models/portfolioSnapshot.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class PortfolioSnapshot extends Model {
  static associate(models) {
    /**
     * PORTFOLIO_SNAPSHOT N → 1 USER
     */
    this.belongsTo(models.User, {
      foreignKey: { name: "user_id", allowNull: false },
      as: "user",
    });
  }
}

PortfolioSnapshot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    // Valeurs du portefeuille
    cash: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
    },
    equity: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      comment: "Valeur totale des positions ouvertes",
    },
    total_value: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      comment: "cash + equity",
    },

    // P&L (Profit & Loss)
    realized_pnl: {
      type: DataTypes.DECIMAL(24, 10),
      defaultValue: 0,
      comment: "Gains/pertes des trades fermés",
    },
    unrealized_pnl: {
      type: DataTypes.DECIMAL(24, 10),
      defaultValue: 0,
      comment: "Gains/pertes des positions ouvertes",
    },
    total_pnl: {
      type: DataTypes.DECIMAL(24, 10),
      defaultValue: 0,
      comment: "realized_pnl + unrealized_pnl",
    },
    daily_pnl: {
      type: DataTypes.DECIMAL(24, 10),
      defaultValue: 0,
      comment: "Variation vs jour précédent",
    },
    daily_pnl_percent: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: "Variation % vs jour précédent",
    },

    // Métriques de performance
    total_return_percent: {
      type: DataTypes.DECIMAL(10, 4),
      comment: "Rendement total depuis le début",
    },
    win_rate: {
      type: DataTypes.DECIMAL(10, 4),
      comment: "% de trades gagnants",
    },
    total_trades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Nombre total de trades",
    },
    winning_trades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Nombre de trades gagnants",
    },

    // Métriques de risque
    max_drawdown: {
      type: DataTypes.DECIMAL(10, 4),
      comment: "Perte max depuis le pic historique (%)",
    },
    sharpe_ratio: {
      type: DataTypes.DECIMAL(10, 4),
      comment: "Rendement ajusté au risque",
    },

    // Date du snapshot
    snapshot_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PortfolioSnapshot",
    tableName: "portfolio_snapshots",
    underscored: true,
    timestamps: true,
    updatedAt: false, // Pas de updated_at pour les snapshots (historique immuable)
    indexes: [
      {
        unique: true,
        fields: ["user_id", "snapshot_date"],
        name: "unique_user_snapshot_date",
      },
      {
        fields: ["user_id", "snapshot_date"],
        name: "idx_snapshots_user_date",
      },
      {
        fields: ["snapshot_date"],
        name: "idx_snapshots_date",
      },
    ],
  }
);

export default PortfolioSnapshot;
