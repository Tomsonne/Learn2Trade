// src/pages/NewsPage.jsx
import React, { useEffect, useState } from "react";
import NewsCard from "../components/news/NewsCard.jsx";

export default function NewsPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1";
    // enlève un éventuel slash final pour éviter //news
    const url  = `${base.replace(/\/$/, "")}/news?limit=10`;

    console.log("NEWS URL =", url); // ← vérifie dans la console

    setLoading(true);
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        const list = Array.isArray(json) ? json : (json?.data ?? []);
        setItems(list);
        setError(null);
      })
      .catch(e => {
        console.error("Fetch /news failed:", e);
        setError(e.message || "Erreur de chargement");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-2 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-rose-700">Impossible de charger les actualités : {error}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">Actualités du Marché</h2>
      {items.map((n, i) => (
        <NewsCard
          key={n.id ?? i}
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
