// backend/app/models/strategy.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

const Strategy = sequelize.define('Strategy', {
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
    type: DataTypes.JSONB, // utile pour dire quel parametre de la strategie 
    allowNull: true,
    defaultValue: {},
  },

  is_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },


}, {
  tableName: 'strategies',
  timestamps: true,
  indexes: [{ unique: true,  fields: ['type'] } ],

});

export default Strategy;
