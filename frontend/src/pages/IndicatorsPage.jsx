import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "../components/CandleLite.jsx";
import { TF, resampleOHLC } from "../utils/ohlc.js"; // <-- chemin utils

/* ------------------------- Glossaire & Stratégies ------------------------- */
const glossaryTerms = [
  {
    term: "RSI (Relative Strength Index)",
    definition:
      "Oscillateur technique qui mesure la vitesse et l'amplitude des changements de prix. Il varie de 0 à 100.",
    usage:
      "RSI > 70 = surachat (plutôt vendre/attendre), RSI < 30 = survente (plutôt acheter)",
  },
  {
    term: "Moyenne Mobile (MA)",
    definition:
      "Indicateur qui lisse les variations de prix en calculant la moyenne des prix sur une période donnée.",
    usage:
      "MA20 > MA50 = tendance haussière, MA20 < MA50 = tendance baissière",
  },
  {
    term: "Support",
    definition:
      "Niveau de prix où l'actif a tendance à trouver un soutien lors des chutes. Les acheteurs entrent massivement.",
    usage: "Niveau d'achat potentiel, stop-loss en dessous",
  },
  {
    term: "Résistance",
    definition:
      "Niveau de prix où l'actif a du mal à dépasser. Les vendeurs sont présents en masse.",
    usage: "Niveau de vente potentiel, objectif de profit",
  },
  {
    term: "Breakout",
    definition:
      "Cassure d'un niveau de support ou résistance avec volume important.",
    usage: "Signal d'entrée fort dans la direction de la cassure",
  },
  {
    term: "Volume",
    definition:
      "Quantité d'actifs échangés sur une période donnée. Confirme la validité des mouvements de prix.",
    usage: "Volume élevé + cassure = signal fiable",
  },
  {
    term: "Stop-Loss",
    definition:
      "Ordre de vente automatique pour limiter les pertes si le prix va contre votre position.",
    usage:
      "Toujours placer un stop-loss, généralement 2-3% sous le prix d'achat",
  },
  {
    term: "Take-Profit",
    definition:
      "Ordre de vente automatique pour sécuriser les profits à un niveau prédéfini.",
    usage: "Ratio risque/rendement de 1:2 ou 1:3 minimum",
  },
];

const strategies = [
  {
    id: "rsi_strategy",
    title: "Stratégie RSI Simple",
    level: "Débutant",
    description:
      "Une stratégie basée sur l'indicateur RSI pour identifier les zones de survente et surachat.",
    steps: [
      "Attendez que le RSI descende sous 30 (zone de survente)",
      "Confirmez avec le volume : il doit être élevé",
      "Entrez en position d'achat quand le RSI remonte au-dessus de 35",
      "Placez votre stop-loss 3% sous votre prix d'achat",
      "Prenez vos profits quand le RSI atteint 70 ou plus",
    ],
    risk: "Faible",
    timeframe: "1H - 4H",
    successRate: "65-70%",
  },
  {
    id: "ma_crossover",
    title: "Croisement de Moyennes Mobiles",
    level: "Débutant",
    description:
      "Stratégie trending qui utilise le croisement des moyennes mobiles 20 et 50.",
    steps: [
      "Surveillez le croisement de la MA20 et MA50",
      "Golden Cross : MA20 au-dessus de MA50 = Signal d'achat",
      "Death Cross : MA20 en dessous de MA50 = Signal de vente",
      "Confirmez avec la tendance générale du marché",
      "Stop-loss : sous la MA50 pour les achats, au-dessus pour les ventes",
    ],
    risk: "Moyen",
    timeframe: "4H - 1D",
    successRate: "60-65%",
  },
  {
    id: "support_resistance",
    title: "Trading de Support et Résistance",
    level: "Intermédiaire",
    description:
      "Identifiez et tradez les rebonds sur les niveaux de support et résistance.",
    steps: [
      "Identifiez les niveaux de support et résistance clairs",
      "Attendez que le prix approche de ces niveaux",
      "Achetez près du support avec confirmation (volume, chandelier d'inversion)",
      "Vendez près de la résistance avec confirmation",
      "Stop-loss : 1-2% au-delà du niveau cassé",
    ],
    risk: "Moyen",
    timeframe: "30M - 4H",
    successRate: "70-75%",
  },
];

