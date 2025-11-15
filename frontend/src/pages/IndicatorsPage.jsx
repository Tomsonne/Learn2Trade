// src/pages/IndicatorsPage.jsx
import { useMemo, useState, useEffect } from "react";
import { BookOpen, Target, Info, BarChart3 } from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "../components/CandleLite.jsx";
import RsiCard from "../components/cards/RsiCard.jsx";
import MaCard from "../components/cards/MaCard.jsx";
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RsiCard series={series} rsiSignal={rsiSignal} currentRSI={currentRSI} tf={tf} />
        <MaCard  series={series} maSignal={maSignal} fmt={fmt} tf={tf} ma20={last?.ma20 ?? null} ma50={last?.ma50 ?? null} price={typeof spot==="number"?spot:null} />
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

        <div className="flex items-center gap-3 mb-4">
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

        <div className="h-96">
          {candles.length >= 2 ? <CandleLite key={`${symbol}-${tf}`} data={candles} height={384} tf={tf} locale="fr-FR" timeZone="Europe/Paris"/> : <div className="text-sm text-muted-foreground">Pas d'OHLC</div>}
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
        <StrategiesSection strategies={strategies} selectedStrategy={selectedStrategy} setSelectedStrategy={setSelectedStrategy} />
      )}
      {activeSection === "live" && renderLiveSection()}
      {activeSection === "glossary" && <Glossary />}
    </div>
  );
}
