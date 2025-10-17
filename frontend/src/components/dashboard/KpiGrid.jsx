import KpiCard from "./KpiCard";
import positionsToKpis from "../../utils/positionsToKpis";

const fmtMoney = (n, currency = "USD", locale = "fr-FR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n ?? 0);
const fmtPct = (n, locale = "fr-FR") =>
  new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format((n ?? 0) / 100);

export default function KpiGrid({ positions = [], cash = 0 }) {
  const { balance, pnlAbs, pnlPct, invested, cash: cashUsd } = positionsToKpis(positions, cash);

  const kpis = [
    { icon: "💰", title: "Solde Total", value: fmtMoney(balance, "USD") },
    { icon: "📈", title: "PnL Total", value: `${pnlAbs >= 0 ? "+" : ""}${fmtMoney(pnlAbs, "USD")}`, sub: fmtPct(pnlPct) },
    { icon: "🏦", title: "Cash Disponible", value: fmtMoney(cashUsd, "USD") },
    { icon: "📊", title: "Montant Investi", value: fmtMoney(invested, "USD") },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
    </div>
  );
}
