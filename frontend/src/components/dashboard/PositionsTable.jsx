// src/components/dashboard/PositionsTable.jsx
import CardBase from "../ui/CardBase";

export default function PositionsTable({ rows = [] }) {
  return (
    <CardBase className="col-span-full overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold">Détail des Positions</h2>
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="px-2 py-1 font-medium">Actif</th>
            <th className="px-2 py-1 font-medium">Quantité</th>
            <th className="px-2 py-1 font-medium">Prix Moyen</th>
            <th className="px-2 py-1 font-medium">Prix Actuel</th>
            <th className="px-2 py-1 font-medium">Valeur</th>
            <th className="px-2 py-1 font-medium">PnL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={i} className="rounded-xl bg-surface shadow-sm">
              <td className="px-2 py-2 font-medium text-app">
                {p.pair}
                <span className="block text-xs text-muted">{p.label}</span>
              </td>
              <td className="px-2 py-2">{p.qty}</td>
              <td className="px-2 py-2">{p.avg}</td>
              <td className="px-2 py-2">{p.current}</td>
              <td className="px-2 py-2">{p.value}</td>
              <td className="px-2 py-2 font-medium">
                <span className={p.positive ? "text-emerald-500" : "text-rose-500"}>
                  {p.pnl}
                </span>
                <span className={`ml-1 text-xs ${p.positive ? "text-emerald-500" : "text-rose-500"}`}>
                  {p.pnlPct}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardBase>
  );
}
