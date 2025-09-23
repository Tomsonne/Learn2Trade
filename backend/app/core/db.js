//connexion à la base de données (PostgreSQL, Mongo, etc.).
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'learn2trade',
  process.env.DB_USER || 'l2t_user',
  process.env.DB_PASS || 'l2t_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
  }
);

export default sequelize;
