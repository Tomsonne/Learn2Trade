//ordres de trading virtuels.
//schéma utilisateur (email, hash, portefeuille).
// backend/models/user.model.js
// backend/app/models/Trade.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';


const Trade = sequelize.define('Trade', {
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
    type: DataTypes.ENUM('BUY', 'SELL'), // soit buy ou sell
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(24, 10),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  price_open: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    validate: {
      min: 0, // > 0
    },
  },
  price_close: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: true,
    validate: {
      min: 0, // > 0 si présent
    },
  },
  pnl: {
    type: DataTypes.DECIMAL(24, 10),
    allowNull: true,
  },
}, {
  tableName: 'trades',
  underscored: true,
  timestamps: false,
});

export default Trade;
