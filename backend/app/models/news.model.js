// app/models/news.model.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../core/db.js';

const dialect = sequelize.getDialect();
const isSQLite = dialect === 'sqlite';
const isPostgres = dialect === 'postgres';

class News extends Model {}

News.init({
  id: {
    // Pour éviter les problèmes en SQLite, on reste en INTEGER auto-incrément.
    // En Postgres, INTEGER suffit largement (2+ milliards de lignes).
    type: DataTypes.INTEGER,
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
    unique: true,         // contrainte unique utile pour dédupliquer
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // symbols: tableau de tickers (ex: ["BTC","ETH"])
  ...(isSQLite
    ? {
        symbols: {
          // Stocké en TEXT (JSON stringifié) pour SQLite
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const raw = this.getDataValue('symbols');
            if (!raw) return null;
            try { return JSON.parse(raw); }
            catch { return null; }
          },
          set(val) {
            this.setDataValue('symbols', val ? JSON.stringify(val) : null);
          }
        }
      }
    : {
        symbols: {
          // Postgres : vrai ARRAY(TEXT)
          type: DataTypes.ARRAY(DataTypes.TEXT),
          allowNull: true,
        }
      }
  ),

}, {
  sequelize,
  tableName: 'news',
  timestamps: false,      //passer à true si on veut created_at/updated_at
  underscored: true,
  indexes: [
    { unique: true, fields: ['url'] },
    { fields: ['published_at'] },
  ],
});

export default News;
