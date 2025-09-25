//schéma utilisateur (email, hash, portefeuille).
// backend/models/user.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js'; // connexion à Postgres

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  
});

export default User;
