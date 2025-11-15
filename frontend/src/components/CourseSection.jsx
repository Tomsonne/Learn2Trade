// src/components/CourseSection.jsx
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Shield,
  Zap,
  Clock,
  DollarSign,
} from "lucide-react";

export default function CourseSection() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 border-2 border-primary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/20 p-3 border border-primary/30">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">
              Formation Trading Crypto - Niveau Débutant
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Maîtrisez les fondamentaux de l'analyse technique et du trading de cryptomonnaies en 6 modules progressifs. Formation 100% gratuite et pratique.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">~2h de formation</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">6 leçons essentielles</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Exemples pratiques</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-primary-foreground">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-card-foreground">
              Les Fondamentaux
            </h3>
            <p className="text-sm text-muted-foreground">
              Commencez par les bases essentielles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leçon 1 */}
          <div className="space-y-6">
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                Leçon 1: Qu'est-ce que l'analyse technique ?
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  L'analyse technique est l'étude des graphiques de prix pour
                  prédire les mouvements futurs. Elle se base sur l'idée que
                  l'histoire se répète et que les prix reflètent toutes les
                  informations disponibles.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground">
                    Les 3 principes fondamentaux :
                  </h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Le marché intègre tout (prix, volume, actualités)</li>
                    <li>• Les prix évoluent selon des tendances</li>
                    <li>• L'histoire a tendance à se répéter</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leçon 2 */}
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                Leçon 2: Les types de tendances
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-brand" />
                  <div>
                    <strong className="text-card-foreground">Tendance haussière :</strong>{" "}
                    Succession de sommets et creux de plus en plus hauts
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5 text-primary" />
                  <div>
                    <strong className="text-card-foreground">Tendance baissière :</strong>{" "}
                    Succession de sommets et creux de plus en plus bas
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <strong className="text-card-foreground">Tendance latérale :</strong>{" "}
                    Prix évoluent dans une fourchette horizontale
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leçon 3 & 4 */}
          <div className="space-y-6">
            {/* Leçon 3 */}
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                Leçon 3: Support et Résistance
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Les niveaux de support et résistance sont les fondations de
                  l'analyse technique.
                </p>
                <div className="space-y-3">
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <strong className="text-card-foreground">Support :</strong>{" "}
                    Zone où le prix a tendance à rebondir vers le haut. Les acheteurs sont plus nombreux que
                    les vendeurs.
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <strong className="text-card-foreground">Résistance :</strong>{" "}
                    Zone où le prix a du mal à monter. Les vendeurs sont plus nombreux que les acheteurs.
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
                    <div className="text-xs text-primary">
                      <strong>Règle d'or :</strong> Un support cassé devient résistance, et vice versa !
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leçon 4 */}
            <div className="bg-accent rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium text-accent-foreground">
                  Leçon 4: Gestion du risque
                </h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  La gestion du risque est plus importante que l'analyse
                  elle-même ! C'est ce qui différencie les traders profitables des autres.
                </p>
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
                    <span>Tenir un journal de trading détaillé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ne jamais trader sous l'émotion (FOMO/FUD)</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>Exemple pratique :</strong> Avec un capital de 1000€, risquez max 20€ par trade (2%). Si votre stop-loss est à 5% du prix d'achat, achetez pour 400€ maximum.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Leçons Avancées */}
      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-500 text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-card-foreground">
              Techniques Avancées
            </h3>
            <p className="text-sm text-muted-foreground">
              Passez au niveau supérieur
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leçon 5 */}
          <div className="bg-accent rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-accent-foreground">
                Leçon 5: Lecture des chandeliers japonais
              </h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Les chandeliers (candlesticks) révèlent la psychologie du marché et donnent des signaux d'achat/vente puissants.
              </p>
              <div className="space-y-3">
                <div className="bg-card p-3 rounded-lg border border-border">
                  <strong className="text-card-foreground">🟢 Hammer (Marteau) :</strong>{" "}
                  Longue mèche basse, petit corps en haut. Signal haussier après une baisse = potentiel retournement.
                </div>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <strong className="text-card-foreground">🔴 Shooting Star (Étoile filante) :</strong>{" "}
                  Longue mèche haute, petit corps en bas. Signal baissier après une hausse = fin de rallye.
                </div>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <strong className="text-card-foreground">⚪ Doji :</strong>{" "}
                  Ouverture = Fermeture. Indécision du marché, souvent précède un changement de tendance.
                </div>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <strong className="text-card-foreground">🟢 Engulfing Haussier :</strong>{" "}
                  Grosse bougie verte englobe la bougie rouge précédente. Forte pression acheteuse.
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    <strong>Astuce :</strong> Les patterns de chandeliers sont plus fiables sur des timeframes élevés (4H, 1D) et quand ils apparaissent près de supports/résistances clés.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Leçon 6 */}
          <div className="bg-accent rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-accent-foreground">
                Leçon 6: Construire votre plan de trading
              </h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Un plan de trading est votre feuille de route pour rester discipliné et profitable sur le long terme.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                    Définissez vos objectifs
                  </h4>
                  <p className="ml-8">Gain mensuel cible, drawdown maximum acceptable, temps à consacrer.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                    Choisissez vos marchés
                  </h4>
                  <p className="ml-8">BTC, ETH, altcoins ? Quels timeframes ? Combien de positions max en parallèle ?</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                    Vos setups d'entrée
                  </h4>
                  <p className="ml-8">Quels signaux vous font entrer ? RSI &lt; 30 + rebond sur support ? Golden cross MA ?</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-accent-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">4</span>
                    Gestion de position
                  </h4>
                  <p className="ml-8">Où placer stop-loss et take-profit ? Quand réduire/augmenter la position ?</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-xs text-green-700 dark:text-green-400">
                    <strong>Conseil final :</strong> Backtestez votre plan sur données historiques, puis tradez en démo pendant 1 mois minimum avant de passer en réel avec du vrai capital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-2">Avertissement important</h4>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Ce contenu est purement éducatif et ne constitue pas un conseil en investissement. Le trading de cryptomonnaies comporte des risques importants de perte en capital. Ne tradez jamais avec de l'argent que vous ne pouvez pas vous permettre de perdre. Pratiquez toujours en mode démo avant d'utiliser de l'argent réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
