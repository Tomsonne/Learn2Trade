// backend/app/models/position.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class Position extends Model {
  static associate(models) {
    /**
     * POSITION ↔ USER
     */
    this.belongsTo(models.User, {
      foreignKey: { name: "user_id", allowNull: false },
      as: "user",
    });

    /**
     * POSITION ↔ ASSET
     */
    this.belongsTo(models.Asset, {
      foreignKey: { name: "asset_id", allowNull: false },
      as: "asset",
    });

  }
}

Position.init(
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    avg_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: "Position",
    tableName: "positions",
    underscored: true,
    timestamps: false,
    indexes: [{ fields: ["user_id"] }, { fields: ["asset_id"] }],
  }
);

export default Position;
