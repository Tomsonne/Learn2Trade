// backend/app/models/strategy.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class Strategy extends Model {
  static associate(models) {
    /**
     * STRATEGY ↔ USER
     */
    this.belongsTo(models.User, {
      foreignKey: { name: "user_id", allowNull: false },
      as: "user",
    });
    models.User.hasMany(this, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      as: "strategies",
    });

    /**
     * STRATEGY ↔ TRADE
     */
    this.hasMany(models.Trade, {
      foreignKey: { name: "strategy_id", allowNull: true },
      onDelete: "SET NULL",
      as: "trades",
    });
    models.Trade.belongsTo(this, {
      foreignKey: { name: "strategy_id", allowNull: true },
      as: "strategy",
    });
  }
}

Strategy.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    params: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Strategy",
    tableName: "strategy",
    timestamps: true,
  }
);

export default Strategy;
