import { Wallet, TrendingUp, PiggyBank, BarChart3 } from "lucide-react";
import KpiCard from "./KpiCard";
import positionsToKpis from "../../utils/positionsToKpis";

const fmtMoney = (n, currency = "USD", locale = "fr-FR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n ?? 0);
const fmtPct = (n, locale = "fr-FR") =>
  new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format((n ?? 0) / 100);

export default function KpiGrid({ positions = [], cash = 0 }) {
  const { balance, pnlAbs, pnlPct, invested, cash: cashUsd } = positionsToKpis(positions, cash);

  const kpis = [
    { icon: <Wallet className="w-5 h-5" />,      title: "Solde Total",     value: fmtMoney(balance, "USD") },
    { icon: <TrendingUp className="w-5 h-5" />,  title: "PnL Latent",       value: `${pnlAbs >= 0 ? "+" : ""}${fmtMoney(pnlAbs, "USD")}`, sub: fmtPct(pnlPct) },
    { icon: <PiggyBank className="w-5 h-5" />,   title: "Cash Disponible", value: fmtMoney(cashUsd, "USD") },
    { icon: <BarChart3 className="w-5 h-5" />,   title: "Montant Investi", value: fmtMoney(invested, "USD") },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
    </div>
  );
}

