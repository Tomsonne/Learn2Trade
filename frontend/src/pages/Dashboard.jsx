import { useEffect, useMemo, useState } from "react";
import KpiGrid from "../components/dashboard/KpiGrid";
import PortfolioDistribution from "../components/dashboard/PortfolioDistribution";
import PositionsTable from "../components/dashboard/PositionsTable";
import { cashFromTradesSingleRow } from "../utils/cashFromTrades";

export default function Dashboard() {
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);

  const initialCashUsd = 10000; // depuis ta table User

  useEffect(() => {
    (async () => {
      const [resPos, resTrd] = await Promise.all([
        fetch("/api/v1/position?userId=4013c82a-9af8-44da-8334-66bfc364333a"),
        fetch("/api/v1/trade?userId=4013c82a-9af8-44da-8334-66bfc364333a"),
      ]);
      const jsonPos = await resPos.json();
      const jsonTrd = await resTrd.json();
      setPositions(jsonPos.data || []);
      setTrades(jsonTrd.data || []);
    })();
  }, []);

  const cashUsd = useMemo(
    () => cashFromTradesSingleRow(trades, initialCashUsd),
    [trades, initialCashUsd]
  );

  const portfolio = [
    { pair: "BTC/USD", label: "Bitcoin", percent: 54.5 },
    { pair: "ETH/USD", label: "Ethereum", percent: 22.1 },
    { pair: "EUR/USD", label: "Euro/Dollar", percent: 23.4 },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <KpiGrid positions={positions} cash={cashUsd} />
      <PortfolioDistribution items={portfolio} />
      <PositionsTable rows={positions} />
    </div>
  );
}
