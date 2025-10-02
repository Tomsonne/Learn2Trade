import { Router } from 'express';
import { getPrices, getForex, getChartOHLC, getMarketChartRange } from '../services/market.service.js';

const router = Router();

router.get('/prices', async (_req, res) => {
  try {
    res.json({ status: 'ok', data: await getPrices() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: { code: 'UPSTREAM', message: String(e.message || e) } });
  }
});

router.get('/forex', async (_req, res) => {
  try {
    res.json({ status: 'ok', data: await getForex() });
  } catch (e) {
    res.status(503).json({ status: 'error', error: { code: 'UPSTREAM', message: String(e.message || e) } });
  }
});

router.get('/ohlc', async (req, res) => {
  try {
    const { symbol = 'BTC', vs = 'usd', days = '30' } = req.query;
    const d = Number(days) || 30;
    const data = await getChartOHLC(symbol, { vs, days: d });
    res.json({ status: 'ok', data });
  } catch (e) {
    const msg = String(e.message || e);
    const code = msg === 'SYMBOL_UNSUPPORTED' ? 400 : 503;
    res.status(code).json({ status: 'error', error: { code: msg, message: msg } });
  }
}); // 👈 this line was missing

router.get('/range', async (req, res) => {
  try {
    const { symbol = 'BTC', vs = 'usd', from, to } = req.query;
    const f = Number(from);
    const t = Number(to);
    const data = await getMarketChartRange(symbol, { vs, from: f, to: t });
    res.json({ status: 'ok', data });
  } catch (e) {
    const msg = String(e.message || e);
    const code = (msg === 'SYMBOL_UNSUPPORTED' || msg === 'INVALID_RANGE') ? 400 : 503;
    res.status(code).json({ status: 'error', error: { code: msg, message: msg } });
  }
});

export default router;
