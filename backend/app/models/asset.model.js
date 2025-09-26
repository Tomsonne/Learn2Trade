// app/models/asset.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  symbol: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  kind: {
    type: DataTypes.STRING(16),                 // aligné avec TEXT du schema.sql
    allowNull: false,
    validate: { isIn: [['crypto', 'forex', 'index']] },
  },
}, {
  tableName: 'assets',
  underscored: true,
  timestamps: false,
  indexes: [
    { unique: true, fields: ['symbol'] },
    { fields: ['kind'] },
  ],
  hooks: {
    beforeValidate(asset) {
      if (asset.symbol) asset.symbol = asset.symbol.toUpperCase().trim();
      if (asset.kind) asset.kind = asset.kind.toLowerCase().trim();
    },
  },
});

export default Asset;
