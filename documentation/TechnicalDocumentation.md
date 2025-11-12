<p align="center">
  <img src="../images/Logo_L2T.png" alt="Logo" width="400"/>
</p>
---

## Livrable : Documentation Technique
Le document final comprend :  
1. User Stories et Maquettes : stories priorisées et maquettes (si applicable).  
2. Architecture Système : diagramme haut-niveau.  
3. Composants, Classes et Schéma de Base de Données : ERD, schéma SQL, ou collections.  
4. Diagrammes de Séquence : interactions clés.  
5. Spécifications API : APIs externes et endpoints internes.  
6. Plans SCM et QA : stratégies pour gestion de code et tests.  
7. Justifications Techniques : raisons des choix de technologies et de conception.

---

## 0. User Stories et Maquettes
### Priorisation MoSCoW

#### Must Have
1) **Inscription / Connexion**  
*En tant qu’invité, je veux créer un compte avec email et mot de passe afin de sauvegarder ma progression.*  
✅ Succès : compte créé, redirection vers tableau de bord.  
❌ Erreurs : email déjà utilisé, mot de passe trop faible, serveur indisponible.  
**Maquette :**
<p align="center">
  <img src="images/connexion_user.png" alt="Connexion" width="400"/>
</p>

3) **Sécurité (Sessions JWT)**  
*En tant qu’utilisateur, je veux rester connecté de manière sécurisée afin de protéger mon compte.*  
✅ Succès : token d’accès court, refresh token en cookie httpOnly.  
❌ Erreurs : token expiré/invalide → `401 Unauthorized`.

4) **Voir les prix en temps réel**  
*En tant qu’utilisateur, je veux voir les prix BTC/USD, ETH/USD, EUR/USD afin de décider quand trader.*  
✅ Actualisation toutes les 1–10s (polling ou SSE/WS).  
❌ API externe indisponible → données fictives ou bannière.  
**Maquette :** `page_trade.png`
<p align="center">
  <img src="images/page_trade.png" alt="Trade" width="400"/>
</p>

6) **Passer des ordres simulés**  
*En tant qu’utilisateur, je veux passer des ordres Buy/Sell en mode simulation sans risque financier.*  
✅ Ordre exécuté au prix du marché, portefeuille/historique mis à jour.  
❌ Erreurs : quantité invalide, symbole inconnu, erreur serveur → `400/500`.  
**Maquette :**
<p align="center">
  <img src="images/page_trade.png" alt="place order" width="400"/>
</p>

8) **Portefeuille & Historique**  
*En tant qu’utilisateur, je veux voir mes positions ouvertes et mes trades passés pour analyser mes performances.*  
✅ Affichage du portefeuille et de l’historique.  
❌ Erreurs : non connecté, base indisponible.  
**Maquette :**
<p align="center">
  <img src="images/page_trade_historique.png" alt="portfolio history" width="400"/>
</p>

10) **Activer Stratégies Automatiques (RSI, MA Crossover)**  
*En tant qu’utilisateur, je veux activer/désactiver des stratégies automatiques afin de comprendre leur fonctionnement.*  
✅ Stratégie activée, indicateur ON, ordres simulés exécutés.  
❌ Erreurs : paramètres invalides, stratégie déjà active, calcul indicateur échoué.  
**Maquette :**
<p align="center">
  <img src="images/page_strategie_RSI.png" alt="Strategies" width="400"/>
</p>

#### Should Have
7) **Voir les actualités financières (BTC, ETH, USD, EUR)**  
✅ Liste d’articles récents avec titre, source, date et lien.  
❌ API de news hors ligne, quota dépassé.  
**Maquette :**
<p align="center">
  <img src="images/page_news.png" alt="News" width="400"/>
</p>

9) **Stop-Loss / Take-Profit**  
✅ SL/TP enregistrés et déclenchés en simulation.  
❌ Valeurs invalides, erreur de liquidité fictive.

