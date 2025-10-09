// src/pages/NewsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import NewsCard from "../components/news/NewsCard.jsx";
import SymbolFilter from "../components/news/SymbolFilter.jsx";

const TABS = [
  { label: "Tous", value: "ALL" },
  { label: "BTC",  value: "BTC" },
  { label: "ETH",  value: "ETH" },
];

export default function NewsPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // --- charge les news (réutilisable par bouton / interval / focus)
  const fetchNews = useCallback(async () => {
    const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const url  = `${base}/news?limit=10`;

    setLoading(true);
    setError(null);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      const list = Array.isArray(json) ? json : (json?.data ?? []);
      setItems(list);
    } catch (e) {
      console.error("Fetch /news failed:", e);
      setError(e.message || "Erreur de chargement");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- premier chargement + auto-refresh + refresh au retour d’onglet
  useEffect(() => {
    fetchNews();                                 // initial
    const id = setInterval(fetchNews, 5 * 60 * 1000); // 5 min
    const onFocus = () => fetchNews();           // quand l’onglet reprend le focus
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNews]);

  if (loading && !items.length) {
    return (
      <div className="mx-auto max-w-3xl space-y-2 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Actualités du Marché</h2>
        <button
          onClick={fetchNews}
          className="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-700"
          disabled={loading}
        >
          {loading ? "Rafraîchissement..." : "Rafraîchir"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-rose-600">Impossible de charger les actualités : {error}</div>
      )}

      {!loading && !items.length && (
        <div className="text-sm text-slate-500 dark:text-slate-400">Aucune news.</div>
      )}

      {items.map((n, i) => (
        <NewsCard
          key={n.id ?? n.url ?? i}
          category={n.category || (n.symbols && n.symbols[0]) || "Marché"}
          title={n.title}
          excerpt={n.excerpt || n.summary || n.description}
          source={n.source}
          publishedAt={n.published_at || n.publishedAt || n.created_at || n.date}
          imageUrl={n.imageUrl || n.image_url}
          href={n.url}
          featured={i === 0}
        />
      ))}
    </div>
  );
}
