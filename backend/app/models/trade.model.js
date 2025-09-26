// app/models/trade.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

const ALLOWED_SIDES = ['BUY', 'SELL']; // ⬅️ manquait

const Trade = sequelize.define('Trade', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  user_id:    { type: DataTypes.UUID,    allowNull: false },
  strategy_id:{ type: DataTypes.UUID,    allowNull: true  },
  asset_id:   { type: DataTypes.INTEGER, allowNull: false },

  side: {
    type: DataTypes.STRING(4),           // STRING + validation, pas ENUM
    allowNull: false,
    validate: { isIn: [ALLOWED_SIDES] },
  },
  quantity:   { type: DataTypes.DECIMAL(24,10), allowNull: false, validate: { min: 0 } },
  price_open: { type: DataTypes.DECIMAL(18,8),  allowNull: false, validate: { min: 0 } },
  price_close:{ type: DataTypes.DECIMAL(18,8),  allowNull: true,  validate: { min: 0 } },
  pnl:        { type: DataTypes.DECIMAL(24,10), allowNull: true },
}, {
  tableName: 'trades',
  underscored: true,
  timestamps: false,
  hooks: {
    beforeValidate(trade) {
      if (trade.side) trade.side = String(trade.side).toUpperCase().trim();
    },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['asset_id'] },
    { fields: ['strategy_id'] },
  ],
});

export default Trade;
