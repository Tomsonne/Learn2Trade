// app/core/bootstrapModels.js (ESM)
import sequelize from './db.js';
import models from '../models/index.js';

// Optionnel: init DB ici (auth & sync) — garde simple pour démarrer
export async function initDatabase() {
  await sequelize.authenticate();

  // Choisis une stratégie de sync via env:
  //   DB_SYNC=force | alter | true | false
  const mode = (process.env.DB_SYNC || 'false').toLowerCase();
  if (mode === 'force') {
    await sequelize.sync({ force: true });
  } else if (mode === 'alter') {
    await sequelize.sync({ alter: true });
  } else if (mode === 'true' || mode === '1') {
    await sequelize.sync();
  }
  return { sequelize, models };
}

export { sequelize, models };
