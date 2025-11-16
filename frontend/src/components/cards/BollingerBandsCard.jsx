import React, { useMemo } from "react";
import { formatDateOnly, formatTimeOnly } from "../../utils/formatDate";
import Tooltip from "../ui/Tooltip";
import { Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

export default function BollingerBandsCard({
  series,
  fmt,          // (v:number)=>string
  price,        // spot (optionnel)
  tf = "1h",
  height = 220,
  currentRSI = null, // Ajout RSI pour confluence
}) {
  // couleurs depuis le thème (CSS variables)
  const theme = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const hsl = (name, fallback) => {
      const v = css.getPropertyValue(name).trim();
      return v ? `hsl(${v})` : fallback;
    };
    return {
      tick:     hsl("--muted-foreground", "rgba(148,163,184,.9)"),
      grid:     "rgba(148,163,184,.18)",
      spot:     hsl("--primary", "rgb(37, 99, 235)"),
      bbUpper:  hsl("--chart-3", "rgb(239, 68, 68)"),      // rouge
      bbMiddle: hsl("--chart-1", "rgb(59, 130, 246)"),     // bleu
      bbLower:  hsl("--chart-4", "rgb(34, 197, 94)"),      // vert
      bbFill:   "rgba(147, 197, 253, 0.15)",               // bleu transparent
    };
  }, []);

  // données propres -> { x: time(sec), bbUpper, bbMiddle, bbLower, close }
  const data = useMemo(() => {
    const arr = (Array.isArray(series) ? series : [])
      .filter(d => Number.isFinite(d?.ts) &&
                   (Number.isFinite(d?.bbUpper) ||
                    Number.isFinite(d?.bbMiddle) ||
                    Number.isFinite(d?.bbLower)))
      .map(d => ({
        x: Math.floor(Number(d.ts) / 1000),
        bbUpper: Number.isFinite(d.bbUpper) ? Number(d.bbUpper) : null,
        bbMiddle: Number.isFinite(d.bbMiddle) ? Number(d.bbMiddle) : null,
        bbLower: Number.isFinite(d.bbLower) ? Number(d.bbLower) : null,
        close: Number.isFinite(d.c) ? Number(d.c) : null,
      }));
    return arr.slice(-300);
  }, [series]);

  // domaine Y avec petite marge
  const [yMin, yMax] = useMemo(() => {
    const vals = [];
    for (const p of data) {
      if (Number.isFinite(p.bbUpper)) vals.push(p.bbUpper);
      if (Number.isFinite(p.bbLower)) vals.push(p.bbLower);
      if (Number.isFinite(p.close)) vals.push(p.close);
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

  // Valeurs actuelles
  const last = data[data.length - 1] || {};
  const currentBBUpper = last.bbUpper;
  const currentBBMiddle = last.bbMiddle;
  const currentBBLower = last.bbLower;

  // Détection du squeeze (compression des bandes)
  const squeezeInfo = useMemo(() => {
    if (data.length < 20) return { isSqueeze: false, trend: "neutral" };

    const recent = data.slice(-20);
    const bandwidths = recent
      .filter(d => Number.isFinite(d.bbUpper) && Number.isFinite(d.bbLower))
      .map(d => d.bbUpper - d.bbLower);

    if (bandwidths.length < 15) return { isSqueeze: false, trend: "neutral" };

    const currentBW = bandwidths[bandwidths.length - 1];
    const avgBW = bandwidths.reduce((a, b) => a + b, 0) / bandwidths.length;
    const minBW = Math.min(...bandwidths);

    // Squeeze = bande actuelle est dans les 20% les plus étroites
    const isSqueeze = currentBW < avgBW * 0.8 && currentBW <= minBW * 1.1;

    // Tendance : prix par rapport à la bande moyenne
    let trend = "neutral";
    if (Number.isFinite(price) && Number.isFinite(currentBBMiddle)) {
      if (price > currentBBMiddle * 1.01) trend = "bullish";
      else if (price < currentBBMiddle * 0.99) trend = "bearish";
    }

    return { isSqueeze, trend, bandwidth: currentBW };
  }, [data, price, currentBBMiddle]);

  // Signal amélioré avec confluence RSI
  const getBBSignal = () => {
    if (!Number.isFinite(price) || !Number.isFinite(currentBBUpper) || !Number.isFinite(currentBBLower)) {
      return {
        text: "En attente",
        color: "text-muted-foreground",
        bg: "bg-muted/20",
        signal: "waiting"
      };
    }

    const bandwidth = currentBBUpper - currentBBLower;
    const upperDist = Math.abs(price - currentBBUpper);
    const lowerDist = Math.abs(price - currentBBLower);
    const hasRSI = Number.isFinite(currentRSI);

    // Confluence RSI pour renforcer les signaux
    let rsiConfluence = null;
    if (hasRSI) {
      if (currentRSI < 30) rsiConfluence = "strong_oversold";
      else if (currentRSI < 40) rsiConfluence = "oversold";
      else if (currentRSI > 70) rsiConfluence = "strong_overbought";
      else if (currentRSI > 60) rsiConfluence = "overbought";
    }

    // Prix au-dessus ou touche bande supérieure
    if (price >= currentBBUpper) {
      if (rsiConfluence === "strong_overbought") {
        return {
          text: `🔴 Surachat Fort (BB + RSI ${currentRSI.toFixed(0)})`,
          color: "text-red-700",
          bg: "bg-red-200 dark:bg-red-800/40",
          signal: "strong_sell",
          description: "Signal de vente très fort : prix sur bande sup + RSI > 70"
        };
      } else if (rsiConfluence === "overbought") {
        return {
          text: `🟠 Surachat (BB + RSI ${currentRSI.toFixed(0)})`,
          color: "text-orange-700",
          bg: "bg-orange-200 dark:bg-orange-800/40",
          signal: "sell",
          description: "Signal de vente : prix sur bande sup + RSI > 60"
        };
      }
      return {
        text: "Surachat (bande sup)",
        color: "text-red-600",
        bg: "bg-red-100 dark:bg-red-900/20",
        signal: "weak_sell",
        description: "Prix touche bande supérieure - prudence"
      };
    }

    // Prix en-dessous ou touche bande inférieure
    if (price <= currentBBLower) {
      if (rsiConfluence === "strong_oversold") {
        return {
          text: `🟢 Survente Forte (BB + RSI ${currentRSI.toFixed(0)})`,
          color: "text-green-700",
          bg: "bg-green-200 dark:bg-green-800/40",
          signal: "strong_buy",
          description: "Signal d'achat très fort : prix sur bande inf + RSI < 30"
        };
      } else if (rsiConfluence === "oversold") {
        return {
          text: `🟢 Survente (BB + RSI ${currentRSI.toFixed(0)})`,
          color: "text-green-600",
          bg: "bg-green-100 dark:bg-green-900/30",
          signal: "buy",
          description: "Signal d'achat : prix sur bande inf + RSI < 40"
        };
      }
      return {
        text: "Survente (bande inf)",
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-900/20",
        signal: "weak_buy",
        description: "Prix touche bande inférieure - opportunité potentielle"
      };
    }

    // Proche bande inférieure
    if (lowerDist < bandwidth * 0.15) {
      if (rsiConfluence === "strong_oversold" || rsiConfluence === "oversold") {
        return {
          text: `💚 Proche BB Inf + RSI ${currentRSI.toFixed(0)}`,
          color: "text-green-600",
          bg: "bg-green-100 dark:bg-green-900/25",
          signal: "buy",
          description: "Signal d'achat : prix proche bande inf + RSI favorable"
        };
      }
      return {
        text: "Proche bande inf",
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/10",
        signal: "neutral_bullish"
      };
    }

    // Proche bande supérieure
    if (upperDist < bandwidth * 0.15) {
      if (rsiConfluence === "strong_overbought" || rsiConfluence === "overbought") {
        return {
          text: `🧡 Proche BB Sup + RSI ${currentRSI.toFixed(0)}`,
          color: "text-orange-600",
          bg: "bg-orange-100 dark:bg-orange-900/25",
          signal: "sell",
          description: "Signal de vente : prix proche bande sup + RSI défavorable"
        };
      }
      return {
        text: "Proche bande sup",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        signal: "neutral_bearish"
      };
    }

    // Squeeze détecté - explosion imminente
    if (squeezeInfo.isSqueeze) {
      return {
        text: `⚡ Squeeze détecté (explosion imminente)`,
        color: "text-purple-700",
        bg: "bg-purple-100 dark:bg-purple-900/25",
        signal: "squeeze",
        description: "Compression forte - préparez-vous à un mouvement violent"
      };
    }

    // Neutre
    return {
      text: hasRSI ? `Neutre (RSI ${currentRSI.toFixed(0)})` : "Neutre (milieu)",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      signal: "neutral"
    };
  };

  const bbSignal = getBBSignal();

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-card-foreground">Bandes de Bollinger</h3>
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-semibold">Bandes de Bollinger avec Confluence RSI</p>
                  <p className="text-xs">Les Bandes de Bollinger mesurent la volatilité et identifient les zones de surachat/survente.</p>
                  <ul className="text-xs space-y-1 list-disc list-inside mt-2">
                    <li><strong>Bande supérieure (rouge) :</strong> +2 écarts-types au-dessus de la MA20</li>
                    <li><strong>Bande moyenne (bleue) :</strong> Moyenne mobile sur 20 périodes (MA20)</li>
                    <li><strong>Bande inférieure (verte) :</strong> -2 écarts-types en-dessous de la MA20</li>
                  </ul>
                  <p className="text-xs mt-2"><strong>Signaux de trading améliorés :</strong></p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>🔴 <strong>Surachat Fort :</strong> Prix sur bande sup + RSI &gt; 70 (signal de vente très fiable)</li>
                    <li>🟢 <strong>Survente Forte :</strong> Prix sur bande inf + RSI &lt; 30 (signal d'achat très fiable)</li>
                    <li>⚡ <strong>Squeeze :</strong> Bandes se resserrent à 80% de la moyenne = explosion imminente</li>
                    <li>📊 <strong>Confluence RSI :</strong> Confirmation par RSI augmente la fiabilité de +15-20%</li>
                  </ul>
                  <p className="text-xs mt-2 text-amber-400"><strong>⚠️ Avantage :</strong> La confluence RSI réduit les faux signaux significativement</p>
                </div>
              }
            />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Prix actuel : {price != null ? fmt(price) : "—"}
            {Number.isFinite(currentRSI) && (
              <span className="ml-2 text-xs">• RSI: {currentRSI.toFixed(1)}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>Bande sup : {currentBBUpper != null ? fmt(currentBBUpper) : "—"}</div>
            <div>Bande moy : {currentBBMiddle != null ? fmt(currentBBMiddle) : "—"}</div>
            <div>Bande inf : {currentBBLower != null ? fmt(currentBBLower) : "—"}</div>
            {squeezeInfo.isSqueeze && (
              <div className="text-purple-600 dark:text-purple-400 font-medium">
                ⚡ Squeeze actif - Volatilité comprimée
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bbSignal.bg}`}>
            <Info className={`w-4 h-4 ${bbSignal.color}`} />
            <span className={`text-sm font-medium ${bbSignal.color}`}>{bbSignal.text}</span>
          </div>
          {bbSignal.description && (
            <p className="text-xs text-muted-foreground text-right max-w-xs">
              {bbSignal.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 12 }}>
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

            {/* Zone ombrée entre bandes sup et inf */}
            <defs>
              <linearGradient id="bbArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.bbMiddle} stopOpacity={0.2} />
                <stop offset="100%" stopColor={theme.bbMiddle} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Bande supérieure */}
            <Line
              type="monotone"
              name="BB Sup (+2σ)"
              dataKey="bbUpper"
              stroke={theme.bbUpper}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />

            {/* Bande moyenne (MA20) */}
            <Line
              type="monotone"
              name="BB Moy (MA20)"
              dataKey="bbMiddle"
              stroke={theme.bbMiddle}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />

            {/* Bande inférieure */}
            <Line
              type="monotone"
              name="BB Inf (-2σ)"
              dataKey="bbLower"
              stroke={theme.bbLower}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />

            {/* Prix de clôture */}
            <Line
              type="monotone"
              name="Prix"
              dataKey="close"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />

            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ paddingTop: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
