import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import { BookOpen, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, CheckCircle, Info } from "lucide-react";

// --- Utils & fake data -------------------------------------------------------
const generateIndicatorData = () => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const price = 43000 + Math.sin(i * 0.15) * 3000 + (Math.random() - 0.5) * 500;
    const ma20 = price - 100 + Math.sin(i * 0.1) * 200;
    const ma50 = price - 200 + Math.sin(i * 0.08) * 300;
    const rsi = 50 + Math.sin(i * 0.2) * 25 + (Math.random() - 0.5) * 10;

    data.push({
      time: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      price: Math.round(price),
      ma20: Math.round(ma20),
      ma50: Math.round(ma50),
      rsi: Math.max(0, Math.min(100, rsi)),
    });
  }
  return data;
};

const glossaryTerms = [
  {
    term: "RSI (Relative Strength Index)",
    definition: "Oscillateur technique qui mesure la vitesse et l'amplitude des changements de prix. Il varie de 0 à 100.",
    usage: "RSI > 70 = surachat (plutôt vendre/attendre), RSI < 30 = survente (plutôt acheter)",
  },
  {
    term: "Moyenne Mobile (MA)",
    definition: "Indicateur qui lisse les variations de prix en calculant la moyenne des prix sur une période donnée.",
    usage: "MA20 > MA50 = tendance haussière, MA20 < MA50 = tendance baissière",
  },
  {
    term: "Support",
    definition: "Niveau de prix où l'actif a tendance à trouver un soutien lors des chutes. Les acheteurs entrent massivement.",
    usage: "Niveau d'achat potentiel, stop-loss en dessous",
  },
  {
    term: "Résistance",
    definition: "Niveau de prix où l'actif a du mal à dépasser. Les vendeurs sont présents en masse.",
    usage: "Niveau de vente potentiel, objectif de profit",
  },
  {
    term: "Breakout",
    definition: "Cassure d'un niveau de support ou résistance avec volume important.",
    usage: "Signal d'entrée fort dans la direction de la cassure",
  },
  {
    term: "Volume",
    definition: "Quantité d'actifs échangés sur une période donnée. Confirme la validité des mouvements de prix.",
    usage: "Volume élevé + cassure = signal fiable",
  },
  {
    term: "Stop-Loss",
    definition: "Ordre de vente automatique pour limiter les pertes si le prix va contre votre position.",
    usage: "Toujours placer un stop-loss, généralement 2-3% sous le prix d'achat",
  },
  {
    term: "Take-Profit",
    definition: "Ordre de vente automatique pour sécuriser les profits à un niveau prédéfini.",
    usage: "Ratio risque/rendement de 1:2 ou 1:3 minimum",
  },
];

