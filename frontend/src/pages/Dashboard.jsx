// src/pages/Dashboard.jsx
import KpiCard from "../components/dashboard/KpiCard";
import PortfolioDistribution from "../components/dashboard/PortfolioDistribution";
import PositionsTable from "../components/dashboard/PositionsTable";

export default function Dashboard() {
  const kpis = [
    { icon: "💰", title: "Solde Total", value: "10 000,00 €" },
    { icon: "📈", title: "PnL Total", value: "+1 234,56 €", sub: "+12,35 %" },
    { icon: "🏦", title: "Cash Disponible", value: "2 500,00 €" },
    { icon: "📊", title: "Montant Investi", value: "7 500,00 €" },
  ];

  const portfolio = [
    { pair: "BTC/USD", label: "Bitcoin", percent: 54.5 },
    { pair: "ETH/USD", label: "Ethereum", percent: 22.1 },
    { pair: "EUR/USD", label: "Euro/Dollar", percent: 23.4 },
  ];

  const positions = [
    { pair: "BTC/USD", label: "Bitcoin", qty: "0,25", avg: "42 000,00 €", current: "43 567,80 €", value: "10 891,95 €", pnl: "+391,95 €", pnlPct: "+3,73 %", positive: true },
    { pair: "ETH/USD", label: "Ethereum", qty: "1,8", avg: "2 400,00 €", current: "2 456,30 €", value: "4 421,34 €", pnl: "+101,34 €", pnlPct: "+2,35 %", positive: true },
    { pair: "EUR/USD", label: "Euro/Dollar", qty: "5 000", avg: "1,09 €", current: "1,08 €", value: "5 417,00 €", pnl: "−80,00 €", pnlPct: "−1,45 %", positive: false },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </div>

      {/* Répartition + Tableau (pleine largeur) */}
      <PortfolioDistribution items={portfolio} />
      <PositionsTable rows={positions} />
    </div>
  );
}
