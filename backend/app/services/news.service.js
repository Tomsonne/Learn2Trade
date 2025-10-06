// app/services/news.service.js
import { Op } from "sequelize";
import News from "../models/news.model.js";

const COINDESK_RSS = "https://www.coindesk.com/arc/outboundfeeds/rss/";

function extractSymbols(text) {
  if (!text) return [];
  const set = new Set();
  if (/\bbitcoin|\bbtc\b/i.test(text)) set.add("BTC");
  if (/\beth(ereum)?\b|\beth\b/i.test(text)) set.add("ETH");
  return [...set];
}

export async function refreshNewsFromCoinDesk() {
  const { default: Parser } = await import("rss-parser");
  const parser = new Parser({
    timeout: 15000,
    requestOptions: {
      headers: { "User-Agent": "Learn2TradeBot/1.0 (+https://example.com)" },
    },
  });

  // peut throw → géré au niveau controller
  const feed = await parser.parseURL(COINDESK_RSS);

  const items = (feed.items || []).map((it) => {
    const image =
      it.enclosure?.url ||
      // fallback: cherche une URL d'image dans content
      (typeof it.content === "string" && (it.content.match(/https?:[^"']+?\.(?:png|jpe?g|gif)/i)?.[0] || null)) ||
      null;

    return {
      source: "CoinDesk",
      title: it.title || "",
      url: it.link,
      published_at: it.isoDate ? new Date(it.isoDate) : new Date(),
      symbols: extractSymbols(`${it.title} ${it.contentSnippet || ""}`),
      image_url: image,
      summary: it.contentSnippet || null,
    };
  });

  let savedCount = 0;
  for (const n of items) {
    if (!n.url) continue;
    const [row, created] = await News.findOrCreate({
      where: { url: n.url.trim() },
      defaults: {
        source: n.source,
        title: n.title?.slice(0, 500),
        url: n.url.trim(),
        published_at: n.published_at,
        symbols: n.symbols?.length ? n.symbols : null, // setter JSON SQlite
        image_url: n.image_url || null,
        summary: n.summary || null,
      },
    });

    // si déjà existant, tu peux envisager un upsert léger (optionnel)
    if (!created) {
      // await row.update({ image_url: row.image_url ?? n.image_url, summary: row.summary ?? n.summary });
    }
    savedCount++;
  }

  return savedCount;
}

export async function listNews({ symbols = [], from, to, limit = 50 } = {}) {
  const dialect = News.sequelize.getDialect();
  const where = {};

  if (from || to) {
    where.published_at = {};
    if (from) where.published_at[Op.gte] = new Date(from);
    if (to) where.published_at[Op.lte] = new Date(to);
  }

  let rows;
  if (dialect === "postgres" && symbols.length) {
    rows = await News.findAll({
      where: { ...where, symbols: { [Op.overlap]: symbols } },
      order: [["published_at", "DESC"]],
      limit,
    });
  } else {
    const prelimit = Math.max(limit * 3, 50);
    rows = await News.findAll({
      where,
      order: [["published_at", "DESC"]],
      limit: prelimit,
    });
    if (symbols.length) {
      const set = new Set(symbols.map((s) => s.toUpperCase()));
      rows = rows
        .filter((r) => {
          const arr = r.get("symbols"); // getter → array en JS (ou null)
          return Array.isArray(arr) && arr.some((s) => set.has(String(s).toUpperCase()));
        })
        .slice(0, limit);
    }
  }

  return rows.map((r) => r.toJSON());
}
