# 🧭 Sprint Deliverable – Learn2Trade

## 1) Sprint Planning

**Durée du sprint :** 2 semaines (du 14 au 27 octobre 2025)  
**Objectif :** finaliser les fonctionnalités du MVP (authentification, trading, historique, intégration frontend/backend).  
**Méthodologie :** Scrum allégée – 1 sprint principal + suivi quotidien.

### Découpage et priorisation (MoSCoW)

| Tâche | Description | Priorité | Assigné à | Statut |
|-------|--------------|-----------|------------|---------|
| Backend Auth | Routes `/auth/signup`, `/auth/login`, gestion JWT + cookies | Must | Thomas | Done |
| Backend Trades | Endpoints `/trade/open`, `/trade/:id/close`, calcul PnL | Must | Thomas | Done |
| Backend Market | Connexion API Binance, endpoint `/market/prices`, OHLC | Must | Julien | Done |
| Backend News | Récupération RSS / NewsAPI | Should | Julien | Done |
| Front Auth | Pages `Login`, `Signup`, stockage token, redirection sécurisée | Must | Thomas | Done |
| Front Dashboard | Affichage positions + KPIs | Must | Julien/Thomas | Done |
| Front History | Page historique (`History.jsx`) avec PnL et filtres | Must | Thomas | Done |
| Front Graphiques | Intégration Lightweight Charts pour chandeliers | Should | Julien | Done |
| UI & UX | Vidéo d’accueil, CTA, responsive Tailwind | Could | Julien | Done |
| Tests & QA | Tests Postman (API) + Jest (backend) + capture front | Must | Thomas/Julien | Done |
| Déploiement | Backend sur Render + Front sur Vercel | Must | Thomas | Done |

### Dépendances

- `auth` doit être terminé avant `trade` (JWT nécessaire).  
- `market` et `asset` doivent être prêts avant `dashboard` et `history`.  
- `news` est indépendante.

---

## 2) Exécution des tâches

- **Branches Git :**  
  - `dev` → branche principale de développement  
  - `feature/auth`, `feature/trade`, `feature/dashboard`  
  - PRs validées avant merge vers `dev`, puis `main`

- **Normes de code :**  
  - ESLint actif, conventions camelCase, commentaires en français  
  - Services séparés (`trade.service.js`, `auth.service.js`, etc.)

- **Preuves :**  
  - Scripts Postman exécutés pour tous les endpoints REST  
  - Jest sur les services critiques (`auth.service`, `trade.service`)  
  - Captures disponibles dans `/docs/screenshots/api_tests.png`

---

## 3) Suivi et ajustements

- **Outil de suivi :** Trello  
  [Tableau Learn2Trade](https://trello.com/b/learn2trade)  
  Colonnes : `Backlog`, `In Progress`, `Review`, `Done`  
  Chaque carte : titre de la tâche + description + étiquette (Thomas / Julien)

- **Stand-ups (résumés)**  
  - 17/10 : Auth et routes trade fonctionnelles  
  - 20/10 : Dashboard et Market API intégrés  
  - 23/10 : Correction des bugs CORS + Historique en place  
  - 25/10 : Tests API validés + déploiement Render / Vercel

- **Indicateurs :**  
  - 92% des tâches prévues terminées  
  - 0 bug bloquant à la clôture du sprint

---

## 4) Sprint Review & Rétrospective

**Ce qui a bien fonctionné :**  
- Bonne coordination front/back entre Thomas et Julien  
- Architecture Express claire et modulaire  
- Intégration Binance et affichage graphique fluide

**Ce qui a été difficile :**  
- CORS et cookies JWT (Render/Vercel)  
- Calcul du PnL côté backend + adaptation du front

**Améliorations prévues :**  
- Automatiser les tests (CI GitHub Actions)  
- Ajouter des graphiques d’évolution du capital utilisateur

---

## 5) Final Integration & QA Testing

- **Tests d’intégration :**  
  - Vérification du flux complet utilisateur → connexion → ouverture → fermeture d’un trade → historique.  
  - Test API : cohérence des champs `price_open`, `price_close`, `pnl`, `pnl_pct`.  
  - Tests d’affichage : Dashboard et History synchronisés avec la BDD.  

- **Résultats :**  
  - Tous les endpoints REST fonctionnels (testés via Postman).  
  - Données cohérentes entre backend (PostgreSQL) et frontend (React).  
  - Aucune erreur critique détectée avant déploiement.

---

## 6) Deliverables

| Élément | Lien / Emplacement |
|----------|--------------------|
| Sprint Planning | [Trello Learn2Trade](https://trello.com/b/learn2trade) |
| Source Repository | [GitHub – Learn2Trade](https://github.com/Tomsonne/Learn2Trade) |
| Bug Tracking | Trello – colonne “Bugs” |
| Testing Evidence | `/docs/screenshots/api_tests.png` |
| Production Environment | Frontend : https://learn2trade.vercel.app <br> Backend : https://learn2trade-api.onrender.com |

---

## 7) Synthèse

Le sprint a permis de livrer un MVP complet et stable de Learn2Trade, incluant :  
- Authentification sécurisée par JWT (httpOnly cookies).  
- Simulation de trading (ouverture/fermeture de trades, calcul PnL).  
- Visualisation de marché (graphiques, actualités, KPIs).  
- Intégration continue via Render (backend) et Vercel (frontend).  

Les prochains sprints viseront à enrichir le produit avec de nouvelles stratégies (DCA, ATR), un système de notifications et un mode “backtesting”.
