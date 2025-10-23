import { useEffect, useMemo, useState, useCallback } from "react";
import KpiGrid from "../components/dashboard/KpiGrid";
import PortfolioDistribution from "../components/dashboard/PortfolioDistribution";
import PositionsTable from "../components/dashboard/PositionsTable";

const API_URL = "http://localhost:8000/api/v1";

// --- Helpers ---------------------------------------------------------------
const num = (v) => Number(v ?? 0);
//true pour afficher BTC/USD au lieu de BTCUSDT
const SHOW_USD_SUFFIX = true;
const toUiPair = (symbol) => {
  if (!SHOW_USD_SUFFIX || !symbol || typeof symbol !== "string") return symbol;
  if (symbol.endsWith("USDT")) return `${symbol.slice(0, -4)}/USD`;
  if (symbol.endsWith("USD"))  return `${symbol.slice(0, -3)}/USD`;
  return symbol;
};
// --------------------------------------------------------------------------

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Session
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data?.status === "ok" ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  // 2) Données utilisateur
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [resPos, resTrd] = await Promise.all([
        fetch(`${API_URL}/position?userId=${user.id}`, { credentials: "include" }),
        fetch(`${API_URL}/trade?userId=${user.id}`,    { credentials: "include" }),
      ]);
      const jsonPos = await resPos.json();
      const jsonTrd = await resTrd.json();
      setPositions(jsonPos.data || []);
      setTrades(jsonTrd.data || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // 3) Cash : on garde la valeur backend (fiable pour tes KPI)
  const cashUsd = num(user?.cash);

  // 4) Répartition portefeuille (valorisation simple positions + cash)
  const portfolioItems = useMemo(() => {
    const rows = (positions || [])
      .map((p) => {
        const pair  = toUiPair(p.pair || p.symbol || p.ticker || p.name);
        const qty   = num(p.quantity ?? p.qty ?? p.size);
        const price = num(
          p.lastPrice ?? p.last_price ??
          p.markPrice ?? p.price ??
          p.avgPrice  ?? p.avg_price ??
          p.price_open
        );
        const valueUsd = qty > 0 && price > 0 ? qty * price : 0;
        return valueUsd > 0
          ? { pair, label: pair?.split("/")?.[0] || pair, valueUsd }
          : null;
      })
      .filter(Boolean);

    const positionsValue = rows.reduce((s, r) => s + r.valueUsd, 0);
    const total = positionsValue + cashUsd;

    const items = [
      ...rows.map((r) => ({
        pair: r.pair,
        label: r.label,
        value: r.valueUsd,        // pour PortfolioDistribution
        percent: total > 0 ? +((r.valueUsd / total) * 100).toFixed(2) : 0,
      })),
      {
        pair: "CASH/USD",
        label: "Cash",
        value: cashUsd,
        percent: total > 0 ? +((cashUsd / total) * 100).toFixed(2) : 0,
      },
    ].sort((a, b) => b.value - a.value);

    // PortfolioDistribution affiche p.percent et la barre via width: `${p.percent}%`
    return items;
  }, [positions, cashUsd]);

  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        Vous devez être connecté pour accéder au tableau de bord.
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <KpiGrid positions={positions} cash={cashUsd} />
      <PortfolioDistribution items={portfolioItems} />
      <PositionsTable rows={positions} />
    </div>
  );
}
