// app/services/news.service.js
import { Op } from 'sequelize';
import News from '../models/news.model.js';

//const COINDESK_RSS = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
const COINDESK_RSS = 'https://www.coindesk.com/arc/outboundfeeds/rss';


function extractSymbols(text) {
  if (!text) return [];
  const set = new Set();
  if (/\bbitcoin|\bbtc\b/i.test(text)) set.add('BTC');
  if (/\beth(ereum)?\b|\beth\b/i.test(text)) set.add('ETH');
  return [...set];
}

export async function refreshNewsFromCoinDesk() {
const { default: Parser } = await import('rss-parser'); // import dynamique
  const parser = new Parser({ timeout: 15000 });
  const feed = await parser.parseURL(COINDESK_RSS); // peut throw → géré par le controller
  const items = (feed.items || []).map(it => ({
    source: 'CoinDesk',
    title: it.title || '',
    url: it.link,
    published_at: it.isoDate ? new Date(it.isoDate) : new Date(),
    symbols: extractSymbols(`${it.title} ${it.contentSnippet || ''}`),
  }));

  const saved = [];
  for (const n of items) {
    if (!n.url) continue;
    const [row] = await News.findOrCreate({
      where: { url: n.url },
      defaults: {
        source: n.source,
        title: n.title?.slice(0, 500),
        url: n.url,
        published_at: n.published_at,
        symbols: n.symbols?.length ? n.symbols : null, // setter fera JSON pour sqlite
      },
    });
    saved.push(row.toJSON());
  }
  return saved.length;
}

export async function listNews({ symbols = [], from, to, limit = 50 } = {}) {
  const dialect = News.sequelize.getDialect();
  const where = {};

  if (from || to) {
    where.published_at = {};
    if (from) where.published_at[Op.gte] = new Date(from);
    if (to)   where.published_at[Op.lte] = new Date(to);
  }

  // En SQLite, on ne peut pas faire overlap. On filtre en JS après sélection.
  let rows;
  if (dialect === 'postgres' && symbols.length) {
    rows = await News.findAll({
      where: { ...where, symbols: { [Op.overlap]: symbols } },
      order: [['published_at', 'DESC']],
      limit,
    });
  } else {
    // on prend un peu plus et on filtre côté app
    const prelimit = Math.max(limit * 3, 50);
    rows = await News.findAll({
      where,
      order: [['published_at', 'DESC']],
      limit: prelimit,
    });
    if (symbols.length) {
      const set = new Set(symbols);
      rows = rows.filter(r => {
        const arr = r.get('symbols'); // getter → array en JS
        return Array.isArray(arr) && arr.some(s => set.has(s));
      }).slice(0, limit);
    }
  }

  return rows.map(r => r.toJSON());
}
