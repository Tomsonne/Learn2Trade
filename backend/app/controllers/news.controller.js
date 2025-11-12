// app/controllers/news.controller.js
import { listNews, refreshNewsFromCoinDesk } from "../services/news.service.js";

export async function getNews(req, res) {
  try {
    const { symbols, from, to, limit } = req.query;
    const list = await listNews({
      symbols: typeof symbols === "string" && symbols.length
        ? symbols.split(",").map((s) => s.trim().toUpperCase())
        : [],
      from,
      to,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ status: "ok", data: list });
  } catch (err) {
    console.error("getNews error:", err);
    res.status(500).json({ status: "error", error: { code: "INTERNAL_ERROR", message: "Failed to fetch news." } });
  }
}


export async function refreshCoinDesk(_req, res) {
  try {
    const savedCount = await refreshNewsFromCoinDesk();
    res.json({ status: "ok", saved: savedCount });
  } catch (err) {
    console.error("refreshNews error:", err);
    res.status(502).json({ status: "error", error: { code: "UPSTREAM_FAIL", message: "RSS fetch failed." } });
  }
}
