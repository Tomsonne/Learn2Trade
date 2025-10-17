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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-primary-foreground">
            <BookOpen className="w-6 h-6" />
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

            {/* Leçon 2 */}
            <div className="bg-accent rounded-xl p-6">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                ✅ Leçon 2: Les types de tendances
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
                🎯 Leçon 3: Support et Résistance
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
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                ⚡ Leçon 4: Gestion du risque
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  La gestion du risque est plus importante que l'analyse
                  elle-même !
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand" />
                    <span>Ne risquez jamais plus de 2% de votre capital</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand" />
                    <span>Toujours placer un stop-loss avant d'entrer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand" />
                    <span>Ratio risque/rendement minimum 1:2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand" />
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
