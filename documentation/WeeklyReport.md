
[Weekly_Progress_Report_Learn2Trade.md](https://github.com/user-attachments/files/23161584/Weekly_Progress_Report_Learn2Trade.md)
# Weekly Progress Report – Learn2Trade

## Semaine du 15 au 19 Septembre 2025

### 1. Structuration du projet backend
- Création du dossier `backend/app` avec séparation claire :  
  - `api` : routes REST (auth, trade, asset, market, news, user, position)  
  - `controllers` : logique d’API centralisée  
  - `services` : logique métier (auth, trade, market, etc.)  
  - `models` : classes et schéma de données SQL  
  - `core` : configuration (`config.js`, `db.js`)  
  - `validators` et `utils` : gestion des erreurs et validation  
- Mise en place du serveur unique `server.js` et du `Dockerfile`.  
- Configuration complète de l’environnement via `docker-compose.yml` (Node + PostgreSQL).  

### 2. Base de données
- Choix de PostgreSQL pour sa robustesse et ses types numériques précis.  
- Schéma SQL dans `backend/db/init/schema.sql` incluant :  
  `users`, `assets`, `strategies`, `trades`, `positions`, `strategy_signals`, `news_cache`.  
- Test de connexion et initialisation via `docker-compose up`.  

### 3. Tests unitaires
- Configuration de Jest (`jest.config.js`, `jest.setup.js`).  
- Premier test sur `auth.service.test.js` et `user.service.test.js`.  

### Problèmes rencontrés
- Synchronisation lente entre conteneurs Node et Postgres.  
- Ajustement du mapping entre modèles et colonnes SQL.  

### Résultats
- Environnement de développement stable.  
- Serveur Express connecté à PostgreSQL via `pg`.  
- Schéma validé et premier test Jest fonctionnel.  

---

## Semaine du 22 au 26 Septembre 2025

### 1. Modèles et services
- Implémentation des modèles `User`, `Trade`, `Position`, `Asset`, `Strategy`.  
- Requêtes SQL paramétrées dans chaque service (prévention injection).  
- Validation des relations et contraintes clés étrangères.  

### 2. Logique métier
- `TradeService` : ouverture/fermeture de position, calcul du PnL.  
- `UserService` : création d’utilisateur, hachage de mot de passe (bcrypt).  
- `AssetService` : gestion de la liste d’actifs (`BTC/USD`, `ETH/USD`).  

### 3. Migration API marché
- Abandon de CoinGecko (limites API et granularité horaire insuffisante).  
- Passage à Binance API : endpoints OHLC précis (`1m`, `1h`, `4h`, `1d`).  

### Problèmes rencontrés
- Rate limit CoinGecko.  
- Format de données incohérent entre CoinGecko et nos besoins.  

### Résultats
- Backend structuré et testable.  
- Services fonctionnels et découplés.  
- Nouvelle source de données de marché opérationnelle.  

---

## Semaine du 29 Septembre au 3 Octobre 2025

### 1. Initialisation du frontend
- Dossier `frontend` créé avec Vite + React + TailwindCSS.  
- Structure conforme :  
  - `pages` (Dashboard, Homepage, Login, Signup, News, Trades, Indicators, History)  
  - `components` (Header, Footer, Sidebar, CandleLite, MiniChart, etc.)  
  - `hooks` (`useMarketSeries`, `useSpotPrice`)  
  - `utils` (`pnl.js`, `positionsToKpis.js`, `cashFromTrades.js`)  

### 2. Intégration backend ↔ frontend
- Service `src/api.js` centralisant les appels API avec `fetch`.  
- Connexion fonctionnelle au backend local (`/api/v1/...`).  
- Tests d’affichage des actifs et positions utilisateurs.  

### 3. Interface de base
- Composants visuels :  
  - `CardBase`, `KpiCard`, `PortfolioDistribution`, `PositionsTable`.  
- Navigation avec `ProtectedRoute` et `React Router`.  

### Problèmes rencontrés
- Gestion des variables d’environnement (`import.meta.env`) sous Vite.  
- Adaptation de l’URL API entre Docker et localhost.  

### Résultats
- Dashboard React fonctionnel et connecté.  
- Interface responsive et cohérente avec TailwindCSS.  

---

## Semaine du 6 au 10 Octobre 2025

### 1. Indicateurs techniques
- Module `lib/indicators.js` : calculs RSI et moyennes mobiles.  
- Hook `useMarketSeries` pour agréger les bougies OHLC.  
- Intégration du graphique `CandleLite.jsx` via Lightweight Charts.  

### 2. Backend trading
- Nouvelles routes :  
  - `POST /api/v1/trade/open`  
  - `POST /api/v1/trade/:id/close`  
- Gestion des transactions SQL atomiques (`BEGIN / COMMIT / ROLLBACK`).  
- Calcul dynamique du PnL et mise à jour des positions.  

### Problèmes rencontrés
- Conflits `FOR UPDATE` sur jointures SQL.  
- Simplification du modèle `Position` pour améliorer la stabilité.  

### Résultats
- Indicateurs RSI et MA fonctionnels.  
- Backend stable et transactions validées.  
- Graphique interactif en temps réel sur le Dashboard.  

---

## Semaine du 13 au 17 Octobre 2025

### 1. Optimisation du Dashboard
- Refactorisation complète des composants (`KpiCard`, `PositionsTable`, `PortfolioDistribution`).  
- Calcul dynamique des KPI : solde total, cash disponible, PnL global, montant investi.  
- Amélioration de la cohérence visuelle (formatage, alignement, valeurs monétaires).  

### 2. Migration complète vers Binance
- Suppression du code CoinGecko.  
- Nouveau service `market.service.js` utilisant les chandeliers Binance (`klines`).  
- Synchronisation des indicateurs RSI/MA avec les nouvelles données.  

### 3. Nettoyage et cohérence
- Correction du décalage horaire sur les bougies (UTC + 2).  
- Suppression du code d’agrégation local redondant.  
- Vérification des timestamps et cohérence du cache local.  

### Problèmes rencontrés
- Parsing JSON différent entre APIs.  
- Décalage de deux heures corrigé sur CandleLite.  

### Résultats
- Intégration Binance totalement stable.  
- Dashboard plus fluide et réactif.  
- Indicateurs fiables et cohérents sur chaque timeframe.  

---

## Prochaines étapes
- Finaliser l’historique des trades et les graphiques de performance.  
- Ajouter la persistance du rendement utilisateur (ROI cumulé).  
- Préparer la démonstration et les supports pour le Demo Day Holberton.  
- Ajouter une suite de tests d’intégration complète avant le déploiement définitif.
## Semaine du 20 au 24 Octobre 2025

### 1. Finalisation du Dashboard
- Intégration complète des composants de visualisation :  
  - `KpiGrid` pour les indicateurs principaux (solde, PnL, cash disponible, montant investi).  
  - `PositionsTable` pour le suivi des positions ouvertes et fermées.  
  - `PortfolioDistribution` pour la répartition des actifs détenus.  
  - `CandleLite.jsx` pour l’affichage des bougies de prix en temps réel.  
- Ajout de filtres temporels sur le graphique (`1h`, `4h`, `1d`).  
- Amélioration des performances de rendu grâce à `useMemo` et `useEffect` optimisés.  

### 2. Connexion au backend en production
- Configuration du proxy HTTPS pour relier le frontend à l’API hébergée sur Railway.  
- Ajustement des variables d’environnement pour le mode production (`VITE_API_URL`).  
- Vérification du comportement en production (latence, authentification, échanges JSON).  

### 3. Déploiement sur Vercel
- Déploiement réussi du frontend sur **Vercel** :  
  [https://learn2-trade.vercel.app](https://learn2-trade.vercel.app)  
- Configuration du domaine, du build Vite et des règles de redirection (`vercel.json`).  
- Vérification de la compatibilité entre les appels API et le backend Railway.  

### 4. Tests utilisateur
- Vérification de la navigation complète : connexion, dashboard, graphique, historique.  
- Tests de responsive design sur ordinateur, tablette et mobile.  
- Validation du fonctionnement sur plusieurs navigateurs (Chrome, Edge, Firefox).  

### 5. Expérience utilisateur (Homepage vidéo et CTA)
- Ajout d’une vidéo d’introduction sur la page d’accueil pour encourager la création de compte et l’essai du service.  
- Fichiers ajoutés : `public/video.mp4` et `public/video_faststart.mp4` (optimisé faststart pour déplacer l’atome moov en début de fichier).  
- Intégration `<video autoplay muted loop playsinline>` avec poster de fallback et contrôle de compatibilité mobile.  
- CTA mis en avant sous la vidéo : bouton **Créer un compte** (route `/signup`) et **Essayer la démo**.  
- Fallback mobile : image statique si l’autoplay est bloqué, afin de préserver le TTI et l’UX.  
- Impact mesuré : LCP amélioré sur desktop grâce à la version faststart ; aucune régression Core Web Vitals constatée.
### Problèmes rencontrés
- Légère différence de fuseau horaire entre Railway et Vercel (UTC vs UTC+2).  
- Nécessité de régénérer les clés JWT après déploiement pour le domaine HTTPS.  

### Résultats
- Dashboard complet, fluide et connecté au backend.  
- Application déployée avec succès sur Vercel pour démonstration publique.  
- Interface réactive, responsive et stable en production.
