//actifs supportés (BTCUSD, EURUSD, etc.).CREATE TABLE assets (
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js'; // connexion à Postgres

const Asset = sequelize.define('Asset', {

  symbol: {

    type: DataTypes.STRING,
    primaryKey: true, //remplace l'id
  },
  kind: {
    type: DataTypes.Enum('crypto', 'forex', 'index'),
    allowNull: false,
  },
  tableName: 'assets',
  timestamps: false,
});
export default Asset;
