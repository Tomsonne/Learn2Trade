//positions ouvertes.
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js'; // connexion à Postgres

const Position = sequelize.define('Position', {

 user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.DECIMAL(24, 10),
    allowNull: false,
    defaultValue: 0,
    validate: {min: 0},
  },
  avg_price: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {min: 0},
  },
}, {
    tableName: 'positions',
    underscored: true,
    timestamps: false,
    indexes: [{ fields: ['user_id'] }, { fields: ['asset_id'] }],
});
export default Position;