#### Could Have
9) **Watchlist personnalisée**  
10) **Mode clair/sombre**  
11) **Tutoriel d’onboarding**  

---

## 1. Architecture Système

### 🌐 Frontend
- **React + Tailwind** : React est aujourd’hui la librairie front-end la plus utilisée et recherchée dans le monde du travail (startups comme grands groupes). Il permet de construire des interfaces modulaires et performantes. Tailwind CSS accélère le développement d’interfaces modernes sans multiplier les fichiers CSS et correspond aux standards actuels de design.
- **État global** : Redux Toolkit (référence industrielle pour les projets complexes, facile à auditer et tester) ou Zustand (solution plus légère et moderne, très populaire pour les MVPs).
- **Graphiques** : Recharts/Chart.js, deux bibliothèques open source largement utilisées en entreprise pour la visualisation de données financières.
- **Temps réel** : SSE pour sa simplicité, WebSocket si besoin de communications bidirectionnelles (standard dans les applications de trading professionnelles).

### ⚙️ Backend
- **Flask + Flask-RESTx** : Flask est un framework Python reconnu pour sa simplicité et sa rapidité de mise en place. Python reste un langage clé du monde professionnel (data, finance, IA), ce qui facilite la maintenance et le recrutement. Flask-RESTx fournit une documentation Swagger intégrée, pratique pour les équipes.
- **Flask-JWT-Extended + bcrypt** : respect des bonnes pratiques de sécurité exigées dans l’industrie (authentification stateless avec JWT, stockage sécurisé des mots de passe).
- **APScheduler** : gestion fiable de tâches récurrentes (rafraîchissement prix/news, exécution de stratégies) sans ajouter de complexité inutile.
- **SSE / Flask-SocketIO** : standards industriels pour le temps réel, déjà utilisés dans la finance (push de prix ou carnet d’ordres).

### 🗄️ Base de données
- **PostgreSQL** : base relationnelle robuste et largement utilisée en production. Supporte très bien les contraintes d’intégrité (FK, check), la précision numérique (NUMERIC pour montants financiers) et l’extension (JSONB). Un choix qui correspond aux attentes des entreprises.

### 🚀 Cache (optionnel)
- **Redis** : outil de cache incontournable dans le monde professionnel (finance, e-commerce, SaaS). Il réduit la latence, protège des quotas API et gère le rate limiting. Même si optionnel dans un MVP, il prépare le projet à une montée en charge.

### 🔗 APIs externes
- **CoinGecko** : référence open source pour les données crypto, sans coût, largement utilisée par les développeurs.
- **exchangerate.host** : API gratuite et fiable pour le forex, parfaite pour un MVP.
- **CryptoPanic RSS** : agrégateur de news crypto connu, sans authentification, utile pour contextualiser les signaux de trading.
- **Google News RSS** : API simple et universelle pour couvrir le forex, conforme aux besoins d’un projet éducatif.

### 🛠️ Infrastructure
- **Docker Compose** : standard de facto en entreprise pour le déploiement local et la CI/CD. Il garantit une cohérence entre environnements (dev, staging, production) et prépare la transition vers Kubernetes si nécessaire.

---
✅ **Justification globale :**  
Chaque choix technique est aligné sur deux axes :  
1. **Employabilité** : toutes les briques choisies (React, Redux, Flask, PostgreSQL, Docker) sont des technologies très demandées sur le marché, ce qui valorise le projet dans un CV ou un portfolio.  
2. **Simplicité et évolutivité** : la stack reste légère pour un MVP, mais elle respecte les standards industriels et peut évoluer vers une architecture plus robuste si le projet devait être porté en production.


<p align="center">
  <img src="images/high_level_diagram.png" alt="high_level_diagram" width="400"/>
</p>
---

