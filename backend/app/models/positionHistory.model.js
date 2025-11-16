// backend/models/positionHistory.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class PositionHistory extends Model {
  static associate(models) {
    /**
     * POSITION_HISTORY N → 1 USER
     */
    this.belongsTo(models.User, {
      foreignKey: { name: "user_id", allowNull: false },
      as: "user",
    });

    /**
     * POSITION_HISTORY N → 1 ASSET
     */
    this.belongsTo(models.Asset, {
      foreignKey: { name: "asset_id", allowNull: false },
      as: "asset",
    });
  }
}

PositionHistory.init(
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
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "assets",
        key: "id",
      },
    },

    // État de la position à ce moment
    quantity: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
    },
    avg_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      comment: "Prix moyen d'achat",
    },
    current_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      comment: "Prix du marché au moment du snapshot",
    },
    market_value: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      comment: "quantity * current_price",
    },
    unrealized_pnl: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      comment: "(current_price - avg_price) * quantity",
    },
    unrealized_pnl_percent: {
      type: DataTypes.DECIMAL(10, 4),
      comment: "% de gain/perte non réalisé",
    },

    // Date du snapshot
    snapshot_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PositionHistory",
    tableName: "position_history",
    underscored: true,
    timestamps: true,
    updatedAt: false, // Pas de updated_at pour l'historique (immuable)
    indexes: [
      {
        unique: true,
        fields: ["user_id", "asset_id", "snapshot_date"],
        name: "unique_user_asset_snapshot_date",
      },
      {
        fields: ["user_id", "snapshot_date"],
        name: "idx_position_history_user_date",
      },
      {
        fields: ["asset_id", "snapshot_date"],
        name: "idx_position_history_asset",
      },
    ],
  }
);

export default PositionHistory;
