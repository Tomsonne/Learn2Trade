// backend/app/models/news.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

const News = sequelize.define('News', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  source: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  symbols: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
}, {
  tableName: 'news',
  timestamps: false, // pas de createdAt/updatedAt dans ton SQL
  underscored: true,
});

export default News;