## 2. Composants, Classes & Base de Données
### A) Services/Méthodes (extraits clés)
#### Utilisateur (User)
- `create_user(email, raw_password)` → crée l’utilisateur + **hash** (bcrypt), unicité email (lower/citext), `is_admin=false`.
- `update_user(id, patch)` → modifie email/flags ; revalide l’email si changé.
- `delete_user(id)` → cascade sur `trades`, `strategies`, `positions`.
- `define_password(user_id, raw_password)` → réinitialise (appelle `hash_password()`).
> **Ne jamais exposer `get_password()`** ; lire `password_hash` côté repo uniquement.
#### Actifs (Assets)
- `get_asset(symbol)`, `set_asset({symbol, kind})` (upsert, kind ∈ `crypto|forex|index`), `delete_asset(symbol)` (refuse si référencé), `get_asset_id(symbol)`.
#### Stratégies (Strategy)
- `switch_is_enabled(strategy_id, bool)` (vérifie ownership)
- `execute_strategy(strategy_id|batch)` → calcule signaux, insère `strategy_signals`, notifie si permission ON (anti-doublon/time-bucket)
- `set_permission_user(strategy_id, bool)`, `get_permission_user(strategy_id)`
#### Signaux (Strategy Signals)
- `record_signal({strategy_id, symbol, action, indicators})` (index temps, unicité optionnelle)
- `latest_signals(filters)` → liste pour UI/notifications
#### Trading
- `open_trade({user_id, strategy_id, symbol, side, quantity, price_open})` → valide qty>0/prix>0, **MAJ positions**
- `close_trade({trade_id, price_close})` → calcule **PnL**, MAJ positions
- Getters : `get_trade_pnl`, `get_price_open/close`
### B) Schéma SQL (PostgreSQL)
> Remarques :
> - Corrections : colonnes `price_open` & `price_close` avec bons **CHECK**, virgules manquantes fixées, `close_at` **sans** défaut `now()` (reste `NULL` tant que non fermé).
> - `positions` peut être **table** (MAJ transactionnelle) ou **vue matérialisée** ; on retient la table pour stabilité démo.
```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false
);
-- Actifs supportés
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('crypto','forex','index'))
);
-- Stratégies configurées par l’utilisateur
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('RSI','MA_CROSS')),
  params JSONB NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Signaux & exécutions liées à une stratégie
CREATE TABLE strategy_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES assets(symbol),
  action TEXT NOT NULL CHECK (action IN ('BUY','SELL','HOLD')),
  indicators JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Transactions (trades simulés)
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL REFERENCES assets(symbol),
  side TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity NUMERIC(24,10) NOT NULL CHECK (quantity > 0),
  price_open NUMERIC(18,8) NOT NULL CHECK (price_open > 0),
  price_close NUMERIC(18,8) NULL CHECK (price_close > 0),
  pnl NUMERIC(24,10),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  close_at TIMESTAMPTZ NULL
);
-- Positions (portefeuille) – mise à jour à chaque trade
CREATE TABLE positions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES assets(symbol),
  quantity NUMERIC(24,10) NOT NULL DEFAULT 0,
  avg_price NUMERIC(18,8) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, symbol)
);
-- Cache news (optionnel MVP)
CREATE TABLE news_cache (
  id BIGSERIAL PRIMARY KEY,
  source TEXT,
  title TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  symbols TEXT[]
);
```
1. Diagramme de classe
<p align="center">
  <img src="images/diagramme_classe.png" alt="Diagramme classe" width="400"/>
</p>
2. ER diagramme
<p align="center">
  <img src="images/er_diagram.png" alt="ER diagramme" width="400"/>
</p>
---

## 3. Diagrammes de Séquence

1. Flux d’authentification
  <p align="center">
    <img src="images/authentification_user.png" alt="diagramme auth" width="400"/>
</p>
2. Mise à jour prix
  <p align="center">
    <img src="images/maj.png" alt="maj price" width="400"/>
