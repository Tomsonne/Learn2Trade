// backend/app/models/strategy.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

const Strategy = sequelize.define('Strategy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parameters: {
    type: DataTypes.JSONB, // utile pour dire quel parametre de la strategie 
    allowNull: true,
  },
}, {
  tableName: 'strategies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'modified_at',
});

export default Strategy;
