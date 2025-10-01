// app/server.js
import express from 'express';
import cors from 'cors';
import { loadConfig } from './core/config.js';
import v1Router from './api/index.js';

// on importe l'init depuis bootstrapModels
import { initDatabase } from './core/bootstrapModels.js';

const cfg = loadConfig();
const app = express();

app.use(express.json());
app.use(cors({ origin: cfg.corsOrigin, credentials: true }));

// HealthCheck
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// API v1
app.use('/api/v1', v1Router);

// 404
app.use((_req, res) =>
  res.status(404).json({
    status: 'error',
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  })
);

// ✅ Démarrage propre : init DB PUIS listen
const PORT = cfg.port || 8000;

(async () => {
  try {
    // initialise sequelize + sync selon l'env (DB_SYNC)
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Learn2Trade backend (Node) on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error initializing database', err);
    process.exit(1);
  }
})();