/* ------------------------------- Helpers UI ------------------------------- */
const getRSISignal = (v) => {
  if (v > 70)
    return {
      text: "Surachat – Risque de correction",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: TrendingDown,
    };
  if (v < 30)
    return {
      text: "Survente – Potentiel de rebond",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: TrendingUp,
    };
  return {
    text: "Zone neutre",
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: BarChart3,
  };
};

const getMASignal = (ma20, ma50) => {
  if (ma20 > ma50)
    return {
      text: "Tendance Haussière",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: TrendingUp,
    };
  if (ma20 < ma50)
    return {
      text: "Tendance Baissière",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: TrendingDown,
    };
  return {
    text: "Tendance Neutre",
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: BarChart3,
  };
};

/* -------------------------------- Component ------------------------------- */
export function IndicatorsPage() {
  const [activeSection, setActiveSection] = useState("live");
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [tf, setTf] = useState("1h"); // timeframe UI

  // LIVE data via backend
  const { data: series = [], loading, error } = useMarketSeries({
    symbol: "BTC",
    vs: "usd",
    tf,
    preferOHLCFor1d: true,
    refreshMs: 60_000,
  });

  // Debug
  useEffect(() => {
    if (series.length) console.log("SAMPLE row:", series[0]);
  }, [series]);

  const hasOHLC = useMemo(
    () =>
      series.some(
        (d) =>
          d?.o != null && d?.h != null && d?.l != null && d?.c != null && d?.ts != null
      ),
    [series]
  );

  // Base OHLC en ms
  const baseOHLC = useMemo(
    () =>
      series
        .filter(
          (d) =>
            d?.ts != null &&
            d?.o != null &&
            d?.h != null &&
            d?.l != null &&
            d?.c != null
        )
        .map((d) => ({
          ts: +d.ts,
          o: +d.o,
          h: +d.h,
          l: +d.l,
          c: +d.c,
        })),
    [series]
  );

  // Resampling selon TF
  const bucketSec = TF[tf] ?? TF["1h"];
  const ohlcTF = useMemo(
    () => resampleOHLC(baseOHLC, bucketSec),
    [baseOHLC, bucketSec]
  );

  // Format pour lightweight-charts
  const candles = useMemo(
    () =>
      ohlcTF.map((r) => ({
        time: Math.floor(r.ts / 1000),
        open: r.o,
        high: r.h,
        low: r.l,
        close: r.c,
      })),
    [ohlcTF]
  );

  // Cartes
  const currentData = series[series.length - 1] || {};
  const currentRSI = currentData?.rsi ?? null;
  const currentPrice = currentData?.price ?? null;
  const currentMA20 = currentData?.ma20 ?? null;
  const currentMA50 = currentData?.ma50 ?? null;

  const nf = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  const fmt = (v) => (v == null ? "—" : nf.format(Number(v)));

  const rsiSignal = useMemo(
    () => getRSISignal(currentRSI ?? 50),
    [currentRSI]
  );
  const maSignal = useMemo(
    () => getMASignal(currentMA20 ?? 0, currentMA50 ?? 0),
    [currentMA20, currentMA50]
  );

  const menuItems = [
    { id: "course", label: "Cours pour Débutants", icon: BookOpen },
    { id: "strategies", label: "Stratégies Détaillées", icon: Target },
    { id: "live", label: "Analyse en Temps Réel", icon: BarChart3 },
    { id: "glossary", label: "Glossaire", icon: Info },
  ];

  /* ----------------------------- Sections UI ----------------------------- */
  const renderCourseSection = () => (
    <div className="space-y-8">
      {/* ... contenu du cours (inchangé) ... */}
      {/* Pour garder la réponse courte, je n’ai pas re-duppliqué tout le texte ici.
          Tu peux conserver exactement ton bloc Course précédent, il compilera tel quel. */}
    </div>
  );

  const renderStrategiesSection = () => (
    <div className="space-y-6">
      {/* ... contenu des stratégies (inchangé) ... */}
    </div>
  );

  const renderGlossarySection = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-8 h-8 text-[#007aff]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {glossaryTerms.map((term, i) => (
            <div key={i} className="bg-accent rounded-xl p-6">
              <h3 className="font-medium text-accent-foreground mb-3">
                {term.term}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {term.definition}
              </p>
              <div className="bg-[#007aff]/10 p-3 rounded-lg">
                <div className="text-xs font-medium text-[#007aff] mb-1">
                  💡 Utilisation pratique :
                </div>
                <div className="text-sm text-muted-foreground">{term.usage}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Contenu éducatif uniquement. Ce n’est pas un conseil en investissement.
        </p>
      </div>
    </div>
  );

  const renderLiveSection = () => {
    const RsiIcon = rsiSignal.icon;
    const MaIcon = maSignal.icon;

    return (
      <div className="space-y-6">
        {loading && (
          <div className="text-sm text-muted-foreground">
            Mise à jour des données temps réel…
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600">Erreur données live : {error}</div>
        )}

        {/* RSI & MA cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RSI */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground">
                Signal RSI
              </h3>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${rsiSignal.bg}`}
                title={rsiSignal.text}
              >
                <RsiIcon className={`w-4 h-4 ${rsiSignal.color}`} />
                <span className={`text-sm font-medium ${rsiSignal.color}`}>
                  {rsiSignal.text}
                </span>
              </div>
            </div>
            <div className="text-3xl font-medium text-card-foreground mb-2">
              {currentRSI == null ? "—" : Number(currentRSI).toFixed(1)}
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series.slice(-20)}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
                  <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MA */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground">
                Signal Moyennes Mobiles
              </h3>
              <div className="text-sm text-muted-foreground mb-2">
                Prix actuel : {fmt(currentPrice)}
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${maSignal.bg}`}
                title={maSignal.text}
              >
                <MaIcon className={`w-4 h-4 ${maSignal.color}`} />
                <span className={`text-sm font-medium ${maSignal.color}`}>
                  {maSignal.text}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xl font-medium text-card-foreground">
                  {fmt(currentMA20)}
                </div>
                <div className="text-sm text-muted-foreground">MA20</div>
                {currentMA20 == null && (
                  <div className="text-xs text-muted-foreground">
                    En cours de calcul…
                  </div>
                )}
              </div>
              <div>
                <div className="text-xl font-medium text-card-foreground">
                  {fmt(currentMA50)}
                </div>
                <div className="text-sm text-muted-foreground">MA50</div>
                {currentMA50 == null && (
                  <div className="text-xs text-muted-foreground">
                    En cours de calcul…
                  </div>
                )}
              </div>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series.slice(-20)}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma50"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Graph principal */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-medium text-card-foreground mb-6">
            Graphique BTC/USD — Chandeliers
          </h3>

          {/* Toolbar timeframe */}
          {candles.length >= 2 && (
            <div className="flex items-center gap-2 mb-4">
              {["1h", "4h", "12h", "1d"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTf(k)}
                  className={`px-3 py-1 rounded-md border text-sm ${
                    tf === k
                      ? "bg-[#007aff] text-white border-[#007aff]"
                      : "border-border hover:bg-muted"
                  }`}
                  aria-pressed={tf === k}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div className="h-96">
            {candles.length >= 2 ? (
              <CandleLite data={candles} height={384} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#007aff"
                    strokeWidth={2}
                    fill="#007aff"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {candles.length
              ? "Données OHLC via backend (source CoinGecko)."
              : "Pas d’OHLC : affichage en courbe."}
          </p>
        </div>
      </div>
    );
  };

  /* ------------------------------- Layout ------------------------------- */
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-medium text-card-foreground">
            Apprendre nos Stratégies
          </h1>
          <div className="text-sm text-muted-foreground">
            Cours interactif • Trading éducatif • Sans risque
          </div>
        </div>

        <div className="flex gap-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeSection === id
                  ? "bg-[#007aff] text-white"
                  : "bg-accent text-accent-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeSection === "course" && renderCourseSection()}
      {activeSection === "strategies" && renderStrategiesSection()}
      {activeSection === "live" && renderLiveSection()}
      {activeSection === "glossary" && renderGlossarySection()}
    </div>
  );
}
