// src/pages/IndicatorsPage.jsx
import { useMemo, useState, useEffect } from "react";
import { BookOpen, Target, Info, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "../components/CandleLite.jsx";
import RsiCard from "../components/cards/RsiCard.jsx";
import MaCard from "../components/cards/MaCard.jsx";
import BollingerBandsCard from "../components/cards/BollingerBandsCard.jsx";
import FibonacciCard from "../components/cards/FibonacciCard.jsx";
import InteractiveCourseSection from "../components/InteractiveCourseSection.jsx";
import StrategiesSection from "../components/StrategiesSection.jsx";
import Glossary from "../components/Glossary.jsx";
import { strategies } from "../data/strategies.js";
import { useSpotPrice } from "../hooks/useSpotPrice.js";
import TimeframeToolbar from "../components/ui/TimeframeToolbar.jsx";
import SymbolSelector from "../components/ui/SymbolSelector.jsx";
import Tooltip from "../components/ui/Tooltip.jsx";
import { getRSISignal, getMASignal } from "../utils/ta-ui.js";

export function IndicatorsPage() {
  const [activeSection, setActiveSection] = useState("course");
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [tf, setTf] = useState("1h");
  const [symbol, setSymbol] = useState("BTC");
  const [showIndicatorsOnChart, setShowIndicatorsOnChart] = useState(false);
  const [expandedIndicators, setExpandedIndicators] = useState({
    rsi: true,
    ma: false,
    bollinger: false,
    fibonacci: false,
  });

  const toggleIndicator = (indicator) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  const { price: spot } = useSpotPrice({ symbol, refreshMs: 60_000 });

  const { data: series = [], loading, error } = useMarketSeries({
    symbol, tf, refreshMs: 60_000, spotPrice: spot
  });

  useEffect(() => { if (series.length) console.log("SAMPLE row:", series[0]); }, [series]);

  const candles = useMemo(() =>
    series.filter(d => [d.ts,d.o,d.h,d.l,d.c].every(Number.isFinite))
          .map(d => ({
            time: Math.floor(d.ts/1000),
            open:+d.o,
            high:+d.h,
            low:+d.l,
            close:+d.c,
            volume: Number.isFinite(d.v) ? +d.v : 0
          })), [series]);

  const last = series.at(-1) ?? {};
  const currentRSI  = useMemo(() => {
    for (let i=series.length-1;i>=0;i--) { const v = series[i]?.rsi; if (Number.isFinite(v)) return v; }
    return null;
  }, [series]);

  const nf  = new Intl.NumberFormat("fr-FR",{ style:"currency", currency:"USD", maximumFractionDigits:2 });
  const fmt = (v) => (v == null ? "—" : nf.format(Number(v)));

  const rsiSignal = useMemo(() => getRSISignal(currentRSI ?? 50), [currentRSI]);
  const maSignal  = useMemo(() => getMASignal(last?.ma20 ?? 0, last?.ma50 ?? 0), [last?.ma20, last?.ma50]);

  // Calculer les niveaux de Fibonacci pour l'affichage sur le graphique
  const fibLevels = useMemo(() => {
    if (!series || series.length < 50) return [];

    const recentData = series.slice(-100);
    let maxPrice = -Infinity, minPrice = Infinity;
    let maxIndex = -1, minIndex = -1;

    recentData.forEach((candle, i) => {
      if (candle.h > maxPrice) { maxPrice = candle.h; maxIndex = i; }
      if (candle.l < minPrice) { minPrice = candle.l; minIndex = i; }
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

  const menuItems = [
    { id: "course",     label: "Cours pour Débutants",  icon: BookOpen },
    { id: "strategies", label: "Stratégies Détaillées", icon: Target },
    { id: "live",       label: "Analyse en Temps Réel", icon: BarChart3 },
    { id: "glossary",   label: "Glossaire",             icon: Info },
  ];

  const renderLiveSection = () => (
    <div className="space-y-6">
      {/* Bannière d'aide pour débutants */}
      <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 border-2 border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-card-foreground mb-1">Guide d'interprétation pour débutants</h3>
            <p className="text-sm text-muted-foreground">
              Passez votre souris sur les icônes <Info className="w-3 h-3 inline text-primary" /> pour comprendre comment lire chaque indicateur et prendre vos décisions de trading.
            </p>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Mise à jour des données temps réel…</div>}
      {error   && <div className="text-sm text-red-600">Erreur données live : {error}</div>}

      {/* Indicateur RSI */}
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
              <h3 className="text-lg font-medium text-card-foreground">RSI (Relative Strength Index)</h3>
              <p className="text-sm text-muted-foreground">
                Indicateur de momentum • Signal : {rsiSignal.text}
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
            <RsiCard series={series} rsiSignal={rsiSignal} currentRSI={currentRSI} tf={tf} />
          </div>
        )}
      </div>

      {/* Indicateur Moyennes Mobiles */}
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
              <h3 className="text-lg font-medium text-card-foreground">Moyennes Mobiles (MA20 / MA50)</h3>
              <p className="text-sm text-muted-foreground">
                Détection de tendance • Signal : {maSignal.text}
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
            <MaCard series={series} maSignal={maSignal} fmt={fmt} tf={tf} ma20={last?.ma20 ?? null} ma50={last?.ma50 ?? null} price={typeof spot==="number"?spot:null} />
          </div>
        )}
      </div>

      {/* Indicateur Bandes de Bollinger */}
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
              <h3 className="text-lg font-medium text-card-foreground">Bandes de Bollinger</h3>
              <p className="text-sm text-muted-foreground">
                Volatilité et zones de prix extrêmes
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
            <BollingerBandsCard series={series} fmt={fmt} tf={tf} price={typeof spot==="number"?spot:null} currentRSI={currentRSI} />
          </div>
        )}
      </div>

      {/* Indicateur Fibonacci */}
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
              <h3 className="text-lg font-medium text-card-foreground">Retracement de Fibonacci</h3>
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
            <FibonacciCard series={series} fmt={fmt} tf={tf} price={typeof spot==="number"?spot:null} currentRSI={currentRSI} />
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-card-foreground">Graphique {symbol}/USD — Chandeliers</h3>
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-semibold">Comment lire un graphique en chandeliers ?</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li><strong>Chandelier vert :</strong> Le prix a monté (clôture &gt; ouverture)</li>
                    <li><strong>Chandelier rouge :</strong> Le prix a baissé (clôture &lt; ouverture)</li>
                    <li><strong>Mèche haute :</strong> Prix maximum atteint</li>
                    <li><strong>Mèche basse :</strong> Prix minimum atteint</li>
                    <li><strong>Volume (barres du bas) :</strong> Quantité échangée. Plus c'est haut, plus il y a eu d'activité.</li>
                  </ul>
                </div>
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/30">
              Prix spot : {typeof spot==="number" ? fmt(spot) : "—"}
            </span>
            <Tooltip
              content={
                <div className="space-y-1">
                  <p className="font-semibold">Prix spot</p>
                  <p className="text-xs">Le prix actuel en temps réel sur le marché. C'est le prix auquel vous pouvez acheter ou vendre maintenant.</p>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SymbolSelector value={symbol} onChange={setSymbol} options={["BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOGE", "DOT"]} />
              <Tooltip
                content={
                  <div className="space-y-1">
                    <p className="font-semibold">Choix de l'actif</p>
                    <p className="text-xs">Sélectionnez la cryptomonnaie que vous souhaitez analyser. Chaque actif a ses propres caractéristiques de volatilité et tendances.</p>
                  </div>
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <TimeframeToolbar value={tf} onChange={setTf} />
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold">Timeframe (période de temps)</p>
                    <p className="text-xs">Chaque chandelier représente une période :</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li><strong>15m, 1h :</strong> Pour le day trading (court terme)</li>
                      <li><strong>4h, 1d :</strong> Pour le swing trading (moyen terme)</li>
                      <li><strong>1w :</strong> Pour l'investissement (long terme)</li>
                    </ul>
                    <p className="text-xs mt-2">💡 Conseil : Commencez par 1h ou 4h pour mieux voir les tendances.</p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Dropdown pour sélectionner l'indicateur à afficher */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Afficher indicateurs :</label>
            <select
              value={showIndicatorsOnChart ? selectedStrategy.id : "none"}
              onChange={(e) => {
                if (e.target.value === "none") {
                  setShowIndicatorsOnChart(false);
                } else {
                  setShowIndicatorsOnChart(true);
                  const strategy = strategies.find(s => s.id === e.target.value);
                  if (strategy) setSelectedStrategy(strategy);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            >
              <option value="none">Aucun</option>
              <option value="ma_crossover">Moyennes Mobiles (MA20/MA50)</option>
              <option value="bollinger_bands">Bandes de Bollinger</option>
              <option value="fibonacci_retracement">Niveaux de Fibonacci</option>
            </select>
            <Tooltip
              content={
                <div className="space-y-1">
                  <p className="font-semibold">Indicateurs sur le graphique</p>
                  <p className="text-xs">Superposez les indicateurs techniques directement sur le graphique pour mieux visualiser les signaux de trading.</p>
                </div>
              }
            />
          </div>
        </div>

        <div className="h-96">
          {candles.length >= 2 ? (
            <CandleLite
              key={`${symbol}-${tf}-${showIndicatorsOnChart ? selectedStrategy.id : 'none'}`}
              data={candles}
              height={384}
              tf={tf}
              series={series}
              showIndicators={
                !showIndicatorsOnChart ? null :
                selectedStrategy.id === "ma_crossover" ? "ma" :
                selectedStrategy.id === "bollinger_bands" ? "bollinger" :
                selectedStrategy.id === "fibonacci_retracement" ? "fibonacci" :
                null
              }
              fibLevels={showIndicatorsOnChart && selectedStrategy.id === "fibonacci_retracement" ? fibLevels : []}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Pas d'OHLC</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* nav */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-medium text-card-foreground">Apprendre nos Stratégies</h1>
          <div className="text-sm text-muted-foreground">Cours interactif • Trading éducatif • Sans risque</div>
        </div>
        <div className="flex gap-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                aria-pressed={activeSection===item.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeSection===item.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground hover:bg-muted"
                }`}
              >
                <IconComponent className="w-4 h-4" /><span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSection === "course" && <InteractiveCourseSection />}
      {activeSection === "strategies" && (
        <StrategiesSection
          strategies={strategies}
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={setSelectedStrategy}
          series={series}
          currentRSI={currentRSI}
          rsiSignal={rsiSignal}
          maSignal={maSignal}
          fmt={fmt}
          spot={spot}
          tf={tf}
          last={last}
        />
      )}
      {activeSection === "live" && renderLiveSection()}
      {activeSection === "glossary" && <Glossary />}
    </div>
  );
}
