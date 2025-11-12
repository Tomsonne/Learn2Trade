// src/pages/History.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import CardBase from "../components/ui/CardBase";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://skillvest-production.up.railway.app/api/v1";

const nfUsd = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const nfQty = new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 6 });
const nfPct = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // "ALL" | "BTC" | "ETH"

  // Vérifie la session utilisateur
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data?.status === "ok" ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  // Récupère les trades fermés
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/trade?userId=${user.id}&is_closed=true`, {
        credentials: "include",
      });
      const json = await res.json();
      setTrades(json?.data || []);
    } catch (e) {
      console.error("Erreur History fetch:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  // Tri du plus récent au plus ancien
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      const da = new Date(a.closed_at || a.updated_at || a.created_at);
      const db = new Date(b.closed_at || b.updated_at || b.created_at);
      return db - da;
    });
  }, [trades]);

  // Filtrage par actif
  const filteredTrades = useMemo(() => {
    if (filter === "ALL") return sortedTrades;
    return sortedTrades.filter((t) => {
      const sym = (t.asset?.symbol || t.symbol || "").toUpperCase();
      return sym.includes(filter);
    });
  }, [sortedTrades, filter]);

  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        Vous devez être connecté pour accéder à votre historique.
      </div>
    );

  if (!filteredTrades.length)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Aucun trade clôturé pour le moment.
      </div>
    );

  const calcDuration = (t) => {
    const open = new Date(t.created_at || t.opened_at);
    const close = new Date(t.closed_at || t.updated_at);
    const diffH = Math.abs(close - open) / 36e5;
    return diffH < 1 ? `${Math.round(diffH * 60)} min` : `${diffH.toFixed(1)} h`;
  };

  // Fallback local si le backend n’envoie pas encore pnl_pct
  const calcLocalPct = (t) => {
    const entry = parseFloat(t.price_open);
    const qty = parseFloat(t.quantity);
    const pnl = parseFloat(t.pnl);
    if (!Number.isFinite(entry) || !Number.isFinite(qty) || !Number.isFinite(pnl)) return 0;
    const invested = entry * qty;
    return invested ? (pnl / invested) * 100 : 0;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-card-foreground">
          Historique des Trades
        </h1>

        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {["ALL", "BTC", "ETH"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 text-sm transition ${
                filter === opt
                  ? "bg-indigo-600 text-white"
                  : "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700"
              } ${opt !== "ALL" ? "border-l border-border" : ""}`}
            >
              {opt === "ALL" ? "Tous" : opt}
            </button>
          ))}
        </div>
      </div>

      <CardBase className="overflow-x-auto bg-card border border-border rounded-2xl">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Actif</th>
              <th className="px-3 py-2 font-medium">Côté</th>
              <th className="px-3 py-2 font-medium">Quantité</th>
              <th className="px-3 py-2 font-medium">Entrée</th>
              <th className="px-3 py-2 font-medium">Sortie</th>
              <th className="px-3 py-2 font-medium">P/L</th>
              <th className="px-3 py-2 font-medium">Durée</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((t) => {
              const pnlAbs = Number(t.pnl ?? 0);
              const pnlPct = Number(t.pnl_pct ?? calcLocalPct(t));
              const positive = pnlAbs >= 0;
              const symbol = t.asset?.symbol || t.symbol || "#";
              const status = t.is_closed ? "Clôturé" : "Ouvert";

              return (
                <tr key={t.id} className="bg-surface rounded-xl shadow-sm">
                  <td className="px-3 py-2">
                    {new Date(t.closed_at || t.updated_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2 font-medium text-card-foreground">{symbol}</td>
                  <td className="px-3 py-2">{t.side}</td>
                  <td className="px-3 py-2">{nfQty.format(t.quantity)}</td>
                  <td className="px-3 py-2">{nfUsd.format(t.price_open)}</td>
                  <td className="px-3 py-2">{nfUsd.format(t.price_close)}</td>
                  <td className="px-3 py-2 font-medium">
                    <span className={positive ? "text-emerald-500" : "text-rose-500"}>
                      {`${pnlAbs >= 0 ? "+" : ""}${nfUsd.format(pnlAbs)}`}
                    </span>
                    <span
                      className={`ml-1 text-xs ${positive ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      ({nfPct.format(pnlPct)}%)
                    </span>
                  </td>
                  <td className="px-3 py-2">{calcDuration(t)}</td>
                  <td className="px-3 py-2">{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBase>
    </div>
  );
}
