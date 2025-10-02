import express from 'express';
import cors from 'cors';
import { loadConfig } from './core/config.js';
import v1Router from './api/index.js';
import sequelize from './core/db.js';
// import { syncDB } from './core/bootstrapModels.js';

const cfg = loadConfig();
const app = express();

app.use(express.json());
app.use(cors({ origin: cfg.corsOrigin, credentials: true }));

// HealthCheck
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// API v1
app.use('/api/v1', v1Router);

// 404 (doit rester après les routes, réponse propre quand la route n’existe pas.)
app.use((_req, res) => {
  res.status(404).json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

async function start() {
  try {
    await sequelize.authenticate();
    // await syncDB(); // attendre que la DB soit OK avant de listen, et logguer les erreurs.
    await sequelize.sync();

    app.listen(cfg.port, () => {
      console.log(`Learn2Trade backend (Node) on http://localhost:${cfg.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Arrêt propre (utile en Docker/K8s)
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  try { await sequelize.close(); } catch {}
  process.exit(0);
});
