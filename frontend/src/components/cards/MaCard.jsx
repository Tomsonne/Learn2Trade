import React, { useMemo } from "react";
import { formatDateOnly, formatTimeOnly } from "../../utils/formatDate";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";

export default function MaCard({
  series,
  maSignal,
  fmt,          // (v:number)=>string
  price,        // spot (optionnel)
  tf = "1h",
  height = 220,
}) {
  const Icon = maSignal.icon;

  // couleurs depuis le thème (CSS variables)
  const theme = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const hsl = (name, fallback) => {
      const v = css.getPropertyValue(name).trim();
      return v ? `hsl(${v})` : fallback;
    };
    return {
      tick:  hsl("--muted-foreground", "rgba(148,163,184,.9)"),
      grid:  "rgba(148,163,184,.18)",
      spot:  hsl("--primary", "rgb(37, 99, 235)"),
      ma20:  hsl("--chart-1", hsl("--primary", "rgb(37, 99, 235)")),
      ma50:  hsl("--chart-2", hsl("--secondary", "rgb(99, 102, 241)")),
    };
  }, []);

  // données propres -> { x: time(sec), ma20, ma50 }
  const data = useMemo(() => {
    const arr = (Array.isArray(series) ? series : [])
      .filter(d => Number.isFinite(d?.ts) && (Number.isFinite(d?.ma20) || Number.isFinite(d?.ma50)))
      .map(d => ({
        x: Math.floor(Number(d.ts) / 1000), // ts(ms) -> s pour l’axe temps
        ma20: Number.isFinite(d.ma20) ? Number(d.ma20) : null,
        ma50: Number.isFinite(d.ma50) ? Number(d.ma50) : null,
      }));
    return arr.slice(-300);
  }, [series]);

  // domaine Y avec petite marge
  const [yMin, yMax] = useMemo(() => {
    const vals = [];
    for (const p of data) {
      if (Number.isFinite(p.ma20)) vals.push(p.ma20);
      if (Number.isFinite(p.ma50)) vals.push(p.ma50);
    }
    if (!vals.length) return [0, 1];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.1, (min || 1) * 0.01);
    return [min - pad, max + pad];
  }, [data]);

  // format ticks X selon TF
 const fmtTick = useMemo(() => {
     return (xSec) => (tf === "1d" ? formatDateOnly(xSec) : formatTimeOnly(xSec));
     }, [tf]);

  const tickCountX = tf === "1h" ? 5 : tf === "4h" ? 6 : tf === "12h" ? 6 : 7;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-card-foreground">Signal Moyennes Mobiles</h3>
          <div className="text-sm text-muted-foreground mt-1">
            Prix actuel : {price != null ? fmt(price) : "—"}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${maSignal.bg}`} title={maSignal.text}>
          <Icon className={`w-4 h-4 ${maSignal.color}`} />
          <span className={`text-sm font-medium ${maSignal.color}`}>{maSignal.text}</span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 12 }}>
            <CartesianGrid stroke={theme.grid} />

            <XAxis
              dataKey="x"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={fmtTick}
              tick={{ fontSize: 11, fill: theme.tick }}
              tickCount={tickCountX}
              minTickGap={24}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => fmt(Number(v))}
              width={56}
              tick={{ fontSize: 11, fill: theme.tick }}
              axisLine={false}
              tickLine={false}
            />

            {/* repère du prix spot si dispo */}
            {Number.isFinite(price) && (
              <ReferenceLine
                y={price}
                stroke={theme.spot}
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
              />
            )}

            {/* MA20 & MA50 (connectNulls pour éviter les trous) */}
            <Line
              type="monotone"
              name="MA20"
              dataKey="ma20"
              stroke="hsl(var(--ma20))"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              name="MA50"
              dataKey="ma50"
              stroke="hsl(var(--ma50))"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />

            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ paddingTop: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
