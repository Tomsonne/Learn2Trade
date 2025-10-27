// src/pages/History.jsx
import { useEffect, useState, useCallback } from "react";
import CardBase from "../components/ui/CardBase";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://skillvest-production.up.railway.app/api/v1";

const nfUsd = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const nfQty = new Intl.NumberFormat("fr-FR", {
  maximumSignificantDigits: 6,
});
const nfPct = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vérifie la session utilisateur
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data?.status === "ok" ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  // Récupère l’historique de trades fermés
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

  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        Vous devez être connecté pour accéder à votre historique.
      </div>
    );

  if (!trades.length)
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-card-foreground">
        Historique des Trades
      </h1>

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
            {trades.map((t) => {
              const pnlAbs = Number(t.pnl_abs ?? t.realized_pnl ?? 0);
              const pnlPct = Number(t.pnl_pct ?? 0);
              const positive = pnlAbs >= 0;
              const status = t.is_closed ? "Clôturé" : "Ouvert";
              const symbol = t.asset?.symbol || t.symbol || "#";

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
                  <td className="px-3 py-2 font-medium text-card-foreground">
                    {symbol}
                  </td>
                  <td className="px-3 py-2">{t.side}</td>
                  <td className="px-3 py-2">{nfQty.format(t.quantity)}</td>
                  <td className="px-3 py-2">{nfUsd.format(t.price_open)}</td>
                  <td className="px-3 py-2">{nfUsd.format(t.price_close)}</td>
                  <td className="px-3 py-2 font-medium">
                    <span className={positive ? "text-emerald-500" : "text-rose-500"}>
                      {`${pnlAbs >= 0 ? "+" : ""}${nfUsd.format(pnlAbs)}`}
                    </span>
                    <span
                      className={`ml-1 text-xs ${
                        positive ? "text-emerald-500" : "text-rose-500"
                      }`}
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
