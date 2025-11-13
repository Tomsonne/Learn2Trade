# SkillVest – Résumé des Résultats & Leçons Apprises

## Résumé des Résultats

### Aperçu
SkillVest est un simulateur de trading éducatif conçu pour aider les utilisateurs à comprendre le trading algorithmique grâce à de vraies données de marché, des graphiques interactifs et des stratégies guidées.

### Fonctionnalités principales de l'MVP
- Visualisation des prix crypto en temps réel (BTC/USD, ETH/USD) via **Binance API**
- Système complet de comptes utilisateurs avec authentification sécurisée
- Deux stratégies automatiques : **Croisement de Moyennes Mobiles (20/50)** et **Stratégie basée sur le RSI**
- Tableau de bord interactif affichant **les performances** et **l’historique des trades**
- Mode éducatif privilégiant la compréhension plutôt que le profit

### Objectifs initiaux vs Résultats

| Objectif | Résultat |
|----------|----------|
| Construire un simulateur full-stack utilisant des données temps réel | ✅ Atteint – stack complète React + Express + PostgreSQL |
| Implémenter au moins 2 stratégies automatisées | ✅ Atteint – MA Crossover et RSI intégrés |
| Fournir une interface claire et intuitive | ✅ Retour positif des utilisateurs test |
| Inclure la mise en cache backend et la validation des données | ✅ Mise en cache en mémoire type Redis implémentée |
| Intégrer une API de données de marché | ⚠️ Défi résolu – migration de CoinGecko → Binance |
| Livrer le projet avant le 14 novembre | ✅ Livré dans les délais |

### Indicateurs clés
- **Fréquence de rafraîchissement des données :** ~60 secondes (cache optimisé)
- **Temps de réponse de l’API :** ~120 ms en moyenne
- **Vitesse de build frontend :** <1 seconde avec Vite
- **Disponibilité pendant la démo :** 100 %

---

## Leçons Apprises

## Ce qui s’est bien passé

### 1. Collaboration d’équipe
- Les stand-ups quotidiens et le suivi des tâches Trello ont assuré une coordination fluide.
- L'utilisation de branches Git bien structurées a réduit les conflits.
- La communication proactive a permis de résoudre rapidement les blocages.

### 2. Succès de la migration API (CoinGecko → Binance)
- La migration a amélioré la précision et la fiabilité des graphiques.
- L’unification autour d’une seule source de vérité a simplifié le backend.
- Des temps de réponse plus rapides ont amélioré l’expérience frontend.

### 3. Boucle de rétroaction UI/UX
- Les tests utilisateurs ont permis d’obtenir des indicateurs visuels plus clairs.
- L’approche itérative a facilité l’ajustement des composants critiques.
- Les retours ont renforcé l’aspect éducatif de la plateforme.


---

## Défis rencontrés

### 1. Synchronisation des données (fuseaux horaires, OHLC)
- L’agrégation initiale était incohérente, corrigée avec l’UTC.
- Le traitement multi-symboles a complexifié le pipeline.
- Des ajustements ont été requis pour synchroniser prix spot et chandelles.

### 2. Limitations de l’API (rate-limit, cache, persistance)
- Les limitations Binance ont nécessité une mise en cache agressive.
- Ajout d’une stratégie de retry pour éviter les erreurs en cascade.
- Optimisation des requêtes pour réduire la charge.

### 3. Équilibrer réalisme vs simplicité
- La priorité a été donnée à la clarté éducative.
- Certains concepts (slippage, spread dynamique) ont été simplifiés.
- Cela a aidé à garder l'application accessible aux débutants.


### 4. Problèmes de compatibilité navigateur (Safari / mobile)
- Les cookies HTTPOnly ont demandé une configuration fine (CORS, SameSite).
- Safari iOS a causé des comportements inattendus.

---

## Domaines à améliorer

### 1. Tests API anticipés
- Effectuer les tests plus tôt aurait évité du rework.
- Une suite de tests automatisés aurait détecté les problèmes rapidement.
- Des tests de charge auraient aidé à dimensionner le cache.

### 2. Phase QA étendue
- Plus de temps doit être consacré aux cas extrêmes et tests mobiles.
- L’utilisation d’outils E2E (Cypress/Playwright) serait bénéfique.
- Mise en place d’une checklist QA pour éviter les régressions.

### 3. Analyse améliorée (ROI / performance utilisateur)
- Ajouter des dashboards de progression serait très utile.
- Suivi de l’évolution du capital pour renforcer la pédagogie.
- Analyse des stratégies (winrate, drawdown) pour améliorer l'apprentissage.

### 4. Optimisation du moteur de trading simulé
- Intégration future d’éléments réalistes comme le slippage.
- Règles plus modulaires pour tester différentes variantes.
- Amélioration de la gestion des clôtures partielles.


---

## Conclusion
SkillVest a pleinement atteint ses objectifs techniques et éducatifs.  
Le projet montre qu’il est possible de rendre le trading algorithmique accessible via une UX réfléchie, une intégration cohérente des données et une forte collaboration.  
Les futures versions pourront intégrer l’apprentissage social, la gamification et des analyses plus avancées.
