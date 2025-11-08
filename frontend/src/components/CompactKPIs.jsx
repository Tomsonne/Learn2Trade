import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import positionsToKpis from "../utils/positionsToKpis";

export default function CompactKPIs({ positions = [], cash = 0 }) {
  const kpis = positionsToKpis(positions, cash);

  const fmtUSD = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  };

  const isProfitable = kpis.pnlAbs >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* Solde Total */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Solde Total</span>
        </div>
        <div className="text-lg font-bold text-card-foreground">{fmtUSD(kpis.balance)}</div>
      </div>

      {/* PnL */}
      <div className={`border rounded-lg p-3 ${
        isProfitable
          ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20'
          : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {isProfitable ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs text-muted-foreground font-medium">PnL</span>
        </div>
        <div className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
          {isProfitable ? '+' : ''}{fmtUSD(kpis.pnlAbs)}
        </div>
        <div className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
          {isProfitable ? '+' : ''}{kpis.pnlPct.toFixed(2)}%
        </div>
      </div>

      {/* Cash */}
      <div className="bg-accent/50 border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Cash</span>
        </div>
        <div className="text-lg font-bold text-card-foreground">{fmtUSD(kpis.cash)}</div>
      </div>

      {/* Équité */}
      <div className="bg-accent/50 border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Équité</span>
        </div>
        <div className="text-lg font-bold text-card-foreground">{fmtUSD(kpis.equity)}</div>
      </div>
    </div>
  );
}
