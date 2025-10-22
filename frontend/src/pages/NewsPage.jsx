// src/pages/NewsPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [tab, setTab] = useState("ALL");

  const base = (
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:8000/api/v1"
    : "https://skillvest-production.up.railway.app/api/v1")
  ).replace(/\/$/, "");

  const currentCtrl = useRef(null);

  const fetchNews = useCallback(async () => {
    if (currentCtrl.current) currentCtrl.current.abort();
    const ctrl = new AbortController();
    currentCtrl.current = ctrl;

    // DIAG: ne PAS envoyer le filtre à l’API pour vérifier qu’on reçoit bien des données
    const params = new URLSearchParams({ limit: "10", t: String(Date.now()) });
    const url = `${base}/news?${params.toString()}`;
    console.log("[NEWS] URL =", url);

    setLoading(true);
    setError(null);
    try {
      const r = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      console.log("[NEWS] JSON RAW =", json);

      // Accepte 3 formes: tableau direct, {data: [...]}, ou {rows: [...]}
      const list =
        Array.isArray(json) ? json :
        Array.isArray(json?.data) ? json.data :
        Array.isArray(json?.rows) ? json.rows :
        [];

      // Post-filtre côté client si onglet ≠ ALL
      const filtered = tab === "ALL"
        ? list
        : list.filter((n) => {
            const raw = n.symbols;
            const sym = Array.isArray(raw)
              ? raw
              : (typeof raw === "string"
                  ? (() => { try { return JSON.parse(raw); } catch { return []; } })()
                  : []);
            return sym.includes(tab);
          });

      setItems(filtered);
      if (!list.length) {
        console.warn("[NEWS] Liste vide. Vérifie le tri/retour backend et le nom du champ (data/rows).");
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Fetch /news failed:", e);
        setError(e.message || "Erreur de chargement");
        setItems([]);
      }
    } finally {
      if (currentCtrl.current === ctrl) currentCtrl.current = null;
      setLoading(false);
    }
  }, [base, tab]);

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 5 * 60 * 1000);
    const onFocus = () => fetchNews();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      if (currentCtrl.current) currentCtrl.current.abort();
    };
  }, [fetchNews]);

  const refreshAndReload = async () => {
    try {
      setLoading(true);
      await fetch(`${base}/news/refresh?t=${Date.now()}`, { method: "POST", cache: "no-store" });
    } catch (e) {
      console.warn("refresh failed:", e);
    } finally {
      await fetchNews();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-card-foreground">Actualités du Marché</h2>
        <div className="ml-2">
          <SymbolFilter options={TABS} value={tab} onChange={setTab} />
        </div>
        <button
          onClick={refreshAndReload}
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm bg-accent text-accent-foreground hover:bg-muted"
          disabled={loading}
        >
          {loading ? "Rafraîchissement..." : "Rafraîchir"}
        </button>
      </div>

      {error && <div className="text-sm text-rose-600">Impossible de charger les actualités : {error}</div>}

      {loading && !items.length && (
        <div className="mx-auto max-w-3xl space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
           ))}
        </div>
      )}

      {!loading && !items.length && (
        <div className="text-sm text-slate-500 dark:text-slate-400">Aucune news{tab !== "ALL" ? ` pour ${tab}` : ""}.</div>
      )}

      {items.map((n, i) => (
        <NewsCard
          key={n.id ?? n.url}
          category={n.category || (Array.isArray(n.symbols) && n.symbols[0]) || "Marché"}
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
