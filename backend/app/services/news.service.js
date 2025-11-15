// app/services/news.service.js
import { Op } from 'sequelize';
import News from '../models/news.model.js';

//const COINDESK_RSS = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
const COINDESK_RSS = 'https://www.coindesk.com/arc/outboundfeeds/rss';
const CRYPTOPANIC_API = 'https://cryptopanic.com/api/v1/posts/';

// Mapping des symboles pour CryptoPanic
const SYMBOL_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binance-coin',
  'SOL': 'solana',
  'ADA': 'cardano',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot'
};

function extractSymbols(text) {
  if (!text) return [];
  const set = new Set();
  if (/\bbitcoin|\bbtc\b/i.test(text)) set.add('BTC');
  if (/\beth(ereum)?\b|\beth\b/i.test(text)) set.add('ETH');
  if (/\bbnb\b|\bbinance\b/i.test(text)) set.add('BNB');
  if (/\bsol(ana)?\b/i.test(text)) set.add('SOL');
  if (/\bada\b|\bcardano\b/i.test(text)) set.add('ADA');
  if (/\bxrp\b|\bripple\b/i.test(text)) set.add('XRP');
  if (/\bdoge(coin)?\b/i.test(text)) set.add('DOGE');
  if (/\bdot\b|\bpolkadot\b/i.test(text)) set.add('DOT');
  return [...set];
}

/**
 * Récupère les news depuis Decrypt RSS (source crypto populaire)
 * Alternative gratuite sans clé API
 */
export async function fetchDecryptNews() {
  try {
    const { default: Parser } = await import('rss-parser');
    const parser = new Parser({ timeout: 10000 });
    const feed = await parser.parseURL('https://decrypt.co/feed');

    const items = (feed.items || []).slice(0, 15).map(it => ({
      id: `decrypt_${it.guid || it.link}`,
      source: 'Decrypt',
      title: it.title || '',
      url: it.link,
      published_at: it.isoDate ? new Date(it.isoDate) : new Date(),
      excerpt: it.contentSnippet || it.content?.substring(0, 200) || '',
      symbols: extractSymbols(`${it.title} ${it.contentSnippet || ''}`),
    }));

    console.log('[Decrypt] Fetched:', items.length, 'news');
    return items;
  } catch (error) {
    console.error('[Decrypt] Error:', error.message);
    return [];
  }
}

/**
 * Récupère les news depuis CryptoPanic (nécessite une clé API)
 * Pour activer : ajoutez CRYPTOPANIC_API_KEY dans .env
 */
export async function fetchCryptoPanicNews(filterSymbols = []) {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;

  if (!apiKey) {
    console.log('[CryptoPanic] Skipped: No API key configured. Get one at https://cryptopanic.com/developers/api/');
    return [];
  }

  try {
    const params = new URLSearchParams({
      auth_token: apiKey,
      public: 'true',
      kind: 'news',
    });

    if (filterSymbols.length > 0) {
      const currencies = filterSymbols
        .map(s => SYMBOL_MAP[s])
        .filter(Boolean)
        .join(',');
      if (currencies) {
        params.append('currencies', currencies);
      }
    }

    const url = `${CRYPTOPANIC_API}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Learn2Trade/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    console.log('[CryptoPanic] Fetched:', results.length, 'news');
    return results.map(post => ({
      id: `cp_${post.id}`,
      source: post.source?.title || 'CryptoPanic',
      title: post.title,
      url: post.url,
      published_at: new Date(post.published_at || post.created_at),
      excerpt: post.body || '',
      symbols: post.currencies?.map(c => c.code.toUpperCase()) || [],
      votes: post.votes || { positive: 0, negative: 0, important: 0 },
    }));
  } catch (error) {
    console.error('[CryptoPanic] Error:', error.message);
    return [];
  }
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
  // 1. Récupérer les news de sources externes
  const decryptNews = await fetchDecryptNews();
  const cryptoPanicNews = await fetchCryptoPanicNews(symbols); // Optionnel si API key configurée

  // 2. Récupérer les news stockées en base (CoinDesk)
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
      limit: Math.floor(limit / 2), // On prend la moitié de chaque source
    });
  } else {
    // on prend un peu plus et on filtre côté app
    const prelimit = Math.max(limit * 2, 50);
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
      }).slice(0, Math.floor(limit / 2));
    }
  }

  const dbNews = rows.map(r => r.toJSON());

  // 3. Fusionner et trier par date de publication
  const allNews = [...decryptNews, ...cryptoPanicNews, ...dbNews];

  // Dédupliquer par URL
  const seen = new Set();
  const unique = allNews.filter(n => {
    if (!n.url || seen.has(n.url)) return false;
    seen.add(n.url);
    return true;
  });

  // Trier par date (plus récent en premier)
  unique.sort((a, b) => {
    const dateA = new Date(a.published_at || 0);
    const dateB = new Date(b.published_at || 0);
    return dateB - dateA;
  });

  // Limiter au nombre demandé
  return unique.slice(0, limit);
}
