// app/core/db.js
import { Sequelize } from 'sequelize';

const DIALECT = process.env.DB_DIALECT || 'postgres';
let sequelize;

if (process.env.NODE_ENV === 'test' && DIALECT === 'sqlite') {
  // ✅ Tests unitaires : SQLite en mémoire
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  // ✅ Dev/Prod/Intégration Postgres
  sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: process.env.PG_HOST || 'localhost',
      port: +(process.env.PG_PORT || 5432),
      dialect: 'postgres',
      logging: false,
    }
  );
}

export default sequelize;
