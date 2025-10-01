import { Sequelize } from 'sequelize';
import { loadConfig } from './config.js';

const cfg = loadConfig();
const isSQLite = (cfg.db.dialect || '').toLowerCase() === 'sqlite';

let sequelize;

// === IMPORTANT ===
// Si SQLite → utiliser la forme objet, SANS host/user/password
if (isSQLite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: cfg.db.storage || 'dev.sqlite',
    logging: cfg.db.logging,
  });
} else if (cfg.db.url) {
  // Postgres via DATABASE_URL
  sequelize = new Sequelize(cfg.db.url, {
    dialect: 'postgres',
    logging: cfg.db.logging,
    dialectOptions: cfg.db.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
} else {
  // Postgres/MySQL/etc via champs séparés
  sequelize = new Sequelize(
    cfg.db.database || '',
    cfg.db.username || '',
    String(cfg.db.password ?? ''),
    {
      dialect: cfg.db.dialect,
      host: cfg.db.host,
      port: cfg.db.port,
      logging: cfg.db.logging,
      dialectOptions: cfg.db.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    }
  );
}

export default sequelize;
