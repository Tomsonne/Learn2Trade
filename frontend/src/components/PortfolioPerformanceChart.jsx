import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CardBase from "./ui/CardBase";
import { TrendingUp, TrendingDown } from "lucide-react";

const fmtUSD = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
};

const fmtShortUSD = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M $`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K $`;
  return `${n.toFixed(0)} $`;
};

export default function PortfolioPerformanceChart({ positions = [], cash = 0, trades = [] }) {
  // Générer des données basées sur l'historique réel des trades
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    // Calculer la valeur actuelle du portfolio
    const currentEquity = positions.reduce((sum, p) => sum + Number(p.value || 0), 0);
    const currentBalance = Number(cash) + currentEquity;

    // Si pas de trades, afficher juste le cash actuel
    if (trades.length === 0) {
      const cashValue = Number(cash) || 0;
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          fullDate: date.toLocaleDateString("fr-FR"),
          value: cashValue,
        });
      }
      return data;
    }

    // Trouver le trade le plus ancien pour déterminer la période
    const oldestTradeDate = trades.reduce((oldest, trade) => {
      const tradeDate = new Date(trade.opened_at || now);
      return tradeDate < oldest ? tradeDate : oldest;
    }, now);

    const daysSinceOldest = Math.max(1, Math.ceil((now - oldestTradeDate) / (1000 * 60 * 60 * 24)));
    const daysToShow = Math.min(Math.max(daysSinceOldest + 1, 7), 30);

    // Calculer le PnL total actuel
    const totalPnl = positions.reduce((sum, p) => sum + Number(p.pnl || 0), 0);

    // Créer une timeline simple : valeur totale = cash + valeur positions
    const timeline = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Pour chaque jour, on estime la valeur en interpolant le PnL
      // Valeur du jour = Balance actuelle - (PnL actuel * (jours restants / jours totaux))
      const daysFromStart = daysToShow - 1 - i;
      const progressRatio = daysFromStart / (daysToShow - 1);

      // PnL accumulé jusqu'à ce jour
      const pnlAtDate = totalPnl * progressRatio;

      // Valeur = balance actuelle - (PnL non encore réalisé à cette date)
      const valueAtDate = currentBalance - totalPnl + pnlAtDate;

      timeline.push({
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        fullDate: date.toLocaleDateString("fr-FR"),
        value: Math.max(0, valueAtDate),
      });
    }

    // S'assurer que la dernière valeur est exactement la valeur actuelle
    if (timeline.length > 0) {
      timeline[timeline.length - 1].value = currentBalance;
    }

    console.log('📊 Chart data generated:', {
      dataPoints: timeline.length,
      daysToShow,
      currentBalance,
      totalPnl,
      firstValue: timeline[0]?.value,
      lastValue: timeline[timeline.length - 1]?.value,
      timeline: timeline.map(t => ({ date: t.date, value: t.value }))
    });

    return timeline;
  }, [positions, cash, trades]);

  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : Number(cash);
  const initialValue = chartData.length > 0 ? chartData[0].value : cash;
  const change = currentValue - initialValue;
  const changePercent = initialValue !== 0 ? ((change / initialValue) * 100) : 0;
  const isPositive = change >= 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-sm font-semibold text-card-foreground">{fmtUSD(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculer le nombre de jours d'uptime
  const uptimeDays = useMemo(() => {
    if (trades.length === 0) return 0;
    const oldestTrade = trades.reduce((oldest, trade) => {
      const tradeDate = new Date(trade.opened_at || new Date());
      return tradeDate < oldest ? tradeDate : oldest;
    }, new Date());
    return Math.max(0, Math.ceil((new Date() - oldestTrade) / (1000 * 60 * 60 * 24)));
  }, [trades]);

  // Calculer le rendement journalier moyen
  const avgDailyReturn = useMemo(() => {
    if (uptimeDays === 0) return 0;
    return changePercent / uptimeDays;
  }, [changePercent, uptimeDays]);

  return (
    <CardBase className="bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Performance du Portfolio</h3>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-muted-foreground">
              {uptimeDays > 0 ? `${uptimeDays} jour${uptimeDays > 1 ? 's' : ''} d'activité` : 'Nouveau portfolio'}
            </p>
            {uptimeDays > 0 && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <p className={`text-xs font-medium ${avgDailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {avgDailyReturn >= 0 ? '+' : ''}{avgDailyReturn.toFixed(2)}% par jour
                </p>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-card-foreground">{fmtUSD(currentValue)}</div>
          <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? "+" : ""}{fmtUSD(change)}</span>
            <span className="text-xs">({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "11px" }}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "11px" }}
              tickFormatter={fmtShortUSD}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#colorValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardBase>
  );
}
