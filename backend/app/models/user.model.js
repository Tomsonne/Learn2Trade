// backend/models/user.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class User extends Model {
  static associate(models) {
    /**
     * USER 1 → N POSITION
     */
    this.hasMany(models.Position, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      as: "positions",
    });


    /**
     * USER 1 → N STRATEGY
     */
    this.hasMany(models.Strategy, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      as: "strategies",
    });

    /**
     * USER 1 → N TRADE
     */
    this.hasMany(models.Trade, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      as: "trades",
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cash: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      defaultValue: 10000, // solde initial
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);

export default User;
