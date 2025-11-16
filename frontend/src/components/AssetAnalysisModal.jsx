import { useMemo, useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "./CandleLite.jsx";
import RsiCard from "./cards/RsiCard.jsx";
import MaCard from "./cards/MaCard.jsx";
import BollingerBandsCard from "./cards/BollingerBandsCard.jsx";
import FibonacciCard from "./cards/FibonacciCard.jsx";
import { useSpotPrice } from "../hooks/useSpotPrice.js";
import TimeframeToolbar from "./ui/TimeframeToolbar.jsx";
import { getRSISignal, getMASignal } from "../utils/ta-ui.js";

export default function AssetAnalysisModal({ symbol, onClose }) {
  const [tf, setTf] = useState("1h");
  const [expandedIndicators, setExpandedIndicators] = useState({
    rsi: true,
    ma: false,
    bollinger: false,
    fibonacci: false,
  });
  const [chartIndicator, setChartIndicator] = useState(null); // null | "ma" | "bollinger" | "fibonacci"

  const toggleIndicator = (indicator) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  // Nettoyer le symbole: enlever USDT, USD, BUSD, etc.
  const cleanSymbol = symbol?.replace(/USDT|USD|BUSD|USDC/gi, "") || symbol;

  const { price: spot } = useSpotPrice({ symbol: cleanSymbol });

  const { data: series = [], loading, error } = useMarketSeries({
    symbol: cleanSymbol,
    tf,
  });

  const candles = useMemo(
    () =>
      series
        .filter((d) => [d.ts, d.o, d.h, d.l, d.c].every(Number.isFinite))
        .map((d) => ({
          time: Math.floor(d.ts / 1000),
          open: +d.o,
          high: +d.h,
          low: +d.l,
          close: +d.c,
          volume: Number.isFinite(d.v) ? +d.v : 0,
        })),
    [series]
  );

  const last = series.at(-1) ?? {};
  const currentRSI = useMemo(() => {
    for (let i = series.length - 1; i >= 0; i--) {
      const v = series[i]?.rsi;
      if (Number.isFinite(v)) return v;
    }
    return null;
  }, [series]);

  const nf = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  const fmt = (v) => (v == null ? "—" : nf.format(Number(v)));

  const rsiSignal = useMemo(() => getRSISignal(currentRSI ?? 50), [currentRSI]);
  const maSignal = useMemo(
    () => getMASignal(last?.ma20 ?? 0, last?.ma50 ?? 0),
    [last?.ma20, last?.ma50]
  );

  // Calculer les niveaux de Fibonacci pour le graphique
  const fibLevels = useMemo(() => {
    if (!series || series.length < 50) return [];

    const recentData = series.slice(-100);
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

    const isUptrend = maxIndex > minIndex;
    const range = maxPrice - minPrice;
    const levels = [];

    if (isUptrend) {
      levels.push({ name: "0%", value: minPrice, percentage: 0, color: "rgb(34, 197, 94)" });
      levels.push({ name: "23.6%", value: maxPrice - range * 0.236, percentage: 23.6, color: "rgb(59, 130, 246)" });
      levels.push({ name: "38.2%", value: maxPrice - range * 0.382, percentage: 38.2, color: "rgb(147, 51, 234)" });
      levels.push({ name: "50%", value: maxPrice - range * 0.5, percentage: 50, color: "rgb(249, 115, 22)" });
      levels.push({ name: "61.8%", value: maxPrice - range * 0.618, percentage: 61.8, color: "rgb(234, 179, 8)" });
      levels.push({ name: "78.6%", value: maxPrice - range * 0.786, percentage: 78.6, color: "rgb(239, 68, 68)" });
      levels.push({ name: "100%", value: maxPrice, percentage: 100, color: "rgb(239, 68, 68)" });
    } else {
      levels.push({ name: "0%", value: maxPrice, percentage: 0, color: "rgb(239, 68, 68)" });
      levels.push({ name: "23.6%", value: minPrice + range * 0.236, percentage: 23.6, color: "rgb(59, 130, 246)" });
      levels.push({ name: "38.2%", value: minPrice + range * 0.382, percentage: 38.2, color: "rgb(147, 51, 234)" });
      levels.push({ name: "50%", value: minPrice + range * 0.5, percentage: 50, color: "rgb(249, 115, 22)" });
      levels.push({ name: "61.8%", value: minPrice + range * 0.618, percentage: 61.8, color: "rgb(234, 179, 8)" });
      levels.push({ name: "78.6%", value: minPrice + range * 0.786, percentage: 78.6, color: "rgb(34, 197, 94)" });
      levels.push({ name: "100%", value: minPrice, percentage: 100, color: "rgb(34, 197, 94)" });
    }

    return levels;
  }, [series]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">
              Analyse en Temps Réel — {symbol}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Indicateurs techniques et graphique en direct
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-accent hover:bg-muted rounded-full flex items-center justify-center text-card-foreground hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-sm text-muted-foreground">
              Mise à jour des données temps réel…
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              Erreur données live : {error}
            </div>
          )}

          {/* Graphique en premier */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-card-foreground">
                Graphique {cleanSymbol}/USD — Chandeliers
              </h3>
              <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/30">
                Prix spot : {typeof spot === "number" ? fmt(spot) : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <TimeframeToolbar value={tf} onChange={setTf} />

              {/* Menu de sélection des indicateurs sur le graphique */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Afficher:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setChartIndicator(null)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      chartIndicator === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    }`}
                  >
                    Chandeliers
                  </button>
                  <button
                    onClick={() => setChartIndicator("ma")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      chartIndicator === "ma"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    }`}
                  >
                    MA20/50
                  </button>
                  <button
                    onClick={() => setChartIndicator("bollinger")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      chartIndicator === "bollinger"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    }`}
                  >
                    Bollinger
                  </button>
                  <button
                    onClick={() => setChartIndicator("fibonacci")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      chartIndicator === "fibonacci"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
                    }`}
                  >
                    Fibonacci
                  </button>
                </div>
              </div>
            </div>

            <div className="h-96">
              {candles.length >= 2 ? (
                <CandleLite
                  key={`${cleanSymbol}-${tf}-${chartIndicator}`}
                  data={candles}
                  height={384}
                  tf={tf}
                  series={series}
                  showIndicators={chartIndicator}
                  fibLevels={fibLevels}
                  spotPrice={spot}
                  locale="fr-FR"
                  timeZone="Europe/Paris"
                />
              ) : (
                <div className="text-sm text-muted-foreground">Pas d'OHLC</div>
              )}
            </div>
          </div>

          {/* Indicateurs en accordéon */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Indicateurs Techniques</h3>

            {/* RSI */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleIndicator('rsi')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    expandedIndicators.rsi ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    📊
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-medium text-card-foreground">RSI (Relative Strength Index)</h4>
                    <p className="text-sm text-muted-foreground">
                      Signal : {rsiSignal.text}
                    </p>
                  </div>
                </div>
                {expandedIndicators.rsi ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedIndicators.rsi && (
                <div className="p-6 pt-0 animate-in slide-in-from-top duration-300">
                  <RsiCard
                    series={series}
                    rsiSignal={rsiSignal}
                    currentRSI={currentRSI}
                    tf={tf}
                  />
                </div>
              )}
            </div>

            {/* Moyennes Mobiles */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleIndicator('ma')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    expandedIndicators.ma ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    📈
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-medium text-card-foreground">Moyennes Mobiles (MA20/MA50)</h4>
                    <p className="text-sm text-muted-foreground">
                      Signal : {maSignal.text}
                    </p>
                  </div>
                </div>
                {expandedIndicators.ma ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedIndicators.ma && (
                <div className="p-6 pt-0 animate-in slide-in-from-top duration-300">
                  <MaCard
                    series={series}
                    maSignal={maSignal}
                    fmt={fmt}
                    tf={tf}
                    ma20={last?.ma20 ?? null}
                    ma50={last?.ma50 ?? null}
                    price={typeof spot === "number" ? spot : null}
                  />
                </div>
              )}
            </div>

            {/* Bandes de Bollinger */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleIndicator('bollinger')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    expandedIndicators.bollinger ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    📉
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-medium text-card-foreground">Bandes de Bollinger</h4>
                    <p className="text-sm text-muted-foreground">
                      Volatilité et zones de surachat/survente
                    </p>
                  </div>
                </div>
                {expandedIndicators.bollinger ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedIndicators.bollinger && (
                <div className="p-6 pt-0 animate-in slide-in-from-top duration-300">
                  <BollingerBandsCard
                    series={series}
                    fmt={fmt}
                    tf={tf}
                    price={typeof spot === "number" ? spot : null}
                    currentRSI={currentRSI}
                  />
                </div>
              )}
            </div>

            {/* Fibonacci */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleIndicator('fibonacci')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    expandedIndicators.fibonacci ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    🎯
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-medium text-card-foreground">Retracement de Fibonacci</h4>
                    <p className="text-sm text-muted-foreground">
                      Niveaux de support/résistance mathématiques
                    </p>
                  </div>
                </div>
                {expandedIndicators.fibonacci ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedIndicators.fibonacci && (
                <div className="p-6 pt-0 animate-in slide-in-from-top duration-300">
                  <FibonacciCard
                    series={series}
                    fmt={fmt}
                    tf={tf}
                    price={typeof spot === "number" ? spot : null}
                    currentRSI={currentRSI}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
