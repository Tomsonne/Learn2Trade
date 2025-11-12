// app/api/market.routes.js
import { Router } from 'express';
import {
  getPrices,
  getForex,
  getChartOHLC,
  getMarketChartRange,
  getKlines,
} from '../services/market.service.js';

const router = Router();

// Prix spot
router.get('/prices', async (_req, res) => {
  try {
    res.json({ status: 'ok', data: await getPrices() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: { code: 'UPSTREAM', message: String(e.message || e) } });
  }
});

// Forex USD→EUR
router.get('/forex', async (_req, res) => {
  try {
    res.json({ status: 'ok', data: await getForex() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: { code: 'UPSTREAM', message: String(e.message || e) } });
  }
});

// ──────────────────────────────────────────────
// KLINES bruts (OHLCV) — pour debugging / usages avancés
// GET /api/v1/market/klines?symbol=BTC&interval=1h&limit=500
router.get('/klines', async (req, res) => {
  try {
    const {
      symbol = 'BTC',
      interval = '1h',
      limit = '500',
      start, // ms
      end,   // ms
    } = req.query;

    const data = await getKlines(symbol, {
      interval,
      limit: Number(limit) || 500,
      start: start ? Number(start) : undefined,
      end:   end   ? Number(end)   : undefined,
    });

    res.json({ status: 'ok', data });
  } catch (e) {
    const msg = String(e.message || e);
    const code = (msg === 'SYMBOL_UNSUPPORTED' || msg === 'INTERVAL_UNSUPPORTED') ? 400 : 503;
    res.status(code).json({ status: 'error', error: { code: msg, message: msg } });
  }
});

// ──────────────────────────────────────────────
// OHLC “facade” — adapté pour le front (Lightweight Charts possible)
// GET /api/v1/market/ohlc?symbol=BTC&interval=5m&limit=300&format=lw
// Back-compat: si ?days=30 fourni → interval=1d&limit=30
router.get('/ohlc', async (req, res) => {
  try {
    let { symbol = 'BTC', interval = '1d', limit = '30', format = 'raw', days } = req.query;

    // Backward compatibility CoinGecko: days -> 1d
    if (days && !req.query.limit && !req.query.interval) {
      interval = '1d';
      limit = String(Number(days) || 30);
    }

    const data = await getChartOHLC(symbol, {
      interval,
      limit: Number(limit) || 30,
      format, // 'raw' | 'lw'
    });

    res.json({ status: 'ok', data });
  } catch (e) {
    const msg = String(e.message || e);
    const code = (msg === 'SYMBOL_UNSUPPORTED' || msg === 'INTERVAL_UNSUPPORTED') ? 400 : 503;
    res.status(code).json({ status: 'error', error: { code: msg, message: msg } });
  }
});

// ──────────────────────────────────────────────
// Range précis (timestamps EN SECONDES) + auto-interval
// GET /api/v1/market/range?symbol=BTC&from=1727218800&to=1727222400
router.get('/range', async (req, res) => {
  try {
    const { symbol = 'BTC', from, to, interval } = req.query;
    const f = Number(from);
    const t = Number(to);
    const data = await getMarketChartRange(symbol, { from: f, to: t, interval });
    res.json({ status: 'ok', data });
  } catch (e) {
    const msg = String(e.message || e);
    const code = (msg === 'SYMBOL_UNSUPPORTED' || msg === 'INVALID_RANGE' || msg === 'INTERVAL_UNSUPPORTED') ? 400 : 503;
    res.status(code).json({ status: 'error', error: { code: msg, message: msg } });
  }
});

export default router;
