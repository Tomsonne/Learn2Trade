import express from 'express'
import cors from 'cors'
import { loadConfig } from './core/config.js'
import v1Router from './api/index.js'

const cfg = loadConfig()
const app = express()

app.use(express.json())
app.use(cors({ origin: cfg.corsOrigin, credentials: true }))

// HealthCheck
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }))

// API v1
app.use('/api/v1', v1Router)

// 404
app.use((_req, res) => res.status(404).json({
  status: 'error', error: { code: 'NOT_FOUND', message: 'Route not found' }
}))

app.listen(cfg.port, () => {
  console.log(`Learn2Trade backend (Node) on http://localhost:${cfg.port}`)
})
