// src/components/dashboard/KpiCard.jsx
import CardBase from "../ui/CardBase";

export default function KpiCard({ icon, title, value, sub }) {
  return (
    <CardBase className="flex flex-col justify-between">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold text-card-foreground">{value}</p>
        {sub && <p className="text-sm font-medium text-brand">{sub}</p>}
      </div>
    </CardBase>
  );
}
