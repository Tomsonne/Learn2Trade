// src/components/cards/RsiCard.jsx
import React, { useMemo } from "react";
import { formatDateOnly, formatTimeOnly } from "/src/utils/formatDate";
import Tooltip from "../ui/Tooltip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export default function RsiCard({
  series,
  rsiSignal,
  currentRSI,
  tf = "1h",
  height = 220,
}) {
  const Icon = rsiSignal.icon;

  // Données propres: { x: time(sec), rsi }
  const rsiData = useMemo(() => {
    const cleaned = (Array.isArray(series) ? series : [])
      .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.rsi))
      .map(d => ({ x: Math.floor(Number(d.ts) / 1000), rsi: Number(d.rsi) }));
    return cleaned.slice(-300);
  }, [series]);

  // Format de l'axe X selon la TF
  const fmtTick = useMemo(() => {
    return (xSec) => (tf === "1d" ? formatDateOnly(xSec) : formatTimeOnly(xSec));
    }, [tf]);
  // Densité de ticks suivant la TF (indice visuel)
  const tickCount = tf === "1h" ? 5 : tf === "4h" ? 6 : tf === "12h" ? 6 : 7;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-card-foreground">Signal RSI</h3>
          <Tooltip
            content={
              <div className="space-y-2">
                <p className="font-semibold">Qu'est-ce que le RSI ?</p>
                <p className="text-xs">Le RSI (Relative Strength Index) mesure la force d'un mouvement de prix sur une échelle de 0 à 100.</p>
                <ul className="text-xs space-y-1 list-disc list-inside mt-2">
                  <li><strong>RSI &gt; 70 :</strong> Suracheté 🔴 (le prix pourrait baisser)</li>
                  <li><strong>RSI 30-70 :</strong> Zone neutre ⚪</li>
                  <li><strong>RSI &lt; 30 :</strong> Survendu 🟢 (le prix pourrait monter)</li>
                </ul>
                <p className="text-xs mt-2">💡 <strong>Conseil :</strong> Évitez d'acheter quand RSI &gt; 70 et de vendre quand RSI &lt; 30.</p>
              </div>
            }
          />
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${rsiSignal.bg}`} title={rsiSignal.text}>
          <Icon className={`w-4 h-4 ${rsiSignal.color}`} />
          <span className={`text-sm font-medium ${rsiSignal.color}`}>{rsiSignal.text}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="text-3xl font-medium text-card-foreground">
          {currentRSI == null ? "—" : Number(currentRSI).toFixed(1)}
        </div>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rsiData} margin={{ top: 8, right: 12, bottom: 6, left: 8 }}>
            {/* Grille douce */}
            <CartesianGrid stroke="rgba(148,163,184,.18)" />

            {/* Axe X = temps (en secondes) -> format selon TF */}
            <XAxis
              dataKey="x"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={fmtTick}
              tick={{ fontSize: 11, fill: "rgba(148,163,184,.9)" }}
              tickCount={tickCount}
              minTickGap={24}
              axisLine={false}
              tickLine={false}
            />

            {/* Axe Y 0..100 + ticks clés */}
            <YAxis
              domain={[0, 100]}
              ticks={[0, 30, 50, 70, 100]}
              width={30}
              tick={{ fontSize: 11, fill: "rgba(148,163,184,.9)" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Repères de zones */}
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4" />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />

            {/* Courbe RSI */}
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

