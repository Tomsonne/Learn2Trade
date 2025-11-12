[TechnicalDocumentation_Addendum.md](https://github.com/user-attachments/files/23161550/TechnicalDocumentation_Addendum.md)
# Technical Documentation – Addendum (Version actuelle du projet)

Ce document complète la documentation technique initiale sans la modifier. Il présente les écarts entre le document de départ et l’implémentation réellement livrée, afin de conserver l’historique tout en facilitant l’évaluation.

---

## 1) Résumé exécutif des changements

| Sujet | Document initial | Implémentation actuelle | Justification |
|------|-------------------|-------------------------|---------------|
| **Pile backend** | Flask + Flask-RESTx (Python, prévu au départ) | Node.js + Express (réellement implémenté) | Unification du langage front/back en JavaScript, plus cohérent avec les compétences du développeur et plus rapide à mettre en œuvre. |
| **Authentification** | Flask-JWT-Extended | JWT avec Express et bcrypt | Stack 100 % JS homogène, middlewares simples à maintenir. |
| **Données marché** | CoinGecko + exchangerate.host | Binance (klines OHLC) | Données structurées par timeframe (`1h`, `4h`, `12h`, `1d`) et cohérence temporelle pour les stratégies. |
| **Graphiques** | Recharts / Chart.js | Lightweight Charts | Meilleure performance et rendu professionnel pour les chandeliers financiers. |
| **Frontend** | React + Tailwind | React + Vite + Tailwind (inchangé côté design) | Ajout de Vite pour un build plus rapide et une meilleure DX. |
| **Stratégies** | RSI, DCA, MA | RSI et MA uniquement (DCA retirée du MVP) | Périmètre réduit pour garantir un MVP stable et démontrable. |
| **Vidéo d’accueil** | Non définie | Vidéo sur la homepage + CTA “Créer un compte” | Amélioration de l’expérience utilisateur et du taux d’inscription. |
| **Déploiement** | Non précisé | Frontend : Vercel / Backend : Railway | Simplicité, stabilité, et URLs publiques pour la démo. |
| **Tests** | pytest (backend Python), Jest (frontend React) | Jest (backend JS) + Postman (API) | Unification des tests dans l’écosystème JavaScript, preuves via captures et scripts Postman. |

**Note :** La stack Flask initialement mentionnée dans le plan de projet n’a jamais été implémentée — le projet a été conçu et livré intégralement en JavaScript (Node.js + Express + React).

---

## 2) Architecture système actualisée

- Frontend: React + Vite + TailwindCSS  
- Backend: Express (Node.js)  
- Base de données: PostgreSQL  
- Intégrations: API Binance (prix/klines), NewsAPI ou flux RSS  
- Déploiement: Vercel (front), Railway (API)  
- Communication: REST JSON, polling périodique pour prix et OHLC  

Diagramme haut-niveau: voir `images/high_level_diagram.png`.

---

## 3) Composants, classes et schéma de base

- Modèles et services (backend/app):  
  - Modèles: `user.model.js`, `asset.model.js`, `trade.model.js`, `position.model.js`, `strategy.model.js`, `news.model.js`  
  - Services: `auth.service.js`, `trade.service.js`, `market.service.js`, `position.service.js`, `news.service.js`, `user.service.js`  
  - Routes API: `auth.routes.js`, `trade.routes.js`, `market.routes.js`, `asset.route.js`, `user.routes.js`, `position.routes.js`, `news.routes.js`  
- Schéma SQL: `backend/db/init/schema.sql`

ERD et diagrammes: `images/er_diagram.png`, `images/diagramme_classe.png`.

---

## 4) Diagrammes de séquence

Les flux restent conformes au document initial (authentification, mise à jour de prix, passage d’ordres).  
Captures :  
- `images/authentification_user.png`  
- `images/maj.png`  
- `images/trade_user.png`

---

## 5) Spécifications API – État actuel

Base URL: `/api/v1`

### Externes
- Binance: récupération des klines et des prix spot par symbole et intervalle.

### Internes
- `POST /auth/signup` – créer un compte utilisateur  
- `POST /auth/login` – obtenir un access token  
- `GET /market/candles` – chandeliers OHLC  
- `POST /trade/open` – ouvrir un trade simulé  
- `POST /trade/:id/close` – clôturer un trade  
- `GET /position` – positions agrégées par symbole  
- `GET /news` – flux d’actualités  

Réponses JSON : `{status, data}` ou `{status, error}`.

---

## 6) SCM et QA – État actuel

- Branches : `main`, `dev`, `feature/*`  
- Tests : Jest (backend JS), Postman (API)  
- Docker : `docker-compose.yml` (Node + Postgres)  
- Déploiement : Vercel / Railway  

---

## 7) Justifications techniques

- Unification JavaScript (Express + React).  
- Binance → cohérence temporelle et granularité.  
- Lightweight Charts → performance graphique.  
- Vercel / Railway → simplicité et disponibilité.  

---

## 8) Traçabilité avec le document initial

Le document initial est conservé inchangé pour l’évaluation.  
Les divergences sont documentées ici pour expliquer les écarts et leurs raisons.  
Suivi hebdomadaire : `WeeklyReport.md`.

