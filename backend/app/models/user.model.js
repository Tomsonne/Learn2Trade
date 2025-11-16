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

    /**
     * USER 1 → N PORTFOLIO_SNAPSHOT
     */
    this.hasMany(models.PortfolioSnapshot, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      as: "snapshots",
    });

    /**
     * USER 1 → N POSITION_HISTORY
     */
    this.hasMany(models.PositionHistory, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "CASCADE",
      as: "positionHistory",
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
    // Identité
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Authentification
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password_reset_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Trading
    cash: {
      type: DataTypes.DECIMAL(24, 10),
      allowNull: false,
      defaultValue: 10000, // solde initial
    },
    initial_balance: {
      type: DataTypes.DECIMAL(24, 10),
      defaultValue: 10000,
    },

    // Profil
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'UTC',
    },
    language: {
      type: DataTypes.STRING(5),
      defaultValue: 'fr',
    },

    // Statut et permissions
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
