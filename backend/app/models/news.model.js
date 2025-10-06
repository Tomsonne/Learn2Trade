// app/models/news.model.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../core/db.js";

const dialect = sequelize.getDialect();
const isSQLite = dialect === "sqlite";

class News extends Model {}

News.init(
  {
    id: {
      type: DataTypes.INTEGER, // simple et portable
      autoIncrement: true,
      primaryKey: true,
    },
    source: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false, // mieux pour l’UI; si besoin -> true, mais c’est pratique d’avoir un titre
      validate: { notEmpty: true },
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,        // ← important pour la dédup
      unique: true,
      validate: { notEmpty: true },
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // symbols: tableau de tickers (["BTC","ETH"])
    ...(isSQLite
      ? {
          symbols: {
            type: DataTypes.TEXT, // JSON stringifié
            allowNull: true,
            get() {
              const raw = this.getDataValue("symbols");
              if (!raw) return null;
              try { return JSON.parse(raw); } catch { return null; }
            },
            set(val) {
              this.setDataValue("symbols", val ? JSON.stringify(val) : null);
            },
          },
        }
      : {
          symbols: {
            type: DataTypes.ARRAY(DataTypes.TEXT), // Postgres ARRAY
            allowNull: true,
          },
        }),

    // 🔻 Manquants : utilisés par ton service/controller
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "news",
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ["url"] },
      { fields: ["published_at"] },
    ],
    hooks: {
      beforeValidate(row) {
        if (row.title) row.title = String(row.title).trim();
        if (row.url) row.url = String(row.url).trim();
        if (row.source) row.source = String(row.source).trim();
      },
    },
  }
);

export default News;
