// backend/app/core/db.js
import { Sequelize } from "sequelize";
import { loadConfig } from "./config.js";

const cfg = loadConfig();
const isSQLite = (cfg.db.dialect || "").toLowerCase() === "sqlite";

let sequelize;

// === IMPORTANT ===
// Mode SQLite → utiliser la forme objet, SANS host/user/password
if (isSQLite) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: cfg.db.storage || "dev.sqlite",
    logging: cfg.db.logging,
  });

  console.log("🔌 DB utilisée : SQLite");
  console.log("📂 Fichier :", cfg.db.storage || "dev.sqlite");
  console.log("🔧 Configuration base de données :", cfg.db);


} else if (cfg.db.url) {
  // Mode Postgres via DATABASE_URL
  sequelize = new Sequelize(cfg.db.url, {
    dialect: "postgres",
    logging: cfg.db.logging,
    dialectOptions: cfg.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });

  console.log("🔌 DB utilisée via URL :", cfg.db.url);
} else {
  // Mode Postgres/MySQL/etc via champs séparés
  sequelize = new Sequelize(
    cfg.db.database || "",
    cfg.db.username || "",
    String(cfg.db.password ?? ""),
    {
      dialect: cfg.db.dialect,
      host: cfg.db.host,
      port: cfg.db.port,
      logging: cfg.db.logging,
      dialectOptions: cfg.db.ssl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    }
  );

  console.log(
    "🔌 DB utilisée :",
    cfg.db.database || "(non défini)",
    "sur",
    (cfg.db.host || "localhost") + ":" + (cfg.db.port || 5432)
  );
}

// Toujours afficher le dialect sélectionné
console.log("🔌 Dialect :", sequelize.getDialect());


console.log("ENV → DATABASE_URL:", process.env.DATABASE_URL);
console.log("ENV → DB_USERNAME:", process.env.DB_USERNAME);
console.log("🔧 cfg.db =", cfg.db);


export default sequelize;