</p>
3. Placement d’un ordre
  <p align="center">
    <img src="images/trade_user.png" alt="placement ordre" width="400"/>
</p>

---

## 4. APIs Externes et Internes

### 4.1 APIs Externes (et justification des choix)

| Domaine           | API                  | Base URL                                                   | Auth | Pourquoi choisi ?                                                                 |
|-------------------|----------------------|-------------------------------------------------------------|------|-----------------------------------------------------------------------------------|
| **Crypto prices** | CoinGecko            | `https://api.coingecko.com/api/v3`                         | Aucune | Gratuit, fiable, endpoints simples, idéal pour un MVP.                             |
| **Forex rates**   | exchangerate.host    | `https://api.exchangerate.host`                            | Aucune | Gratuit, simple requête `/latest`, pas de clé API.                                 |
| **Crypto news**   | CryptoPanic RSS      | `https://cryptopanic.com/news/rss/`                        | Aucune | Agrégateur large de news crypto, format RSS facile à parser côté backend.          |
| **EUR/USD news**  | Google News RSS      | `https://news.google.com/rss/search?q=EUR+USD+forex`       | Aucune | Couverture large, filtrage par mots-clés forex, pas de clé API.                    |
| *(Optionnel)* Macro | TradingEconomics   | `https://api.tradingeconomics.com/calendar`                | Clé   | Données macro de haute qualité (calendrier BCE/Fed, CPI, NFP).                     |

#### Exemples de requêtes
- **CoinGecko**  
  `GET /simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur`
- **exchangerate.host**  
  `GET /latest?base=USD&symbols=EUR`

---
# 4.2 API Interne (Projet)

**Base URL :** `/api/v1`  

**Convention des réponses :**  
- Succès :  
```json
{"status":"ok","data":{...}}
```
- Erreur :  
```json
{"status":"error","error":{"code":"<CODE>","message":"..."}}
```

---

## Endpoints

| Domaine | Méthode | Chemin | Entrée | Sortie (Succès) | Erreurs possibles |
|---------|---------|--------|--------|-----------------|------------------|
| **Auth** | POST | `/auth/signup` | `{email,password}` | `{user_id,email}` | `400 INVALID_EMAIL`, `400 WEAK_PASSWORD`, `409 EMAIL_EXISTS`, `500 SERVER_ERROR` |
| **Auth** | POST | `/auth/login` | `{email,password}` | `{access_token,refresh_token,token_type}` | `401 INVALID_CREDENTIALS`, `500 SERVER_ERROR` |
| **Marché** | GET | `/prices` | `symbols=BTC,ETH&vs=usd,eur` | `{timestamp,prices,source}` | `503 PROVIDER_UNAVAILABLE`, `500 SERVER_ERROR` |
| **Marché** | GET | `/forex` | `base=USD&symbols=EUR` | `{timestamp,base,rates,source}` | `503 PROVIDER_UNAVAILABLE`, `400 INVALID_SYMBOL` |
| **Marché** | GET | `/charts/candles` | `symbol=BTCUSD&interval=1h&limit=500` | `[{t,o,h,l,c,v},...]` (voir explication ci-dessous) | `400 INVALID_PARAMS`, `503 PROVIDER_UNAVAILABLE` |
| **News** | GET | `/news/crypto` | `q=BTC,ETH&limit&lang` | `[{title,url,published_at,source,tickers},...]` | `503 NEWS_API_DOWN`, `204 NO_CONTENT` |
| **News** | GET | `/news/forex` | `q="EUR USD forex"&limit&lang` | `[{title,url,published_at,source,tickers},...]` | `503 NEWS_API_DOWN`, `204 NO_CONTENT` |
| **Ordres** | POST | `/orders` | `{symbol,side,quantity,type="market",strategy_tag}` | `{order_id,symbol,side,filled_qty,avg_price,created_at}` | `400 INVALID_ORDER`, `401 UNAUTHORIZED`, `500 SERVER_ERROR` |
| **Ordres** | GET | `/orders` | `symbol,limit,cursor` | `[{order_id,symbol,side,filled_qty,avg_price},...]` | `401 UNAUTHORIZED`, `500 SERVER_ERROR` |
| **Portefeuille** | GET | `/portfolio` | — | `{cash,positions,equity}` | `401 UNAUTHORIZED`, `500 SERVER_ERROR` |
| **Trades** | GET | `/trades` | `symbol,from,to,limit` | `[{trade_id,symbol,side,qty,price_open,price_close,pnl},...]` | `401 UNAUTHORIZED`, `500 SERVER_ERROR` |
| **Stratégies** | GET | `/strategies` | — | `[{key,enabled,params},...]` | `401 UNAUTHORIZED`, `500 SERVER_ERROR` |
| **Stratégies** | PUT | `/strategies/{key}` | `{enabled,params}` | `{key,enabled,params}` | `400 INVALID_PARAMS`, `401 UNAUTHORIZED` |


