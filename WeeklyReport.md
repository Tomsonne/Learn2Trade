# 📄 Weekly Progress Report – Learn2Trade

## ✅ Semaine du 15 au 19 Septembre 2025

### 1. Structuration du projet backend
- Mise en place d’une arborescence claire pour séparer les responsabilités :  
  - `api` pour les routes (endpoints REST)  
  - `controllers` pour la logique API  
  - `services` pour la logique métier  
  - `models` pour les classes SQL  
  - `core` pour la configuration et la connexion à la base  
  - `test` pour les tests unitaires  
- Création d’un point d’entrée unique `server.js`.  
- Préparation de l’environnement de développement avec Docker (Node + Postgres).  

---

### 2. Base de données PostgreSQL
- Choix de **PostgreSQL** pour la fiabilité et la compatibilité SQL.  
- Création du schéma complet (`schema.sql`) contenant les tables principales :  
  `users`, `assets`, `strategies`, `trades`, `positions`, `strategy_signals`, `news_cache`.  
- Initialisation automatique du conteneur Postgres via `docker-compose`.  
- Tests de connexion et premières requêtes de validation via DBeaver.  

---

### 3. Configuration serveur
- Mise en place d’un serveur **Express.js** avec middlewares (CORS, helmet, morgan, JSON parsing).  
- Validation de la communication backend ↔ base de données.  

---

### ⚠️ Problèmes rencontrés
- Difficulté initiale à synchroniser les conteneurs Docker.  
- Petites erreurs de mapping entre les noms de colonnes SQL et les propriétés JS.  

---

### 🎯 Résultats
- Environnement de développement complet et fonctionnel.  
- Serveur Node connecté à PostgreSQL.  
- Schéma SQL stable et validé.  

---

## ✅ Semaine du 22 au 26 Septembre 2025

### 1. Création des modèles
- Définition des modèles `User`, `Trade`, `Position`, `Asset`, `Strategy`.  
- Implémentation d’un **repository SQL** avec requêtes préparées.  
- Vérification des relations (`user_id`, `asset_id`, `trade_id`) et des contraintes.  

---

### 2. Services métier
- Création de `TradeService` pour ouvrir/fermer un trade avec calcul du PnL.  
- Début du service `UserService` pour gérer l’inscription et l’authentification (bcrypt).  
- Mise en place de `AssetService` pour récupérer les actifs listés.  

---

### ⚠️ Problèmes rencontrés
- Première tentative d’intégration de l’API **CoinGecko** :  
  - Limites strictes de taux d’appels (`rate limit exceeded`).  
  - Données parfois obsolètes ou incomplètes .
  - problemes sur les Tf12h et 1d  
- Décision de **migrer vers l’API Binance**, plus fiable et moins limitative.  

---

### 🎯 Résultats
- Backend plus structuré et cohérent.  
- Première couche de logique métier validée.  
- Planification du passage à Binance pour la récupération de prix en temps réel.  

---

## ✅ Semaine du 29 Septembre au 3 Octobre 2025

### 1. Démarrage du frontend React
- Initialisation du projet frontend avec **Vite + React + TailwindCSS**.  
- Structure du dossier `src` : `pages`, `components`, `hooks`, `api.js`.  
- Configuration du proxy API pour le développement local.  

---

### 2. Liaison backend ↔ frontend
- Création d’un service API central (`api.js`) pour gérer les appels (`fetch`).  
- Tests de récupération des actifs et prix reels depuis le backend.  
- Affichage des cours page strategie dynamique(api coingecko).  

---

### 3. Interface de base
- Création des composants :  
  - `CardBase` (structure commune)  
  - `KpiCard` (indicateurs clés)  
  - `PortfolioDistribution` (répartition graphique)  
  - `PositionsTable` (liste des positions ouvertes).  

---

### ⚠️ Problèmes rencontrés
- Difficultés à gérer les variables d’environnement avec Vite (`import.meta.env`).  
- Ajustements nécessaires pour l’URL API selon l’environnement Docker / local.  

---

### 🎯 Résultats
- Premier **Dashboard React fonctionnel**.  
- Données affichées depuis le backend.  
- Design cohérent et responsive avec TailwindCSS.  

---

## ✅ Semaine du 6 au 10 Octobre 2025

### 1. Indicateurs techniques
- Création du module `lib/indicators.js` (RSI et Moyennes Mobiles).  
- Développement du hook `useMarketSeries` pour agréger les données OHLC.  
- Intégration du graphique **CandleLite.jsx** avec **lightweight-charts**.  

---

### 2. Backend trading
- Ajout des routes `/api/v1/trade/open` et `/api/v1/trade/:id/close`.  
- Gestion des transactions SQL avec `FOR UPDATE`.  
- Calcul du profit/loss et mise à jour des positions ouvertes.  

---

### ⚠️ Problèmes rencontrés
- Erreurs SQL liées à `FOR UPDATE` sur des jointures extérieures (`nullable side`).  
- Nécessité de revoir la logique de récupération de positions ouvertes avant le verrouillage.  
- Ajustement du modèle `Position` pour simplifier la requête.  

---

### 🎯 Résultats
- Indicateurs techniques opérationnels (RSI, MA).  
- Backend de trading stable après correction des transactions SQL.  
- Graphiques interactifs fonctionnels sur le Dashboard.  

---

## ✅ Semaine du 13 au 17 Octobre 2025

### 1. Amélioration du Dashboard
- Refactorisation et nettoyage des composants (`KpiCard`, `PositionsTable`, `PortfolioDistribution`).  
- Affichage dynamique des KPI : **solde total**, **cash disponible**, **PnL total**, **montant investi**.  
- Optimisation du formatage (valeurs monétaires, pourcentages, alignement visuel).  

---

### 2. Données de marché et changement d’API
- **Abandon de l’API CoinGecko** : les données en 30m/1h étaient trop difficiles à ré-agréger selon les timeframes (TF).  
- **Migration vers l’API Binance**, plus adaptée aux besoins du projet :  
  - Données OHLC disponibles directement selon plusieurs intervalles (`1m`, `1h`, `4h`, `1d`, etc.)  
  - Meilleure fréquence de mise à jour et cohérence temporelle.  
- Simplification du service `market.services.js` pour récupérer directement les chandeliers depuis Binance.  

---

### 3. Stabilité et cohérence globale
- Amélioration du rendu du graphique `CandleLite.jsx` avec les nouvelles données Binance.  
- Vérification des calculs de RSI et de moyennes mobiles sur les nouvelles séries de données.  
- Nettoyage des conversions de timestamps et suppression des fonctions d’agrégation locales devenues inutiles.  

---

### ⚠️ Problèmes rencontrés
- Ajustement du parsing JSON entre CoinGecko et Binance (format des timestamps et clés).  
- Petites erreurs de synchronisation entre les données Binance et les indicateurs (résolues en recalculant le buffer local).  
- Besoin d’adapter les hooks React (`useMarketSeries`) à la nouvelle structure des données.  

---

### 🎯 Résultats
- **Intégration complète de l’API Binance** réussie.  
- **Dashboard plus fluide** et plus réactif grâce aux données déjà agrégées par timeframe.  
- **Calculs d’indicateurs techniques fiables** sur des données cohérentes.  

---

## 🔜 Prochaines étapes  
- finaliser history et dashboard 
- Ajouter la **persistance des performances utilisateurs** et l’historique des trades.  
- Préparer une **présentation fonctionnelle du projet** (demo live + slides).  
