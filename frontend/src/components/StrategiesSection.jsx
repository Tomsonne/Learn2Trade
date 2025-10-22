import React from "react";
import { Target, AlertTriangle } from "lucide-react";

/**
 * Props:
 * - strategies: array
 * - selectedStrategy: object
 * - setSelectedStrategy: fn
 */
export default function StrategiesSection({ strategies, selectedStrategy, setSelectedStrategy }) {
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

          <div>
            <h4 className="font-medium text-accent-foreground mb-3">Étapes :</h4>
            <div className="space-y-3">
              {selectedStrategy.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#007aff] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">⚠️ Points d'attention</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Tester en démo avant le réel</li>
                  <li>• Respect strict du money management</li>
                  <li>• Éviter les annonces macro très volatiles</li>
                  <li>• Tenir un journal de trading</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Contenu éducatif uniquement. Ce n’est pas un conseil en investissement.
          </p>
        </div>
      </div>
    </div>
  );
}