---

## Explication des bougies (`/charts/candles`)

La sortie `[{t,o,h,l,c,v},...]` correspond à une série temporelle de **bougies (candlesticks)**.  
Chaque objet représente une bougie avec les champs suivants :

| Abréviation | Signification | Exemple | Description |
|-------------|---------------|---------|-------------|
| **t** | timestamp | `1693824000` | Date/heure (Unix ou ISO). |
| **o** | open | `62500` | Prix d’ouverture. |
| **h** | high | `63200` | Plus haut prix atteint. |
| **l** | low | `62000` | Plus bas prix atteint. |
| **c** | close | `62800` | Prix de clôture. |
| **v** | volume | `123.4` | Volume échangé pendant l’intervalle. |

### Exemple concret

```json
{
  "status": "ok",
  "data": [
    {
      "t": 1693824000,
      "o": 62500,
      "h": 63200,
      "l": 62000,
      "c": 62800,
      "v": 123.4
    },
    {
      "t": 1693827600,
      "o": 62800,
      "h": 63000,
      "l": 62650,
      "c": 62700,
      "v": 95.7
    }
  ],
  "source": "coingecko"
}
```

---

## Exemple de succès (`/prices`)

```json
{
  "status": "ok",
  "data": {
    "timestamp": "2025-09-04T09:00:00Z",
    "prices": {
      "BTC": {"usd": 62800.0, "eur": 57500.0},
      "ETH": {"usd": 3400.0, "eur": 3100.0}
    },
    "source": "coingecko"
  }
}
```

## Exemple d’erreur (`/prices` avec API externe indisponible)

```json
{
  "status": "error",
  "error": {
    "code": "503 PROVIDER_UNAVAILABLE",
    "message": "Service de prix temporairement indisponible"
  }
}
```


## 5. Plan SCM et QA
### SCM
- GitHub avec branches `main` (stable), `thomas/*`, `julien/*`.  
- PRs obligatoires 2 fois/semaine, reviews chaque vendredi.
- Commit en anglais sur le main uniquement quand la fonction est fonctionnelle et testée localement. 

### QA
- **Backend** : tests `pytest`.  
- **Frontend** : tests `Jest`.  
- **API** : Postman.  
- **CI/CD** : GitHub Actions pour lint + tests sur PR.  

---

## 6. Justifications Techniques
- **Flask/RESTx** : rapidité MVP, doc auto.  
- **JWT (access+refresh)** : stateless + sécurisé.  
- **PostgreSQL** : intégrité relationnelle, précision numérique.  
- **Redis** : cache prix/news + rate limiting.  
- **APIs sans clé (CoinGecko, exchangerate.host, RSS)** : idéal MVP.  
- **SSE plutôt que WS** : simplicité pour push unidirectionnel.  
- **Recharts/Chart.js** : rapide pour MVP (Lightweight Charts possible plus tard).  
