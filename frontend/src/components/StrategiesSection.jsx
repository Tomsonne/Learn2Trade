import React from "react";
import { Target, AlertTriangle, ThumbsUp, ThumbsDown, Lightbulb, TrendingUp, Info } from "lucide-react";
import RsiCard from "./cards/RsiCard";
import MaCard from "./cards/MaCard";
import BollingerBandsCard from "./cards/BollingerBandsCard";
import FibonacciCard from "./cards/FibonacciCard";
import Tooltip from "./ui/Tooltip";

/**
 * Props:
 * - strategies: array
 * - selectedStrategy: object
 * - setSelectedStrategy: fn
 * - series: array (données de marché avec indicateurs)
 * - currentRSI: number
 * - rsiSignal: object
 * - maSignal: object
 * - fmt: function (formatage prix)
 * - spot: number (prix spot)
 * - tf: string (timeframe)
 * - last: object (dernière bougie avec indicateurs)
 */
export default function StrategiesSection({
  strategies,
  selectedStrategy,
  setSelectedStrategy,
  series = [],
  currentRSI = null,
  rsiSignal = null,
  maSignal = null,
  fmt = (v) => v,
  spot = null,
  tf = "1h",
  last = {},
}) {
  // Mapping stratégie -> card d'indicateur
  const getIndicatorCard = () => {
    switch (selectedStrategy.id) {
      case "rsi_strategy":
      case "rsi_divergence":
        return <RsiCard series={series} rsiSignal={rsiSignal} currentRSI={currentRSI} tf={tf} />;

      case "ma_crossover":
        return <MaCard series={series} maSignal={maSignal} fmt={fmt} tf={tf} ma20={last?.ma20 ?? null} ma50={last?.ma50 ?? null} price={spot} />;

      case "bollinger_bands":
        return <BollingerBandsCard series={series} fmt={fmt} tf={tf} price={spot} currentRSI={currentRSI} />;

      case "fibonacci_retracement":
        return <FibonacciCard series={series} fmt={fmt} tf={tf} price={spot} currentRSI={currentRSI} />;

      default:
        return null;
    }
  };

  // Glossaire des termes techniques avec explications
  const glossary = {
    "RSI": "Relative Strength Index : Indicateur mesurant la force d'une tendance sur une échelle de 0 à 100. < 30 = survente, > 70 = surachat.",
    "confluence": "Confirmation d'un signal par plusieurs indicateurs différents. Plus il y a de confluence, plus le signal est fiable.",
    "Golden Ratio": "Niveau 61.8% de Fibonacci, le plus fiable statistiquement pour les rebonds. Basé sur la suite mathématique de Fibonacci.",
    "61.8%": "Niveau de Fibonacci le plus important (Golden Ratio). Zone où le prix rebondit le plus souvent.",
    "retracement": "Correction temporaire du prix dans le sens inverse de la tendance principale avant de reprendre sa direction initiale.",
    "swing high": "Point haut local significatif : prix le plus élevé avant une baisse notable.",
    "swing low": "Point bas local significatif : prix le plus bas avant une hausse notable.",
    "chandelier d'inversion": "Pattern de bougie qui annonce un retournement : hammer (marteau), doji (indécision), engulfing (engloutissement).",
    "volume": "Quantité d'actifs échangés sur une période. Volume élevé = forte conviction du marché.",
    "extension": "Projection des niveaux Fibonacci au-delà du mouvement initial pour identifier des cibles de prix (127.2%, 161.8%).",
    "stop-loss": "Ordre automatique de vente si le prix baisse à un certain niveau pour limiter les pertes.",
    "take profit": "Ordre automatique de vente quand le prix atteint un objectif pour sécuriser les gains.",
  };

  // Fonction pour détecter et entourer les termes du glossaire avec des tooltips
  const renderStepWithTooltips = (step) => {
    const terms = Object.keys(glossary).sort((a, b) => b.length - a.length); // Trier par longueur décroissante
    let parts = [step];

    terms.forEach(term => {
      const newParts = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          // Recherche insensible à la casse avec conservation de la casse originale
          const regex = new RegExp(`\\b(${term})\\b`, 'gi');
          const matches = [...part.matchAll(regex)];

          if (matches.length > 0) {
            let lastIndex = 0;
            matches.forEach((match, idx) => {
              // Texte avant le match
              if (match.index > lastIndex) {
                newParts.push(part.substring(lastIndex, match.index));
              }
              // Le terme avec tooltip
              newParts.push(
                <span key={`${term}-${idx}`} className="relative inline-flex items-center gap-1">
                  <strong className="text-primary">{match[0]}</strong>
                  <Tooltip
                    content={
                      <div className="max-w-xs">
                        <p className="font-semibold mb-1">{term}</p>
                        <p className="text-xs">{glossary[term]}</p>
                      </div>
                    }
                  >
                    <Info className="w-3 h-3 text-primary inline cursor-help" />
                  </Tooltip>
                </span>
              );
              lastIndex = match.index + match[0].length;
            });
            // Texte après le dernier match
            if (lastIndex < part.length) {
              newParts.push(part.substring(lastIndex));
            }
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-[#007aff]" />
          <div>
            <h2 className="text-xl font-medium text-card-foreground">Stratégies de Trading Détaillées</h2>
            <p className="text-muted-foreground">Stratégies testées et pédagogiques pour débuter</p>
          </div>
        </div>

        {/* Choix de stratégie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {strategies.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStrategy(s)}
              aria-pressed={selectedStrategy.id === s.id}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedStrategy.id === s.id
                  ? "border-[#007aff] bg-blue-50 dark:bg-blue-900/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-card-foreground">{s.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    s.level === "Débutant"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : s.level === "Intermédiaire"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {s.level}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </button>
          ))}
        </div>

        {/* Card de l'indicateur en temps réel pour cette stratégie */}
        {getIndicatorCard() && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Indicateur en temps réel pour cette stratégie
            </h3>
            {getIndicatorCard()}
          </div>
        )}

        {/* Détails de la stratégie sélectionnée */}
        <div className="bg-accent rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-accent-foreground">{selectedStrategy.title}</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Risque: <strong>{selectedStrategy.risk}</strong></span>
              <span className="text-muted-foreground">Timeframe: <strong>{selectedStrategy.timeframe}</strong></span>
              <span className="text-muted-foreground">Succès: <strong>{selectedStrategy.successRate}</strong></span>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">{selectedStrategy.description}</p>

          <div className="mb-6">
            <h4 className="font-medium text-accent-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Étapes d'exécution :
            </h4>
            <div className="space-y-3">
              {selectedStrategy.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{renderStepWithTooltips(step)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Avantages & Inconvénients */}
          {(selectedStrategy.advantages || selectedStrategy.disadvantages) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedStrategy.advantages && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Avantages
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    {selectedStrategy.advantages.map((adv, i) => (
                      <li key={i}>✓ {adv}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedStrategy.disadvantages && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" />
                    Inconvénients
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    {selectedStrategy.disadvantages.map((dis, i) => (
                      <li key={i}>✗ {dis}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Exemple pratique */}
          {selectedStrategy.example && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Exemple pratique
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {selectedStrategy.example}
              </p>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Points d'attention</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• Tester en démo avant le réel (minimum 1 mois)</li>
                  <li>• Respect strict du money management (max 2% par trade)</li>
                  <li>• Éviter de trader pendant les annonces macro importantes (FOMC, NFP, CPI)</li>
                  <li>• Tenir un journal de trading détaillé pour analyser vos performances</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Contenu purement éducatif. Ce n'est pas un conseil en investissement. Le trading comporte des risques de perte en capital.
          </p>
        </div>
      </div>
    </div>
  );
}
