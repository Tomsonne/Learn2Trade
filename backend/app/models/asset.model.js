//actifs supportés (BTCUSD, EURUSD, etc.).CREATE TABLE assets (
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js'; // connexion à Postgres

const Asset = sequelize.define('Asset', {
  id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  kind: {
    type: DataTypes.ENUM('crypto', 'forex', 'index'),
    allowNull: false,
  },
 },
{
    tableName: 'assets',
    timestamps: false,
    underscored: true,
  });
export default Asset;
