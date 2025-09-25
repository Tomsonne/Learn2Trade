//positions ouvertes.
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js'; // connexion à Postgres

const Position = sequelize.define('Position', {

 user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'users', key: 'id'},
    onDelete: 'CASCADE',
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {model:'assets', key: 'id'},
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

});
export default Position;
