import { useEffect, useMemo, useState, useCallback } from "react";
import KpiGrid from "../components/dashboard/KpiGrid";
import PortfolioDistribution from "../components/dashboard/PortfolioDistribution";
import PositionsTable from "../components/dashboard/PositionsTable";
import { cashFromTradesSingleRow } from "../utils/cashFromTrades";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://skillvest-production.up.railway.app/api/v1";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 1. Vérifie la session utilisateur (comme dans TradesPage)
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status === "ok" && data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  // 📊 2. Récupère positions et trades pour le user connecté
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [resPos, resTrd] = await Promise.all([
        fetch(`${API_URL}/position?userId=${user.id}`, { credentials: "include" }),
        fetch(`${API_URL}/trade?userId=${user.id}`, { credentials: "include" }),
      ]);

      const jsonPos = await resPos.json();
      const jsonTrd = await resTrd.json();

      setPositions(jsonPos.data || []);
      setTrades(jsonTrd.data || []);
    } catch (e) {
      console.error("Erreur Dashboard fetch:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    console.log("User connecté :", user);
  }, [user]);
  

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // 💵 3. Utilise le cash réel du user au lieu d’une constante
  const initialCashUsd = user?.cash ?? 0;

  // 💰 4. Calcule le cash actuel à partir des trades
  const cashUsd = user?.cash ?? 0;


  const portfolio = [
    { pair: "BTC/USD", label: "Bitcoin", percent: 54.5 },
    { pair: "ETH/USD", label: "Ethereum", percent: 22.1 },
    { pair: "EUR/USD", label: "Euro/Dollar", percent: 23.4 },
  ];

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
      <PortfolioDistribution items={portfolio} />
      <PositionsTable rows={positions} />
    </div>
  );
}
