import React, { useMemo } from "react";
import { formatDateOnly, formatTimeOnly } from "../../utils/formatDate";
import Tooltip from "../ui/Tooltip";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
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

export default function FibonacciCard({
  series,
  fmt,
  price,
  tf = "1h",
  height = 280,
  currentRSI = null, // Ajout RSI pour confluence
}) {
  // Détection automatique du dernier swing high/low significatif
  const { swingLow, swingHigh, trend, fibLevels } = useMemo(() => {
    if (!series || series.length < 50) {
      return { swingLow: null, swingHigh: null, trend: null, fibLevels: [] };
    }

    // Prendre les 100 dernières bougies pour détecter le swing
    const recentData = series.slice(-100);

    // Trouver le point le plus haut et le plus bas récents
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxIndex = -1;
    let minIndex = -1;

    recentData.forEach((candle, i) => {
      const high = candle.h;
      const low = candle.l;

      if (high > maxPrice) {
        maxPrice = high;
        maxIndex = i;
      }
      if (low < minPrice) {
        minPrice = low;
        minIndex = i;
      }
    });

    // Déterminer la tendance : si le max vient après le min = tendance haussière
    const isUptrend = maxIndex > minIndex;

    // Calculer les niveaux de Fibonacci
    const range = maxPrice - minPrice;
    const levels = [];

    if (isUptrend) {
      // Tendance haussière : Fibonacci du bas vers le haut
      // Prix actuel devrait retracer depuis le haut
      levels.push({
        name: "Swing Low (0%)",
        value: minPrice,
        percentage: 0,
        color: "rgb(34, 197, 94)", // vert
      });
      levels.push({
        name: "23.6%",
        value: maxPrice - range * 0.236,
        percentage: 23.6,
        color: "rgb(59, 130, 246)", // bleu
      });
      levels.push({
        name: "38.2%",
        value: maxPrice - range * 0.382,
        percentage: 38.2,
        color: "rgb(147, 51, 234)", // violet
      });
      levels.push({
        name: "50%",
        value: maxPrice - range * 0.5,
        percentage: 50,
        color: "rgb(249, 115, 22)", // orange
      });
      levels.push({
        name: "61.8% (Golden)",
        value: maxPrice - range * 0.618,
        percentage: 61.8,
        color: "rgb(234, 179, 8)", // jaune
      });
      levels.push({
        name: "78.6%",
        value: maxPrice - range * 0.786,
        percentage: 78.6,
        color: "rgb(239, 68, 68)", // rouge
      });
      levels.push({
        name: "Swing High (100%)",
        value: maxPrice,
        percentage: 100,
        color: "rgb(239, 68, 68)", // rouge foncé
      });
    } else {
      // Tendance baissière : Fibonacci du haut vers le bas
      levels.push({
        name: "Swing High (0%)",
        value: maxPrice,
        percentage: 0,
        color: "rgb(239, 68, 68)",
      });
      levels.push({
        name: "23.6%",
        value: minPrice + range * 0.236,
        percentage: 23.6,
        color: "rgb(59, 130, 246)",
      });
      levels.push({
        name: "38.2%",
        value: minPrice + range * 0.382,
        percentage: 38.2,
        color: "rgb(147, 51, 234)",
      });
      levels.push({
        name: "50%",
        value: minPrice + range * 0.5,
        percentage: 50,
        color: "rgb(249, 115, 22)",
      });
      levels.push({
        name: "61.8% (Golden)",
        value: minPrice + range * 0.618,
        percentage: 61.8,
        color: "rgb(234, 179, 8)",
      });
      levels.push({
        name: "78.6%",
        value: minPrice + range * 0.786,
        percentage: 78.6,
        color: "rgb(34, 197, 94)",
      });
      levels.push({
        name: "Swing Low (100%)",
        value: minPrice,
        percentage: 100,
        color: "rgb(34, 197, 94)",
      });
    }

    return {
      swingLow: minPrice,
      swingHigh: maxPrice,
      trend: isUptrend ? "uptrend" : "downtrend",
      fibLevels: levels,
    };
  }, [series]);

  // Générer un signal basé sur la proximité du prix avec les niveaux + confluence RSI
  const fibSignal = useMemo(() => {
    if (!price || !fibLevels.length) {
      return { text: "En attente", color: "text-muted-foreground", bg: "bg-muted/20" };
    }

    // Trouver le niveau le plus proche
    let closestLevel = null;
    let minDistance = Infinity;

    fibLevels.forEach((level) => {
      const distance = Math.abs(price - level.value);
      if (distance < minDistance && level.percentage > 0 && level.percentage < 100) {
        minDistance = distance;
        closestLevel = level;
      }
    });

    if (!closestLevel) {
      return { text: "Hors zone", color: "text-muted-foreground", bg: "bg-muted/20" };
    }

    const percentDistance = (minDistance / price) * 100;

    // Confluence RSI : détermine si le RSI confirme le signal
    const hasRSI = Number.isFinite(currentRSI);
    let rsiConfluence = null;

    if (hasRSI) {
      // Pour tendance haussière : chercher rebond sur niveaux de retracement (38.2%, 50%, 61.8%)
      // Signal d'achat si RSI < 40 (survente/neutre bas)
      if (trend === "uptrend" && price < swingHigh) {
        if (currentRSI < 30) {
          rsiConfluence = "strong_buy"; // RSI très survendu
        } else if (currentRSI < 40) {
          rsiConfluence = "buy"; // RSI survendu/neutre bas
        }
      }
      // Pour tendance baissière : chercher rebond sur niveaux de résistance
      // Signal de vente si RSI > 60 (surachat/neutre haut)
      else if (trend === "downtrend" && price > swingLow) {
        if (currentRSI > 70) {
          rsiConfluence = "strong_sell"; // RSI très suracheté
        } else if (currentRSI > 60) {
          rsiConfluence = "sell"; // RSI suracheté/neutre haut
        }
      }
    }

    // Si très proche d'un niveau (< 1.5%)
    if (percentDistance < 1.5) {
      if (closestLevel.percentage === 61.8) {
        // Golden Ratio - niveau le plus important
        if (rsiConfluence === "strong_buy") {
          return {
            text: `🎯 Golden Ratio + RSI Survente (${currentRSI.toFixed(0)})`,
            color: "text-green-700",
            bg: "bg-green-200 dark:bg-green-800/30",
            level: closestLevel,
            signal: "strong_buy",
          };
        } else if (rsiConfluence === "buy") {
          return {
            text: `✓ Golden Ratio + RSI Favorable (${currentRSI.toFixed(0)})`,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            level: closestLevel,
            signal: "buy",
          };
        } else if (rsiConfluence === "strong_sell") {
          return {
            text: `🎯 Golden Ratio + RSI Surachat (${currentRSI.toFixed(0)})`,
            color: "text-red-700",
            bg: "bg-red-200 dark:bg-red-800/30",
            level: closestLevel,
            signal: "strong_sell",
          };
        } else if (rsiConfluence === "sell") {
          return {
            text: `✓ Golden Ratio + RSI Défavorable (${currentRSI.toFixed(0)})`,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
            level: closestLevel,
            signal: "sell",
          };
        } else {
          return {
            text: hasRSI
              ? `Au Golden Ratio (${closestLevel.percentage}%) - RSI neutre (${currentRSI.toFixed(0)})`
              : `Au Golden Ratio (${closestLevel.percentage}%)`,
            color: "text-yellow-600",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            level: closestLevel,
          };
        }
      } else if (closestLevel.percentage === 50) {
        // Niveau médian
        if (rsiConfluence === "strong_buy" || rsiConfluence === "buy") {
          return {
            text: hasRSI
              ? `Niveau 50% + RSI Favorable (${currentRSI.toFixed(0)})`
              : `Au niveau 50% (médian)`,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            level: closestLevel,
            signal: rsiConfluence,
          };
        } else if (rsiConfluence === "strong_sell" || rsiConfluence === "sell") {
          return {
            text: hasRSI
              ? `Niveau 50% + RSI Défavorable (${currentRSI.toFixed(0)})`
              : `Au niveau 50% (médian)`,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
            level: closestLevel,
            signal: rsiConfluence,
          };
        } else {
          return {
            text: hasRSI
              ? `Au niveau 50% (médian) - RSI ${currentRSI.toFixed(0)}`
              : `Au niveau 50% (médian)`,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            level: closestLevel,
          };
        }
      } else {
        // Autres niveaux (23.6%, 38.2%, 78.6%)
        if (rsiConfluence === "strong_buy" || rsiConfluence === "buy") {
          return {
            text: hasRSI
              ? `Fib ${closestLevel.percentage}% + RSI ${currentRSI.toFixed(0)} ✓`
              : `Proche ${closestLevel.percentage}%`,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            level: closestLevel,
            signal: rsiConfluence,
          };
        } else if (rsiConfluence === "strong_sell" || rsiConfluence === "sell") {
          return {
            text: hasRSI
              ? `Fib ${closestLevel.percentage}% + RSI ${currentRSI.toFixed(0)} ✗`
              : `Proche ${closestLevel.percentage}%`,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
            level: closestLevel,
            signal: rsiConfluence,
          };
        } else {
          return {
            text: hasRSI
              ? `Proche ${closestLevel.percentage}% - RSI ${currentRSI.toFixed(0)}`
              : `Proche ${closestLevel.percentage}%`,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            level: closestLevel,
          };
        }
      }
    } else if (percentDistance < 3) {
      return {
        text: hasRSI
          ? `Approche ${closestLevel.percentage}% - RSI ${currentRSI.toFixed(0)}`
          : `Approche ${closestLevel.percentage}%`,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/10",
        level: closestLevel,
      };
    } else {
      return {
        text: hasRSI ? `Entre niveaux - RSI ${currentRSI.toFixed(0)}` : "Entre niveaux",
        color: "text-muted-foreground",
        bg: "bg-muted/20",
        level: null,
      };
    }
  }, [price, fibLevels, currentRSI, trend, swingHigh, swingLow]);

  // Données pour le graphique
  const data = useMemo(() => {
    const arr = (Array.isArray(series) ? series : [])
      .filter((d) => Number.isFinite(d?.ts) && Number.isFinite(d?.c))
      .map((d) => ({
        x: Math.floor(Number(d.ts) / 1000),
        close: Number(d.c),
      }));
    return arr.slice(-150);
  }, [series]);

  // Couleurs
  const theme = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const hsl = (name, fallback) => {
      const v = css.getPropertyValue(name).trim();
      return v ? `hsl(${v})` : fallback;
    };
    return {
      tick: hsl("--muted-foreground", "rgba(148,163,184,.9)"),
      grid: "rgba(148,163,184,.18)",
      spot: hsl("--primary", "rgb(37, 99, 235)"),
      line: hsl("--chart-1", "rgb(59, 130, 246)"),
    };
  }, []);

  const [yMin, yMax] = useMemo(() => {
    if (!swingLow || !swingHigh) return [0, 1];
    const pad = (swingHigh - swingLow) * 0.15;
    return [swingLow - pad, swingHigh + pad];
  }, [swingLow, swingHigh]);

  const fmtTick = useMemo(() => {
    return (xSec) => (tf === "1d" ? formatDateOnly(xSec) : formatTimeOnly(xSec));
  }, [tf]);

  const tickCountX = tf === "1h" ? 5 : tf === "4h" ? 6 : 7;

  const TrendIcon = trend === "uptrend" ? TrendingUp : TrendingDown;
  const trendColor = trend === "uptrend" ? "text-green-600" : "text-red-600";
  const trendBg = trend === "uptrend" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20";

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-card-foreground">Niveaux de Fibonacci</h3>
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-semibold">Retracement de Fibonacci automatique avec confluence RSI</p>
                  <p className="text-xs">
                    Détecte le dernier swing high/low significatif et calcule automatiquement les niveaux de retracement.
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside mt-2">
                    <li><strong>23.6%, 38.2% :</strong> Retracements faibles</li>
                    <li><strong>50% :</strong> Niveau médian (psychologique)</li>
                    <li><strong>61.8% (Golden Ratio) :</strong> Niveau le plus fiable</li>
                    <li><strong>78.6% :</strong> Retracement profond</li>
                  </ul>
                  <p className="text-xs mt-2 font-semibold text-primary">
                    🎯 Confluence RSI : Fiabilité améliorée !
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li><strong>Signal FORT ✓</strong> : Niveau Fib + RSI {'<'} 30 (survente) ou RSI {'>'} 70 (surachat)</li>
                    <li><strong>Signal Favorable ✓</strong> : Niveau Fib + RSI {'<'} 40 ou RSI {'>'} 60</li>
                    <li><strong>Signal Neutre</strong> : Niveau Fib seul (RSI entre 40-60)</li>
                  </ul>
                  <p className="text-xs mt-2">
                    💡 Attendez toujours la confluence (Fib + RSI + volume élevé) pour entrer en position
                  </p>
                </div>
              }
            />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Prix actuel : {price != null ? fmt(price) : "—"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${trendBg}`}>
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              <span className={`text-xs font-medium ${trendColor}`}>
                {trend === "uptrend" ? "Tendance haussière" : "Tendance baissière"}
              </span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${fibSignal.bg}`}>
          <Info className={`w-4 h-4 ${fibSignal.color}`} />
          <span className={`text-sm font-medium ${fibSignal.color}`}>{fibSignal.text}</span>
        </div>
      </div>

      {/* Niveaux calculés */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        {fibLevels.slice(1, -1).map((level) => (
          <div key={level.name} className="bg-accent/50 rounded px-2 py-1">
            <div className="font-medium" style={{ color: level.color }}>
              {level.name}
            </div>
            <div className="text-muted-foreground">{fmt(level.value)}</div>
          </div>
        ))}
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

            {/* Lignes des niveaux Fibonacci */}
            {fibLevels.map((level) => (
              <ReferenceLine
                key={level.name}
                y={level.value}
                stroke={level.color}
                strokeWidth={level.percentage === 61.8 ? 2 : 1}
                strokeDasharray={level.percentage === 0 || level.percentage === 100 ? "0" : "5 5"}
                label={{
                  value: level.name,
                  position: "right",
                  fill: level.color,
                  fontSize: 10,
                }}
              />
            ))}

            {/* Prix actuel */}
            {Number.isFinite(price) && (
              <ReferenceLine
                y={price}
                stroke={theme.spot}
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: "Prix", position: "left", fill: theme.spot, fontSize: 10 }}
              />
            )}

            {/* Prix de clôture */}
            <Line
              type="monotone"
              dataKey="close"
              stroke={theme.line}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
