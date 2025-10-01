
// app/core/db.js
import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { loadConfig } from './config.js';

const cfg = loadConfig();
let sequelize;

if (cfg.dbDialect === 'sqlite') {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: cfg.dbStorage || './dev.sqlite', logging: false });
} else if (cfg.dbDialect === 'postgres') {
  if (cfg.databaseUrl) {
    sequelize = new Sequelize(cfg.databaseUrl, { dialect: 'postgres', logging: false });
  } else {
    sequelize = new Sequelize(
      process.env.PG_DATABASE || 'learn2trade',
      process.env.PG_USER || 'postgres',
      process.env.PG_PASSWORD || '',
      { host: process.env.PG_HOST || 'db', port: Number(process.env.PG_PORT || 5432), dialect: 'postgres', logging: false }
    );
  }
} else {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: cfg.dbStorage || './dev.sqlite', logging: false });
}

export default sequelize;