const strategies = [
  {
    id: "rsi_strategy",
    title: "Stratégie RSI Simple",
    level: "Débutant",
    description: "Une stratégie basée sur l'indicateur RSI pour identifier les zones de survente et surachat.",
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
    description: "Stratégie trending qui utilise le croisement des moyennes mobiles 20 et 50.",
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
    description: "Identifiez et tradez les rebonds sur les niveaux de support et résistance.",
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

// --- Signals helpers ---------------------------------------------------------
const getRSISignal = (rsi) => {
  if (rsi > 70)
    return {
      text: "Surachat – Risque de correction",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: TrendingDown,
    };
  if (rsi < 30)
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
  return { text: "Tendance Neutre", color: "text-gray-600", bg: "bg-gray-50", icon: BarChart3 };
};

// --- Component ---------------------------------------------------------------
export function IndicatorsPage() {
  // Génère une seule fois pour éviter un "shuffle" à chaque rendu
  const [indicatorData] = useState(() => generateIndicatorData());
  const [activeSection, setActiveSection] = useState("course");
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);

  const currentData = indicatorData[indicatorData.length - 1] || {};
  const currentRSI = currentData.rsi ?? 50;
  const currentPrice = currentData.price ?? 43000;
  const currentMA20 = currentData.ma20 ?? 42900;
  const currentMA50 = currentData.ma50 ?? 42800;

  const rsiSignal = useMemo(() => getRSISignal(currentRSI), [currentRSI]);
  const maSignal = useMemo(() => getMASignal(currentMA20, currentMA50), [currentMA20, currentMA50]);

  const menuItems = [
    { id: "course", label: "Cours pour Débutants", icon: BookOpen },
    { id: "strategies", label: "Stratégies Détaillées", icon: Target },
    { id: "live", label: "Analyse en Temps Réel", icon: BarChart3 },
    { id: "glossary", label: "Glossaire", icon: Info },
  ];

  const renderCourseSection = () => (
    <div className="space-y-8">
      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#007aff] rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-card-foreground">Cours pour Débutants</h2>
            <p className="text-muted-foreground">Apprenez les bases de l'analyse technique step-by-step</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leçon 1 */}
          <div className="space-y-6">
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">📚 Leçon 1: Qu'est-ce que l'analyse technique ?</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  L'analyse technique est l'étude des graphiques de prix pour prédire les mouvements futurs. Elle se base sur l'idée que l'histoire
                  se répète et que les prix reflètent toutes les informations disponibles.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground">Les 3 principes fondamentaux :</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Le marché intègre tout (prix, volume, actualités)</li>
                    <li>• Les prix évoluent selon des tendances</li>
                    <li>• L'histoire a tendance à se répéter</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-4">✅ Leçon 2: Les types de tendances</h3>
              <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance haussière :</strong> Succession de sommets et creux de plus en plus hauts
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance baissière :</strong> Succession de sommets et creux de plus en plus bas
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance latérale :</strong> Prix évoluent dans une fourchette horizontale
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leçon 3 */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4">🎯 Leçon 3: Support et Résistance</h3>
              <div className="space-y-4 text-sm text-blue-700 dark:text-blue-300">
                <p>Les niveaux de support et résistance sont les fondations de l'analyse technique.</p>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                    <strong>Support :</strong> Zone où le prix a tendance à rebondir vers le haut. Les acheteurs sont plus nombreux que les vendeurs.
                  </div>
                  <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                    <strong>Résistance :</strong> Zone où le prix a du mal à monter. Les vendeurs sont plus nombreux que les acheteurs.
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-800 dark:text-yellow-200 text-xs">
                      <strong>Règle d'or :</strong> Un support cassé devient résistance, et vice versa !
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-4">⚡ Leçon 4: Gestion du risque</h3>
              <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
                <p>La gestion du risque est plus importante que l'analyse elle-même !</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ne risquez jamais plus de 2% de votre capital par trade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Toujours placer un stop-loss avant d'entrer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ratio risque/rendement minimum 1:2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tenir un journal de trading</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Contenu éducatif uniquement. Ce n’est pas un conseil en investissement. Testez en démo avant le réel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategiesSection = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-[#007aff]" />
          <div>
            <h2 className="text-xl font-medium text-card-foreground">Stratégies de Trading Détaillées</h2>
            <p className="text-muted-foreground">Stratégies testées et validées pour débuter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy)}
              aria-pressed={selectedStrategy.id === strategy.id}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedStrategy.id === strategy.id
                  ? "border-[#007aff] bg-blue-50 dark:bg-blue-900/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-card-foreground">{strategy.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    strategy.level === "Débutant"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : strategy.level === "Intermédiaire"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {strategy.level}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{strategy.description}</p>
            </button>
          ))}
        </div>

        <div className="bg-accent rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-accent-foreground">{selectedStrategy.title}</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">
                Risque: <strong>{selectedStrategy.risk}</strong>
              </span>
              <span className="text-muted-foreground">
                Timeframe: <strong>{selectedStrategy.timeframe}</strong>
              </span>
              <span className="text-muted-foreground">
                Succès: <strong>{selectedStrategy.successRate}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">{selectedStrategy.description}</p>

            <div>
              <h4 className="font-medium text-accent-foreground mb-3">📋 Étapes de la stratégie :</h4>
              <div className="space-y-3">
                {selectedStrategy.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#007aff] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">⚠️ Points d'attention :</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Toujours tester en démo avant le réel</li>
                    <li>• Respecter strictement les règles de money management</li>
                    <li>• Ne pas trader en période de forte volatilité (news importantes)</li>
                    <li>• Garder un journal de vos trades pour analyser vos performances</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Contenu éducatif uniquement. Ce n’est pas un conseil en investissement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveSection = () => {
    const RsiIcon = rsiSignal.icon;
    const MaIcon = maSignal.icon;

    return (
      <div className="space-y-6">
        {/* Current Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground">Signal RSI</h3>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${rsiSignal.bg}`} title={rsiSignal.text}>
                <RsiIcon className={`w-4 h-4 ${rsiSignal.color}`} />
                <span className={`text-sm font-medium ${rsiSignal.color}`}>{rsiSignal.text}</span>
              </div>
            </div>
            <div className="text-3xl font-medium text-card-foreground mb-2">{Number(currentRSI).toFixed(1)}</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indicatorData.slice(-20)}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
                  <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground">Signal Moyennes Mobiles</h3>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${maSignal.bg}`} title={maSignal.text}>
                <MaIcon className={`w-4 h-4 ${maSignal.color}`} />
                <span className={`text-sm font-medium ${maSignal.color}`}>{maSignal.text}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xl font-medium text-card-foreground">{currentMA20.toLocaleString()}€</div>
                <div className="text-sm text-muted-foreground">MA20</div>
              </div>
              <div>
                <div className="text-xl font-medium text-card-foreground">{currentMA50.toLocaleString()}€</div>
                <div className="text-sm text-muted-foreground">MA50</div>
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indicatorData.slice(-20)}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Chart */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-medium text-card-foreground mb-6">Graphique BTC/USD - Analyse Temps Réel</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={indicatorData}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
                <Area type="monotone" dataKey="price" stroke="#007aff" strokeWidth={2} fill="#007aff" fillOpacity={0.1} />
                <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Données simulées à des fins pédagogiques.</p>
        </div>
      </div>
    );
  };

  const renderGlossarySection = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-8 h-8 text-[#007aff]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {glossaryTerms.map((term, index) => (
            <div key={index} className="bg-accent rounded-xl p-6">
              <h3 className="font-medium text-accent-foreground mb-3">{term.term}</h3>
              <p className="text-sm text-muted-foreground mb-4">{term.definition}</p>
              <div className="bg-[#007aff]/10 p-3 rounded-lg">
                <div className="text-xs font-medium text-[#007aff] mb-1">💡 Utilisation pratique :</div>
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

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-medium text-card-foreground">Apprendre nos Stratégies</h1>
          <div className="text-sm text-muted-foreground">Cours interactif • Trading éducatif • Sans risque</div>
        </div>

        <div className="flex gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                aria-pressed={activeSection === item.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeSection === item.id ? "bg-[#007aff] text-white" : "bg-accent text-accent-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
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
