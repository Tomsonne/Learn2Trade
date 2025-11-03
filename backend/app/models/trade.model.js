// backend/app/models/trade.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class Trade extends Model {
  static associate(models) {
    /**
     * TRADE ↔ USER
     */
    this.belongsTo(models.User, {
      foreignKey: { name: "user_id", allowNull: false },
      as: "user",
    });

    /**
     * TRADE ↔ STRATEGY (nullable)
     */
    this.belongsTo(models.Strategy, {
      foreignKey: { name: "strategy_id", allowNull: true },
      as: "strategy",
    });

    /**
     * TRADE ↔ ASSET
     */
    this.belongsTo(models.Asset, {
      foreignKey: { name: "asset_id", allowNull: false },
      as: "asset",
    });
  }
}

Trade.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    strategy_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    side: {
      type: DataTypes.ENUM("BUY", "SELL"),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      validate: { min: 0 },
    },

    price_open: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      validate: { min: 0 },
    },

    price_close: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
      validate: { min: 0 },
    },

    pnl: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: true,
    },

    /**
     * Ajouts pour le suivi
     */
    opened_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Trade",
    tableName: "trades",
    underscored: true,
    timestamps: false,
  }
);

export default Trade;
