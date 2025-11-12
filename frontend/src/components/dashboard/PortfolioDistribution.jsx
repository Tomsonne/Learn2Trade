// src/components/dashboard/PortfolioDistribution.jsx
import CardBase from "../ui/CardBase";

export default function PortfolioDistribution({ items = [] }) {
  return (
    <CardBase className="col-span-full">
      <h2 className="mb-4 text-lg font-semibold">Répartition du Portefeuille</h2>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-app">
                {p.pair} <span className="ml-2 text-muted">{p.label}</span>
              </span>
              <span className="text-muted">{p.percent.toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary" style={{ width: `${p.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </CardBase>
  );
}
