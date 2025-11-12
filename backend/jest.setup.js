// backend/jest.setup.js
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './app/core/db.js';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// re-définis bien le dialect pour le setup
const DIALECT = process.env.DB_DIALECT || 'sqlite';

// charge les modèles (ils utilisent l'instance exportée par db.js)
const { default: User }     = await import('./app/models/user.model.js');
const { default: Asset }    = await import('./app/models/asset.model.js');
const { default: Position } = await import('./app/models/position.model.js');
const { default: Strategy } = await import('./app/models/strategy.model.js');


beforeAll(async () => {
  if (DIALECT === 'sqlite') {
    // SQLite in-memory pour les tests unitaires
    await sequelize.sync({ force: true, logging: false });

    // (diagnostic optionnel)
    // const qi = sequelize.getQueryInterface();
    // console.log('Tables SQLite:', await qi.showAllTables());
  } else {
    // Intégration Postgres: exécute le schéma
    const schemaPath = path.resolve(__dirname, 'db/init/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await sequelize.query(sql);
  }
});

afterAll(async () => {
  await sequelize.close();
});

// Expose les modèles aux tests
global.Models = { User, Asset, Position, Strategy };
