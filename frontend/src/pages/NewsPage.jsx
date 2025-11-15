// src/pages/NewsPage.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import NewsCard from "../components/news/NewsCard.jsx";
import SymbolFilter from "../components/news/SymbolFilter.jsx";
import { Newspaper, RefreshCw, Search, TrendingUp } from "lucide-react";

const TABS = [
  { label: "Tous", value: "ALL" },
  { label: "BTC",  value: "BTC" },
  { label: "ETH",  value: "ETH" },
  { label: "BNB",  value: "BNB" },
  { label: "SOL",  value: "SOL" },
  { label: "ADA",  value: "ADA" },
  { label: "XRP",  value: "XRP" },
  { label: "DOGE", value: "DOGE" },
  { label: "DOT",  value: "DOT" },
];

export default function NewsPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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

    // DIAG: ne PAS envoyer le filtre à l'API pour vérifier qu'on reçoit bien des données
    const params = new URLSearchParams({ limit: "50", t: String(Date.now()) });
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

  // Filtrage par recherche
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.excerpt?.toLowerCase().includes(q) ||
      n.summary?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Indicateur "nouveau" (< 24h)
  const isNew = (publishedAt) => {
    if (!publishedAt) return false;
    const date = new Date(publishedAt);
    const now = new Date();
    return (now - date) < 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 border-2 border-primary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/20 p-3 border border-primary/30">
            <Newspaper className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-card-foreground mb-1">Actualités Crypto</h1>
            <p className="text-sm text-muted-foreground">
              Restez informé des dernières nouvelles du marché • Mise à jour toutes les 5 minutes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-card-foreground">{filteredItems.length}</div>
              <div className="text-xs text-muted-foreground">articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de contrôles */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher dans les actualités..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Filtres + Rafraîchir */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrer par crypto :</span>
          </div>
          <SymbolFilter options={TABS} value={tab} onChange={setTab} />
          <button
            onClick={refreshAndReload}
            className="ml-auto flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm bg-accent text-accent-foreground hover:bg-muted transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-600 dark:text-red-400">
          Impossible de charger les actualités : {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !items.length && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !filteredItems.length && (
        <div className="bg-card rounded-2xl p-12 border border-border text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            {searchQuery ? "Aucun résultat" : "Aucune actualité"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `Aucun article ne correspond à "${searchQuery}"`
              : tab !== "ALL"
                ? `Aucune actualité disponible pour ${tab}`
                : "Aucune actualité disponible pour le moment"
            }
          </p>
        </div>
      )}

      {/* Liste des articles */}
      <div className="space-y-4">
        {filteredItems.map((n, i) => {
          const publishedAt = n.published_at || n.publishedAt || n.created_at || n.date;
          const symbols = Array.isArray(n.symbols) ? n.symbols : [];
          const votes = n.votes || {};
          const hasSocialEngagement = votes.positive > 0 || votes.negative > 0 || votes.important > 0;

          return (
            <div key={n.id ?? n.url} className="relative">
              {/* Badge "Nouveau" */}
              {isNew(publishedAt) && (
                <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                  Nouveau
                </div>
              )}

              {/* Badge engagement social */}
              {hasSocialEngagement && (
                <div className="absolute -top-2 left-4 z-10 bg-violet-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {votes.important > 0 && `${votes.important} 🔥`}
                  {votes.positive > 0 && `${votes.positive} 👍`}
                </div>
              )}

              <NewsCard
                category={symbols[0] || n.category || "Marché"}
                title={n.title}
                excerpt={n.excerpt || n.summary || n.description}
                source={n.source}
                publishedAt={publishedAt}
                imageUrl={n.imageUrl || n.image_url}
                href={n.url}
                featured={i === 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
