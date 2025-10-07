// src/components/CourseSection.jsx
import React from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CourseSection() {
  return (
    <div className="space-y-8">
      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#007aff] rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-card-foreground">
              Cours pour Débutants
            </h2>
            <p className="text-muted-foreground">
              Apprenez les bases de l'analyse technique step-by-step
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leçon 1 */}
          <div className="space-y-6">
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                📚 Leçon 1: Qu'est-ce que l'analyse technique ?
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

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-4">
                ✅ Leçon 2: Les types de tendances
              </h3>
              <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance haussière :</strong> Succession de sommets
                    et creux de plus en plus hauts
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance baissière :</strong> Succession de sommets
                    et creux de plus en plus bas
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5" />
                  <div>
                    <strong>Tendance latérale :</strong> Prix évoluent dans une
                    fourchette horizontale
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leçon 3 & 4 */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4">
                🎯 Leçon 3: Support et Résistance
              </h3>
              <div className="space-y-4 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Les niveaux de support et résistance sont les fondations de
                  l'analyse technique.
                </p>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                    <strong>Support :</strong> Zone où le prix a tendance à
                    rebondir vers le haut. Les acheteurs sont plus nombreux que
                    les vendeurs.
                  </div>
                  <div className="bg-white dark:bg-blue-950/50 p-3 rounded-lg">
                    <strong>Résistance :</strong> Zone où le prix a du mal à
                    monter. Les vendeurs sont plus nombreux que les acheteurs.
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-800 dark:text-yellow-200 text-xs">
                      <strong>Règle d'or :</strong> Un support cassé devient
                      résistance, et vice versa !
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-4">
                ⚡ Leçon 4: Gestion du risque
              </h3>
              <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
                <p>
                  La gestion du risque est plus importante que l'analyse
                  elle-même !
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ne risquez jamais plus de 2% de votre capital</span>
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
                  Contenu éducatif uniquement. Ce n’est pas un conseil en
                  investissement. Testez en démo avant le réel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
